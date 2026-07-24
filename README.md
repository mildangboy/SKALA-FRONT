# SKALA-FRONT

SK(주) AX Full-Stack Engineering 과정 프론트엔드 실습 프로젝트입니다. 아스널(Arsenal FC) 테마의 개인 포트폴리오 겸 실습용 멀티 페이지 사이트입니다.

## ⚠️ 실행 방법 (꼭 읽어주세요)

`html/index.html`을 더블클릭해서 `file://`로 직접 열면 두 가지 기능이 정상 동작하지 않습니다.

- **실시간 날씨 / 실시간 순위·경기 일정**: `weatherAPI.js`, `realtimeInfo.js`, `eplAPI.js`, `fixturesAPI.js`, `myRanking.js`가 ES6 모듈(`import`/`export`)로 작성되어 있는데, 브라우저 보안 정책(CORS)이 `file://` 프로토콜에서 모듈 스크립트 로딩을 차단하기 때문입니다.
- **페이지 간 끊김 없는 이동(SPA 라우팅)**: 내부 링크·폼 제출을 가로채 `fetch()`로 다음 페이지를 불러오는 방식이라, `file://`에서는 자동으로 일반 페이지 이동으로 대체됩니다(이 경우 배경음악은 페이지가 바뀔 때마다 처음부터 다시 재생됩니다). 그 외 기능(내비게이션, 반응형 레이아웃, 폼 등)은 file://로 열어도 정상 동작합니다.

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
│   ├── index.html          홈 (히어로 헤더, 아스널 최신 소식, 에미레이츠 스타디움 날씨)
│   ├── myProfile.html      About me (기본 정보, 보유 기술, 연도별 주요 경력)
│   ├── myHoliday.html      Holiday (휴일 취미: 스포츠 시청 / 영화 시청 / 게임)
│   ├── myClass.html        Timetable (주간 강의 시간표, rowspan/colspan)
│   ├── myTrip.html         World Trip (다녀온 여행지 6곳 소개 + 방문 41개 도시 세계 지도, 사진 라이트박스)
│   ├── myRanking.html      Live standings (프리미어리그 순위, 아스널 경기 일정)
│   ├── gpaCalculator.html  GPA Calculator (강의·학점·등급 추가/삭제, 4.5·4.3 만점 평균 평점 계산)
│   ├── signUp.html         Sign In / Sign Up (로그인 탭 + 회원가입 폼, 필수 항목 검증, 관리자 이스터에그)
│   ├── signUpResult.html   Sign-up Complete (제출 결과 요약, 비밀번호는 화면·URL 어디에도 노출되지 않음)
│   └── adminBanner.html    (숨김) 관리자 이스터에그 배너 페이지
├── css/
│   └── style.css           공통 스타일 (Arsenal FC 테마, RWD, 애니메이션)
├── script/
│   ├── nav.js               모바일 햄버거 메뉴
│   ├── spaNav.js             내부 링크·폼 제출을 가로채는 경량 SPA 라우터
│   ├── bgm.js                배경음악 위젯 (유튜브 IFrame API, 3곡 재생목록)
│   ├── weatherAPI.js         ES6 모듈 - Open-Meteo API 호출
│   ├── realtimeInfo.js       ES6 모듈 - 에미레이츠 스타디움 날씨 렌더링
│   ├── eplAPI.js             ES6 모듈 - ESPN API로 프리미어리그 순위 조회
│   ├── fixturesAPI.js        ES6 모듈 - ESPN API로 아스널 경기 일정 조회
│   ├── myRanking.js          ES6 모듈 - 순위·경기 일정 렌더링
│   ├── signUp.js             로그인/회원가입 탭 전환, 로그인 데모 안내, 회원가입 유효성 검증 + 관리자 이스터에그 체크
│   ├── tripPhotoLightbox.js  World Trip 사진 호버 라이트박스
│   ├── tripMapEasterEgg.js   세계 지도 위 10초 정지 시 이스터에그
│   ├── arsenalEasterEgg.js   아스날 티커 3연속 클릭 이스터에그 (전 페이지 공통)
│   ├── dodgeGame.js          토트넘 피하기 게임 (전 페이지 사이드바 위젯)
│   └── gradeCalculator.js    GPA 계산기 로직 (등급→평점 환산, 4.5/4.3 기준 전환)
└── images/
    ├── logo.svg
    ├── champion.jpeg
    ├── tottenham.svg        토트넘 피하기 게임에서 떨어지는 로고
    ├── trip-*.jpg           여행지 소개용 실제 사진 6장
    └── easter-bunny.png     (선택) 지도 이스터에그용 토끼 이미지 — 없으면 🐰 이모지로 자동 대체
