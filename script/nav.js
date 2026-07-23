// nav.js : 모바일 햄버거 메뉴 토글 (일반 스크립트 — file://에서도 동작)
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(function () {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('siteNavList');
  if (!toggle || !menu) return;

  // document/window에 매번 새 리스너를 추가하지 않도록, 항상 현재 살아있는
  // #navToggle / #siteNavList를 새로 조회해서 동작하도록 작성합니다.
  function closeMenu() {
    const currentMenu = document.getElementById('siteNavList');
    const currentToggle = document.getElementById('navToggle');
    if (!currentMenu || !currentToggle) return;
    currentMenu.classList.remove('nav-open');
    currentToggle.setAttribute('aria-expanded', 'false');
    currentToggle.setAttribute('aria-label', '메뉴 열기');
  }

  function openMenu() {
    menu.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('nav-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // 메뉴 안의 링크를 클릭하면 자동으로 닫기
  menu.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      closeMenu();
    }
  });

  // 주의: document/window 리스너는 SPA 이동으로 nav.js가 다시 실행될 때마다
  // 새로 추가하면 계속 쌓여서(메모리 누수) 매번 중복 실행됩니다.
  // 세션당 한 번만 등록되도록 플래그로 막습니다. closeMenu가 항상 현재 DOM을
  // 새로 조회하므로, 처음 등록된 리스너 하나만으로도 이후의 모든 페이지에서
  // 정상 동작합니다.
  if (!window.__navGlobalListenersBound) {
    window.__navGlobalListenersBound = true;

    // ESC 키로 닫기
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    // 데스크톱 폭으로 리사이즈되면 상태 초기화
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }
})();
