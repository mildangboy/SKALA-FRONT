// tripMapEasterEgg.js : 세계 지도 위에 마우스를 10초 이상 올려두면 부활절 토끼
// 이스터에그 팝업을 보여줍니다. 화면 아무 곳이나 클릭하면 다시 사라집니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다 (spaNav.js가 페이지 전환마다
// 이 스크립트를 다시 삽입해 재실행하기 때문입니다).
(function () {
  const mapEl = document.querySelector('.trip-map');
  const overlay = document.getElementById('mapEasterEgg');
  if (!mapEl || !overlay) return;

  const HOVER_MS = 10000;
  let timer = null;

  function startTimer() {
    clearTimer();
    timer = setTimeout(() => {
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
    }, HOVER_MS);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function closeOverlay() {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  mapEl.addEventListener('mouseenter', startTimer);
  mapEl.addEventListener('mouseleave', clearTimer);

  document.addEventListener('click', () => {
    if (overlay.classList.contains('is-visible')) {
      closeOverlay();
    }
  });
})();
