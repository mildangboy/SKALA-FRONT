// spaNav.js : 내부 페이지 이동을 fetch 기반으로 가로채서 #app 영역만 교체하는
// 초경량 SPA 라우터. body 밖(정확히는 #app 밖)에 있는 BGM 위젯/유튜브 플레이어는
// 절대 다시 그려지지 않으므로, 페이지를 이동해도 배경음악이 끊기지 않습니다.
//
// - 같은 폴더의 .html 내부 링크만 가로챕니다 (외부 링크, target="_blank", #앵커는
//   그대로 브라우저 기본 동작을 따릅니다).
// - method="get"이고 action이 같은 폴더 .html인 폼 제출도 가로챕니다 (예:
//   signUp.html → signUpResult.html). 그렇지 않으면 폼 제출은 전체 페이지를
//   새로 불러오는 진짜 네비게이션이 되어, #app 밖의 BGM도 처음부터 다시
//   시작되기 때문입니다.
// - fetch가 실패하면(예: file:// 프로토콜, 네트워크 오류) 일반 페이지 이동으로
//   자동 대체됩니다.
(function () {
  const APP_ID = 'app';

  function isSpaLink(link) {
    if (!link) return false;
    if (link.target === '_blank') return false;
    if (link.hasAttribute('download')) return false;
    const href = link.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (/^([a-z]+:)?\/\//i.test(href)) return false; // http(s)://, // 등 외부/절대 URL
    if (!href.endsWith('.html')) return false;
    return true;
  }

  function isSpaForm(form) {
    if (!form) return false;
    const method = (form.getAttribute('method') || 'get').toLowerCase();
    if (method !== 'get') return false; // POST 등은 그대로 기본 동작
    if (form.target === '_blank') return false;
    const action = form.getAttribute('action');
    if (!action) return false;
    if (/^([a-z]+:)?\/\//i.test(action)) return false; // 외부/절대 URL
    if (!action.endsWith('.html')) return false;
    return true;
  }

  function runPageScripts(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((old) => {
      const fresh = document.createElement('script');
      for (const attr of Array.from(old.attributes)) {
        fresh.setAttribute(attr.name, attr.value);
      }

      // 주의: type="module" 스크립트는 일반 스크립트와 달리, 브라우저가 같은 URL의
      // 모듈을 "이미 평가된 모듈"로 캐시해두기 때문에 동일한 src로 다시 삽입해도
      // 최상위 코드가 재실행되지 않습니다 (예: realtimeInfo.js, myRanking.js).
      // 그래서 SPA 이동으로 페이지에 처음/다시 들어올 때 데이터가 안 뜨고,
      // 새로고침(완전한 새 문서 로드)해야만 정상 동작하는 문제가 있었습니다.
      // 매번 고유한 쿼리스트링을 붙여 브라우저가 "새 모듈"로 인식하고
      // 다시 실행하도록 강제해서 해결합니다.
      if (fresh.type === 'module' && fresh.src) {
        const url = new URL(fresh.src, window.location.href);
        url.searchParams.set('_spa', Date.now().toString());
        fresh.src = url.href;
      }

      fresh.textContent = old.textContent;
      old.replaceWith(fresh);
    });
  }

  async function swapTo(url, push) {
    const app = document.getElementById(APP_ID);
    if (!app) {
      window.location.href = url;
      return;
    }

    let html;
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (err) {
      // fetch 실패(예: file:// 프로토콜, 네트워크 문제) 시 일반 이동으로 대체
      window.location.href = url;
      return;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newApp = doc.getElementById(APP_ID);
    if (!newApp) {
      window.location.href = url;
      return;
    }

    document.title = doc.title;
    app.innerHTML = newApp.innerHTML;
    window.scrollTo(0, 0);

    if (push) {
      history.pushState({ spaUrl: url }, '', url);
    }

    runPageScripts(app);
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a');
    if (!isSpaLink(link)) return;

    const href = link.getAttribute('href');
    const targetUrl = new URL(href, window.location.href).href;

    event.preventDefault();

    if (targetUrl === window.location.href) return;

    swapTo(href, true);
  });

  document.addEventListener('submit', (event) => {
    // signUp.js 등 다른 제출 핸들러가 이미 유효성 검사에 실패해 preventDefault()를
    // 호출했다면(예: 필수 항목 미입력) 그대로 두고 SPA 이동을 시도하지 않습니다.
    if (event.defaultPrevented) return;

    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !isSpaForm(form)) return;

    const action = form.getAttribute('action');
    const params = new URLSearchParams(new FormData(form));
    const url = params.toString() ? `${action}?${params.toString()}` : action;

    event.preventDefault();
    swapTo(url, true);
  });

  window.addEventListener('popstate', () => {
    const path = window.location.pathname.split('/').pop() + window.location.search;
    swapTo(path, false);
  });
})();
