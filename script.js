// ===== Rotating hero questions =====
(() => {
  const qs = document.querySelectorAll('.questions .q');
  if (!qs.length) return;

  let qi = 0;
  setInterval(() => {
    qs[qi].classList.remove('active');
    qi = (qi + 1) % qs.length;
    qs[qi].classList.add('active');
  }, 2600);
})();

// ===== PR vs PA Reveal (Canvas) =====
(() => {
  const stage  = document.getElementById('stage');
  const img    = document.getElementById('stageImage');
  const canvas = document.getElementById('revealCanvas');
  const btnPR  = document.getElementById('btn-pr');
  const btnPA  = document.getElementById('btn-pa');
  const def    = document.getElementById('definition'); // optional helper text (currently not present)

  if (!stage || !img || !canvas) return;
  const ctx = canvas.getContext('2d');

  let mode = 'PR';         // 'PR' or 'PA'
  const radius = 70;       // size of the reveal circle
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }
  window.addEventListener('resize', resizeCanvas);

  function punch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function handleMouseMove(e) {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'PR') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    punch(x, y);
  }

  function resetOverlay() {
    const rect = stage.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function setPR() {
    mode = 'PR';
    btnPR?.classList.add('active'); btnPR?.setAttribute('aria-pressed', 'true');
    btnPA?.classList.remove('active'); btnPA?.setAttribute('aria-pressed', 'false');
    if (def) def.innerHTML = '<strong>PR</strong>: only the slice under your cursor is visible; nothing sticks.';
    resetOverlay();
  }

  function setPA() {
    mode = 'PA';
    btnPA?.classList.add('active'); btnPA?.setAttribute('aria-pressed', 'true');
    btnPR?.classList.remove('active'); btnPR?.setAttribute('aria-pressed', 'false');
    if (def) def.innerHTML = '<strong>PA</strong>: each slice you hover stays lit; reveal the full image.';
  }

  btnPR?.addEventListener('click', setPR);
  btnPA?.addEventListener('click', setPA);

  stage.addEventListener('mousemove', handleMouseMove);
  stage.addEventListener('mouseleave', () => {
    if (mode === 'PR') resetOverlay();
  });

  function init() {
    resizeCanvas();
    setPR();
  }
  if (img.complete) {
    init();
  } else {
    img.addEventListener('load', init);
  }
})();

// ===== Persona-aware FAQ with native <details> + typing dots =====
(() => {
  const root = document.querySelector('#faq .faq-grid');
  if (!root) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DELAY = prefersReduced ? 0 : 450;

  const btnDiya  = document.getElementById('p-diya');
  const btnVivek = document.getElementById('p-vivek');

  function setMode(mode){
    root.setAttribute('data-mode', mode);
    const isDiya = mode === 'diya';
    btnDiya?.classList.toggle('active', isDiya);
    btnDiya?.setAttribute('aria-pressed', String(isDiya));
    btnVivek?.classList.toggle('active', !isDiya);
    btnVivek?.setAttribute('aria-pressed', String(!isDiya));

    root.querySelectorAll('details.qa[open]').forEach(d => showForCurrentPersona(d));
  }

  btnDiya?.addEventListener('click', ()=> setMode('diya'));
  btnVivek?.addEventListener('click', ()=> setMode('vivek'));

  root.querySelectorAll('details.qa').forEach(d=>{
    d.querySelectorAll('.atext').forEach(el => el.style.display = 'none');
    d.querySelectorAll('.typing').forEach(el => el.style.display = 'none');

    d.addEventListener('toggle', ()=>{
      if (!d.open) {
        d.querySelectorAll('.typing').forEach(el => el.style.display = 'none');
        d.querySelectorAll('.atext').forEach(el => el.style.display = 'none');
        return;
      }
      showForCurrentPersona(d);
    });
  });

  function showForCurrentPersona(detailsEl){
    const mode = root.getAttribute('data-mode') || 'diya';
    const target = detailsEl.querySelector(`.ans.${mode}`);
    if (!target) return;

    detailsEl.querySelectorAll('.atext').forEach(el => el.style.display = 'none');
    detailsEl.querySelectorAll('.typing').forEach(el => el.style.display = 'none');

    const typing = target.querySelector('.typing');
    const atext  = target.querySelector('.atext');
    if (!typing || !atext) return;

    typing.style.display = 'flex';
    atext.style.display = 'none';

    setTimeout(()=>{
      if (!detailsEl.open) return;
      typing.style.display = 'none';
      atext.style.display = 'block';
    }, DELAY);
  }

  setMode('diya');
})();

// ===== Scroll-based section reveal =====
(() => {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;

  if (!('IntersectionObserver' in window)) {
    sections.forEach(sec => sec.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach(sec => {
    if (sec.classList.contains('is-visible')) return;
    observer.observe(sec);
  });
})();

// ===== PR vs PA text toggle (definition blocks) =====
(() => {
  const prBtn  = document.getElementById("btn-pr");
  const paBtn  = document.getElementById("btn-pa");
  const prCopy = document.querySelector(".pr-copy");
  const paCopy = document.querySelector(".pa-copy");

  if (!prBtn || !paBtn || !prCopy || !paCopy) return;

  prBtn.addEventListener("click", () => {
    prBtn.classList.add("active");
    paBtn.classList.remove("active");
    prCopy.classList.add("active");
    paCopy.classList.remove("active");
  });

  paBtn.addEventListener("click", () => {
    paBtn.classList.add("active");
    prBtn.classList.remove("active");
    paCopy.classList.add("active");
    prCopy.classList.remove("active");
  });
})();

// ===== Ethos underline reveal on scroll =====
(() => {
  const ethos = document.querySelector('.footer-ethos-inner');
  if (!ethos) return;

  if (!('IntersectionObserver' in window)) {
    ethos.classList.add('underline-active');
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ethos.classList.add('underline-active');
          observer.unobserve(ethos);
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(ethos);
})();
