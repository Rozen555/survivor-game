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
    Audio.play('enemyShoot');
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
    const d = diff || getDifficulty(MIN_DIFFICULTY);
    this.id = nextId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = def.radius;
    let hpWaveScale = waveScale * 0.38;
    let dmgWaveScale = waveScale * 0.15;
    let hpTierMult = 1;
    let dmgTierMult = 1;
    if (def.isElite) {
      hpWaveScale = waveScale * 0.42;
      dmgWaveScale = waveScale * 0.22;
      hpTierMult = 1.5;
      dmgTierMult = 1.05;
    } else if (def.isBoss) {
      hpWaveScale = waveScale * 0.55;
      dmgWaveScale = waveScale * 0.32;
      hpTierMult = 2.0;
      dmgTierMult = 1.12;
    }
    this.speed = def.speed * (1 + waveScale * 0.05) * d.speedMult * (def.isBoss ? 1.14 : def.isElite ? 1.05 : 1);
    const hpDiffMult = (def.isElite || def.isBoss) ? d.hpMult : (d.minionHpMult ?? d.hpMult);
    const wave1HpEase = (waveScale <= 1 && !def.isElite && !def.isBoss)
      ? (d.wave1MinionHpMult ?? 1)
      : 1;
    this.maxHp = Math.floor(def.hp * (1 + hpWaveScale) * hpDiffMult * hpTierMult * wave1HpEase);
    this.hp = this.maxHp;
    const dmgDiffMult = def.isBoss ? (d.bossDmgMult ?? d.dmgMult) : d.dmgMult;
    this.damage = Math.floor(def.damage * (1 + dmgWaveScale) * dmgDiffMult * dmgTierMult);
    this.xp = Math.max(1, Math.floor(def.xp * d.rewardMult * XP_REWARD_MULT));
    this.gold = def.gold > 0 ? Math.max(1, Math.floor(def.gold * d.rewardMult * GOLD_REWARD_MULT)) : 0;
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
    this.burn = null;
    this.slow = null;
  }

  get moveSpeed() {
    return this.speed * (this.slow?.time > 0 ? this.slow.mult : 1);
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

    if (this.slow) {
      this.slow.time -= dt;
      if (this.slow.time <= 0) this.slow = null;
    }
  }

  moveChase(dt, player) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += (dx / d) * this.moveSpeed * dt;
    this.y += (dy / d) * this.moveSpeed * dt;
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
    this.x += (mx / len) * this.moveSpeed * dt;
    this.y += (my / len) * this.moveSpeed * dt;
  }

  moveGhost(dt, player) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const orbit = Math.sin(this.wobble * 2.5) * 0.8;
    this.x += (nx * 0.65 - ny * orbit * 0.35) * this.moveSpeed * dt;
    this.y += (ny * 0.65 + nx * orbit * 0.35) * this.moveSpeed * dt;
  }

  moveRanged(dt, player, game) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d = Math.hypot(dx, dy) || 1;
    const range = this._def.shootRange || 240;
    const prefer = range * 0.65;

    if (d > prefer + 40) {
      this.x += (dx / d) * this.moveSpeed * dt;
      this.y += (dy / d) * this.moveSpeed * dt;
    } else if (d < prefer - 30) {
      this.x -= (dx / d) * this.moveSpeed * 0.8 * dt;
      this.y -= (dy / d) * this.moveSpeed * 0.8 * dt;
    } else {
      const strafe = Math.cos(this.wobble * 2);
      this.x += (-dy / d) * strafe * this.moveSpeed * 0.6 * dt;
      this.y += (dx / d) * strafe * this.moveSpeed * 0.6 * dt;
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
      Audio.play('charge');
      return;
    }

    this.x += (dx / d) * this.moveSpeed * dt;
    this.y += (dy / d) * this.moveSpeed * dt;
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
      Audio.play('charge');
      return;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < 320 && game) {
      this.shootTimer = this._def.shootCd || 2.4;
      const base = angleBetween(this.x, this.y, player.x, player.y);
      for (let i = -2; i <= 2; i++) {
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, base + i * 0.18,
          this._def.projSpeed || 300,
          Math.floor(this.damage * 0.82),
          this.color, 8
        ));
      }
    }

    this.x += (dx / d) * this.moveSpeed * dt;
    this.y += (dy / d) * this.moveSpeed * dt;
  }

  moveEliteMage(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;
    const range = this._def.shootRange || 280;
    const prefer = range * 0.58;

    if (d > prefer + 35) {
      this.x += (dx / d) * this.moveSpeed * dt;
      this.y += (dy / d) * this.moveSpeed * dt;
    } else if (d < prefer - 25) {
      this.x -= (dx / d) * this.moveSpeed * 0.85 * dt;
      this.y -= (dy / d) * this.moveSpeed * 0.85 * dt;
    } else {
      const strafe = Math.cos(this.wobble * 2.2);
      this.x += (-dy / d) * strafe * this.moveSpeed * 0.7 * dt;
      this.y += (dx / d) * strafe * this.moveSpeed * 0.7 * dt;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < range + 40 && game) {
      this.shootTimer = this._def.shootCd || 1.5;
      const base = angleBetween(this.x, this.y, player.x, player.y);
      for (let i = -2; i <= 2; i++) {
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, base + i * 0.16,
          this._def.projSpeed || 280,
          Math.floor(this.damage * 0.78),
          this.color, 6
        ));
      }
    }

    this.eliteTimer -= dt;
    if (this.eliteTimer <= 0 && d < range && game) {
      this.eliteTimer = this._def.novaCd || 4.5;
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * TAU + this.wobble * 0.3;
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, angle,
          (this._def.projSpeed || 280) * 0.8,
          Math.floor(this.damage * 0.68),
          '#dfe6e9', 6
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
      Audio.play('charge');
      return;
    }

    this.x += (dx / d) * this.moveSpeed * dt;
    this.y += (dy / d) * this.moveSpeed * dt;
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
      Audio.play('dash');
      if (game) game.particles.hit(this.x, this.y, this.color);
      return;
    }

    this.x += (nx * 0.55 - ny * orbit * 0.45) * this.moveSpeed * dt;
    this.y += (ny * 0.55 + nx * orbit * 0.45) * this.moveSpeed * dt;
  }

  moveEliteWarlock(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    if (d > 180) {
      this.x += (dx / d) * this.moveSpeed * dt;
      this.y += (dy / d) * this.moveSpeed * dt;
    } else if (d < 120) {
      this.x -= (dx / d) * this.moveSpeed * 0.75 * dt;
      this.y -= (dy / d) * this.moveSpeed * 0.75 * dt;
    }

    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && d < 340 && game) {
      this.shootTimer = this._def.shootCd || 2.0;
      const base = angleBetween(this.x, this.y, player.x, player.y);
      for (let i = -1; i <= 1; i++) {
        game.enemyProjectiles.push(new EnemyProjectile(
          this.x, this.y, base + i * 0.35,
          this._def.projSpeed || 240,
          Math.floor(this.damage * 0.85),
          '#2d3436', 9
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
          game.spawner.wave * 0.55
        );
      }
      game.particles.hit(this.x, this.y, '#6c5ce7');
    }
  }

  _bossCd(seconds) {
    const ratio = this.hp / this.maxHp;
    if (ratio <= 0.3) return seconds * 0.62;
    if (ratio <= 0.55) return seconds * 0.78;
    return seconds;
  }

  moveBoss(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && game) {
      if (this.bossPhase === 0) {
        this.charging = true;
        this.chargeTime = 0.85;
        this.chargeDir.x = dx / d;
        this.chargeDir.y = dy / d;
        Audio.play('charge');
        this.bossTimer = this._bossCd(2.0);
        this.bossPhase = (this.bossPhase + 1) % 3;
        return;
      } else if (this.bossPhase === 1) {
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * TAU;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            this._def.projSpeed || 300,
            Math.floor(this.damage * 0.88),
            '#ff7675', 10
          ));
        }
        this.bossTimer = this._bossCd(1.7);
      } else {
        const novaR = this._def.novaRadius || 175;
        if (d < novaR + player.radius) {
          player.takeDamage(Math.floor(this.damage * 1.15));
          game.camera.shake = Math.max(game.camera.shake || 0, 10);
        }
        game.particles.hit(this.x, this.y, '#d63031');
        for (let i = 0; i < 20; i++) {
          game.particles.hit(
            this.x + Math.cos(i / 20 * TAU) * novaR * 0.4,
            this.y + Math.sin(i / 20 * TAU) * novaR * 0.4,
            '#ff7675'
          );
        }
        this.bossTimer = this._bossCd(2.2);
      }
      this.bossPhase = (this.bossPhase + 1) % 3;
    }

    this.x += (dx / d) * this.moveSpeed * 0.9 * dt;
    this.y += (dy / d) * this.moveSpeed * 0.9 * dt;
  }

  moveBossHydra(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && game) {
      const heads = this._def.headCount || 8;
      if (this.bossPhase === 0) {
        const base = angleBetween(this.x, this.y, player.x, player.y);
        for (let i = 0; i < heads; i++) {
          const spread = (i - (heads - 1) / 2) * 0.16;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y - 8 + i * 4, base + spread,
            this._def.projSpeed || 310,
            Math.floor(this.damage * 0.95),
            '#00cec9', 9
          ));
        }
        for (let i = 0; i < 4; i++) {
          const angle = base + (i - 1.5) * 0.35;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            (this._def.projSpeed || 310) * 1.1,
            Math.floor(this.damage * 0.75),
            '#55efc4', 8
          ));
        }
        this.bossTimer = this._bossCd(1.4);
      } else if (this.bossPhase === 1) {
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * TAU + this.wobble * 0.5;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            (this._def.projSpeed || 310) * 0.95,
            Math.floor(this.damage * 0.78),
            '#55efc4', 8
          ));
        }
        this.bossTimer = this._bossCd(1.6);
      } else {
        this.charging = true;
        this.chargeTime = 0.72;
        this.chargeDir.x = dx / d;
        this.chargeDir.y = dy / d;
        Audio.play('charge');
        this.bossTimer = this._bossCd(1.9);
      }
      this.bossPhase = (this.bossPhase + 1) % 3;
    }

    this.x += (dx / d) * this.moveSpeed * 1.05 * dt;
    this.y += (dy / d) * this.moveSpeed * 1.05 * dt;
  }

  moveBossTitan(dt, player, game) {
    const dx = player.x - this.x + this.knockback.x;
    const dy = player.y - this.y + this.knockback.y;
    const d = Math.hypot(dx, dy) || 1;

    this.bossTimer -= dt;
    if (this.bossTimer <= 0 && game) {
      if (this.bossPhase === 0) {
        const slamR = this._def.slamRadius || 150;
        if (d < slamR + player.radius) {
          player.takeDamage(Math.floor(this.damage * 1.28));
        }
        game.camera.shake = Math.max(game.camera.shake || 0, 16);
        game.particles.hit(this.x, this.y, '#e17055');
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * TAU;
          game.particles.hit(
            this.x + Math.cos(a) * slamR * 0.45,
            this.y + Math.sin(a) * slamR * 0.45,
            '#fdcb6e'
          );
        }
        this.bossTimer = this._bossCd(2.4);
      } else if (this.bossPhase === 1) {
        for (let i = 0; i < 14; i++) {
          const angle = angleBetween(this.x, this.y, player.x, player.y) + (i - 6.5) * 0.11;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, angle,
            this._def.projSpeed || 260,
            Math.floor(this.damage * 0.92),
            '#ff7675', 11
          ));
        }
        this.bossTimer = this._bossCd(1.6);
      } else {
        const novaR = this._def.novaRadius || 195;
        if (d < novaR + player.radius) {
          player.takeDamage(Math.floor(this.damage * 1.2));
          game.camera.shake = Math.max(game.camera.shake || 0, 12);
        }
        game.particles.hit(this.x, this.y, '#d63031');
        for (let i = 0; i < 22; i++) {
          game.particles.hit(
            this.x + Math.cos(i / 22 * TAU) * novaR * 0.42,
            this.y + Math.sin(i / 22 * TAU) * novaR * 0.42,
            '#e17055'
          );
        }
        this.bossTimer = this._bossCd(2.5);
      }
      this.bossPhase = (this.bossPhase + 1) % 3;
    }

    this.x += (dx / d) * this.moveSpeed * 0.78 * dt;
    this.y += (dy / d) * this.moveSpeed * 0.78 * dt;
  }

  takeDamage(amount, fromX, fromY) {
    this.hp -= amount;
    this.flash = 0.1;
    Audio.play(this.isBoss || this.isElite ? 'hitHeavy' : 'hit');

    const angle = Math.atan2(this.y - fromY, this.x - fromX);
    const force = this.isBoss ? 10 : this.isElite ? 28 : 80;
    this.knockback.x = Math.cos(angle) * force;
    this.knockback.y = Math.sin(angle) * force;

    return this.hp <= 0;
  }

  draw(ctx) {
    const aura = this._def.auraColor || (this.isBoss ? '#ff4757' : this.isElite ? '#fdcb6e' : null);
    const ratio = this.hp / this.maxHp;
    const barW = this.isBoss
      ? this.radius * 2.4
      : this.isElite
        ? this.radius * 2
        : Math.max(14, this.radius * 1.5);
    const barH = this.isBoss || this.isElite ? 5 : 3;
    const barPad = this.isBoss || this.isElite ? 1 : 0;
    const barY = this.y - this.radius - (this.isBoss ? 22 : this.isElite ? 18 : 10);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(this.x - barW / 2 - barPad, barY - barPad, barW + barPad * 2, barH + barPad * 2);
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x - barW / 2, barY, barW, barH);
    ctx.fillStyle = aura || (ratio > 0.5 ? '#6bcb77' : ratio > 0.25 ? '#ffd93d' : '#ff4757');
    ctx.fillRect(this.x - barW / 2, barY, barW * ratio, barH);
    if (this.isBoss || this.isElite) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(this.x - barW / 2, barY, barW * ratio, Math.min(2, barH));
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

    if (this.slow) {
      ctx.save();
      ctx.fillStyle = '#74b9ff';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(this.x - 8, this.y - this.radius - 6, 3, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    if (this.burn?.time > 0) {
      ctx.save();
      ctx.fillStyle = '#e17055';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(this.x + 8, this.y - this.radius - 6, 3, 0, TAU);
      ctx.fill();
      ctx.restore();
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
    this.difficulty = getDifficulty(MIN_DIFFICULTY);
    this.spawnPool = ENEMY_SPAWN_POOL.map(p => ({ ...p }));
  }

  _waveConfig(wave = this.wave) {
    const d = this.difficulty;
    return {
      enemiesPerWave: Math.floor((35 + wave * 18) * d.countMult),
      spawnRate: Math.max(0.12, (0.95 - wave * 0.075) * d.spawnRateMult),
      maxEnemies: Math.floor((55 + wave * 30) * d.maxEnemyMult),
      spawnBurst: wave >= 8 ? 3 : wave >= 5 ? 2 : wave >= 3 ? 2 : 1,
    };
  }

  _applyWaveConfig() {
    const cfg = this._waveConfig();
    this.enemiesPerWave = cfg.enemiesPerWave;
    this.spawnRate = cfg.spawnRate;
  }

  setDifficulty(diff) {
    this.difficulty = diff || getDifficulty(MIN_DIFFICULTY);
    this._applyWaveConfig();
  }

  reset() {
    const d = this.difficulty;
    this.spawnTimer = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.spawnedThisWave = 0;
    this.eliteSpawned = false;
    this.bossSpawned = false;
    this._applyWaveConfig();
  }

  update(dt, game) {
    this.waveTimer += dt;
    if (isWaveTimedOut(game.waveTimer, game.currentWave)) return;

    this.spawnTimer += dt;

    const cfg = this._waveConfig();
    const maxEnemies = cfg.maxEnemies;
    const burst = cfg.spawnBurst;

    if (this.spawnTimer >= this.spawnRate && this.spawnedThisWave < this.enemiesPerWave) {
      let spawned = 0;
      while (
        spawned < burst
        && this.spawnedThisWave < this.enemiesPerWave
        && game.enemies.length < maxEnemies
      ) {
        this.spawnEnemy(game);
        this.spawnedThisWave++;
        spawned++;
      }
      if (spawned > 0) this.spawnTimer = 0;
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
    this.wave++;
    this.waveTimer = 0;
    this.spawnedThisWave = 0;
    this._applyWaveConfig();
    this.eliteSpawned = false;
    this.bossSpawned = false;
  }

  isWaveComplete() {
    return this.spawnedThisWave >= this.enemiesPerWave;
  }
}
