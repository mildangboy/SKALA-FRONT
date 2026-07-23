// fixturesAPI.js : ESPN 공개 API로 아스널의 다가오는 경기 일정을 가져오는 ES6 모듈
// 팀 전용 스케줄 엔드포인트는 다음 시즌 일정을 채워주지 않는 경우가 있어,
// 리그 전체 스코어보드를 넓은 날짜 범위로 조회한 뒤 아스널 경기만 필터링합니다.
const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard';
const TEAM_NAME = 'Arsenal';
const LOOKAHEAD_DAYS = 120;

function toEspnDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

export async function getArsenalFixtures(limit = 5) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + LOOKAHEAD_DAYS);

  const url = `${SCOREBOARD_URL}?dates=${toEspnDate(start)}-${toEspnDate(end)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`아스널 경기 일정 API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  const events = data.events ?? [];

  const fixtures = events
    .filter((event) => event.name?.includes(TEAM_NAME))
    .map((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors ?? [];
      const home = competitors.find((c) => c.homeAway === 'home');
      const away = competitors.find((c) => c.homeAway === 'away');

      return {
        date: event.date,
        homeTeam: home?.team?.displayName ?? '',
        awayTeam: away?.team?.displayName ?? '',
        venue: competition?.venue?.fullName ?? '',
        completed: competition?.status?.type?.completed ?? false,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = fixtures.filter((fixture) => !fixture.completed);
  return (upcoming.length ? upcoming : fixtures).slice(0, limit);
}
