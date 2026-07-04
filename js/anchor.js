class AnchorArrowProjectile {
  constructor(x, y, angle, speed, damage, pierce = 1) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.radius = 5;
    this.pierce = pierce;
    this.lifetime = 2.4;
    this.alive = true;
    this.hitIds = new Set();
    this.color = '#6bcb77';
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.alive = false;
  }

  draw(ctx) {
    const angle = Math.atan2(this.vy, this.vx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#a8e6cf';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#dff9fb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.restore();
  }
}

class AnchorArrowTower {
  constructor(x, y, player) {
    this.x = x;
    this.y = y;
    this.cooldown = 0.15;
    this.facing = 0;
    this.flash = 0;
    this.wobble = Math.random() * TAU;
  }

  getStats(player) {
    const def = player.getAnchorTypeDef();
    const dmgMult = player.getDamageMult?.() ?? player.damageMult ?? 1;
    return {
      damage: Math.floor(
        ((def.towerDamage || 22) + player.level * (def.towerDamagePerLevel || 1.75))
        * dmgMult
        * (player.towerDamageMult || 1)
      ),
      range: (def.towerRange || 290) * (player.towerRangeMult || 1),
      shootCd: (def.towerShootCd || 0.56) / (player.towerSpeedMult || 1),
      projSpeed: def.towerProjSpeed || 520,
      pierce: 1 + Math.floor(player.level / 6),
    };
  }

