// grade.js : 3과목 성적 평균 계산기
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnGrade');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const subjects = ['국어', '영어', '수학'];
    const scores = [];

    for (const subject of subjects) {
      let input = prompt(`${subject} 점수를 입력하세요 (0~100):`);
      let score = Number(input);

      while (input === null ? false : (Number.isNaN(score) || score < 0 || score > 100)) {
        input = prompt(`올바른 점수를 입력해주세요 (0~100). ${subject} 점수:`);
        score = Number(input);
      }

      if (input === null) {
        alert('계산을 취소했습니다.');
        return;
      }

      scores.push(score);
    }

    let total = 0;
    for (const score of scores) {
      total += score;
    }

    const average = total / scores.length;
    const isPass = average >= 60;
    const resultText = isPass ? '합격 🎉' : '불합격 😢';

    alert(
      `국어: ${scores[0]}점 / 영어: ${scores[1]}점 / 수학: ${scores[2]}점\n` +
      `평균 점수: ${average.toFixed(1)}점\n` +
      `결과: ${resultText}`
    );
  });
});
