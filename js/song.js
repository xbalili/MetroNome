
document.getElementById('year').textContent=new Date().getFullYear();
const slug=new URLSearchParams(location.search).get('slug');
fetch('data/songs.json').then(r=>r.json()).then(songs=>{
const song=songs.find(x=>x.slug===slug);
const c=document.getElementById('song-detail');
if(!song){c.innerHTML='آهنگ پیدا نشد';return;}
document.title=`${song.title} - MetroNome`;
c.innerHTML=`
<a href="index.html" class="back-link">بازگشت</a>
<div class="detail-grid">
<div><img src="${song.cover||''}" alt="${song.title}" class="cover-img"></div>
<div>
<h1>${song.title}</h1>
<p>${song.artist||''}</p>
<p>${song.description||''}</p>

<div class="player-card">
<audio id="audio" src="${song.audio||''}"></audio>
<div class="player-controls">
<button class="play-btn" id="playBtn">▶</button>
<div style="flex:1">
<input type="range" id="progress" class="progress" value="0" min="0" max="100">
<div><span id="cur">0:00</span> / <span id="dur">0:00</span></div>
</div>
</div>
</div>

<div class="action-row">
<a href="${song.audio||'#'}" download class="btn">دانلود آهنگ</a>
<a href="${song.telegramPost||'#'}" target="_blank" class="btn">پست تلگرام</a>
<button id="shareBtn" class="btn">اشتراک‌گذاری</button>
</div>

<div class="lyrics-block">${(song.lyrics||'').replace(/\n/g,'<br>')}</div>
</div></div>`;

const a=document.getElementById('audio');
const p=document.getElementById('playBtn');
const r=document.getElementById('progress');
const cur=document.getElementById('cur');
const dur=document.getElementById('dur');

p.onclick=()=>{if(a.paused){a.play();p.textContent='⏸';}else{a.pause();p.textContent='▶';}};
a.onloadedmetadata=()=>{dur.textContent=format(a.duration)};
a.ontimeupdate=()=>{
r.value=(a.currentTime/a.duration||0)*100;
cur.textContent=format(a.currentTime);
};
r.oninput=()=>{a.currentTime=(r.value/100)*a.duration};
document.getElementById('shareBtn').onclick=()=>navigator.share?navigator.share({title:song.title,url:location.href}):navigator.clipboard.writeText(location.href);

function format(s){if(!s)return '0:00';let m=Math.floor(s/60);let ss=Math.floor(s%60);return m+':'+String(ss).padStart(2,'0');}
});
