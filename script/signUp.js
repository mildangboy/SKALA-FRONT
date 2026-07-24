// signUp.js : Sign In / Sign Up 페이지 전반을 담당합니다.
// 1) 로그인 / 회원가입 탭 전환
// 2) 로그인 폼 제출 시, 이 사이트는 백엔드가 없는 데모라는 안내와 함께 메인으로
//    돌아가는 버튼을 보여줌 (실제 인증은 하지 않음)
// 3) 회원가입 폼 제출 시 필수 항목이 비어 있으면 경고하고 제출을 막음 (form에
//    novalidate가 있어 브라우저 기본 검증이 자동으로 동작하지 않으므로, 제출 시점에
//    직접 checkValidity()/reportValidity()를 호출해 검증합니다)
// 4) 이스터에그: 회원가입 폼의 이름 / 비밀번호 / 비밀번호 확인 세 항목이 모두
//    'admin'이 되는 순간(제출 버튼을 누르지 않아도) 숨겨진 관리자 배너 페이지로 이동
//
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(function () {
  // ---- 1) 로그인 / 회원가입 탭 전환 ----
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInPanel = document.getElementById('signInPanel');
  const signUpPanel = document.getElementById('signUpPanel');
  const signInForm = document.getElementById('signInForm');
  const signInNotice = document.getElementById('signInNotice');

  if (tabSignIn && tabSignUp && signInPanel && signUpPanel) {
    const activate = (tab) => {
      const showSignIn = tab === 'signIn';

      tabSignIn.setAttribute('aria-selected', String(showSignIn));
      tabSignUp.setAttribute('aria-selected', String(!showSignIn));
      tabSignIn.classList.toggle('is-active', showSignIn);
      tabSignUp.classList.toggle('is-active', !showSignIn);

      signInPanel.hidden = !showSignIn;
      signUpPanel.hidden = showSignIn;

      // 로그인 탭으로 다시 돌아오면 이전 데모 안내는 접어두고 폼을 다시 보여줌
      if (showSignIn && signInForm && signInNotice) {
        signInForm.hidden = false;
        signInNotice.hidden = true;
      }
    };

    tabSignIn.addEventListener('click', () => activate('signIn'));
    tabSignUp.addEventListener('click', () => activate('signUp'));

    // 초기 상태(로그인 탭이 기본으로 선택됨)를 마크업과 맞춰줌
    activate('signIn');
  }

  // ---- 2) 로그인 폼: 실제 인증 없이 데모 안내만 표시 ----
  if (signInForm && signInNotice) {
    signInForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!signInForm.checkValidity()) {
        signInForm.reportValidity();
        return;
      }
      signInForm.hidden = true;
      signInNotice.hidden = false;
    });
  }

  // ---- 3) & 4) 회원가입 폼: 유효성 검증 + 관리자 이스터에그 ----
  const form = document.getElementById('signUpForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    const pw = document.getElementById('userPw');
    const pwConfirm = document.getElementById('userPwConfirm');
    if (pw && pwConfirm && pw.value !== pwConfirm.value) {
      event.preventDefault();
      alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
      pwConfirm.focus();
      return;
    }

    // 이 폼은 method="get"이라 제출 값이 그대로 signUpResult.html의 URL
    // 쿼리스트링에 담깁니다. 결과 페이지 화면에는 비밀번호를 표시하지 않지만,
    // 그것만으로는 부족합니다 — disabled 처리된 입력은 FormData/네이티브 폼
    // 제출 모두에서 자동으로 제외되므로, 제출 직전 비밀번호 필드를 disabled로
    // 바꿔 주소창에도 비밀번호가 노출되지 않도록 합니다.
    if (pw) pw.disabled = true;
    if (pwConfirm) pwConfirm.disabled = true;
  });

  const nameInput = document.getElementById('userName');
  const pwInput = document.getElementById('userPw');
  const pwConfirmInput = document.getElementById('userPwConfirm');

  if (nameInput && pwInput && pwConfirmInput) {
    let triggered = false;
    const checkAdminEasterEgg = () => {
      if (triggered) return;
      if (
        nameInput.value === 'admin' &&
        pwInput.value === 'admin' &&
        pwConfirmInput.value === 'admin'
      ) {
        triggered = true;
        window.location.href = 'adminBanner.html';
      }
    };
    [nameInput, pwInput, pwConfirmInput].forEach((el) => {
      el.addEventListener('input', checkAdminEasterEgg);
    });
  }
})();
