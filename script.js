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
  const def    = document.getElementById('definition'); // optional helper text

  if (!stage || !img || !canvas) return;
  const ctx = canvas.getContext('2d');

  let mode = 'PR';
  const radius = 70;
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

// ===== Persona-aware FAQ =====
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

// ===== PR vs PA text toggle =====
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

// ===== Ethos underline reveal =====
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

// ===== AUDIT OVERLAY (full-screen, same page) =====
(() => {
  const overlay = document.getElementById('auditOverlay');
  const openBtn = document.getElementById('startAuditBtn');
  const closeBtn = document.getElementById('auditCloseBtn');
  const form = document.getElementById('auditForm');
  const steps = Array.from(document.querySelectorAll('.audit-step'));
  const progressBar = document.querySelector('.audit-progress-bar');
  const progressText = document.getElementById('progressText');
  const thanksBlock = document.getElementById('auditThanks');
  const closeAfterBtn = document.getElementById('auditCloseAfter');

  if (!overlay || !openBtn || !form || !steps.length || !progressBar || !progressText) return;

  const totalQuestionSteps = 9; // steps 1..9 (0 is intro)
  let current = 0;

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function resetFormUI() {
    form.reset();
    document
      .querySelectorAll('.choice-grid button, .choice-stack button')
      .forEach(btn => btn.classList.remove('is-selected'));
    const wrap = document.getElementById('photoUploadWrap');
    if (wrap) wrap.classList.add('is-hidden');
  }

  function openOverlay() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();

    form.style.display = 'block';
    thanksBlock?.classList.remove('is-visible');
    resetFormUI();
    showStep(0);
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
  }

  function updateProgress(stepIndex) {
    if (stepIndex === 0) {
      progressBar.style.width = '0%';
      progressText.textContent = 'Intro';
      return;
    }
    const logical = stepIndex;
    const pct = (logical / totalQuestionSteps) * 100;
    progressBar.style.width = pct + '%';
    progressText.textContent = `Step ${logical} of ${totalQuestionSteps}`;
  }

  function showStep(i) {
    if (i < 0 || i >= steps.length) return;
    steps.forEach(s => s.classList.remove('is-active'));
    steps[i].classList.add('is-active');
    current = i;
    updateProgress(i);
    const shell = overlay.querySelector('.audit-overlay-shell');
    if (shell) shell.scrollTop = 0;
  }

  function validateStep(stepIndex) {
    const section = steps[stepIndex];
    if (!section) return true;

    let valid = true;
    section.querySelectorAll('.field-error').forEach(el =>
      el.classList.remove('field-error')
    );

    const requiredFields = section.querySelectorAll(
      'input[required], textarea[required]'
    );

    requiredFields.forEach(field => {
      const value = (field.value || '').trim();
      if (!value) {
        valid = false;
        const wrapper = field.closest('.field') || field.parentElement;
        if (wrapper) wrapper.classList.add('field-error');
      }
    });

    return valid;
  }

  function showThanks() {
    progressBar.style.width = '100%';
    progressText.textContent = 'Done';

    form.style.display = 'none';
    if (thanksBlock) {
      thanksBlock.classList.add('is-visible');
    }
    const shell = overlay.querySelector('.audit-overlay-shell');
    if (shell) shell.scrollTop = 0;
  }

  openBtn.addEventListener('click', openOverlay);
  closeBtn?.addEventListener('click', closeOverlay);
  closeAfterBtn?.addEventListener('click', closeOverlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeOverlay();
    }
  });

  document.querySelectorAll('.js-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current !== 0 && !validateStep(current)) return;
      showStep(current + 1);
    });
  });

  document.querySelectorAll('.js-back').forEach(btn => {
    btn.addEventListener('click', () => {
      showStep(current - 1);
    });
  });

  function initChoiceGroup(group) {
    const name = group.dataset.name;
    const type = group.dataset.type;
    const hidden = document.querySelector(`input[name="${name}"]`);

    group.addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') return;
      const btn = e.target;
      const val = btn.dataset.value;

      if (type === 'single') {
        group.querySelectorAll('button').forEach(b =>
          b.classList.remove('is-selected')
        );
        btn.classList.add('is-selected');
        if (hidden) hidden.value = val;
      } else {
        btn.classList.toggle('is-selected');
        const selected = Array.from(
          group.querySelectorAll('button.is-selected')
        ).map(b => b.dataset.value);
        if (hidden) hidden.value = selected.join(',');
      }

      if (name === 'photo_choice') {
        const wrap = document.getElementById('photoUploadWrap');
        if (!wrap) return;
        if (val === 'upload') wrap.classList.remove('is-hidden');
        else wrap.classList.add('is-hidden');
      }
    });
  }

  document
    .querySelectorAll('.choice-grid, .choice-stack')
    .forEach(initChoiceGroup);

  form.addEventListener('submit', async e => {
    if (!validateStep(current)) {
      e.preventDefault();
      return;
    }

    const hasEndpoint =
      form.action && form.action.toLowerCase().includes('formspree');

    if (hasEndpoint) {
      e.preventDefault();
      const data = new FormData(form);

      try {
        await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
      } catch (err) {
        console.error('Audit submit error:', err);
      }
    } else {
      e.preventDefault();
    }

    showThanks();
  });
})();
 
