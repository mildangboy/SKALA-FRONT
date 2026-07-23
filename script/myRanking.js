// myRanking.js : eplAPI.js / fixturesAPI.js를 import하여
// 실시간 순위표 페이지(myRanking.html)를 렌더링하는 ES6 모듈
import { getEplStandings } from './eplAPI.js';
import { getArsenalFixtures } from './fixturesAPI.js';

function showError(tbodyId, colspan, message) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="${colspan}">${message}</td></tr>`;
  }
}

function renderEpl(standings) {
  const tbody = document.getElementById('eplTableBody');
  tbody.innerHTML = standings
    .map(
      (row) => `
    <tr class="${row.team === 'Arsenal' ? 'highlight-row' : ''}">
      <td>${row.rank}</td>
      <td class="team-cell">
        <img src="${row.logo}" alt="${row.team} 엠블럼" class="team-logo" />
        <span>${row.team}</span>
      </td>
      <td>${row.played}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.goalDiff}</td>
      <td>${row.points}</td>
    </tr>`
    )
    .join('');
}

function formatFixtureDate(isoDate) {
  const date = new Date(isoDate);
  const formatted = date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${formatted} (KST)`;
}

function renderFixtures(fixtures) {
  const list = document.getElementById('fixtureList');
  if (!list) return;

  if (!fixtures.length) {
    list.innerHTML = '<li class="fixture-item">예정된 경기 정보를 찾을 수 없습니다.</li>';
    return;
  }

  list.innerHTML = fixtures
    .map((fixture) => {
      const isArsenalHome = fixture.homeTeam === 'Arsenal';
      return `
    <li class="fixture-item">
      <div class="fixture-date">${formatFixtureDate(fixture.date)}</div>
      <div class="fixture-teams">
        <span class="${isArsenalHome ? 'fixture-team-highlight' : ''}">${fixture.homeTeam}</span>
        <span class="fixture-vs">vs</span>
        <span class="${!isArsenalHome ? 'fixture-team-highlight' : ''}">${fixture.awayTeam}</span>
      </div>
      <div class="fixture-venue">${fixture.venue}</div>
    </li>`;
    })
    .join('');
}

// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(async () => {
  try {
    const epl = await getEplStandings();
    renderEpl(epl);
  } catch (err) {
    showError('eplTableBody', 8, '⚠️ Premier League 순위를 불러오지 못했습니다.');
  }

  try {
    const fixtures = await getArsenalFixtures();
    renderFixtures(fixtures);
  } catch (err) {
    const list = document.getElementById('fixtureList');
    if (list) {
      list.innerHTML = '<li class="fixture-item">⚠️ 경기 일정을 불러오지 못했습니다.</li>';
    }
  }
})();
