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

  // myTrip.html을 SPA로 여러 번 오갈 때마다 이 스크립트가 다시 실행되는데,
  // window/document 리스너를 매번 새로 addEventListener 하면 방문할수록 리스너가
  // 계속 쌓입니다(메모리 누수). nav.js와 같은 방식으로: 이번에 새로 만들어진
  // 지도/오버레이를 "현재 활성 인스턴스"로 등록해두고, window/document 리스너는
  // 세션당 한 번만 등록해서 항상 그 인스턴스로 위임하도록 합니다.
  window.__tripMapEasterEggActive = {
    clearTimer,
    closeOverlay,
    isVisible: () => overlay.classList.contains('is-visible'),
  };

  if (!window.__tripMapEasterEggGlobalListenersBound) {
    window.__tripMapEasterEggGlobalListenersBound = true;

    // 지도 위 도시 점을 클릭하면 구글 검색 결과가 새 탭으로 열리면서 이 탭은
    // 백그라운드로 밀려나는데, setTimeout은 백그라운드에서도 계속 흘러가기 때문에
    // 새 탭을 구경하는 동안 "10초 정지"가 채워져 돌아왔을 때 이스터에그가 이미
    // 떠 있는 문제가 있었습니다. 탭이 비활성화되거나 창이 포커스를 잃으면 타이머를
    // 취소해서, 실제로 화면을 보며 마우스를 멈추고 있을 때만 카운트되도록 합니다.
    window.addEventListener('blur', () => {
      const active = window.__tripMapEasterEggActive;
      if (active) active.clearTimer();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const active = window.__tripMapEasterEggActive;
        if (active) active.clearTimer();
      }
    });
    document.addEventListener('click', () => {
      const active = window.__tripMapEasterEggActive;
      if (active && active.isVisible()) {
        active.closeOverlay();
      }
    });
  }
})();
