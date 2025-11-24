// New module: button SFX pool and press handling (prevents double-play)

const SFX_SRC = 'Botón de Minecraft.mp3';
const POOL_SIZE = 6;
const pool = [];
let poolIdx = 0;
let __lastSfxPlay = 0;
const SFX_MIN_GAP = 220;

for(let i=0;i<POOL_SIZE;i++){
  const a = new Audio(SFX_SRC);
  a.preload = 'auto';
  a.volume = 1.0;
  a.crossOrigin = 'anonymous';
  pool.push(a);
}

function playSfx(){
  try{
    const now = Date.now();
    if(now - __lastSfxPlay < SFX_MIN_GAP) return;
    __lastSfxPlay = now;
    const s = pool[poolIdx];
    s.currentTime = 0;
    const p = s.play();
    if(p && p.catch) p.catch(()=>{/* ignore */});
    poolIdx = (poolIdx + 1) % POOL_SIZE;
  }catch(e){ /* ignore */ }
}

const selectors = ['.btn-buy-top', '.btn-primary', '.btn-submit'];

document.addEventListener('pointerdown', (ev) => {
  const btn = ev.target.closest(selectors.join(','));
  if(!btn) return;
  playSfx();
  btn.classList.add('press');
  setTimeout(()=> btn.classList.remove('press'), 160);
}, { passive: true });

document.addEventListener('keydown', (ev) => {
  if(!(ev.key === ' ' || ev.key === 'Enter')) return;
  const active = document.activeElement;
  if(!active) return;
  if(active.matches && active.matches(selectors.join(','))){
    playSfx();
    active.classList.add('press');
    setTimeout(()=> active.classList.remove('press'), 160);
  }
});

// Removed the 'click' handler to avoid double-playing (pointerdown + click).
// The pointerdown handler covers pointer interactions, keydown covers keyboard activation.

window.__packCreativoButtonSfx = { play: playSfx };