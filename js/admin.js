const adminKeyInput = document.getElementById('admin-key');
const savedKey = sessionStorage.getItem('metronome_admin_key');
if (savedKey) adminKeyInput.value = savedKey;

const form = document.getElementById('song-form');
const msg = document.getElementById('form-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.className = 'form-msg';
  msg.textContent = '';

  const adminKey = adminKeyInput.value.trim();
  if (!adminKey) {
    msg.textContent = 'کلید ادمین رو وارد کن';
    msg.classList.add('err');
    return;
  }
  sessionStorage.setItem('metronome_admin_key', adminKey);

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || 'خطایی رخ داد';
      msg.classList.add('err');
      return;
    }

    msg.textContent = `آهنگ «${data.title}» با موفقیت اضافه شد ✓`;
    msg.classList.add('ok');
    form.reset();
    loadExistingSongs();
  } catch (err) {
    msg.textContent = 'خطا در اتصال به سرور';
    msg.classList.add('err');
  }
});

async function loadExistingSongs() {
  const list = document.getElementById('existing-songs');
  try {
    const res = await fetch('/api/songs');
    const songs = await res.json();

    if (!songs.length) {
      list.innerHTML = '<div class="mono-readout">هنوز آهنگی ثبت نشده</div>';
      return;
    }

    list.innerHTML = songs
      .map(
        (s) => `
        <div class="admin-row">
          <span>${s.title} <span class="mono-readout">(${s.slug})</span></span>
          <button data-id="${s.id}">حذف</button>
        </div>
      `
      )
      .join('');

    list.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const adminKey = adminKeyInput.value.trim();
        if (!adminKey) {
          alert('اول کلید ادمین رو وارد کن');
          return;
        }
        if (!confirm('مطمئنی می‌خوای این آهنگ رو حذف کنی؟')) return;

        const res = await fetch(`/api/songs/${btn.dataset.id}`, {
          method: 'DELETE',
          headers: { 'x-admin-key': adminKey },
        });
        if (res.ok) loadExistingSongs();
        else alert('حذف ناموفق بود');
      });
    });
  } catch (e) {
    list.innerHTML = '<div class="mono-readout">خطا در بارگذاری لیست</div>';
  }
}

loadExistingSongs();
