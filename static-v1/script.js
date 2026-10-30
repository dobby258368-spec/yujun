// 主視覺幻燈片
(function () {
  const slides = document.querySelectorAll('.slide');
  const dotsBox = document.querySelector('.dots');
  const INTERVAL = 5000;
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `第 ${i + 1} 張`);
    dot.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(dot);
  });
  const dots = dotsBox.querySelectorAll('button');

  function go(i) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), INTERVAL);
  }

  document.querySelector('.prev').addEventListener('click', () => { go(current - 1); restart(); });
  document.querySelector('.next').addEventListener('click', () => { go(current + 1); restart(); });

  dots[0].classList.add('is-active');
  restart();
})();

// 手機選單
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
