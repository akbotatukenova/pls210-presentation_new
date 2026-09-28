const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const fullBtn = document.getElementById('fullBtn');
const currentSlideEl = document.getElementById('currentSlide');
const totalSlidesEl = document.getElementById('totalSlides');
const journeyFill = document.getElementById('journeyFill');
const horseRunner = document.getElementById('horseRunner');
const boundaryRange = document.getElementById('boundaryRange');
const boundaryNote = document.getElementById('boundaryNote');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = 0;
let touchStartX = 0;
let touchEndX = 0;

const boundaryTexts = [
  'A low placement suggests the line is crossed quickly. My study asks what makes that judgment persuasive.',
  'A middle placement highlights ambiguity. My project begins from that ambiguity, not from a fixed answer.',
  'A high placement suggests more sporting demand is seen as acceptable. My question is how people justify that view.'
];

if (boundaryRange && boundaryNote) {
  boundaryRange.addEventListener('input', () => {
    const value = Number(boundaryRange.value);
    if (value < 34) boundaryNote.textContent = boundaryTexts[0];
    else if (value < 67) boundaryNote.textContent = boundaryTexts[1];
    else boundaryNote.textContent = boundaryTexts[2];
  });
}

totalSlidesEl.textContent = String(slides.length).padStart(2, '0');

function indexFromHash() {
  const hash = window.location.hash.replace('#', '');
  const number = parseInt(hash, 10);
  if (!Number.isNaN(number) && number >= 1 && number <= slides.length) {
    return number - 1;
  }
  return 0;
}

function setHorsePosition(index, animate = true) {
  const progress = slides.length === 1 ? 0 : index / (slides.length - 1);
  const left = 4 + progress * 72; // vw
  horseRunner.style.left = `${left}vw`;
  if (animate && !reducedMotion) {
    horseRunner.classList.remove('gallop');
    void horseRunner.offsetWidth;
    horseRunner.classList.add('gallop');
    setTimeout(() => horseRunner.classList.remove('gallop'), 700);
  }
}

function updateProgress(index) {
  const ratio = ((index + 1) / slides.length) * 100;
  journeyFill.style.width = `${ratio}%`;
  currentSlideEl.textContent = String(index + 1).padStart(2, '0');
}

function showSlide(index, pushHash = true) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === current);
    slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    slide.tabIndex = i === current ? 0 : -1;
  });
  updateProgress(current);
  setHorsePosition(current, true);
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
  if (pushHash) {
    history.replaceState(null, '', `#${current + 1}`);
  }
}

function nextSlide() { if (current < slides.length - 1) showSlide(current + 1); }
function prevSlide() { if (current > 0) showSlide(current - 1); }

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

fullBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

document.addEventListener('keydown', (event) => {
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;

  if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') {
    event.preventDefault();
    nextSlide();
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    prevSlide();
  }
  if (event.key === 'Home') {
    event.preventDefault();
    showSlide(0);
  }
  if (event.key === 'End') {
    event.preventDefault();
    showSlide(slides.length - 1);
  }
});

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const delta = touchEndX - touchStartX;
  if (Math.abs(delta) < 45) return;
  if (delta < 0) nextSlide();
  else prevSlide();
}, { passive: true });

window.addEventListener('hashchange', () => showSlide(indexFromHash(), false));
window.addEventListener('resize', () => setHorsePosition(current, false));

showSlide(indexFromHash(), false);
setHorsePosition(current, false);
