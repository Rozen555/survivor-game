let nextId = 1;

class EnemyProjectile {
  constructor(x, y, angle, speed, damage, color, radius = 6) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.color = color;
    this.radius = radius;
    this.lifetime = 3.5;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 2, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

class Enemy {
  constructor(type, x, y, waveScale = 1, diff = null) {
    const def = ENEMIES[type];
    const d = diff || getDifficulty(2);
    this.id = nextId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = def.radius;
    this.speed = def.speed * (1 + waveScale * 0.05) * d.speedMult;
    this.maxHp = Math.floor(def.hp * (1 + waveScale * 0.3) * d.hpMult);
    this.hp = this.maxHp;
    this.damage = Math.floor(def.damage * (1 + waveScale * 0.15) * d.dmgMult);
    this.xp = Math.max(1, Math.floor(def.xp * d.rewardMult));
    this.gold = def.gold > 0 ? Math.max(1, Math.floor(def.gold * d.rewardMult)) : 0;
    this.color = def.color;
    this.isBoss = def.isBoss || false;
    this.isElite = def.isElite || false;
    this.behavior = def.behavior || 'chase';
    this.alpha = def.alpha || 1;
    this.knockback = { x: 0, y: 0 };
    this.flash = 0;
    this.wobble = Math.random() * TAU;
    this.shootTimer = Math.random() * 1.5;
    this.chargeTimer = Math.random() * 2;
    this.charging = false;
    this.chargeTime = 0;
    this.chargeDir = { x: 0, y: 0 };
    this.bossTimer = 2;
    this.bossPhase = 0;
    this.eliteTimer = 1.5;
    this.summonTimer = Math.random() * 2;
    this.dashTimer = Math.random() * 1.5;
    this._def = def;
  }

  update(dt, player, game) {
    this.wobble += dt * 3;

    if (this.charging) {
      this.chargeTime -= dt;
      this.x += this.chargeDir.x * this._def.chargeSpeed * dt;
      this.y += this.chargeDir.y * this._def.chargeSpeed * dt;
      if (this.chargeTime <= 0) this.charging = false;
    } else {
      switch (this.behavior) {
        case 'zigzag': this.moveZigzag(dt, player); break;
        case 'ghost': this.moveGhost(dt, player); break;
        case 'ranged': this.moveRanged(dt, player, game); break;
        case 'charger': this.moveCharger(dt, player); break;
        case 'elite': this.moveElite(dt, player, game); break;
        case 'eliteMage': this.moveEliteMage(dt, player, game); break;
        case 'eliteBerserker': this.moveEliteBerserker(dt, player, game); break;
        case 'elitePhantom': this.moveElitePhantom(dt, player, game); break;
        case 'eliteWarlock': this.moveEliteWarlock(dt, player, game); break;
        case 'boss': this.moveBoss(dt, player, game); break;
        case 'bossHydra': this.moveBossHydra(dt, player, game); break;
        case 'bossTitan': this.moveBossTitan(dt, player, game); break;
        default: this.moveChase(dt, player);
      }
    }

    this.knockback.x *= 0.9;
    this.knockback.y *= 0.9;
    if (this.flash > 0) this.flash -= dt;
  }

  moveChase(dt, player) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }

