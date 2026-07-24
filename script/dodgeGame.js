// dodgeGame.js : 토트넘 피하기 게임. 모든 페이지의 사이드바(aside) 하단에 들어가는
// 작은 위젯으로, 하늘에서 떨어지는 토트넘 로고를 아스날 캐논(플레이어)으로 피하는
// 캔버스 게임입니다. 시간이 지날수록 스폰 간격이 짧아지고 낙하 속도도 조금씩
// 빨라집니다. 점수는 버틴 시간(초)입니다.
// 주의: DOMContentLoaded에 걸지 않고 즉시 실행합니다. SPA 방식 페이지 전환(spaNav.js)이
// 매 이동마다 이 스크립트를 다시 삽입해 재실행하는데, DOMContentLoaded는 문서 전체
// 수명 중 단 한 번만 발생하므로 그 이후에는 리스너가 걸리지 않기 때문입니다.
(function () {
  const canvas = document.getElementById('dodgeCanvas');
  const overlay = document.getElementById('dodgeOverlay');
  const overlayTitle = document.getElementById('dodgeOverlayTitle');
  const overlayDesc = document.getElementById('dodgeOverlayDesc');
  const startBtn = document.getElementById('dodgeStartBtn');
  const scoreEl = document.getElementById('dodgeScore');
  const bestEl = document.getElementById('dodgeBest');
  if (!canvas || !overlay || !overlayTitle || !overlayDesc || !startBtn || !scoreEl || !bestEl) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const BEST_KEY = 'skalaFront.dodgeGame.bestSeconds';
  let best = parseFloat(localStorage.getItem(BEST_KEY) || '0') || 0;
  bestEl.textContent = best.toFixed(1);

  // 플레이어(아스날 캐논)와 낙하물(토트넘 로고) 이미지
  const playerImg = new Image();
  playerImg.src = '../images/logo.svg';

  let spursImgOk = true;
  const spursImg = new Image();
  spursImg.onerror = function () {
    spursImgOk = false;
  };
  spursImg.src = '../images/tottenham.svg';

  const player = {
    width: 22,
    height: 18,
    x: WIDTH / 2 - 11,
    y: HEIGHT - 25,
    speed: 140, // px/sec
  };

  let movingLeft = false;
  let movingRight = false;
  let drops = [];
  let running = false;
  let elapsed = 0; // 생존 시간 (초)
  let spawnTimer = 0; // ms
  let lastTime = 0;
  let rafId = null;

  function spawnIntervalMs() {
    // 시간이 지날수록 점점 자주 떨어짐 (최소 220ms)
    return Math.max(220, 1100 - elapsed * 55);
  }

  function fallSpeedPxPerSec() {
    // 시간이 지날수록 낙하 속도도 조금씩 빨라짐
    return 62 + elapsed * 2.5;
  }

  function spawnDrop() {
    const size = 14 + Math.random() * 6;
    drops.push({
      x: Math.random() * (WIDTH - size),
      y: -size,
      size: size,
      speed: fallSpeedPxPerSec() * (0.85 + Math.random() * 0.3),
    });
  }

  function resetState() {
    drops = [];
    elapsed = 0;
    spawnTimer = 0;
    player.x = WIDTH / 2 - player.width / 2;
    movingLeft = false;
    movingRight = false;
    scoreEl.textContent = '0.0';
  }

  function drawBackground() {
    ctx.fillStyle = '#500b10';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawPlayer() {
    if (playerImg.complete && playerImg.naturalWidth > 0) {
      ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
  }

  function drawDrop(drop) {
    if (spursImgOk && spursImg.complete && spursImg.naturalWidth > 0) {
      // 진한 마룬 배경 위에서 짙은 남색 로고가 묻히지 않도록, 로고 뒤에 옅은 골드색
      // 원형 배지를 깔아준 다음 그 위에 로고를 그림 (플레이어 흰색 캐논과의 대비는 유지)
      const cx = drop.x + drop.size / 2;
      const cy = drop.y + drop.size / 2;
      const badgeRadius = drop.size / 2 + 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#f0e2c4';
      ctx.fill();

      // 로고 원본 비율을 유지한 채 drop.size 정사각형 안에 가운데 정렬해서 그림
      const ratio = spursImg.naturalWidth / spursImg.naturalHeight;
      let drawW = drop.size;
      let drawH = drop.size;
      if (ratio >= 1) {
        drawH = drop.size / ratio;
      } else {
        drawW = drop.size * ratio;
      }
      const offsetX = drop.x + (drop.size - drawW) / 2;
      const offsetY = drop.y + (drop.size - drawH) / 2;
      ctx.drawImage(spursImg, offsetX, offsetY, drawW, drawH);
    } else {
      // 토트넘 로고 파일이 없을 때의 대체 표시 (남색 원 + S)
      ctx.beginPath();
      ctx.arc(drop.x + drop.size / 2, drop.y + drop.size / 2, drop.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#132257';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = Math.floor(drop.size * 0.5) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', drop.x + drop.size / 2, drop.y + drop.size / 2 + 1);
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function checkCollision() {
    const pRect = { x: player.x + 2.5, y: player.y + 2.5, w: player.width - 5, h: player.height - 5 };
    for (let i = 0; i < drops.length; i += 1) {
      const d = drops[i];
      const dRect = { x: d.x + d.size * 0.15, y: d.y + d.size * 0.15, w: d.size * 0.7, h: d.size * 0.7 };
      if (rectsOverlap(pRect, dRect)) return true;
    }
    return false;
  }

  function endGame() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (elapsed > best) {
      best = elapsed;
      localStorage.setItem(BEST_KEY, String(best));
      bestEl.textContent = best.toFixed(1);
    }
    overlayTitle.textContent = '게임 오버!';
    overlayDesc.innerHTML = '생존 시간 <strong>' + elapsed.toFixed(1) + '초</strong><br />다시 도전해보세요.';
    startBtn.textContent = '다시 시작';
    overlay.classList.remove('is-hidden');
  }

  function loop(timestamp) {
    if (!running) return;
    const dt = Math.min(0.05, (timestamp - lastTime) / 1000 || 0);
    lastTime = timestamp;

    elapsed += dt;
    scoreEl.textContent = elapsed.toFixed(1);

    if (movingLeft) player.x -= player.speed * dt;
    if (movingRight) player.x += player.speed * dt;
    player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));

    spawnTimer += dt * 1000;
    if (spawnTimer >= spawnIntervalMs()) {
      spawnTimer = 0;
      spawnDrop();
    }

    for (let i = 0; i < drops.length; i += 1) {
      drops[i].y += drops[i].speed * dt;
    }
    drops = drops.filter(function (d) {
      return d.y < HEIGHT + d.size;
    });

    drawBackground();
    drawPlayer();
    drops.forEach(drawDrop);

    if (checkCollision()) {
      endGame();
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function startGame() {
    resetState();
    running = true;
    lastTime = performance.now();
    overlay.classList.add('is-hidden');
    rafId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener('click', startGame);

  // 이 위젯은 모든 페이지의 사이드바에 들어있어서, SPA 이동을 할 때마다 캔버스가
  // 새로 생기고 이 스크립트도 매번 처음부터 다시 실행됩니다. 그런데 keydown/keyup
  // 리스너를 매번 window에 새로 addEventListener 하면, 페이지를 옮겨다닐수록
  // 리스너가 계속 쌓이고(메모리 누수), 게임 도중 다른 페이지로 넘어가면 이전
  // 페이지의 애니메이션 루프가 화면에 안 보이는 채로 백그라운드에서 계속 도는
  // 문제가 있었습니다. nav.js와 같은 방식으로: 이전 인스턴스가 있으면 멈추고,
  // window 리스너는 세션당 한 번만 등록해서 항상 "현재 활성 인스턴스"로
  // 위임하도록 합니다.
  if (window.__dodgeGameActive && window.__dodgeGameActive.stop) {
    window.__dodgeGameActive.stop();
  }
  window.__dodgeGameActive = {
    stop: stopLoop,
    setLeft: (v) => { movingLeft = v; },
    setRight: (v) => { movingRight = v; },
  };

  if (!window.__dodgeGameGlobalListenersBound) {
    window.__dodgeGameGlobalListenersBound = true;

    window.addEventListener('keydown', function (e) {
      const active = window.__dodgeGameActive;
      if (!active) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') active.setLeft(true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') active.setRight(true);
    });
    window.addEventListener('keyup', function (e) {
      const active = window.__dodgeGameActive;
      if (!active) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') active.setLeft(false);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') active.setRight(false);
    });
  }

  // 시작 전 미리보기 (배경 + 플레이어만)
  drawBackground();
  drawPlayer();
})();
