// Config: set your Meta Pixel ID to enable Purchase event
const META_PIXEL_ID = ""; // Example: "123456789012345"

// main.js refactored: orchestrates modules and keeps high-level init only

// tombstone: removed large inline implementations moved to modules
// removed function reveal/intersection observers {}

// removed carousel implementation {}

// removed background music implementation {}

// removed toast helper {}

// removed payment details + copy handler {}

// removed form submission {}

// removed meta pixel loader {}

// removed hero video autoplay helper {}

// removed reduce-motion helper {}

// removed whatsapp fab intersection observer {}

// removed SFX pool & button sound handlers {}

// --- New, small orchestrator imports ---
import './ui.js';
import './carousel.js';
import './audio.js';
import './sfx.js';

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// main.js refactored: orchestrates modules and keeps high-level init only

// tombstone: removed large inline implementations moved to modules
// removed function reveal/intersection observers {}

// removed carousel implementation {}

// removed background music implementation {}

// removed toast helper {}

// removed payment details + copy handler {}

// removed form submission {}

// removed hero video autoplay helper {}

// removed reduce-motion helper {}

// removed whatsapp fab intersection observer {}

// removed SFX pool & button sound handlers {}

// --- New, small orchestrator imports ---
import './ui.js';
import './carousel.js';
import './audio.js';
import './sfx.js';

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Promo countdown: 2 hours 56 minutes from first page load (client-side)
(() => {
  const el = document.getElementById('promoCountdown');
  if(!el) return;
  // Set end time to now + 2 hours 56 minutes (in ms) and persist in localStorage; when it reaches 0 it will reset
  const DURATION = (2 * 60 + 56) * 60 * 1000; // 2 hours 56 minutes in ms
  const END_KEY = 'pack_creativo_promo_end';
  const parent = el.closest('.promo-timer');

  const getSavedEnd = () => {
    const saved = localStorage.getItem(END_KEY);
    const n = saved ? parseInt(saved, 10) : NaN;
    return (!isNaN(n) && n > Date.now()) ? n : null;
  };

  let endTime = getSavedEnd();
  if(!endTime){
    endTime = Date.now() + DURATION;
    localStorage.setItem(END_KEY, String(endTime));
  }

  function update(){
    const now = Date.now();
    let diff = endTime - now;

    if(diff <= 0){
      // When countdown hits zero, reset to another full DURATION and continue counting
      endTime = Date.now() + DURATION;
      localStorage.setItem(END_KEY, String(endTime));
      diff = endTime - Date.now();
      parent?.classList.remove('expired');
    }

    const hrs = Math.floor(diff / (1000*60*60));
    diff -= hrs * (1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    diff -= mins * (1000*60);
    const secs = Math.floor(diff / 1000);
    const fmt = (v) => String(v).padStart(2,'0');
    el.textContent = `${fmt(hrs)}:${fmt(mins)}:${fmt(secs)}`;
    return true;
  }

  // Initial render
  update();
  // Update every 1s
  const iv = setInterval(()=>{ update(); }, 1000);
})();

// --- NEW: TimeOnPage30Sec custom event (fires once after 30s on this page) ---
(() => {
  try {
    // Only run on the landing page (index.html). If main.js is reused on other pages, this still harmlessly runs.
    const TIME_MS = 30000;
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      try { if (window.fbq && typeof window.fbq === 'function') window.fbq('trackCustom', 'TimeOnPage30Sec'); } catch(e){}
    };
    // Use visibility API to ensure user is on the page when timer ends
    let timeoutId = setTimeout(() => {
      if (document.visibilityState === 'visible') fire();
      else {
        const onVis = () => { if (document.visibilityState === 'visible') { fire(); document.removeEventListener('visibilitychange', onVis); } };
        document.addEventListener('visibilitychange', onVis, { once: true });
      }
    }, TIME_MS);
    // cleanup on unload (optional)
    window.addEventListener('beforeunload', ()=> { clearTimeout(timeoutId); });
  } catch (e) {}
})();

// Accessibility: allow anchor back to top to reset views
document.querySelector('#thankyou .btn')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.scrollTo({top:0, behavior:'smooth'});
});