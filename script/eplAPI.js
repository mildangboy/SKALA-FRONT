// eplAPI.js : ESPN 공개 API로 Premier League(프리미어리그) 순위를 가져오는 ES6 모듈
// API 키가 필요 없는 ESPN의 비공식 공개 엔드포인트를 사용합니다.
const EPL_STANDINGS_URL = 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings';

function getStat(stats, name) {
  const stat = stats.find((item) => item.name === name);
  return stat ? stat.displayValue : '-';
}

export async function getEplStandings() {
  const response = await fetch(EPL_STANDINGS_URL);

  if (!response.ok) {
    throw new Error(`Premier League 순위 API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  const entries = data.children?.[0]?.standings?.entries ?? [];

  return entries.map((entry) => {
    const stats = entry.stats;

    return {
      rank: getStat(stats, 'rank'),
      team: entry.team.displayName,
      abbreviation: entry.team.abbreviation,
      logo: entry.team.logos?.[0]?.href ?? '',
      played: getStat(stats, 'gamesPlayed'),
      wins: getStat(stats, 'wins'),
      draws: getStat(stats, 'ties'),
      losses: getStat(stats, 'losses'),
      goalDiff: getStat(stats, 'pointDifferential'),
      points: getStat(stats, 'points'),
    };
  });
}
