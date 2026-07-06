document.getElementById('year').textContent = new Date().getFullYear();

const slug = new URLSearchParams(location.search).get('slug');

let songs = [];
let currentIndex = 0;
let audio;
let autoplayNext = false;

const c = document.getElementById('song-detail');

fetch('data/songs.json')
.then(r => r.json())
.then(data => {

    songs = data;

    currentIndex = songs.findIndex(x => x.slug === slug);

    if (currentIndex === -1) {
        c.innerHTML = 'آهنگ پیدا نشد';
        return;
    }

    renderSong(false);

});

function renderSong(animate = true) {

    const song = songs[currentIndex];
    if (!song) return;

    if (animate) {
        c.style.opacity = 0;
        c.style.transform = 'translateY(10px)';
    }

    setTimeout(() => {

        document.title = `${song.title} - MetroNome`;

        c.innerHTML = `
        <a href="index.html" class="back-link">بازگشت به صفحه اصلی</a>

        <div class="detail-grid">

            <div>
                <img src="${song.cover || ''}" class="cover-img" alt="${song.title}">
            </div>

            <div>

                <h1>${song.title}</h1>

                <p>${song.artist || ''}</p>

                <p>${song.description || ''}</p>

                <p>Release: ${song.releaseDate || ''}</p>

                <div class="player-card">

                    <audio id="audio" src="${song.audio || ''}"></audio>

                    <div class="player-controls">

                        <button class="play-btn" id="playBtn">▶</button>

                        <div class="progress-wrap">

                            <input
                                type="range"
                                id="progress"
                                class="progress"
                                value="0"
                                min="0"
                                max="100"
                            >

                            <div class="time-row">
                                <span id="cur">0:00</span>
                                <span id="dur">0:00</span>
                            </div>

                        </div>

                    </div>

                </div>

                <div class="action-row">

                    <a href="${song.audio || '#'}" download class="btn">
                        دانلود آهنگ
                    </a>

                    ${song.telegramPost
                        ? `<a href="${song.telegramPost}" target="_blank" class="btn">پست تلگرام</a>`
                        : ''
                    }

                    <button id="shareBtn" class="btn">
                        اشتراک‌گذاری
                    </button>

                </div>

                <div class="lyrics-block">
                    ${(song.lyrics || '').replace(/\n/g, '<br>')}
                </div>

                <div class="action-row" id="navSongs"></div>

            </div>

        </div>
        `;

        audio = document.getElementById('audio');

        setupPlayer(song);

        if (animate) {
            setTimeout(() => {
                c.style.opacity = 1;
                c.style.transform = 'translateY(0)';
            }, 50);
        }

    }, animate ? 200 : 0);
}

function setupPlayer(song) {

    const p = document.getElementById('playBtn');
    const r = document.getElementById('progress');
    const cur = document.getElementById('cur');
    const dur = document.getElementById('dur');
    const img = document.querySelector('.cover-img');

    p.onclick = () => {

        if (audio.paused) {

            audio.play();

            p.textContent = '⏸';

            if (img) img.classList.add('playing');

        } else {

            audio.pause();

            p.textContent = '▶';

            if (img) img.classList.remove('playing');
        }
    };

    audio.onloadedmetadata = () => {

        dur.textContent = format(audio.duration);

        if (autoplayNext) {

            audio.play().catch(() => {});

            autoplayNext = false;

            p.textContent = '⏸';

            if (img) img.classList.add('playing');
        }
    };

    audio.ontimeupdate = () => {

        const percent = audio.duration
            ? (audio.currentTime / audio.duration) * 100
            : 0;

        r.value = percent;

        cur.textContent = format(audio.currentTime);

        r.style.setProperty('--val', percent + '%');
    };

    r.oninput = () => {

        if (!audio.duration) return;

        audio.currentTime = (r.value / 100) * audio.duration;
    };

    audio.onended = () => {

        autoplayNext = true;

        nextSong();
    };

    const shareBtn = document.getElementById('shareBtn');

    shareBtn.onclick = () => {

        if (navigator.share) {

            navigator.share({
                title: song.title,
                url: location.href
            });

        } else {

            navigator.clipboard.writeText(location.href);
        }
    };

    renderNav();
}

function renderNav() {

    const nav = document.getElementById('navSongs');

    nav.innerHTML = '';

    nav.innerHTML += `
        <a class="btn" href="#" onclick="prevSong();return false;">
            ← قبلی
        </a>
    `;

    nav.innerHTML += `
        <a class="btn" href="#" onclick="nextSong();return false;">
            بعدی →
        </a>
    `;
}

function nextSong() {

    currentIndex++;

    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }

    renderSong(true);
}

function prevSong() {

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }

    renderSong(true);
}

window.nextSong = nextSong;
window.prevSong = prevSong;

function format(s) {

    if (!s || isNaN(s)) return '0:00';

    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);

    return m + ':' + String(ss).padStart(2, '0');
}