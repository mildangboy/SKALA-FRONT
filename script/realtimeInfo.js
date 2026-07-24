// realtimeInfo.js : weatherAPI.js를 import하여 에미레이츠 스타디움의 실시간 날씨를 렌더링
// 새로고침 버튼(weatherRefreshBtn)의 클릭 이벤트로 다시 불러올 수도 있습니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
import { getWeather } from './weatherAPI.js';

// 에미레이츠 스타디움 (아스널 홈구장, 런던 홀러웨이) 좌표
const EMIRATES_STADIUM = { name: '에미레이츠 스타디움 (런던)', lat: 51.5549, lon: -0.1084 };

const weatherBox = document.getElementById('weatherBox');
const refreshBtn = document.getElementById('weatherRefreshBtn');

async function loadWeather() {
  if (!weatherBox) return;

  try {
    const data = await getWeather(EMIRATES_STADIUM.lat, EMIRATES_STADIUM.lon);
    const temperature = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;

    weatherBox.innerHTML = `
      <h3>${EMIRATES_STADIUM.name}</h3>
      <p>🌡️ 온도: ${temperature}°C</p>
      <p>💧 습도: ${humidity}%</p>
    `;
  } catch (error) {
    weatherBox.innerHTML = '<p>날씨 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>';
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    const originalLabel = refreshBtn.textContent;
    refreshBtn.textContent = '불러오는 중...';
    await loadWeather();
    refreshBtn.textContent = originalLabel;
    refreshBtn.disabled = false;
  });
}

loadWeather();
