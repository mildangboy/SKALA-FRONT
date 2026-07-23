// weatherAPI.js : Open-Meteo API 호출 전용 ES6 모듈
export async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`날씨 API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
