// tripMapEasterEgg.js : 세계 지도 위에서 마우스 포인터가 10초 이상 '정지'해
// 있으면 부활절 토끼 이스터에그 팝업을 보여줍니다. (마우스가 조금이라도 움직이면
// 타이머가 다시 시작됩니다.) 화면 아무 곳이나 클릭하면 다시 사라집니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다 (spaNav.js가 페이지 전환마다
// 이 스크립트를 다시 삽입해 재실행하기 때문입니다).
(function () {
  const mapEl = document.querySelector('.trip-map');
  const overlay = document.getElementById('mapEasterEgg');
  if (!mapEl || !overlay) return;

  const STILL_MS = 10000;
  let timer = null;

  function restartTimer() {
    clearTimer();
    timer = setTimeout(() => {
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
    }, STILL_MS);
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

  // 마우스가 지도 위에 들어오거나, 들어온 채로 움직일 때마다 "정지 10초" 타이머를
  // 다시 시작합니다. 즉, 10초 동안 한 번도 움직이지 않아야만 팝업이 뜹니다.
  mapEl.addEventListener('mouseenter', restartTimer);
  mapEl.addEventListener('mousemove', restartTimer);
  mapEl.addEventListener('mouseleave', clearTimer);

  document.addEventListener('click', () => {
    if (overlay.classList.contains('is-visible')) {
      closeOverlay();
    }
  });
})();
