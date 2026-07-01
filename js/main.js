
document.getElementById('year').textContent=new Date().getFullYear();
fetch('data/songs.json').then(r=>r.json()).then(songs=>{
document.getElementById('song-count').textContent=`${songs.length} آهنگ`;
const grid=document.getElementById('song-grid');grid.innerHTML='';
songs.forEach(song=>{
const c=document.createElement('div');
c.className='song-card';
c.dataset.slug=song.slug;
c.innerHTML=`<div class="tilt-inner"><div class="song-cover-wrap">${song.cover?`<img src="${song.cover}" alt="${song.title}">`:''}</div><div class="song-meta"><span class="genre-tag">${song.genre||''}</span><h4>${song.title}</h4><small>${song.artist||''}</small></div></div>`;
c.onclick=()=>location.href=`song.html?slug=${song.slug}`;
grid.appendChild(c);
});
}).catch(()=>{});
