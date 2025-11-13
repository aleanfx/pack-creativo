// Config: set your Meta Pixel ID to enable Purchase event
const META_PIXEL_ID = ""; // Example: "123456789012345"

// --- Consolidated JS (modules inlined) ---
// Year injection (kept here in case index references it)
document.getElementById('year').textContent = new Date().getFullYear();

// Toast helper
const toast = (msg)=>{
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 1800);
};

/* Reveal on scroll (used for .reveal and .tool) */
(() => {
  const revealEls = [...document.querySelectorAll('.reveal'), ...document.querySelectorAll('.tool')];
  if(revealEls.length === 0) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    })
  }, {threshold:.15});
  revealEls.forEach(el=>io.observe(el));
})();

/* Promo countdown (client-side persistent) */
(() => {
  const el = document.getElementById('promoCountdown');
  if(!el) return;
  const DURATION = (2 * 60 + 56) * 60 * 1000;
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
  }
  update();
  setInterval(()=>{ update(); }, 1000);
})();

/* Payment details rendering & copy handlers */
(() => {
  const paymentDetailsEl = document.getElementById('paymentDetails');
  const methodEl = document.getElementById('method');
  if(!paymentDetailsEl || !methodEl) return;

  const tplPagoMovil = () => `
    <div class="inline">
      <div class="copy-line">
        <small>Banco</small>
        <code>0102 (Venezuela)</code>
      </div>
      <div class="copy-line">
        <small>Teléfono</small>
        <code>04126660925</code>
        <button class="btn-copy" data-copy="04126660925">Copiar</button>
      </div>
      <div class="copy-line">
        <small>Cédula</small>
        <code>31600911</code>
        <button class="btn-copy" data-copy="31600911">Copiar</button>
      </div>
      <div class="copy-line">
        <small>Monto</small>
        <code>10$ (a BCV)</code>
      </div>
    </div>
    <div class="form-note">Selecciona Pago móvil en tu banco, ingresa los datos arriba y sube tu capture.</div>
  `;

  const tplUSDT = () => `
    <div class="inline">
      <div class="copy-line">
        <small>Red</small>
        <code>BEP20 (BSC)</code>
      </div>
      <div class="copy-line">
        <small>Wallet</small>
        <code>0x233b61263eb0d5faa859e7d4d5591da87929c003</code>
        <button class="btn-copy" data-copy="0x233b61263eb0d5faa859e7d4d5591da87929c003">Copiar</button>
      </div>
      <div class="copy-line">
        <small>Monto</small>
        <code>10$</code>
      </div>
    </div>
    <div class="form-note">Envía 10 USDT por BEP20 a la dirección indicada y sube tu capture.</div>
  `;

  const tplBinancePay = () => `
    <div class="inline">
      <div class="copy-line">
        <small>Método</small>
        <code>Binance Pay</code>
      </div>
      <div class="copy-line">
        <small>ID</small>
        <code>185115161</code>
        <button class="btn-copy" data-copy="185115161">Copiar</button>
      </div>
      <div class="copy-line">
        <small>Monto</small>
        <code>10$</code>
      </div>
    </div>
    <div class="form-note">Envía 10$ usando Binance Pay a la ID indicada y sube tu capture del pago.</div>
  `;

  const renderDetails = ()=>{
    const v = methodEl.value;
    paymentDetailsEl.innerHTML = v === 'pago-movil' ? tplPagoMovil() :
                                 v === 'usdt-bep20' ? tplUSDT() :
                                 v === 'binance-pay' ? tplBinancePay() : '';
  };
  methodEl.addEventListener('change', renderDetails);
  renderDetails();

  paymentDetailsEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-copy');
    if(!btn) return;
    const text = btn.getAttribute('data-copy') || '';
    navigator.clipboard.writeText(text).then(()=>toast('Copiado ')).catch(()=>toast('No se pudo copiar'));
  });
})();

