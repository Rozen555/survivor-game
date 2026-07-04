const canvas = document.getElementById('game-canvas');
const ui = new UI();
const game = new Game(canvas, ui);

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function resizeCanvas() {
  const container = document.getElementById('game-container');
  const aspect = CANVAS_WIDTH / CANVAS_HEIGHT;
  let w = container.clientWidth;
  let h = container.clientHeight;

  if (w / h > aspect) {
    w = h * aspect;
  } else {
    h = w / aspect;
  }

  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.getElementById('start-btn').addEventListener('click', () => {
  Audio.init();
  if (!KnightSprites.ready) {
    alert('骑士 PNG 素材未加载。\n\n请双击「一键开始游戏.hta」或 copy-assets.bat 复制素材，然后 Ctrl+F5 刷新。');
    return;
  }
  game.start(ui.selectedChar, ui.selectedDifficulty);
});

document.getElementById('copy-assets-btn').addEventListener('click', () => {
  alert(
    '恢复骑士角色素材：\n\n' +
    '1. 确认桌面有 Tiny Swords (Update 010)\n' +
    '2. 双击 copy-assets.bat 或 一键开始游戏.hta\n' +
    '3. 打开 projects\\survivor-game\\index.html\n' +
    '4. 按 Ctrl+F5 强制刷新'
  );
});

setTimeout(() => KnightSprites._updateStatusUI(), 800);

document.getElementById('restart-btn').addEventListener('click', () => {
  game.start(ui.selectedChar, ui.selectedDifficulty);
});

document.getElementById('menu-btn').addEventListener('click', () => {
  ui.hideAllScreens();
  ui.hideHud();
  ui.menuScreen.classList.remove('hidden');
  game.state = GameState.MENU;
});

document.getElementById('resume-btn').addEventListener('click', () => {
  game.state = GameState.PLAYING;
  ui.hidePause();
  Audio.play('resume');
});

document.getElementById('quit-btn').addEventListener('click', () => {
  ui.hideAllScreens();
  ui.hideHud();
  ui.menuScreen.classList.remove('hidden');
  game.state = GameState.MENU;
});

let lastTime = 0;
let loopRunning = true;

function loop(timestamp) {
  if (!loopRunning) return;

  try {
    const dt = lastTime === 0 ? 0 : Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    game.update(dt);
    game.draw();
  } catch (err) {
    console.error(err);
    const hint = document.createElement('div');
    hint.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;background:#ff4757;color:#fff;padding:12px;border-radius:8px;z-index:9999;font-family:sans-serif;';
    hint.textContent = '游戏出错: ' + err.message;
    document.body.appendChild(hint);
    loopRunning = false;
    return;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
