// gradeCalculator.js : 강의 제목/학점/등급을 추가하면 학점 가중 평균으로 평균
// 평점을 계산해 보여주는 성적 계산기입니다. 4.5 만점 / 4.3 만점 환산 기준을
// 선택할 수 있습니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(function () {
  const form = document.getElementById('gpaForm');
  const titleInput = document.getElementById('courseTitle');
  const creditInput = document.getElementById('courseCredit');
  const gradeSelect = document.getElementById('courseGrade');
  const scaleSelect = document.getElementById('gpaScale');
  const tableBody = document.getElementById('gpaTableBody');
  const totalCreditsEl = document.getElementById('gpaTotalCredits');
  const averageEl = document.getElementById('gpaAverage');
  const scaleLabelEl = document.getElementById('gpaScaleLabel');

  if (
    !form || !titleInput || !creditInput || !gradeSelect || !scaleSelect ||
    !tableBody || !totalCreditsEl || !averageEl || !scaleLabelEl
  ) {
    return;
  }

  const GRADE_POINTS = {
    '4.5': { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0.0 },
    '4.3': { 'A+': 4.3, 'A0': 4.0, 'B+': 3.3, 'B0': 3.0, 'C+': 2.3, 'C0': 2.0, 'D+': 1.3, 'D0': 1.0, 'F': 0.0 },
  };

  let courses = []; // { title, credit, grade }

  function formatNumber(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  function currentPointsTable() {
    return GRADE_POINTS[scaleSelect.value] || GRADE_POINTS['4.5'];
  }

  function render() {
    const points = currentPointsTable();
    scaleLabelEl.textContent = scaleSelect.value;

    tableBody.innerHTML = '';

    if (courses.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'gpa-empty-row';
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = '아직 추가한 과목이 없어요.';
      emptyRow.appendChild(cell);
      tableBody.appendChild(emptyRow);
    } else {
      courses.forEach((course, index) => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.textContent = course.title;
        row.appendChild(titleCell);

        const creditCell = document.createElement('td');
        creditCell.textContent = formatNumber(course.credit);
        row.appendChild(creditCell);

        const gradeCell = document.createElement('td');
        gradeCell.textContent = course.grade;
        row.appendChild(gradeCell);

        const pointCell = document.createElement('td');
        pointCell.textContent = (points[course.grade] ?? 0).toFixed(1);
        row.appendChild(pointCell);

        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-outline gpa-delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.setAttribute('aria-label', course.title + ' 삭제');
        deleteBtn.addEventListener('click', () => {
          courses.splice(index, 1);
          render();
        });
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
      });
    }

    let totalCredits = 0;
    let weightedSum = 0;
    courses.forEach((course) => {
      const point = points[course.grade] ?? 0;
      totalCredits += course.credit;
      weightedSum += point * course.credit;
    });

    totalCreditsEl.textContent = formatNumber(totalCredits);
    averageEl.textContent = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const credit = parseFloat(creditInput.value);
    const grade = gradeSelect.value;

    if (!title) {
      titleInput.focus();
      return;
    }
    if (!credit || credit <= 0) {
      creditInput.focus();
      return;
    }
    if (!grade) {
      gradeSelect.focus();
      return;
    }

    courses.push({ title, credit, grade });
    render();

    form.reset();
    titleInput.focus();
  });

  scaleSelect.addEventListener('change', render);

  render();
})();
