// arsenalEasterEgg.js : 상단 "Arsenal — Premier League Champions" 티커를 3연속
// 클릭하면 화면 전체를 채우는 아스날 로고가 5초에 걸쳐 서서히 불투명해지고,
// 3초간 유지된 뒤 사라지는 이스터에그입니다. 모든 페이지 공통으로 동작합니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다 (spaNav.js가 페이지 전환마다
// 이 스크립트를 다시 삽입해 재실행하기 때문입니다).
(function () {
  const ticker = document.querySelector('.ticker');
  const overlay = document.getElementById('arsenalEasterEgg');
  if (!ticker || !overlay) return;

  const CLICK_WINDOW_MS = 600;
  const FADE_IN_MS = 5000;
  const HOLD_MS = 3000;
  const FADE_OUT_MS = 600;

  let clickCount = 0;
  let clickResetTimer = null;
  let animating = false;

  ticker.addEventListener('click', () => {
    clickCount += 1;
    clearTimeout(clickResetTimer);
    clickResetTimer = setTimeout(() => {
      clickCount = 0;
    }, CLICK_WINDOW_MS);

    if (clickCount >= 3) {
      clickCount = 0;
      clearTimeout(clickResetTimer);
      triggerEasterEgg();
    }
  });

  function triggerEasterEgg() {
    if (animating) return;
    animating = true;

    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.style.transition = 'none';
    overlay.style.opacity = '0';
    // 강제 리플로우: 이후 opacity 변경이 transition 애니메이션으로 재생되도록 함
    void overlay.offsetWidth;
    overlay.style.transition = `opacity ${FADE_IN_MS}ms ease`;
    overlay.style.opacity = '1';

    setTimeout(() => {
      setTimeout(() => {
        overlay.style.transition = `opacity ${FADE_OUT_MS}ms ease`;
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.classList.remove('is-visible');
          overlay.setAttribute('aria-hidden', 'true');
          overlay.style.transition = '';
          animating = false;
        }, FADE_OUT_MS);
      }, HOLD_MS);
    }, FADE_IN_MS);
  }
})();
