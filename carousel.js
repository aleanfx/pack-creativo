// New module: carousel behavior and auto-scroll with drag/focus handling

const carouselTrack = document.querySelector('.carousel-track');
if(carouselTrack){
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
}