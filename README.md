# SKALA-FRONT

SK(주) AX Full-Stack Engineering 과정 프론트엔드 실습 프로젝트입니다.

## ⚠️ 실행 방법 (꼭 읽어주세요)

`html/index.html`을 더블클릭해서 `file://`로 직접 열면 **실시간 날씨 기능이 동작하지 않습니다.**
`script/weatherAPI.js`, `script/realtimeInfo.js`가 ES6 모듈(`import`/`export`)로 작성되어 있는데,
브라우저 보안 정책(CORS)이 `file://` 프로토콜에서 모듈 스크립트 로딩을 차단하기 때문입니다.
(다른 기능들은 file://로 열어도 정상 동작합니다.)

정상적으로 확인하시려면 아래 두 가지 중 하나로 실행해주세요.

### 방법 1. 로컬 서버 실행 (터미널)

이 폴더(`SKALA-FRONT`)에서 터미널을 열고:

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/html/index.html` 접속

### 방법 2. VSCode Live Server 확장

1. VSCode에서 이 폴더를 열기
2. "Live Server" 확장 설치
3. `html/index.html` 우클릭 → **Open with Live Server**

## 프로젝트 구조

```
SKALA-FRONT/
├── html/
│   ├── index.html          메인 허브 (nav, main, aside, 실시간 날씨)
│   ├── myHoliday.html       휴일 일과
│   ├── myProfile.html       나의 소개
│   ├── myClass.html         강의 시간표 (rowspan/colspan)
│   ├── signUp.html          회원가입 폼
│   ├── signUpResult.html    회원가입 결과
│   └── myTrip.html          여행지 소개 (audio/video)
├── css/
│   └── style.css            공통 스타일 (Arsenal FC 테마, RWD, 애니메이션)
├── script/
│   ├── upDown.js             1~50 숫자 맞추기 게임
│   ├── grade.js               3과목 성적 평균 계산기
│   ├── bag.js                  가방 소지품 출력
│   ├── weatherAPI.js         ES6 모듈 - Open-Meteo API 호출
│   └── realtimeInfo.js        ES6 모듈 - 날씨 렌더링 (weatherAPI.js import)
└── images/
    ├── logo.svg
    └── champion.jpeg
```

## 주요 기능

- 시맨틱 HTML5 마크업 (header/nav/main/aside/footer/article/section)
- CSS Flexbox/Grid 레이아웃, `@media (max-width: 768px)` 반응형
- ES6 모듈(`import`/`export`)로 분리한 실시간 날씨 위젯 (Open-Meteo API)
- 폼 유효성 검증 (`required`, `minlength`, `label for` 매칭)
- 웹폰트: Anton(헤드라인) · Montserrat(UI) · 에스코어드림(본문)
