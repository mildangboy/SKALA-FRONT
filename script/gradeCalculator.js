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
  const average45El = document.getElementById('gpaAverage45');
  const average43El = document.getElementById('gpaAverage43');

  if (
    !form || !titleInput || !creditInput || !gradeSelect || !scaleSelect ||
    !tableBody || !totalCreditsEl || !average45El || !average43El
  ) {
    return;
  }

  // 4.5 만점은 국내 대학에서 흔히 쓰는 A+/A0/B+/B0 표기, 4.3 만점은 A+/A/A-/B+/B/B-
  // 처럼 마이너스 등급이 있는 표기를 씁니다. 두 기준의 등급 이름 자체가 다르므로
  // 과목을 추가할 때 선택돼 있던 기준의 평점으로 "고정"해서 저장합니다 (아래 참고).
  const GRADE_POINTS = {
    '4.5': { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0.0 },
    '4.3': {
      'A+': 4.3, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    },
  };

  let courses = []; // { title, credit, grade, point, scale } — point/scale은 추가 시점의 기준으로 고정됨

  function formatNumber(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  function currentPointsTable() {
    return GRADE_POINTS[scaleSelect.value] || GRADE_POINTS['4.5'];
  }

  // 현재 선택된 평점 기준(4.5 / 4.3)에 맞는 등급 옵션으로 등급 select를 다시 채웁니다.
  // 4.3 기준일 때는 A-, B-, C-, D- 같은 마이너스 등급도 함께 나옵니다.
  function renderGradeOptions() {
    const points = currentPointsTable();
    const previousValue = gradeSelect.value;

    gradeSelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '선택';
    placeholder.disabled = true;
    placeholder.selected = true;
    gradeSelect.appendChild(placeholder);

    Object.keys(points).forEach((grade) => {
      const option = document.createElement('option');
      option.value = grade;
      option.textContent = grade;
      gradeSelect.appendChild(option);
    });

    // 기준을 바꿔도 같은 이름의 등급이 새 목록에 있으면 선택 상태를 유지
    if (Object.prototype.hasOwnProperty.call(points, previousValue)) {
      gradeSelect.value = previousValue;
    }
  }

  function render() {
    tableBody.innerHTML = '';

    if (courses.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'gpa-empty-row';
      const cell = document.createElement('td');
      cell.colSpan = 6;
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

        const scaleCell = document.createElement('td');
        scaleCell.textContent = course.scale;
        row.appendChild(scaleCell);

        const pointCell = document.createElement('td');
        pointCell.textContent = course.point.toFixed(1);
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

    // 4.5 만점과 4.3 만점은 척도 자체가 달라서 하나의 평균으로 합치면 안 되므로,
    // 과목을 추가 당시 고정된 기준(scale)별로 나눠서 각각 가중 평균을 계산합니다.
    // 총 이수 학점(totalCredits)만은 기준과 무관한 단순 합산이라 합쳐도 됩니다.
    let totalCredits = 0;
    const bucket = {
      '4.5': { credits: 0, weightedSum: 0, count: 0 },
      '4.3': { credits: 0, weightedSum: 0, count: 0 },
    };

    courses.forEach((course) => {
      totalCredits += course.credit;
      const b = bucket[course.scale];
      if (!b) return;
      b.credits += course.credit;
      b.weightedSum += course.point * course.credit;
      b.count += 1;
    });

    totalCreditsEl.textContent = formatNumber(totalCredits);

    function formatScaleAverage(scale, el) {
      const b = bucket[scale];
      if (b.count === 0) {
        el.textContent = '추가한 과목 없음';
        return;
      }
      const avg = b.weightedSum / b.credits;
      el.textContent = `${avg.toFixed(2)} / ${scale} (${b.count}과목)`;
    }

    formatScaleAverage('4.5', average45El);
    formatScaleAverage('4.3', average43El);
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

    const scale = scaleSelect.value;
    const points = currentPointsTable();
    const point = points[grade] ?? 0;
    courses.push({ title, credit, grade, point, scale });
    render();

    form.reset();
    renderGradeOptions();
    titleInput.focus();
  });

  scaleSelect.addEventListener('change', () => {
    // 등급 이름 자체가 기준마다 달라서(4.5=A0/B0, 4.3=A/A-/B/B-...), 이미 추가한
    // 과목의 평점은 그대로 두고 앞으로 추가할 과목의 등급 선택지만 새로 채웁니다.
    renderGradeOptions();
    render();
  });

  renderGradeOptions();
  render();
})();
