// bgm.js : 유튜브 IFrame Player API를 이용한 배경음악(BGM) 위젯
// 재생목록: RESCENE - Busy Boy → Tray B - New New (Prod. by GroovyRoom) →
// 예린(YERIN) - Wavy 순서로 자동 재생되며, 마지막 곡이 끝나면 처음 곡으로 돌아갑니다.
// (유튜브 임베드 사용 — 실제 음원 파일을 직접 호스팅하지 않습니다. 원래 있던
// Fall Out Boy/Kendrick Lamar/Nas 공식 뮤직비디오 3곡은 한국에서 임베드 재생이
// 막혀있어서 이 3곡으로 교체했습니다. 유튜브 임베드 특성상 채널 수익화 설정에
// 따라 광고가 붙을 수 있는데, 이건 임베드하는 쪽에서 제어할 수 없는 유튜브 쪽
// 사정이라 감수하기로 했습니다.)
//
// 참고: 대부분의 브라우저는 사용자 조작 없이 소리가 나오는 자동재생을 차단합니다.
// 아래 코드는 (1) 페이지 로드시 자동재생을 우선 시도하고, (2) 브라우저가 이를 막을 경우
// 페이지 아무 곳이나 처음 클릭/터치/키 입력하는 순간 자동으로 재생을 시작하는
// 폴백을 함께 둬서, 사실상 자동재생에 가깝게 동작하도록 했습니다.
(function () {
  const TRACKS = [
    { videoId: 'c70TkZH7fr0', title: 'Busy Boy', artist: 'RESCENE' },
    { videoId: 's0-m0gHYTjA', title: 'New New (Prod. by GroovyRoom)', artist: 'Tray B' },
    { videoId: '5nNKcrzKc1U', title: 'Wavy', artist: '예린(YERIN)' },
  ];
  let trackIndex = 0;
  let player = null;
  let isReady = false;
  let isSeeking = false;

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function loadYouTubeAPI(onApiReady, onApiError) {
    if (window.YT && window.YT.Player) {
      onApiReady();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    // 네트워크 문제 등으로 유튜브 IFrame API 스크립트 자체를 못 불러오면
    // onYouTubeIframeAPIReady가 영영 호출되지 않으므로, 이 경우를 따로 감지합니다.
    tag.onerror = () => {
      if (onApiError) onApiError();
    };
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = onApiReady;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const widget = document.querySelector('.bgm-widget');
    const toggle = document.getElementById('bgmToggle');
    const playerBox = document.getElementById('bgmPlayer');
    const seek = document.getElementById('bgmSeek');
    const currentEl = document.getElementById('bgmCurrent');
    const durationEl = document.getElementById('bgmDuration');
    const titleEl = document.getElementById('bgmTitle');
    const artistEl = document.getElementById('bgmArtist');
    const prevBtn = document.getElementById('bgmPrev');
    const nextBtn = document.getElementById('bgmNext');
    const playPauseBtn = document.getElementById('bgmPlayPause');
    const playPauseIcon = playPauseBtn ? playPauseBtn.querySelector('.bgm-playpause-icon') : null;
    if (!toggle || !playerBox) return;

    if (window.location.protocol === 'file:') {
      // file://로 직접 열면 외부 스크립트(유튜브 API) 로딩이 브라우저 정책상
      // 제한될 수 있어, 클릭 시 안내만 표시합니다. 로컬 서버로 실행하면 정상 동작합니다.
      toggle.addEventListener('click', () => {
        toggle.title = '로컬 서버(http://)로 실행해야 BGM이 재생됩니다.';
      });
      return;
    }

    function setPlayingUI(playing) {
      toggle.setAttribute('aria-pressed', String(playing));
      toggle.setAttribute('aria-label', playing ? '배경음악 정지' : '배경음악 재생');
      toggle.classList.toggle('is-playing', playing);
      if (widget) widget.classList.toggle('is-playing', playing);
      // 바깥쪽 원형 버튼(🎵)은 아이콘을 바꾸지 않고, 패널 안의 재생/일시정지
      // 버튼에서만 ▶️/⏸️를 표시합니다 (두 버튼이 같은 아이콘을 쓰면 헷갈리기 때문).
      if (playPauseBtn) {
        playPauseBtn.classList.toggle('is-playing', playing);
        playPauseBtn.setAttribute('aria-label', playing ? '일시정지' : '재생');
      }
      // 변형 선택자(FE0F)를 붙인 이모지(▶️/⏸️)는 일부 플랫폼에서 자체 색상의
      // 회색/파란 배경 아이콘으로 렌더링되어 마룬/골드 테마와 어울리지 않습니다.
      // 변형 선택자 없는 일반 텍스트 기호(▶/⏸)를 사용해 색상을 완전히 제어합니다.
      if (playPauseIcon) playPauseIcon.textContent = playing ? '⏸' : '▶';
    }

    function updateTrackInfo() {
      const track = TRACKS[trackIndex];
      if (titleEl) titleEl.textContent = track.title;
      if (artistEl) artistEl.textContent = track.artist;
    }

    // 다음 곡으로 넘어갑니다. 마지막 곡 다음에는 다시 첫 곡으로 돌아갑니다.
    function playTrack(index) {
      trackIndex = (index + TRACKS.length) % TRACKS.length;
      updateTrackInfo();
      if (isReady) {
        player.loadVideoById(TRACKS[trackIndex].videoId);
      }
    }

    function updateProgress() {
      if (!isReady || isSeeking) return;
      const duration = player.getDuration() || 0;
      const current = player.getCurrentTime() || 0;
      if (seek && duration > 0) {
        seek.value = String((current / duration) * 100);
      }
      if (currentEl) currentEl.textContent = formatTime(current);
      if (durationEl) durationEl.textContent = formatTime(duration);
    }

    setInterval(updateProgress, 500);

    // 브라우저가 자동재생을 막았을 경우를 대비해, 페이지 첫 상호작용 시
    // 아직 재생 중이 아니라면 자동으로 재생을 시작합니다.
    function armAutoplayFallback() {
      const events = ['click', 'keydown', 'touchstart'];
      const tryPlay = () => {
        if (isReady && player.getPlayerState && player.getPlayerState() !== 1) {
          player.playVideo();
        }
        events.forEach((evt) => document.removeEventListener(evt, tryPlay));
      };
      events.forEach((evt) => document.addEventListener(evt, tryPlay, { once: false }));
    }

    updateTrackInfo();

    // 임베드 재생이 막힌 영상(저작권사가 다른 사이트 재생을 금지했거나 지역 제한이
    // 걸린 경우)을 만나면 YouTube가 onError 콜백으로 알려줍니다. 예전에는 이 콜백
    // 자체가 없어서 에러가 콘솔에도 안 뜨고 그냥 조용히 멈춰버렸습니다. 이제는
    // 에러가 나면 다음 곡으로 자동으로 넘기고, 재생목록의 모든 곡이 다 막혀있는
    // 경우(연속 에러가 트랙 수만큼 쌓이면)에는 무한 루프를 돌지 않고 안내 문구만
    // 표시하고 멈춥니다.
    let consecutiveErrors = 0;

    // 유튜브 API 스크립트 로딩 자체가 실패하면(네트워크 차단 등) 제목 자리에
    // 에러를 표시합니다.
    function showApiError() {
      if (titleEl) titleEl.textContent = '유튜브 API 오류';
      if (artistEl) artistEl.textContent = '';
    }

    loadYouTubeAPI(() => {
      player = new YT.Player('bgmPlayer', {
        width: '2',
        height: '2',
        videoId: TRACKS[trackIndex].videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: () => {
            isReady = true;
            player.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              consecutiveErrors = 0;
              setPlayingUI(true);
            } else if (event.data === YT.PlayerState.PAUSED) {
              setPlayingUI(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              // 한 곡이 끝나면 자동으로 다음 곡을 재생합니다.
              playTrack(trackIndex + 1);
            }
          },
          onError: (event) => {
            console.warn(`[BGM] "${TRACKS[trackIndex].title}" 재생 실패(에러 코드 ${event.data}). 다음 곡으로 넘어갑니다.`);
            consecutiveErrors += 1;
            if (consecutiveErrors >= TRACKS.length) {
              setPlayingUI(false);
              if (titleEl) titleEl.textContent = '유튜브 오류';
              if (artistEl) artistEl.textContent = '';
              return;
            }
            playTrack(trackIndex + 1);
          },
        },
      });
    }, showApiError);

    armAutoplayFallback();

    // 바깥쪽 원형 버튼과 패널 안의 재생/일시정지 버튼이 같은 재생/정지 동작을
    // 공유하도록 함수로 뺐습니다.
    function togglePlayback() {
      if (!isReady) return;
      if (player.getPlayerState() === 1) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }

    toggle.addEventListener('click', () => {
      // 클릭 후 포커스가 남아있지 않도록 해서, 마우스가 벗어나면
      // 패널이 항상 순수 hover 기준으로만 닫히도록 합니다.
      toggle.blur();
      togglePlayback();
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        playPauseBtn.blur();
        togglePlayback();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!isReady) return;
        playTrack(trackIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!isReady) return;
        playTrack(trackIndex + 1);
      });
    }

    if (seek) {
      seek.addEventListener('input', () => {
        isSeeking = true;
        if (isReady) {
          const duration = player.getDuration() || 0;
          currentEl.textContent = formatTime((Number(seek.value) / 100) * duration);
        }
      });

      seek.addEventListener('change', () => {
        if (isReady) {
          const duration = player.getDuration() || 0;
          const target = (Number(seek.value) / 100) * duration;
          player.seekTo(target, true);
        }
        isSeeking = false;
      });
    }
  });
})();