  moveZigzag(dt, player) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const perpX = -ny;
    const perpY = nx;
    const wobble = Math.sin(this.wobble * 4) * 0.55;
    const mx = nx + perpX * wobble;
    const my = ny + perpY * wobble;
    const len = Math.hypot(mx, my) || 1;
    this.x += (mx / len) * this.speed * dt;
    this.y += (my / len) * this.speed * dt;
  }

  moveGhost(dt, player) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const orbit = Math.sin(this.wobble * 2.5) * 0.8;
    this.x += (nx * 0.65 - ny * orbit * 0.35) * this.speed * dt;
    this.y += (ny * 0.65 + nx * orbit * 0.35) * this.speed * dt;
  }

  moveRanged(dt, player, game) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d = Math.hypot(dx, dy) || 1;
    const range = this._def.shootRange || 240;
    const prefer = range * 0.65;

    if (d > prefer + 40) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    } else if (d < prefer - 30) {
      this.x -= (dx / d) * this.speed * 0.8 * dt;
      this.y -= (dy / d) * this.speed * 0.8 * dt;
    } else {
      const strafe = Math.cos(this.wobble * 2);
      this.x += (-dy / d) * strafe * this.speed * 0.6 * dt;
      this.y += (dx / d) * strafe * this.speed * 0.6 * dt;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < range && game) {
      this.shootTimer = this._def.shootCd || 1.8;
      const angle = angleBetween(this.x, this.y, player.x, player.y);
      game.enemyProjectiles.push(new EnemyProjectile(
        this.x, this.y, angle, this._def.projSpeed || 220,
        this.damage, this.color
      ));
    }
  }

  moveCharger(dt, player) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.chargeTimer -= dt;
    if (this.chargeTimer <= 0 && d < 220 && d > 60) {
      this.charging = true;
      this.chargeTime = 0.45;
      this.chargeDir.x = dx / d;
      this.chargeDir.y = dy / d;
      this.chargeTimer = this._def.chargeCd || 2.5;
      return;
    }

    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }

  moveElite(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.chargeTimer -= dt;
    if (this.chargeTimer <= 0 && d < 260 && d > 55) {
      this.charging = true;
      this.chargeTime = 0.4;
      this.chargeDir.x = dx / d;
      this.chargeDir.y = dy / d;
      this.chargeTimer = this._def.chargeCd || 2.2;
      return;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < 320 && game) {
      this.shootTimer = this._def.shootCd || 2.4;
      const base = angleBetween(this.x, this.y, player.x, player.y);
      for (let i = -1; i <= 1; i++) {
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, base + i * 0.22,
          this._def.projSpeed || 300,
          Math.floor(this.damage * 0.7),
          this.color, 7
        ));
      }
    }

    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }

  moveEliteMage(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    const range = this._def.shootRange || 280;
    const prefer = range * 0.58;

    if (d > prefer + 35) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    } else if (d < prefer - 25) {
      this.x -= (dx / d) * this.speed * 0.85 * dt;
      this.y -= (dy / d) * this.speed * 0.85 * dt;
    } else {
      const strafe = Math.cos(this.wobble * 2.2);
      this.x += (-dy / d) * strafe * this.speed * 0.7 * dt;
      this.y += (dx / d) * strafe * this.speed * 0.7 * dt;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < range + 40 && game) {
      this.shootTimer = this._def.shootCd || 1.5;
      const base = angleBetween(this.x, this.y, player.x, player.y);
      for (let i = -2; i <= 2; i++) {
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, base + i * 0.16,
          this._def.projSpeed || 280,
          Math.floor(this.damage * 0.65),
          this.color, 6
        ));
      }
    }

    this.eliteTimer -= dt;
    if (this.eliteTimer <= 0 && d < range && game) {
      this.eliteTimer = this._def.novaCd || 4.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * TAU + this.wobble * 0.3;
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, angle,
          (this._def.projSpeed || 280) * 0.75,
          Math.floor(this.damage * 0.55),
          '#dfe6e9', 5
        ));
      }
      game.particles.hit(this.x, this.y, this.color);
    }
  }

  moveEliteBerserker(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.chargeTimer -= dt;
    if (this.chargeTimer <= 0 && d < 300) {
      this.charging = true;
      this.chargeTime = 0.55;
      this.chargeDir.x = dx / d;
      this.chargeDir.y = dy / d;
      this.chargeTimer = this._def.chargeCd || 1.5;
      return;
    }

    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }

  moveElitePhantom(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const orbit = Math.sin(this.wobble * 3) * 0.65;

    this.dashTimer -= dt;
    if (this.dashTimer <= 0 && d < 280 && d > 45) {
      this.charging = true;
      this.chargeTime = this._def.dashTime || 0.32;
      this.chargeDir.x = nx;
      this.chargeDir.y = ny;
      this.dashTimer = this._def.dashCd || 2.0;
      if (game) game.particles.hit(this.x, this.y, this.color);
      return;
    }

    this.x += (nx * 0.55 - ny * orbit * 0.45) * this.speed * dt;
    this.y += (ny * 0.55 + nx * orbit * 0.45) * this.speed * dt;
  }

  moveEliteWarlock(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    if (d > 180) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    } else if (d < 120) {
      this.x -= (dx / d) * this.speed * 0.75 * dt;
      this.y -= (dy / d) * this.speed * 0.75 * dt;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < 340 && game) {
      this.shootTimer = this._def.shootCd || 2.0;
      const base = angleBetween(this.x, this.y, player.x, player.y);
      for (let i = -1; i <= 1; i++) {
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, base + i * 0.35,
          this._def.projSpeed || 240,
          Math.floor(this.damage * 0.75),
          '#2d3436', 8
        ));
      }
    }

    this.summonTimer -= dt;
    if (this.summonTimer <= 0 && game) {
      this.summonTimer = this._def.summonCd || 4.8;
      const count = this._def.summonCount || 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * TAU + Math.random() * 0.4;
        const distOff = this.radius + 18 + i * 6;
        game.spawner.spawnEnemy(
          game,
          this._def.summonType || 'skeleton',
          this.x + Math.cos(angle) * distOff,
          this.y + Math.sin(angle) * distOff,
          game.spawner.wave * 0.35
        );
      }
      game.particles.hit(this.x, this.y, '#6c5ce7');
    }
  }

  moveBoss(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && game) {
      if (this.bossPhase === 0) {
        this.charging = true;
        this.chargeTime = 0.65;
        this.chargeDir.x = dx / d;
        this.chargeDir.y = dy / d;
        this.bossTimer = 3.2;
        this.bossPhase = (this.bossPhase + 1) % 3;
        return;
      } else if (this.bossPhase === 1) {
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * TAU;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            this._def.projSpeed || 220,
            Math.floor(this.damage * 0.6),
            '#ff7675', 8
          ));
        }
        this.bossTimer = 2.8;
      } else {
        const novaR = this._def.novaRadius || 130;
        if (d < novaR + player.radius) {
          player.takeDamage(Math.floor(this.damage * 0.8));
        }
        game.particles.hit(this.x, this.y, '#d63031');
        for (let i = 0; i < 16; i++) {
          game.particles.hit(
            this.x + Math.cos(i / 16 * TAU) * novaR * 0.4,
            this.y + Math.sin(i / 16 * TAU) * novaR * 0.4,
            '#ff7675'
          );
        }
        this.bossTimer = 3.5;
      }
      this.bossPhase = (this.bossPhase + 1) % 3;
    }

    this.x += (dx / d) * this.speed * 0.8 * dt;
    this.y += (dy / d) * this.speed * 0.8 * dt;
  }

  moveBossHydra(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && game) {
      const heads = this._def.headCount || 5;
      if (this.bossPhase === 0) {
        const base = angleBetween(this.x, this.y, player.x, player.y);
        for (let i = 0; i < heads; i++) {
          const spread = (i - (heads - 1) / 2) * 0.18;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y - 8 + i * 4, base + spread,
            this._def.projSpeed || 260,
            Math.floor(this.damage * 0.7),
            '#00cec9', 7
          ));
        }
        this.bossTimer = 2.2;
      } else if (this.bossPhase === 1) {
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * TAU + this.wobble * 0.5;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            (this._def.projSpeed || 260) * 0.85,
            Math.floor(this.damage * 0.5),
            '#55efc4', 6
          ));
        }
        this.bossTimer = 2.6;
      } else {
        this.charging = true;
        this.chargeTime = 0.5;
        this.chargeDir.x = dx / d;
        this.chargeDir.y = dy / d;
        this.bossTimer = 3.0;
      }
      this.bossPhase = (this.bossPhase + 1) % 3;
    }

    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }

  moveBossTitan(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && game) {
      if (this.bossPhase === 0) {
        const slamR = this._def.slamRadius || 110;
        if (d < slamR + player.radius) {
          player.takeDamage(Math.floor(this.damage * 0.9));
        }
        game.camera.shake = Math.max(game.camera.shake || 0, 10);
        game.particles.hit(this.x, this.y, '#e17055');
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * TAU;
          game.particles.hit(
            this.x + Math.cos(a) * slamR * 0.45,
            this.y + Math.sin(a) * slamR * 0.45,
            '#fdcb6e'
          );
        }
        this.bossTimer = 3.8;
      } else if (this.bossPhase === 1) {
        for (let i = 0; i < 8; i++) {
          const angle = angleBetween(this.x, this.y, player.x, player.y) + (i - 3.5) * 0.12;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            this._def.projSpeed || 200,
            Math.floor(this.damage * 0.65),
            '#ff7675', 9
          ));
        }
        this.bossTimer = 2.5;
      } else {
        const novaR = this._def.novaRadius || 155;
        if (d < novaR + player.radius) {
          player.takeDamage(Math.floor(this.damage * 0.85));
        }
        game.particles.hit(this.x, this.y, '#d63031');
        for (let i = 0; i < 18; i++) {
          game.particles.hit(
            this.x + Math.cos(i / 18 * TAU) * novaR * 0.42,
            this.y + Math.sin(i / 18 * TAU) * novaR * 0.42,
            '#e17055'
          );
        }
        this.bossTimer = 4.0;
      }
      this.bossPhase = (this.bossPhase + 1) % 3;
    }

    this.x += (dx / d) * this.speed * 0.65 * dt;
    this.y += (dy / d) * this.speed * 0.65 * dt;
  }

  takeDamage(amount, fromX, fromY) {
    this.hp -= amount;
    this.flash = 0.1;

    const angle = Math.atan2(this.y - fromY, this.x - fromX);
    const force = this.isBoss ? 30 : this.isElite ? 50 : 80;
    this.knockback.x = Math.cos(angle) * force;
    this.knockback.y = Math.sin(angle) * force;

    return this.hp <= 0;
  }

  draw(ctx) {
    const aura = this._def.auraColor || (this.isBoss ? '#ff4757' : this.isElite ? '#fdcb6e' : null);

    if (this.isElite || this.isBoss || this.maxHp > 30) {
      const ratio = this.hp / this.maxHp;
      const barW = this.isBoss ? this.radius * 2.4 : this.radius * 2;
      const barY = this.y - this.radius - (this.isBoss ? 22 : 18);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(this.x - barW / 2 - 1, barY - 1, barW + 2, 7);
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - barW / 2, barY, barW, 5);
      ctx.fillStyle = aura || (ratio > 0.5 ? '#6bcb77' : ratio > 0.25 ? '#ffd93d' : '#ff4757');
      ctx.fillRect(this.x - barW / 2, barY, barW * ratio, 5);
      if (this.isBoss || this.isElite) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(this.x - barW / 2, barY, barW * ratio, 2);
      }
    }

    if (this.isElite || this.isBoss) {
      const labelY = this.y - this.radius - (this.isBoss ? 32 : 28);
      ctx.fillStyle = aura || (this.isBoss ? '#ff7675' : '#ffeaa7');
      ctx.font = `bold ${this.isBoss ? 14 : 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = aura || '#000';
      ctx.shadowBlur = 8;
      const prefix = this.isBoss ? (this._def.bossIcon || '☠') : (this._def.eliteIcon || '⚔');
      ctx.fillText(`${prefix} ${this._def.name}`, this.x, labelY);
      ctx.shadowBlur = 0;
    }

    Sprites.drawEnemy(ctx, this);
  }
}

class EnemySpawner {
  constructor() {
    this.spawnTimer = 0;
    this.spawnRate = 1.5;
    this.wave = 1;
    this.waveTimer = 0;
    this.enemiesPerWave = 20;
    this.spawnedThisWave = 0;
    this.eliteSpawned = false;
    this.bossSpawned = false;
    this.difficulty = getDifficulty(2);
    this.spawnPool = ENEMY_SPAWN_POOL.map(p => ({ ...p }));
  }

  setDifficulty(diff) {
    this.difficulty = diff || getDifficulty(2);
  }

  reset() {
    const d = this.difficulty;
    this.spawnTimer = 0;
    this.spawnRate = 1.5 * d.spawnRateMult;
    this.wave = 1;
    this.waveTimer = 0;
    this.enemiesPerWave = Math.floor(20 * d.countMult);
    this.spawnedThisWave = 0;
    this.eliteSpawned = false;
    this.bossSpawned = false;
  }

  update(dt, game) {
    this.waveTimer += dt;
    this.spawnTimer += dt;

    const d = this.difficulty;
    const maxEnemies = Math.floor((80 + this.wave * 10) * d.maxEnemyMult);

    if (this.spawnTimer >= this.spawnRate && game.enemies.length < maxEnemies && this.spawnedThisWave < this.enemiesPerWave) {
      this.spawnTimer = 0;
      this.spawnEnemy(game);
      this.spawnedThisWave++;
    }

    if (this.wave === 5 && !this.eliteSpawned && this.spawnedThisWave >= Math.floor(this.enemiesPerWave * 0.45)) {
      this.spawnElite(game);
      this.eliteSpawned = true;
    }

    if (this.wave === 10 && !this.bossSpawned && this.spawnedThisWave >= Math.floor(this.enemiesPerWave * 0.5)) {
      this.spawnBoss(game);
      this.bossSpawned = true;
    }
  }

  getEnemyType() {
    const shift = this.difficulty.enemyWaveShift;
    const diffLevel = this.difficulty.level;
    const available = this.spawnPool.filter(p => {
      const needWave = Math.max(1, Math.min(TOTAL_WAVES, p.minWave - shift));
      const needDiff = p.minDifficulty ?? 0;
      return this.wave >= needWave && diffLevel >= needDiff;
    });
    const pool = available.length
      ? available
      : this.spawnPool.filter(p => p.minWave === 1 && (p.minDifficulty ?? 0) <= diffLevel);
    let total = 0;
    for (const p of pool) total += p.weight;
    let roll = Math.random() * total;
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) return p.type;
    }
    return 'slime';
  }

  spawnEnemy(game, type, x, y, waveScale) {
    type = type || this.getEnemyType();
    const pos = (x != null && y != null)
      ? { x, y }
      : this.getSpawnPosition(game.player, game.bounds);
    const diff = game.difficulty || this.difficulty;
    game.enemies.push(new Enemy(
      type, pos.x, pos.y,
      waveScale != null ? waveScale : this.wave,
      diff
    ));
  }

  spawnElite(game) {
    const type = getRandomEliteType();
    const def = ENEMIES[type];
    const pos = this.getSpawnPosition(game.player, game.bounds);
    const diff = game.difficulty || this.difficulty;
    game.enemies.push(new Enemy(type, pos.x, pos.y, this.wave, diff));
    game.triggerAnnouncement(`${def.eliteIcon || '⚔'} ${def.name} 出现！`, def.auraColor || '#fdcb6e');
    game.camera.shake = 6;
    Audio.play('elite');
  }

  spawnBoss(game) {
    const type = getRandomBossType();
    const def = ENEMIES[type];
    const pos = this.getSpawnPosition(game.player, game.bounds);
    const diff = game.difficulty || this.difficulty;
    game.enemies.push(new Enemy(type, pos.x, pos.y, this.wave, diff));
    game.triggerAnnouncement(`${def.bossIcon || '☠'} ${def.name} 降临！`, def.auraColor || '#ff4757', 4);
    game.camera.shake = 12;
    Audio.play('boss');
  }

  getSpawnPosition(player, bounds) {
    const edge = Math.floor(Math.random() * 4);
    const margin = 50;
    let x, y;

    switch (edge) {
      case 0: x = randomRange(margin, bounds.width - margin); y = -margin; break;
      case 1: x = bounds.width + margin; y = randomRange(margin, bounds.height - margin); break;
      case 2: x = randomRange(margin, bounds.width - margin); y = bounds.height + margin; break;
      default: x = -margin; y = randomRange(margin, bounds.height - margin);
    }
    return { x, y };
  }

  nextWave() {
    const d = this.difficulty;
    this.wave++;
    this.waveTimer = 0;
    this.spawnedThisWave = 0;
    this.enemiesPerWave = Math.floor((20 + this.wave * 8) * d.countMult);
    this.spawnRate = Math.max(0.25, (1.5 - this.wave * 0.1) * d.spawnRateMult);
    this.eliteSpawned = false;
    this.bossSpawned = false;
  }

  isWaveComplete() {
    return this.spawnedThisWave >= this.enemiesPerWave;
  }
}
