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
const freshNotice = document.getElementById('weatherFreshNotice');

// 직전에 표시했던 온도/습도를 기억해뒀다가, 새로고침으로 받아온 값이 똑같으면
// "최신 데이터입니다!" 안내를 잠깐 보여줍니다.
let lastWeather = null;
let freshNoticeTimer = null;

function showFreshNotice() {
  if (!freshNotice) return;
  clearTimeout(freshNoticeTimer);
  freshNotice.hidden = false;
  freshNoticeTimer = setTimeout(() => {
    freshNotice.hidden = true;
  }, 3000);
}

// 런던 현지 시각(Europe/London, 서머타임 자동 반영)을 실시간으로 갱신합니다.
// weatherBox는 새로고침 때마다 innerHTML이 통째로 교체되므로, #londonTime을
// 매번 새로 조회해서 항상 최신 요소를 가리키도록 합니다.
const londonTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Europe/London',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function updateLondonTime() {
  const el = document.getElementById('londonTime');
  if (!el) return;
  el.textContent = londonTimeFormatter.format(new Date());
}

async function loadWeather() {
  if (!weatherBox) return false;

  try {
    const data = await getWeather(EMIRATES_STADIUM.lat, EMIRATES_STADIUM.lon);
    const temperature = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;

    const isUnchanged =
      lastWeather !== null &&
      lastWeather.temperature === temperature &&
      lastWeather.humidity === humidity;

    weatherBox.innerHTML = `
      <h3>${EMIRATES_STADIUM.name}</h3>
      <p>🌡️ 온도: ${temperature}°C</p>
      <p>💧 습도: ${humidity}%</p>
      <p>🕒 현지 시각: <span id="londonTime">--:--</span></p>
    `;
    lastWeather = { temperature, humidity };
    updateLondonTime();

    return isUnchanged;
  } catch (error) {
    weatherBox.innerHTML = '<p>날씨 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>';
    return false;
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    const originalLabel = refreshBtn.textContent;
    refreshBtn.textContent = '불러오는 중...';
    const isUnchanged = await loadWeather();
    if (isUnchanged) {
      showFreshNotice();
    }
    refreshBtn.textContent = originalLabel;
    refreshBtn.disabled = false;
  });
}

loadWeather();

// 날씨를 다시 불러오지 않아도 시계는 계속 흐르도록 매 초 갱신
setInterval(updateLondonTime, 1000);
