// signUp.js : 회원가입 폼 제출 시 필수 항목이 비어 있으면 경고하고 제출을 막습니다.
// form에 novalidate가 있어 브라우저 기본 검증이 자동으로 동작하지 않으므로,
// 제출 시점에 직접 checkValidity()/reportValidity()를 호출해 검증합니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(function () {
  const form = document.querySelector('form');
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
    }
  });
})();
