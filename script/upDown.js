// upDown.js : 1~50 숫자 맞추기 게임
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnUpDown');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const answer = Math.floor(Math.random() * 50) + 1;
    let tries = 0;
    let isCorrect = false;

    while (!isCorrect) {
      const input = prompt('1부터 50 사이의 숫자를 맞춰보세요! (취소를 누르면 게임을 종료합니다)');

      if (input === null) {
        alert('게임을 종료합니다.');
        return;
      }

      const guess = Number(input);

      if (Number.isNaN(guess) || guess < 1 || guess > 50) {
        alert('1부터 50 사이의 숫자를 입력해주세요.');
        continue;
      }

      tries += 1;

      if (guess === answer) {
        isCorrect = true;
        alert(`🎉 정답입니다! ${tries}번 만에 ${answer}를 맞추셨습니다.`);
      } else if (guess < answer) {
        alert('UP ⬆️ 더 큰 숫자입니다.');
      } else {
        alert('DOWN ⬇️ 더 작은 숫자입니다.');
      }
    }
  });
});
