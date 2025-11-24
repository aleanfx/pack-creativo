// New module: UI utilities, toast, form, payment details and small helpers
// Provides: reveal observer, year injection, promo countdown, payment UI, copy handlers, form submit, meta pixel trigger, hero video helper, reduced motion handling, whatsapp fab visibility and back-to-top

const toast = (msg)=>{
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 1800);
};

/* Reveal on scroll */
const revealEls = [...document.querySelectorAll('.reveal'), ...document.querySelectorAll('.tool')];
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('revealed');
      io.unobserve(e.target);
    }
  })
}, {threshold:.15});
revealEls.forEach(el=>io.observe(el));

/* Year */
document.getElementById('year').textContent = new Date().getFullYear();

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
const paymentDetailsEl = document.getElementById('paymentDetails');
const methodEl = document.getElementById('method');

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

/* Form submission */
const form = document.getElementById('orderForm');
const statusEl = document.getElementById('formStatus');
const MAX_SIZE = 10 * 1024 * 1024;

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  statusEl.textContent = 'Procesando tu pedido...';
  const fd = new FormData(form);

  const file = form.attachment.files[0];
  if(!file){ statusEl.textContent = 'Adjunta el capture del pago.'; return; }
  if(file.size > MAX_SIZE){ statusEl.textContent = 'El archivo supera 10MB.'; return; }

  let sent = false;
  try{
    const res = await fetch('/api/order', { method:'POST', body: fd });
    sent = res.ok;
  }catch(err){ /* ignore */ }

  // Fire Lead event only at form submit on this page (do not fire on thankyou page)
  try {
    if (window.fbq && typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration');
    }
  } catch (err) { /* ignore pixel errors */ }

  // Redirect to animated thank you page with user data as query params for WhatsApp prefill
  const params = new URLSearchParams({
    name: fd.get('name') || '',
    email: fd.get('email') || '',
    phone: fd.get('phone') || '',
    method: fd.get('method') || ''
  });
  window.location.href = '/thankyou.html?' + params.toString();
});

/* Meta Pixel loader + Purchase event */
const META_PIXEL_ID = ""; // keep blank by default; change in main.js if needed
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

/* Hero video autoplay helper + reduced motion */
(() => {
  const video = document.querySelector('.hero-video video');
  if(!video) return;
  video.volume = 1.0;
  try { video.muted = false; } catch(e){}
  video.play().catch(()=> {
    // Do not show any toast/notice for autoplay/sound
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

if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
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

/* Expose toast for other modules */
window.__packCreativoToast = toast;