/* Form submission (posts to action then redirects to thankyou) */
(() => {
  const form = document.getElementById('orderForm');
  const statusEl = document.getElementById('formStatus');
  if(!form) return;
  const MAX_SIZE = 10 * 1024 * 1024;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    statusEl.textContent = 'Procesando tu pedido...';
    const fd = new FormData(form);

    const file = form.attachment.files[0];
    if(!file){ statusEl.textContent = 'Adjunta el capture del pago.'; return; }
    if(file.size > MAX_SIZE){ statusEl.textContent = 'El archivo supera 10MB.'; return; }

    try{
      const action = form.getAttribute('action') || '/';
      await fetch(action, { method: 'POST', body: fd });
      try{
        await fetch('/api/track-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            value: 10.00,
            currency: 'USD',
            content_name: 'Pack Creativo de +20 herramientas premium'
          })
        });
      }catch(e){}
      window.location.href = '/thankyou.html';
    }catch(err){
      statusEl.textContent = 'Error al enviar. Intenta nuevamente.';
    }
  });
})();

/* Meta Pixel loader + Purchase event utility */
function ensureMetaPixel(){
  if(!META_PIXEL_ID) return false;
  if(window.fbq) return true;
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){
    n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
    };if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
  return true;
}
function firePurchasePixel(){
  const ok = ensureMetaPixel();
  if(!ok) return;
  window.fbq('track', 'Purchase', {
    value: 10.00,
    currency: 'USD',
    content_name: 'Pack Creativo de +20 herramientas premium',
    content_type: 'product',
  });
}

/* Hero video autoplay helper + reduced motion handling */
(() => {
  const video = document.querySelector('.hero-video video');
  if(!video) return;
  video.volume = 1.0;
  try { video.muted = false; } catch(e){}
  video.play().catch(()=> {
    const onInteract = () => {
      try { video.muted = false; video.volume = 1.0; } catch(e){}
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(()=>{/* ignore */});
      } else if (video.webkitEnterFullscreen) {
        try { video.webkitEnterFullscreen(); } catch(e){}
      }
      video.play().then(()=> { }).catch(()=> { });
      video.removeEventListener('pointerdown', onInteract);
    };
    video.addEventListener('pointerdown', onInteract, { once: true });
  });
})();

if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('.tool, .reveal').forEach(el=>{
    el.style.transition = 'none';
    el.style.transform = 'none';
    el.style.opacity = '1';
  });
}

