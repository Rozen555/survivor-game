// 以撒的结合风格 — 地下室脏污石砖地板（烘焙缓存，每帧只 blit）
const IsaacBackground = {
  cache: null,

  _hash(tx, ty) {
    return ((tx * 73856093) ^ (ty * 19349663) ^ 83492791) >>> 0;
  },

  _drawFloorTiles(ctx, w, h, tile) {
    const shades = ['#3d2e22', '#453328', '#4a382a', '#3a2a1e', '#524030', '#362818'];
    const cols = Math.ceil(w / tile);
    const rows = Math.ceil(h / tile);

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const x = tx * tile;
        const y = ty * tile;
        const h = this._hash(tx, ty);

        ctx.fillStyle = shades[h % shades.length];
        ctx.fillRect(x, y, tile, tile);

        // 砖缝阴影
        ctx.fillStyle = 'rgba(8, 5, 3, 0.35)';
        ctx.fillRect(x, y + tile - 1, tile, 1);
        ctx.fillRect(x + tile - 1, y, 1, tile);

        // 高光边
        ctx.fillStyle = 'rgba(255, 220, 180, 0.04)';
        ctx.fillRect(x + 1, y + 1, tile - 2, 1);

        // 污渍 / 裂纹
        if (h % 5 === 0) {
          ctx.fillStyle = 'rgba(25, 15, 10, 0.22)';
          const cx = x + 6 + (h % (tile - 12));
          const cy = y + 6 + ((h >> 3) % (tile - 12));
          ctx.fillRect(cx, cy, 2 + (h % 3), 1);
          ctx.fillRect(cx + 1, cy + 1, 1, 2 + (h % 2));
        }

        // 血渍
        if (h % 13 === 0) {
          ctx.fillStyle = 'rgba(72, 18, 12, 0.28)';
          ctx.beginPath();
          ctx.ellipse(
            x + tile * 0.35 + (h % 8),
            y + tile * 0.45 + ((h >> 4) % 8),
            4 + (h % 5),
            3 + (h % 4),
            0, 0, TAU
          );
          ctx.fill();
        }

        // 尘土噪点
        if (h % 3 === 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.fillRect(x + (h % (tile - 4)) + 2, y + ((h >> 2) % (tile - 4)) + 2, 1, 1);
        }
      }
    }
  },

  _drawWalls(ctx, w, h, thickness) {
    const rockColors = ['#1a100c', '#221610', '#150d09', '#2a1a12', '#120a07'];

    const drawWallStrip = (x, y, sw, sh, seed) => {
      ctx.fillStyle = '#0c0705';
      ctx.fillRect(x, y, sw, sh);

      const rockSize = 14;
      for (let ry = y; ry < y + sh; ry += rockSize) {
        for (let rx = x; rx < x + sw; rx += rockSize) {
          const rh = this._hash(rx >> 4, ry >> 4) + seed;
          ctx.fillStyle = rockColors[rh % rockColors.length];
          const inset = rh % 3;
          ctx.fillRect(rx + inset, ry + inset, rockSize - inset, rockSize - inset - 1);

          if (rh % 4 === 0) {
            ctx.fillStyle = 'rgba(60, 40, 28, 0.35)';
            ctx.fillRect(rx + 2, ry + 2, 4, 2);
          }
        }
      }
    };

    drawWallStrip(0, 0, w, thickness, 1);
    drawWallStrip(0, h - thickness, w, thickness, 2);
    drawWallStrip(0, thickness, thickness, h - thickness * 2, 3);
    drawWallStrip(w - thickness, thickness, thickness, h - thickness * 2, 4);

    // 内缘阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(thickness, thickness, w - thickness * 2, 6);
    ctx.fillRect(thickness, thickness, 6, h - thickness * 2);
    ctx.fillRect(thickness, h - thickness - 6, w - thickness * 2, 6);
    ctx.fillRect(w - thickness - 6, thickness, 6, h - thickness * 2);
  },

  _drawVignette(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.72);
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },

  _drawCornerStains(ctx, w, h) {
    const spots = [
      [80, 60, 18], [w - 100, 80, 14], [120, h - 90, 16], [w - 130, h - 70, 20],
    ];
    for (const [sx, sy, sr] of spots) {
      ctx.fillStyle = 'rgba(55, 14, 10, 0.18)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, TAU);
      ctx.fill();
    }
  },

  build() {
    if (this.cache) return;

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    const tile = 40;
    const wall = 24;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 底色
    ctx.fillStyle = '#2a1f16';
    ctx.fillRect(0, 0, w, h);

    this._drawFloorTiles(ctx, w, h, tile);
    this._drawCornerStains(ctx, w, h);
    this._drawWalls(ctx, w, h, wall);
    this._drawVignette(ctx, w, h);

    // 整体脏污层
    ctx.fillStyle = 'rgba(30, 20, 12, 0.08)';
    ctx.fillRect(wall, wall, w - wall * 2, h - wall * 2);

    this.cache = canvas;
  },

  draw(ctx) {
    this.build();
    ctx.drawImage(this.cache, 0, 0);
  },
};
