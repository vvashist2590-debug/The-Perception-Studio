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
  const def    = document.getElementById('definition');

  if (!stage || !img || !canvas) return;
  const ctx = canvas.getContext('2d');

  let mode = 'PR';         // 'PR' or 'PA'
  let radius = 70;         // size of the reveal circle
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  // Resize canvas to match rendered size (and DPR for crispness)
  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Fill black overlay fresh
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }
  window.addEventListener('resize', resizeCanvas);

  // Draw a circular “hole” at x,y
  function punch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // For PR, we reset the overlay each move, then punch once
  function handleMouseMove(e) {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'PR') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, rect.width, rect.height); // reset to full black
    }
    punch(x, y);
  }

  // Reset overlay fully black (used on PR mouseleave)
  function resetOverlay() {
    const rect = stage.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  // Toggle modes
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
    // keep what’s already revealed (don’t reset)
  }

  btnPR?.addEventListener('click', setPR);
  btnPA?.addEventListener('click', setPA);

  // Attach interactions to stage (not canvas, which is pointer-events:none)
  stage.addEventListener('mousemove', handleMouseMove);
  stage.addEventListener('mouseleave', () => {
    if (mode === 'PR') resetOverlay();
  });

  // Init once image has dimensions (in case it loads later)
  function init() {
    resizeCanvas();
    setPR(); // default
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

    // Re-play typing for currently visible persona in all open items
    root.querySelectorAll('details.qa[open]').forEach(d => showForCurrentPersona(d));
  }

  btnDiya?.addEventListener('click', ()=> setMode('diya'));
  btnVivek?.addEventListener('click', ()=> setMode('vivek'));

  // Initialize each details item
  root.querySelectorAll('details.qa').forEach(d=>{
    // Hide both persona texts initially
    d.querySelectorAll('.atext').forEach(el => el.style.display = 'none');
    d.querySelectorAll('.typing').forEach(el => el.style.display = 'none');

    d.addEventListener('toggle', ()=>{
      if (!d.open) {
        // Closing: hide typing + text for both personas
        d.querySelectorAll('.typing').forEach(el => el.style.display = 'none');
        d.querySelectorAll('.atext').forEach(el => el.style.display = 'none');
        return;
      }
      // Opening: show typing for the currently selected persona
      showForCurrentPersona(d);
    });
  });

  function showForCurrentPersona(detailsEl){
    const mode = root.getAttribute('data-mode') || 'diya';
    const target = detailsEl.querySelector(`.ans.${mode}`);
    if (!target) return;

    // Hide all persona texts & typing, then show typing for the active one
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

  // Default to Diya on load
  setMode('diya');
})();