```

## 주요 기능

- 시맨틱 HTML5 마크업 (header/nav/main/aside/footer/article/section) + 모바일 햄버거 내비게이션
- CSS Flexbox/Grid 레이아웃, `@media (max-width: 768px)` 반응형
- ES6 모듈(`import`/`export`)로 분리한 실시간 날씨 위젯(Open-Meteo API) 및 실시간 프리미어리그 순위·아스널 경기 일정(ESPN API)
- 에미레이츠 스타디움 날씨 위젯: 새로고침 버튼으로 다시 불러올 수 있고, 새로 받아온 값이 직전과 같으면 "최신 데이터입니다!" 안내가 잠깐 표시됨. 런던 현지 시각(Europe/London, 서머타임 자동 반영)도 매초 갱신되어 함께 표시됨
- `fetch()` 기반 경량 SPA 라우팅으로, 페이지를 이동해도 배경음악이 끊기지 않음
- 유튜브 IFrame Player API를 이용한 배경음악 위젯 (재생/일시정지, 이전·다음 곡, 탐색바)
- 오른쪽 위 "Sign In / Sign Up" 배지(네이버·구글 스타일)로 로그인/회원가입 페이지 진입. 로그인 탭은 실제 인증 없이 데모 안내만 보여주고, 회원가입 탭은 실제 폼 유효성 검증(`required`, `minlength`, JS `checkValidity()`)을 거침
- 회원가입 폼은 `method="get"`이라 제출 값이 URL 쿼리스트링에 담기는데, 비밀번호 입력란은 제출 직전 `disabled` 처리해서 결과 페이지 화면은 물론 주소창에도 비밀번호가 노출되지 않음
- 웹폰트: Anton(헤드라인) · Montserrat(UI) · 에스코어드림(본문)
- World Trip 방문 도시 세계 지도: 25개국 41개 도시를 인라인 SVG 지도 위에 점으로 표시, 유럽 지역은 좌하단에 확대 지도(inset)로 별도 표시
- 지도 위 각 도시 점 클릭 시 해당 도시를 구글에서 검색하는 결과가 새 탭으로 열림 (본 지도 + 유럽 확대본 총 71개 점)
- World Trip 추천 여행지 사진에 마우스를 올리면 화면 중앙에 크게 보여주는 라이트박스
- 숨겨진 이스터에그 3종: ① 세계 지도 위에서 마우스 포인터를 10초간 정지시키면 부활절 토끼 팝업, ② 상단 "Arsenal — Premier League Champions" 티커를 3연속 클릭하면 전체 화면 아스날 로고가 서서히 나타났다 사라짐(전 페이지 공통), ③ Sign In / Sign Up 페이지의 회원가입 탭에서 이름·비밀번호·비밀번호 확인을 모두 `admin`으로 입력하면 숨겨진 관리자 배너 페이지로 이동
- GPA Calculator: 강의 제목·학점·등급을 추가/삭제하면 학점 가중 평균으로 평균 평점을 실시간 계산. 4.5 만점(A+/A0/B+/B0…)과 4.3 만점(A+/A/A-/B+/B/B-…) 두 기준을 전환할 수 있고, 이미 추가한 과목의 평점·기준은 추가 당시 그대로 고정되어 나중에 기준을 바꿔도 값이 바뀌지 않음. 두 기준은 만점 자체가 달라 하나의 평균으로 합칠 수 없으므로, 평균 평점은 4.5 만점 과목과 4.3 만점 과목으로 나눠서 각각 표시함(과목 목록에도 어떤 기준으로 계산됐는지 "기준" 열로 표시)
- Timetable: 시간표 칸에 마우스를 올리면 rowspan으로 병합된 행 전체가 아니라 그 칸 하나만 하이라이트되고, 얼룩말 줄무늬 대신 점심시간 행만 회색으로 표시됨
- 토트넘 피하기: 모든 페이지의 사이드바 하단에 있는 미니 게임 위젯. ←/→ 또는 A/D로 아스날 캐논을 움직여 떨어지는 토트넘 로고를 피하고, 시간이 지날수록 더 자주·빠르게 떨어짐. 점수는 생존 시간(초)이며 최고 기록은 브라우저에 저장됨. SPA로 페이지를 옮겨다녀도 키 입력 리스너나 게임 루프가 중복으로 쌓이지 않도록 세션당 한 번만 등록하고 항상 "현재 페이지의 인스턴스"로 위임함