/* WhatsApp FAB visibility when #pago is in view */
(() => {
  const fab = document.getElementById('whatsappFab');
  const target = document.getElementById('pago');
  if(!fab || !target) return;

  fab.classList.remove('visible');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        fab.classList.add('visible');
      } else {
        fab.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  io.observe(target);

  window.addEventListener('hashchange', () => {
    if(location.hash === '#pago'){
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  }, { passive: true });
})();

/* --- Carousel behavior & auto-scroll with drag/focus handling (inlined) --- */
(() => {
  const carouselTrack = document.querySelector('.carousel-track');
  if(!carouselTrack) return;

  let autoScrollId = null;
  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollId = setInterval(()=> {
      const card = carouselTrack.querySelector('.tool');
      const step = (card ? card.getBoundingClientRect().width + 10 : 160);
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
      if (carouselTrack.scrollLeft + step >= maxScroll - 2) {
        carouselTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
        setTimeout(()=> carouselTrack.scrollTo({ left: 0, behavior: 'smooth' }), 3000);
      } else {
        carouselTrack.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 2400);
  };
  const stopAutoScroll = () => { if(autoScrollId) { clearInterval(autoScrollId); autoScrollId = null; } };

  const scrollByWidth = () => {
    const card = carouselTrack.querySelector('.tool');
    return (card ? card.getBoundingClientRect().width + 10 : 160);
  };

  let isDown=false, startX, scrollLeft;
  let resumeTimeout = null;
  const scheduleResume = (delay = 5000) => {
    if(resumeTimeout) clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(()=> {
      startAutoScroll();
      resumeTimeout = null;
    }, delay);
  };
  const clearScheduledResume = () => { if(resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; } };

  carouselTrack.addEventListener('pointerdown', (e)=>{
    isDown = true;
    stopAutoScroll();
    clearScheduledResume();
    carouselTrack.setPointerCapture(e.pointerId);
    startX = e.clientX;
    scrollLeft = carouselTrack.scrollLeft;
  });
  carouselTrack.addEventListener('pointermove', (e)=>{
    if(!isDown) return;
    const dx = e.clientX - startX;
    carouselTrack.scrollLeft = scrollLeft - dx;
  });
  const endDrag = (e)=>{
    if(!isDown) return;
    isDown=false;
    try{ carouselTrack.releasePointerCapture(e.pointerId) }catch{}
    scheduleResume(5000);
  };
  carouselTrack.addEventListener('pointerup', endDrag);
  carouselTrack.addEventListener('pointercancel', endDrag);
  carouselTrack.addEventListener('pointerleave', (e)=>{
    if(isDown) endDrag(e);
  });

  let activeTouchTool = null;
  const setTouching = (el) => { if(activeTouchTool && activeTouchTool !== el){ activeTouchTool.classList.remove('touching'); } activeTouchTool = el; if(el) el.classList.add('touching'); };

  carouselTrack.addEventListener('pointerdown', (e)=>{
    const tool = e.target.closest('.tool');
    if(tool) setTouching(tool);
  });
  const clearTouching = (e) => { if(activeTouchTool){ activeTouchTool.classList.remove('touching'); activeTouchTool = null; } };
  carouselTrack.addEventListener('pointerup', clearTouching);
  carouselTrack.addEventListener('pointercancel', clearTouching);
  carouselTrack.addEventListener('pointerleave', (e)=>{ clearTouching(e); });

  const carouselWrap = document.getElementById('toolsCarousel');
  carouselWrap?.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') { e.preventDefault(); stopAutoScroll(); carouselTrack.scrollBy({left: scrollByWidth(), behavior:'smooth'}); scheduleResume(5000); }
    if(e.key === 'ArrowLeft') { e.preventDefault(); stopAutoScroll(); carouselTrack.scrollBy({left: -scrollByWidth(), behavior:'smooth'}); scheduleResume(5000); }
  });

  const carouselStartObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        startAutoScroll();
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.25 });
  carouselStartObserver.observe(carouselTrack);

  carouselTrack.addEventListener('pointerenter', (e)=>{
    stopAutoScroll();
    clearScheduledResume();
  });
  carouselTrack.addEventListener('pointerleave', (e)=>{
    if(!isDown) scheduleResume(5000);
  });

  carouselTrack.addEventListener('focusin', (e)=>{
    stopAutoScroll();
    clearScheduledResume();
  });
  carouselTrack.addEventListener('focusout', (e)=>{
    scheduleResume(5000);
  });
})();

/* --- SFX pool & button press handling (inlined) --- */
(() => {
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

  window.__packCreativoButtonSfx = { play: playSfx };
})();

/* --- Background audio management (inlined) --- */
(() => {
  const audio = new Audio('Música fondo.MP3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';

  let playAttempts = 0;
  const MAX_ATTEMPTS = 6;
  const ATTEMPT_INTERVAL = 3000;
  let retryId = null;

  const tryPlay = async () => {
    if (playAttempts >= MAX_ATTEMPTS) return;
    playAttempts++;
    try {
      await audio.play();
      clearInterval(retryId);
    } catch (err) {
      // silent
    }
  };

  tryPlay();
  retryId = setInterval(() => {
    tryPlay();
    if (playAttempts >= MAX_ATTEMPTS) clearInterval(retryId);
  }, ATTEMPT_INTERVAL);

  const heroVideo = document.querySelector('.hero-video video');
  if (heroVideo) {
    const onVideoPointer = () => {
      if (!audio.paused) audio.pause();
    };
    heroVideo.addEventListener('pointerdown', onVideoPointer, { passive: true });
    heroVideo.addEventListener('pause', () => {
      audio.play().catch(()=>{/* ignore */});
    });
  }

  window.__packCreativoBackgroundAudio = audio;
})();

/* Accessibility helper: back-to-top from thank you card button */
document.querySelector('#thankyou .btn')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.scrollTo({top:0, behavior:'smooth'});
});