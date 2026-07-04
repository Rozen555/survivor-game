// Tiny Swords Update 010 — 直接加载 PNG（兼容 file:// 本地打开）
const KnightSprites = {
  ready: false,
  sheets: {},
  status: '正在加载素材…',

  charPaths: {
    warrior: [
      'assets/knights/Troops/Warrior/Red/Warrior_Red.png',
      'assets/knights/Troops/Warrior/Blue/Warrior_Blue.png',
    ],
    ranger: [
      'assets/knights/Troops/Archer/Red/Archer_Red.png',
      'assets/knights/Troops/Archer/Blue/Archer_Blue.png',
    ],
    mage: [
      'assets/knights/Troops/Pawn/Red/Pawn_Red.png',
      'assets/knights/Troops/Pawn/Blue/Pawn_Blue.png',
    ],
  },

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(src));
      img.src = src;
    });
  },

  parseTinySheet(img, charId) {
    const configs = {
      warrior: { idleRow: 0, runRow: 1, walkCols: 6 },
      ranger:  { idleRow: 0, runRow: 0, walkCols: 6 },
      mage:    { idleRow: 0, runRow: 1, walkCols: 6 },
    };
    const cfg = configs[charId] || configs.warrior;

    // Tiny Swords 标准帧 192px，Archer 等为 8 列
    const sizes = [192, 128, 96, 64];
    let sheet = null;
    for (const s of sizes) {
      if (img.width % s === 0 && img.height % s === 0) {
        const cols = img.width / s;
        const rows = img.height / s;
        sheet = {
          img, fw: s, fh: s, cols, rows,
          idleRow: cfg.idleRow,
          runRow: cfg.runRow,
          walkCols: Math.min(cfg.walkCols, cols),
        };
        break;
      }
    }

    if (!sheet) {
      for (let cols = 12; cols >= 4; cols--) {
        if (img.width % cols !== 0) continue;
        const fw = img.width / cols;
        if (img.height % fw !== 0) continue;
        sheet = {
          img, fw, fh: fw, cols, rows: img.height / fw,
          idleRow: cfg.idleRow,
          runRow: cfg.runRow,
          walkCols: Math.min(cfg.walkCols, cols),
        };
        break;
      }
    }

    if (!sheet) {
      sheet = { img, fw: img.width, fh: img.height, cols: 1, rows: 1, idleRow: 0, runRow: 0, walkCols: 1 };
    }

    try {
      sheet.bounds = this._measureFrameBounds(sheet, sheet.idleRow, 0);
      sheet.runBounds = this._measureFrameBounds(sheet, sheet.runRow, 0);
    } catch (_) {
      sheet.bounds = this._defaultBounds(sheet);
      sheet.runBounds = sheet.bounds;
    }
    sheet.displayH = Math.min(72, Math.max(48, sheet.bounds.height * 0.38));
    return sheet;
  },

  _defaultBounds(sheet) {
    const top = Math.floor(sheet.fh * 0.08);
    const feet = Math.floor(sheet.fh * 0.80);
    const left = Math.floor(sheet.fw * 0.18);
    const right = Math.floor(sheet.fw * 0.82);
    return {
      top,
      left,
      width: right - left + 1,
      height: feet - top + 1,
      feet,
    };
  },

  _measureFrameBounds(sheet, row, col) {
    const canvas = document.createElement('canvas');
    canvas.width = sheet.fw;
    canvas.height = sheet.fh;
    const c = canvas.getContext('2d', { willReadFrequently: true });
    if (!c) return this._defaultBounds(sheet);

    c.drawImage(
      sheet.img,
      col * sheet.fw, row * sheet.fh, sheet.fw, sheet.fh,
      0, 0, sheet.fw, sheet.fh
    );

    let data;
    try {
      data = c.getImageData(0, 0, sheet.fw, sheet.fh).data;
    } catch (_) {
      return this._defaultBounds(sheet);
    }
    const rowWidths = new Array(sheet.fh).fill(0);

    let top = sheet.fh;
    let left = sheet.fw;
    let right = 0;

    for (let y = 0; y < sheet.fh; y++) {
      for (let x = 0; x < sheet.fw; x++) {
        if (data[(y * sheet.fw + x) * 4 + 3] > 24) {
          rowWidths[y]++;
          if (y < top) top = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    if (top >= sheet.fh) {
      return this._defaultBounds(sheet);
    }

    const maxRowWidth = Math.max(...rowWidths);
    const minFootWidth = Math.max(8, maxRowWidth * 0.2);
    const ignoreBottom = Math.floor(sheet.fh * 0.14);

    let feet = top;
    for (let y = sheet.fh - 1 - ignoreBottom; y >= top; y--) {
      if (rowWidths[y] >= minFootWidth) {
        feet = y;
        break;
      }
    }

    // 检测到的最宽行常在贴图阴影上，再往上收到真实脚底
    const feetInset = Math.floor(sheet.fh * 0.07);
    feet = Math.max(top, feet - feetInset);

    return {
      top,
      left,
      width: right - left + 1,
      height: feet - top + 1,
      feet,
    };
  },

  async tryLoadChar(charId) {
    for (const path of this.charPaths[charId]) {
      try {
        const img = await this.loadImage(path);
        this.sheets[charId] = this.parseTinySheet(img, charId);
        return true;
      } catch (_) {}
    }
    return false;
  },

  async load() {
    if (this.ready) return;
    let count = 0;
    for (const charId of Object.keys(this.charPaths)) {
      if (await this.tryLoadChar(charId)) count++;
    }

    if (count > 0) {
      this.ready = true;
      this.status = `Knights 素材已加载 (${count}/3 角色)`;
    } else {
      this.status = '骑士 PNG 缺失 — 请双击 copy-assets.bat 复制素材';
    }
    this._updateStatusUI();
  },

  _updateStatusUI() {
    const el = document.getElementById('asset-status');
    const launch = document.getElementById('launch-link');
    if (el) {
      el.textContent = this.status;
      el.className = this.ready ? 'asset-ok' : 'asset-warn';
    }
    if (launch) launch.style.display = this.ready ? 'none' : 'inline-block';
  },

  drawPlayer(ctx, player) {
    const sheet = this.sheets[player.charId];
    if (!sheet || !sheet.img) return false;

    const moving = Math.hypot(player.vx, player.vy) > 10;
    const row = moving ? sheet.runRow : sheet.idleRow;
    const walkCols = sheet.walkCols || sheet.cols;
    const col = moving ? Math.floor(Date.now() / 100) % walkCols : 0;
    const flipX = Math.cos(player.facing) < -0.15;
    const bob = moving ? Math.sin(Date.now() / 100) * 1 : 0;

    let bounds = moving ? (sheet.runBounds || sheet.bounds) : sheet.bounds;
    if (!bounds || bounds.height <= 0 || bounds.width <= 0) {
      bounds = this._defaultBounds(sheet);
    }

    const displayH = sheet.displayH || 64;
    const scale = displayH / bounds.height;
    const displayW = bounds.width * scale;
    const groundY = player.y + 14 + bob;

    Sprites.drawShadow(ctx, player.x, player.y, 0.85, 0.3);
    ctx.save();
    ctx.translate(player.x, groundY);
    if (flipX) ctx.scale(-1, 1);
    if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }
    ctx.imageSmoothingEnabled = false;

    try {
      ctx.drawImage(
        sheet.img,
        col * sheet.fw + bounds.left,
        row * sheet.fh + bounds.top,
        bounds.width,
        bounds.height,
        -displayW / 2,
        -displayH,
        displayW,
        displayH
      );
    } catch (_) {
      ctx.drawImage(
        sheet.img,
        col * sheet.fw,
        row * sheet.fh,
        sheet.fw,
        sheet.fh,
        -displayH / 2,
        -displayH,
        displayH,
        displayH
      );
    }

    ctx.restore();
    return true;
  },
};

KnightSprites.load();
