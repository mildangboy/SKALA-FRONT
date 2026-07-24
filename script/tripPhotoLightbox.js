// tripPhotoLightbox.js : World Trip 페이지의 추천 여행지 사진에 마우스를 올리면
// 화면 중앙에 사진을 크게 띄우는 라이트박스입니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(function () {
  const overlay = document.getElementById('photoLightbox');
  const overlayImg = document.getElementById('photoLightboxImg');
  if (!overlay || !overlayImg) return;

  const cardImages = document.querySelectorAll('.trip-card img');
  if (!cardImages.length) return;

  function showLightbox(img) {
    overlayImg.src = img.currentSrc || img.src;
    overlayImg.alt = img.alt || '';
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hideLightbox() {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  cardImages.forEach((img) => {
    img.addEventListener('mouseenter', () => showLightbox(img));
    img.addEventListener('mouseleave', hideLightbox);
    img.addEventListener('focus', () => showLightbox(img));
    img.addEventListener('blur', hideLightbox);
  });
})();
