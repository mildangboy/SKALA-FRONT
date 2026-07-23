// bag.js : 가방 소지품 출력
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnBag');
  const output = document.getElementById('bagOutput');
  if (!btn || !output) return;

  const bagItems = [
    { name: '노트북', category: '전자기기', quantity: 1 },
    { name: '텀블러', category: '생활용품', quantity: 1 },
    { name: '필통', category: '문구', quantity: 1 },
    { name: '지갑', category: '개인용품', quantity: 1 },
    { name: '우산', category: '생활용품', quantity: 1 },
  ];

  btn.addEventListener('click', () => {
    let html = '<ul>';

    for (const item of bagItems) {
      html += `<li>${item.name} (${item.category}) - ${item.quantity}개</li>`;
    }

    html += '</ul>';
    output.innerHTML = html;
  });
});
