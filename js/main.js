document.getElementById('year').textContent = new Date().getFullYear();

fetch('data/songs.json')
.then(r => r.json())
.then(songs => {

    const grid = document.getElementById('song-grid');
    const count = document.getElementById('song-count');

    const search = document.getElementById('search');
    const sort = document.getElementById('sortSongs');
    const genreFilter = document.getElementById('genreFilter');

    // -------------------------
    // Genre list
    // -------------------------

    if (genreFilter) {

        const genres = [];

        songs.forEach(song => {

            if (!song.genre) return;

            song.genre
                .split('/')
                .map(g => g.trim())
                .forEach(g => {
                    if (g && !genres.includes(g)) {
                        genres.push(g);
                    }
                });

        });

        genres.sort();

        genres.forEach(genre => {

            const option = document.createElement('option');

            option.value = genre;
            option.textContent = genre;

            genreFilter.appendChild(option);

        });
    }

    // -------------------------
    // Sort
    // -------------------------

    function sortList(list) {

        const mode = sort ? sort.value : 'new';

        const arr = [...list];

        if (mode === 'az') {
            arr.sort((a, b) => a.title.localeCompare(b.title));
        }

        if (mode === 'new') {
            arr.sort(
                (a, b) =>
                    new Date(b.releaseDate || 0) -
                    new Date(a.releaseDate || 0)
            );
        }

        if (mode === 'old') {
            arr.sort(
                (a, b) =>
                    new Date(a.releaseDate || 0) -
                    new Date(b.releaseDate || 0)
            );
        }

        return arr;
    }

    // -------------------------
    // Render
    // -------------------------

    function render(list) {

        count.textContent = `${list.length} آهنگ`;

        grid.innerHTML = '';

        if (!list.length) {

            grid.innerHTML =
                '<div class="empty-state">چیزی پیدا نشد</div>';

            return;
        }

        list.forEach(song => {

            const card = document.createElement('div');

            card.className = 'song-card';

            card.innerHTML = `
                <div class="tilt-inner">

                    <div class="song-cover-wrap">
                        ${
                            song.cover
                            ? `<img loading="lazy"
                                    src="${song.cover}"
                                    alt="${song.title} - ${song.artist || ''}">`
                            : ''
                        }
                    </div>

                    <div class="song-meta">

                        <span class="genre-tag">
                            ${song.genre || ''}
                        </span>

                        <h4>${song.title}</h4>

                        <small>${song.artist || ''}</small>

                    </div>

                </div>
            `;

            card.onclick = () => {

                if (!dragMoved) {

                    location.href =
                        `song.html?slug=${song.slug}`;
                }
            };

            grid.appendChild(card);

        });
    }

    // -------------------------
    // Filter + Search
    // -------------------------

    function refresh() {

        const q =
            search
            ? search.value.toLowerCase().trim()
            : '';

        const selectedGenre =
            genreFilter
            ? genreFilter.value
            : '';

        let filtered = songs.filter(song => {

            const title =
                (song.title || '').toLowerCase();

            const artist =
                (song.artist || '').toLowerCase();

            const genre =
                (song.genre || '');

            const matchSearch =
                title.includes(q) ||
                artist.includes(q);

            const matchGenre =
                !selectedGenre ||
                genre.includes(selectedGenre);

            return matchSearch && matchGenre;

        });

        render(sortList(filtered));
    }

    refresh();

    if (search) {
        search.addEventListener('input', refresh);
    }

    if (sort) {
        sort.addEventListener('change', refresh);
    }

    if (genreFilter) {
        genreFilter.addEventListener('change', refresh);
    }

    // -------------------------
    // Drag Scroll Desktop
    // -------------------------

    let isDown = false;
    let dragMoved = false;
    let startX = 0;
    let startScroll = 0;

    grid.addEventListener('mousedown', e => {

        isDown = true;

        dragMoved = false;

        grid.classList.add('dragging');

        startX = e.pageX;

        startScroll = grid.scrollLeft;
    });

    window.addEventListener('mouseup', () => {

        isDown = false;

        grid.classList.remove('dragging');
    });

    grid.addEventListener('mouseleave', () => {

        isDown = false;

        grid.classList.remove('dragging');
    });

    grid.addEventListener('mousemove', e => {

        if (!isDown) return;

        e.preventDefault();

        const dx = e.pageX - startX;

        if (Math.abs(dx) > 5) {
            dragMoved = true;
        }

        grid.scrollLeft = startScroll - dx;
    });

});