  findNearest(enemies, range) {
    let nearest = null;
    let nearestDist = range;
    for (const e of enemies) {
      const d = dist(this.x, this.y, e.x, e.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  update(dt, player, enemies, projectiles, particles) {
    this.wobble += dt * 4;
    this.flash = Math.max(0, this.flash - dt);
    this.cooldown -= dt;

    const stats = this.getStats(player);
    if (this.cooldown > 0 || !enemies.length) return;

    const target = this.findNearest(enemies, stats.range);
    if (!target) return;

    const angle = angleBetween(this.x, this.y, target.x, target.y);
    this.facing = angle;
    projectiles.push(new AnchorArrowProjectile(
      this.x,
      this.y,
      angle,
      stats.projSpeed,
      stats.damage,
      stats.pierce
    ));
    this.cooldown = stats.shootCd;
    this.flash = 0.12;
    if (particles) particles.hit(this.x + Math.cos(angle) * 12, this.y + Math.sin(angle) * 12, '#6bcb77');
    Audio.play('shoot');
  }

  draw(ctx) {
    const bob = Math.sin(this.wobble) * 1.2;
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.globalAlpha = this.flash > 0 ? 0.85 : 1;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 5, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#5a4a32';
    ctx.fillRect(-13, 2, 26, 9);
    ctx.fillStyle = '#6bcb77';
    ctx.fillRect(-10, -10, 20, 14);
    ctx.fillStyle = '#4a6741';
    ctx.fillRect(-8, -8, 16, 10);

    ctx.save();
    ctx.rotate(this.facing);
    ctx.fillStyle = '#a8e6cf';
    ctx.fillRect(4, -2, 14, 4);
    ctx.fillStyle = '#dfe6e9';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(10, -3);
    ctx.lineTo(10, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#2d3436';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏹', 0, -1);
    ctx.restore();
  }
}

class AnchorSystem {
  constructor() {
    this.stormTick = 0;
    this.stormBolts = [];
    this.stormPulse = 0;
    this.arrowTower = null;
    this.towerProjectiles = [];
  }

  reset() {
    this.stormTick = 0;
    this.stormBolts = [];
    this.stormPulse = 0;
    this.arrowTower = null;
    this.towerProjectiles = [];
  }

  handleInput(player, keys) {
    if (!player || player.hp <= 0) return;

    const wantAnchor = keys['ShiftLeft'] || keys['ShiftRight'];

    if (wantAnchor && player.haulCooldown <= 0) {
      if (player.anchorState !== 'anchored') {
        this.deploy(player);
      }
    } else if (player.anchorState === 'anchored') {
      this.haul(player);
    }
  }

  deploy(player) {
    player.anchorState = 'anchored';
    player.anchorX = player.x;
    player.anchorY = player.y;
    player.anchorDuration = 0;
    player.stillTime = Math.max(player.stillTime || 0, 0.65);
    this.stormTick = 0;

    const def = player.getAnchorTypeDef();
    if (def.id === 'thunder') {
      player._anchorPulsePending = true;
    }
    if (def.id === 'magnet') {
      this.arrowTower = new AnchorArrowTower(player.anchorX, player.anchorY, player);
      this.towerProjectiles = [];
    }
  }

  haul(player) {
    if (player.anchorState !== 'anchored') return;

    const maxGhost = player.ghostAnchorMax || ANCHOR_CONFIG.ghostAnchorMax;
    player.ghostAnchors = player.ghostAnchors || [];
    player.ghostAnchors.push({
      x: player.anchorX,
      y: player.anchorY,
      life: ANCHOR_CONFIG.ghostLife + (player.ghostLifeBonus || 0),
    });
    while (player.ghostAnchors.length > maxGhost) {
      player.ghostAnchors.shift();
    }

    player.anchorState = 'hauling';
    player.haulTimer = ANCHOR_CONFIG.haulDuration;
    player.haulCooldown = ANCHOR_CONFIG.haulCooldown * (player.haulCooldownMult || 1);
    player.invincible = Math.max(
      player.invincible,
      ANCHOR_CONFIG.haulInvincible + (player.haulInvincibleBonus || 0)
    );
    this.stormBolts = [];
    this.arrowTower = null;
    this.towerProjectiles = [];
  }

  _getChainColors(def) {
    switch (def?.id) {
      case 'thunder':
        return { link: '#74b9ff', edge: '#0984e7', glow: 'rgba(116, 185, 255, 0.35)' };
      case 'magnet':
        return { link: '#6bcb77', edge: '#4a6741', glow: 'rgba(107, 203, 119, 0.32)' };
      case 'spirit':
        return { link: '#a29bfe', edge: '#6c5ce7', glow: 'rgba(162, 155, 254, 0.32)' };
      default:
        return { link: '#dfe6e9', edge: '#636e72', glow: 'rgba(253, 203, 110, 0.28)' };
    }
  }

  _chainSlowMult(player) {
    return Math.max(0.42, (ANCHOR_CONFIG.chainSlowMult || 0.65) - (player.anchorChainSlow || 0) * 0.035);
  }

  _updateAnchorChain(player, enemies, dt) {
    const ax = player.anchorX;
    const ay = player.anchorY;
    const px = player.x;
    const py = player.y;
    const chainLen = dist(ax, ay, px, py);
    if (chainLen < 10) return;

    const hitWidth = ANCHOR_CONFIG.chainHitWidth || 15;
    const slowMult = this._chainSlowMult(player);
    const slowTime = 0.35 + dt;

    for (const enemy of enemies) {
      const d = distPointToSegment(enemy.x, enemy.y, ax, ay, px, py);
      if (d > hitWidth + enemy.radius) continue;

      if (!enemy.slow || enemy.slow.mult > slowMult) {
        enemy.slow = { mult: slowMult, time: slowTime };
      } else {
        enemy.slow.time = Math.max(enemy.slow.time, slowTime);
      }
    }
  }

  _drawAnchorChain(ctx, player) {
    const x1 = player.anchorX;
    const y1 = player.anchorY;
    const x2 = player.x;
    const y2 = player.y;
    const len = dist(x1, y1, x2, y2);
    if (len < 12) return;

    const def = player.getAnchorTypeDef();
    const colors = this._getChainColors(def);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const spacing = ANCHOR_CONFIG.chainLinkSpacing || 14;
    const count = Math.max(1, Math.floor(len / spacing));
    const phase = (player.anchorDuration || 0) * 4;
    const pulse = 0.85 + Math.sin(phase * 0.6) * 0.08;

    ctx.save();

    ctx.strokeStyle = colors.glow;
    ctx.lineWidth = 10;
    ctx.globalAlpha = 0.22 + pulse * 0.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const lx = lerp(x1, x2, t);
      const ly = lerp(y1, y2, t);
      const wobble = Math.sin(phase + i * 0.9) * 1.2;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.fillStyle = colors.link;
      ctx.strokeStyle = colors.edge;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.7 + wobble * 0.06;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(-1.5, -0.8, 2, 1, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    for (const [cx, cy] of [[x1, y1], [x2, y2]]) {
      ctx.fillStyle = colors.edge;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = colors.link;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  _addStormBolt(x1, y1, x2, y2) {
    const segments = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      segments.push({
        x: x1 + (x2 - x1) * t + randomRange(-10, 10),
        y: y1 + (y2 - y1) * t + randomRange(-10, 10),
      });
    }
    segments[0] = { x: x1, y: y1 };
    segments[segments.length - 1] = { x: x2, y: y2 };
    this.stormBolts.push({
      segments,
      life: 0.16 + Math.random() * 0.14,
    });
  }

  _doDeployPulse(player, enemies, particles) {
    const def = player.getAnchorTypeDef();
    if (!def.deployPulseDamage) return;

    const radius = def.pulseRadius || ANCHOR_CONFIG.deployPulseRadius;
    const damage = Math.floor((def.deployPulseDamage + Math.floor(player.level * 1.5)) * (player.stormDamageMult || 1));

    for (const enemy of enemies) {
      if (dist(enemy.x, enemy.y, player.anchorX, player.anchorY) <= radius + enemy.radius) {
        enemy.takeDamage(damage, player.anchorX, player.anchorY);
        if (particles) particles.hit(enemy.x, enemy.y, '#ffeaa7');
        this._addStormBolt(player.anchorX, player.anchorY, enemy.x, enemy.y);
      }
    }

    if (particles) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        particles.hit(
          player.anchorX + Math.cos(a) * radius * 0.7,
          player.anchorY + Math.sin(a) * radius * 0.7,
          '#74b9ff'
        );
      }
    }
  }

  _updateThunderstorm(dt, player, enemies, particles) {
    const def = player.getAnchorTypeDef();
    if (def.id !== 'thunder' || player.anchorState !== 'anchored') return;

    this.stormPulse += dt;
    this.stormTick -= dt;

    const tick = (def.stormTick || 0.3) / (player.stormTickMult || 1);
    if (this.stormTick > 0) return;
    this.stormTick = tick;

    const radius = player.getAnchorRadius();
    const cx = player.anchorX;
    const cy = player.anchorY;
    const baseDps = (def.stormDps || 10) + Math.floor(player.level * 1.1);
    const dmgMult = player.getDamageMult?.() ?? player.damageMult ?? 1;
    const damage = Math.floor(baseDps * dmgMult * (player.stormDamageMult || 1));

    for (const enemy of enemies) {
      if (dist(enemy.x, enemy.y, cx, cy) > radius + enemy.radius) continue;
      enemy.takeDamage(damage, cx, cy);
      if (def.stormSlow && def.stormSlow < 1) {
        enemy.slow = {
          mult: def.stormSlow,
          time: Math.max(enemy.slow?.time || 0, tick + 0.15),
        };
      }
      if (particles) particles.hit(enemy.x, enemy.y, '#74b9ff');
      if (Math.random() < 0.28) {
        this._addStormBolt(cx, cy, enemy.x, enemy.y);
      }
    }

    for (let i = 0; i < 2; i++) {
      const a = Math.random() * TAU;
      const r = Math.random() * radius * 0.92;
      this._addStormBolt(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  }

  _tickStormBolts(dt) {
    for (let i = this.stormBolts.length - 1; i >= 0; i--) {
      this.stormBolts[i].life -= dt;
      if (this.stormBolts[i].life <= 0) this.stormBolts.splice(i, 1);
    }
  }

  _updateTowerProjectiles(dt, enemies, bounds, particles) {
    for (let i = this.towerProjectiles.length - 1; i >= 0; i--) {
      const p = this.towerProjectiles[i];
      p.update(dt);
      if (!p.alive
        || p.x < -40 || p.x > bounds.width + 40
        || p.y < -40 || p.y > bounds.height + 40) {
        this.towerProjectiles.splice(i, 1);
        continue;
      }

      for (const enemy of enemies) {
        if (p.hitIds.has(enemy.id)) continue;
        if (dist(p.x, p.y, enemy.x, enemy.y) >= p.radius + enemy.radius) continue;

        p.hitIds.add(enemy.id);
        enemy.takeDamage(p.damage, p.x, p.y);
        if (particles) particles.hit(enemy.x, enemy.y, p.color);
        p.pierce -= 1;
        if (p.pierce <= 0) {
          p.alive = false;
          break;
        }
      }
    }
  }

  _updateArrowTower(dt, player, enemies, particles) {
    if (!this.arrowTower || player.anchorState !== 'anchored') return;
    if (player.getAnchorTypeDef().id !== 'magnet') return;

    this.arrowTower.syncPosition?.(player.anchorX, player.anchorY);
    this.arrowTower.x = player.anchorX;
    this.arrowTower.y = player.anchorY;
    this.arrowTower.update(dt, player, enemies, this.towerProjectiles, particles);
  }

  update(dt, player, enemies, particles, bounds) {
    if (!player) return;

    this._tickStormBolts(dt);

    if (player.haulCooldown > 0) player.haulCooldown -= dt;

    if (player.anchorState === 'hauling') {
      player.haulTimer -= dt;
      if (player.haulTimer <= 0) player.anchorState = 'drift';
    }

    if (player.anchorState === 'anchored') {
      player.anchorDuration = (player.anchorDuration || 0) + dt;

      if (player._anchorPulsePending) {
        player._anchorPulsePending = false;
        this._doDeployPulse(player, enemies, particles);
      }

      this._updateThunderstorm(dt, player, enemies, particles);
      this._updateArrowTower(dt, player, enemies, particles);
      this._updateAnchorChain(player, enemies, dt);

      const pullStr = ANCHOR_CONFIG.pullStrength * (player.anchorPullMult || 1);
      const pullRange = player.getAnchorRadius() * 2.4;
      for (const enemy of enemies) {
        const d = dist(enemy.x, enemy.y, player.anchorX, player.anchorY);
        if (d > pullRange || d < 10) continue;
        const pull = (pullStr / Math.max(d, 36)) * dt;
        enemy.x += (player.anchorX - enemy.x) * pull;
        enemy.y += (player.anchorY - enemy.y) * pull;
      }
    }

    if (player.ghostAnchors?.length) {
      for (let i = player.ghostAnchors.length - 1; i >= 0; i--) {
        player.ghostAnchors[i].life -= dt;
        if (player.ghostAnchors[i].life <= 0) player.ghostAnchors.splice(i, 1);
      }
    }

    if (player.anchorChainSlow > 0 && player.ghostAnchors?.length >= 1) {
      for (const enemy of enemies) {
        for (const ghost of player.ghostAnchors) {
          if (dist(enemy.x, enemy.y, ghost.x, ghost.y) < 44) {
            if (typeof enemy.applySlow === 'function') {
              enemy.applySlow(player.anchorChainSlow + 1);
            } else {
              enemy.slowTimer = Math.max(enemy.slowTimer || 0, 0.35);
            }
          }
        }
      }
    }

    if (bounds) {
      this._updateTowerProjectiles(dt, enemies, bounds, particles);
    }
  }

  _drawSpiritAnchor(ctx, player, r, pulse) {
    const cx = player.anchorX;
    const cy = player.anchorY;
    const flicker = 0.8 + Math.sin((player.anchorDuration || 0) * 7) * 0.1;

    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r * pulse);
    grad.addColorStop(0, `rgba(162, 155, 254, ${0.16 * flicker})`);
    grad.addColorStop(0.6, `rgba(232, 67, 147, ${0.08 * flicker})`);
    grad.addColorStop(1, 'rgba(162, 155, 254, 0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#a29bfe';
    ctx.globalAlpha = 0.3 + flicker * 0.12;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dfe6e9';
    ctx.globalAlpha = 0.85;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻', cx, cy + 6);
    ctx.restore();
  }

  _drawMagnetAnchor(ctx, player, r, pulse) {
    const cx = player.anchorX;
    const cy = player.anchorY;

    ctx.save();
    ctx.strokeStyle = '#6bcb77';
    ctx.globalAlpha = 0.2 + pulse * 0.1;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * pulse);
    grad.addColorStop(0, 'rgba(107, 203, 119, 0.1)');
    grad.addColorStop(1, 'rgba(107, 203, 119, 0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (this.arrowTower) {
      this.arrowTower.draw(ctx);
    }

    for (const p of this.towerProjectiles) {
      p.draw(ctx);
    }
  }

  _drawThunderstorm(ctx, player, r, pulse) {
    const cx = player.anchorX;
    const cy = player.anchorY;
    const flicker = 0.75 + Math.sin(this.stormPulse * 14) * 0.12 + Math.sin(this.stormPulse * 23) * 0.08;

    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * pulse);
    grad.addColorStop(0, `rgba(116, 185, 255, ${0.14 * flicker})`);
    grad.addColorStop(0.55, `rgba(162, 155, 254, ${0.1 * flicker})`);
    grad.addColorStop(1, 'rgba(9, 132, 227, 0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#74b9ff';
    ctx.globalAlpha = 0.28 + flicker * 0.14;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (const bolt of this.stormBolts) {
      const alpha = Math.min(1, bolt.life * 5);
      ctx.save();
      ctx.strokeStyle = '#ffeaa7';
      ctx.shadowColor = '#74b9ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const segs = bolt.segments;
      ctx.moveTo(segs[0].x, segs[0].y);
      for (let i = 1; i < segs.length; i++) {
        ctx.lineTo(segs[i].x, segs[i].y);
      }
      ctx.stroke();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = alpha * 0.55;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = '#dfe6e9';
    ctx.globalAlpha = 0.8;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', cx, cy + 6);
    ctx.restore();
  }

  draw(ctx, player) {
    if (!player) return;

    const ghosts = player.ghostAnchors || [];
    for (let i = 0; i < ghosts.length; i++) {
      const g = ghosts[i];
      const alpha = Math.min(0.55, g.life / ANCHOR_CONFIG.ghostLife);

      ctx.save();
      ctx.strokeStyle = '#636e72';
      ctx.globalAlpha = alpha * 0.45;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(g.x, g.y, 18, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#b2bec3';
      ctx.globalAlpha = alpha * 0.35;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚓', g.x, g.y + 5);
      ctx.restore();

      if (i > 0) {
        const prev = ghosts[i - 1];
        ctx.save();
        ctx.strokeStyle = '#74b9ff';
        ctx.globalAlpha = alpha * 0.28;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(g.x, g.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    if (player.anchorState === 'anchored') {
      const r = player.getAnchorRadius();
      const pulse = 0.85 + Math.sin((player.anchorDuration || 0) * 5) * 0.08;
      const def = player.getAnchorTypeDef();

      if (def.id === 'thunder') {
        this._drawThunderstorm(ctx, player, r, pulse);
      } else if (def.id === 'magnet') {
        this._drawMagnetAnchor(ctx, player, r, pulse);
      } else if (def.id === 'spirit') {
        this._drawSpiritAnchor(ctx, player, r, pulse);
      } else {
        ctx.save();
        ctx.strokeStyle = '#fdcb6e';
        ctx.globalAlpha = 0.22 + pulse * 0.12;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.anchorX, player.anchorY, r * pulse, 0, TAU);
        ctx.stroke();

        ctx.fillStyle = '#dfe6e9';
        ctx.globalAlpha = 0.75;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(def.icon, player.anchorX, player.anchorY + 6);
        ctx.restore();
      }

      this._drawAnchorChain(ctx, player);

      ctx.save();
      ctx.strokeStyle = '#55efc4';
      ctx.globalAlpha = 0.16 + pulse * 0.08;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 6, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (player.isDrifting?.()) {
      const pulse = 0.5 + Math.sin(Date.now() * 0.006) * 0.12;
      ctx.save();
      ctx.strokeStyle = '#74b9ff';
      ctx.globalAlpha = 0.14 + pulse * 0.08;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 10, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (player.anchorState === 'hauling') {
      ctx.save();
      ctx.strokeStyle = '#55efc4';
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 8, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
}
