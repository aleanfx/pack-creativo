// New module: background music management (autoplay retries, toasts, pause when hero video touched)

const audio = new Audio('Música fondo.MP3');
audio.loop = true;
audio.volume = 0.5;
audio.preload = 'auto';
audio.crossOrigin = 'anonymous';

let playAttempts = 0;
const MAX_ATTEMPTS = 6;
const ATTEMPT_INTERVAL = 3000;

const tryPlay = async () => {
  if (playAttempts >= MAX_ATTEMPTS) return;
  playAttempts++;
  try {
    await audio.play();
    clearInterval(retryId);
  } catch (err) {
    // silently ignore autoplay block; no user notices required
  }
};

tryPlay();
const retryId = setInterval(() => {
  tryPlay();
  if (playAttempts >= MAX_ATTEMPTS) clearInterval(retryId);
}, ATTEMPT_INTERVAL);

audio.addEventListener('play', () => {});
audio.addEventListener('pause', () => {});

const heroVideo = document.querySelector('.hero-video video');
if (heroVideo) {
  const onVideoPointer = () => {
    if (!audio.paused) audio.pause();
  };
  heroVideo.addEventListener('pointerdown', onVideoPointer, { passive: true });
  heroVideo.addEventListener('play', () => {});
  heroVideo.addEventListener('pause', () => {
    audio.play().catch(()=>{/* ignore */});
  });
}

window.__packCreativoBackgroundAudio = audio;

