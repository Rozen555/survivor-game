class Projectile {
  constructor(x, y, angle, speed, damage, config) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.radius = config.radius || 6;
    this.color = config.color;
    this.pierce = config.pierce || 0;
    this.homing = config.homing || false;
    this.aoe = config.aoe || 0;
    this.lifetime = config.lifetime || 3;
    this.sprite = config.sprite || null;
    this.boomerang = config.boomerang || false;
    this.maxRange = config.maxRange || 0;
    this.traveled = 0;
    this.returning = false;
    this.ownerRef = null;
    this.hitIds = new Set();
    this.alive = true;
    this.trail = [];
    this.shape = config.shape || null;
    this.trailRate = 0;
  }

  update(dt, enemies, player) {
    this.trailRate += dt;
    if (this.trailRate >= 0.025) {
      this.trailRate = 0;
      this.trail.push({ x: this.x, y: this.y, a: 1 });
      if (this.trail.length > 7) this.trail.shift();
    }
    for (const t of this.trail) t.a *= 0.88;

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.alive = false;
      return;
    }

    if (this.boomerang && player) {
      const spd = Math.hypot(this.vx, this.vy);
      if (!this.returning) {
        this.traveled += spd * dt;
        if (this.traveled >= this.maxRange) this.returning = true;
      } else {
        const angle = angleBetween(this.x, this.y, player.x, player.y);
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;
        if (dist(this.x, this.y, player.x, player.y) < player.radius + this.radius) {
          this.alive = false;
          return;
        }
      }
    } else if (this.homing && enemies.length > 0) {
      let nearest = null;
      let nearestDist = Infinity;
      for (const e of enemies) {
        const d = dist(this.x, this.y, e.x, e.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        const targetAngle = angleBetween(this.x, this.y, nearest.x, nearest.y);
        const speed = Math.hypot(this.vx, this.vy);
        const currentAngle = Math.atan2(this.vy, this.vx);
        let diff = targetAngle - currentAngle;
        while (diff > Math.PI) diff -= TAU;
        while (diff < -Math.PI) diff += TAU;
        const newAngle = currentAngle + diff * Math.min(1, dt * 5);
        this.vx = Math.cos(newAngle) * speed;
        this.vy = Math.sin(newAngle) * speed;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    const angle = Math.atan2(this.vy, this.vx);
    const lifeA = Math.min(1, this.lifetime);

    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      ctx.save();
      ctx.globalAlpha = (i / Math.max(1, this.trail.length)) * 0.35 * t.a * lifeA;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * (0.35 + i * 0.08), 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.3 * lifeA;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.aoe > 0 ? 18 : 12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + (this.aoe > 0 ? 5 : 3), 0, TAU);
    ctx.fill();
    ctx.restore();

    if (this.sprite) {
      Sprites.draw(ctx, this.sprite, this.x, this.y, {
        rotation: angle + Math.PI / 2,
        scale: 0.9 + (this.aoe > 0 ? 0.2 : 0),
        alpha: lifeA,
      });
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    if (this.shape === 'cross') {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(-this.radius * 0.35, -this.radius * 1.6, this.radius * 0.7, this.radius * 3.2);
      ctx.fillRect(-this.radius * 1.6, -this.radius * 0.35, this.radius * 3.2, this.radius * 0.7);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.55 * lifeA;
      ctx.fillRect(-this.radius * 0.15, -this.radius * 1.1, this.radius * 0.3, this.radius * 2.2);
      ctx.fillRect(-this.radius * 1.1, -this.radius * 0.15, this.radius * 2.2, this.radius * 0.3);
    } else if (this.homing) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.radius * 1.4, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.8);
      ctx.lineTo(-this.radius * 0.5, 0);
      ctx.lineTo(-this.radius, this.radius * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(this.radius * 0.3, 0, this.radius * 0.35, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.15, -this.radius * 0.15, this.radius * 0.35, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }
}

class WeaponInstance {
  constructor(weaponId, level = 1) {
    this.id = weaponId;
    this.level = level;
    this.cooldown = 0;
    this.orbitAngle = Math.random() * TAU;
    this.def = WEAPONS[weaponId];
  }

  getDamage(player) {
    const base = this.def.damage * (1 + (this.level - 1) * 0.2);
    const crit = Math.random() < player.critChance ? 2 : 1;
    return Math.floor(base * player.damageMult * crit);
  }

  getCooldown(player) {
    const mult = player.attackSpeedMult || 1;
    return this.def.cooldown * Math.max(0.25, 1 - (this.level - 1) * 0.08) / mult;
  }

  areaMult(player) {
    return player.areaMult || 1;
  }
}

class WeaponSystem {
  constructor() {
    this.projectiles = [];
    this.meleeEffects = [];
    this.lightningEffects = [];
    this.novaEffects = [];
    this.rainMarkers = [];
  }

  maybeExtraCast(player, fn, weapon, ...args) {
    const ok = fn.call(this, weapon, player, ...args);
    if (ok && player.extraCast > 0 && Math.random() < player.extraCast) {
      fn.call(this, weapon, player, ...args);
      Audio.play('select');
    }
    return ok;
  }

  addWeapon(player, weaponId) {
    const existing = player.weapons.find(w => w.id === weaponId);
    if (existing) {
      existing.level = Math.min(existing.level + 1, 8);
    } else {
      player.weapons.push(new WeaponInstance(weaponId));
    }
  }

  update(dt, player, enemies, bounds, particles) {
    for (const weapon of player.weapons) {
      weapon.cooldown -= dt;

      if (weapon.def.type === 'orbit') {
        this.updateOrbit(dt, weapon, player, enemies, particles);
        continue;
      }

      if (weapon.def.type === 'satellite') {
        this.updateSatellite(dt, weapon, player, enemies, bounds, particles);
        continue;
      }

      if (weapon.cooldown > 0) continue;

      let fired = false;
      switch (weapon.def.type) {
        case 'melee':
          fired = this.maybeExtraCast(player, this.fireMelee, weapon, enemies, particles);
          if (fired) weapon.cooldown = weapon.getCooldown(player);
          break;
        case 'projectile':
          if (this.maybeExtraCast(player, this.fireProjectile, weapon, enemies)) {
            weapon.cooldown = weapon.getCooldown(player);
          }
          break;
        case 'instant':
          if (this.maybeExtraCast(player, this.fireLightning, weapon, enemies, particles)) {
            weapon.cooldown = weapon.getCooldown(player);
          }
          break;
        case 'boomerang':
          if (this.maybeExtraCast(player, this.fireBoomerang, weapon, enemies)) {
            weapon.cooldown = weapon.getCooldown(player);
          }
          break;
        case 'nova':
          if (this.maybeExtraCast(player, this.fireNova, weapon, enemies, particles)) {
            weapon.cooldown = weapon.getCooldown(player);
          }
          break;
        case 'rain':
          if (this.maybeExtraCast(player, this.fireRain, weapon, enemies, bounds)) {
            weapon.cooldown = weapon.getCooldown(player);
          }
          break;
        case 'cross':
          if (this.maybeExtraCast(player, this.fireCross, weapon, enemies)) {
            weapon.cooldown = weapon.getCooldown(player);
          }
          break;
      }
    }

    for (let i = this.rainMarkers.length - 1; i >= 0; i--) {
      const m = this.rainMarkers[i];
      m.timer -= dt;
      if (m.timer > 0) continue;
      if (!m.hit) {
        m.hit = true;
        for (const enemy of enemies) {
          if (dist(m.x, m.y, enemy.x, enemy.y) < m.radius + enemy.radius) {
            enemy.takeDamage(m.damage, m.x, m.y);
            particles.hit(enemy.x, enemy.y, m.color);
          }
        }
        particles.hit(m.x, m.y, m.color);
      }
      m.life = (m.life || 0.2) - dt;
      if (m.life <= 0) this.rainMarkers.splice(i, 1);
    }

    for (let i = this.novaEffects.length - 1; i >= 0; i--) {
      this.novaEffects[i].life -= dt;
      if (this.novaEffects[i].life <= 0) this.novaEffects.splice(i, 1);
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, enemies, player);

      if (!p.alive || p.x < -50 || p.x > bounds.width + 50 || p.y < -50 || p.y > bounds.height + 50) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (const enemy of enemies) {
        if (p.hitIds.has(enemy.id)) continue;
        if (dist(p.x, p.y, enemy.x, enemy.y) < p.radius + enemy.radius) {
          p.hitIds.add(enemy.id);
          const killed = enemy.takeDamage(p.damage, p.x, p.y);
          particles.hit(enemy.x, enemy.y, p.color);

          if (p.aoe > 0) {
            for (const other of enemies) {
              if (other.id !== enemy.id && dist(p.x, p.y, other.x, other.y) < p.aoe) {
                other.takeDamage(Math.floor(p.damage * 0.5), p.x, p.y);
                particles.hit(other.x, other.y, p.color);
              }
            }
          }

          if (p.pierce <= 0) {
            p.alive = false;
            break;
          }
          p.pierce--;
        }
      }
    }

    // Update melee effects
    for (let i = this.meleeEffects.length - 1; i >= 0; i--) {
      this.meleeEffects[i].life -= dt;
      if (this.meleeEffects[i].life <= 0) {
        this.meleeEffects.splice(i, 1);
      }
    }

    for (let i = this.lightningEffects.length - 1; i >= 0; i--) {
      this.lightningEffects[i].life -= dt;
      if (this.lightningEffects[i].life <= 0) {
        this.lightningEffects.splice(i, 1);
      }
    }
  }

  fireMelee(weapon, player, enemies, particles) {
    const area = weapon.areaMult(player);
    const range = weapon.def.range * area * (1 + (weapon.level - 1) * 0.1);
    const arc = weapon.def.arc;

    let aimAngle = player.facing;
    const nearest = this.findNearest(player, enemies, range * 2);
    if (nearest) {
      aimAngle = angleBetween(player.x, player.y, nearest.x, nearest.y);
    }

    for (const enemy of enemies) {
      const d = dist(player.x, player.y, enemy.x, enemy.y);
      if (d > range + enemy.radius) continue;

      const angle = angleBetween(player.x, player.y, enemy.x, enemy.y);
      let diff = angle - aimAngle;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;

      if (Math.abs(diff) < arc / 2) {
        const damage = weapon.getDamage(player);
        enemy.takeDamage(damage, player.x, player.y);
        particles.hit(enemy.x, enemy.y, weapon.def.color);
      }
    }

    this.meleeEffects.push({
      x: player.x,
      y: player.y,
      angle: aimAngle,
      range,
      arc,
      color: weapon.def.color,
      life: 0.22,
      maxLife: 0.22,
      weaponId: weapon.id,
    });
    return true;
  }

  fireProjectile(weapon, player, enemies) {
    if (enemies.length === 0) return false;

    const count = (weapon.def.count || 1) + Math.floor((weapon.level - 1) / 2) + (player.bonusProjectiles || 0);
    const nearest = this.findNearest(player, enemies, 400);
    if (!nearest) return false;

    const baseAngle = angleBetween(player.x, player.y, nearest.x, nearest.y);

    for (let i = 0; i < count; i++) {
      const spread = count > 1 ? (i - (count - 1) / 2) * 0.2 : 0;
      this.projectiles.push(new Projectile(
        player.x, player.y,
        baseAngle + spread,
        weapon.def.speed,
        weapon.getDamage(player),
        {
          color: weapon.def.color,
          homing: weapon.def.homing,
          pierce: weapon.def.pierce || 0,
          aoe: weapon.def.aoe || 0,
          sprite: weapon.def.sprite,
          radius: weapon.def.aoe > 0 ? 8 : 6,
        }
      ));
    }
    return true;
  }

  fireLightning(weapon, player, enemies, particles) {
    const area = weapon.areaMult(player);
    const range = weapon.def.range * area * (1 + (weapon.level - 1) * 0.1);
    const chains = weapon.def.chains + Math.floor((weapon.level - 1) / 2);
    const start = this.findNearest(player, enemies, range);
    if (!start) return false;

    const hitEnemies = [];
    let current = start;
    const chainPoints = [{ x: player.x, y: player.y }];

    for (let i = 0; i < chains && current; i++) {
      hitEnemies.push(current);
      chainPoints.push({ x: current.x, y: current.y });
      current.takeDamage(weapon.getDamage(player), chainPoints[chainPoints.length - 2].x, chainPoints[chainPoints.length - 2].y);
      particles.hit(current.x, current.y, weapon.def.color);

      const remaining = enemies.filter(e => !hitEnemies.includes(e));
      current = this.findNearest(current, remaining, range * 0.8);
    }

    this.lightningEffects.push({
      points: chainPoints,
      color: weapon.def.color,
      life: 0.28,
      maxLife: 0.28,
    });
    return true;
  }

  updateOrbit(dt, weapon, player, enemies, particles) {
    const count = weapon.def.count + Math.floor((weapon.level - 1) / 2);
    const radius = weapon.def.radius;
    const speed = weapon.def.orbitSpeed;
    const ballR = weapon.def.ballRadius;

    weapon.orbitAngle += speed * dt;

    for (let i = 0; i < count; i++) {
      const angle = weapon.orbitAngle + (i / count) * TAU;
      const bx = player.x + Math.cos(angle) * radius;
      const by = player.y + Math.sin(angle) * radius;

      for (const enemy of enemies) {
        if (dist(bx, by, enemy.x, enemy.y) < ballR + enemy.radius) {
          if (!enemy._orbitHit || enemy._orbitHit <= 0) {
            enemy.takeDamage(weapon.getDamage(player), bx, by);
            particles.hit(enemy.x, enemy.y, weapon.def.color);
            enemy._orbitHit = 0.3;
          }
        }
      }
    }

    for (const enemy of enemies) {
      if (enemy._orbitHit > 0) enemy._orbitHit -= dt;
    }
  }

  updateSatellite(dt, weapon, player, enemies, bounds, particles) {
    if (!weapon.satAngle) weapon.satAngle = Math.random() * TAU;
    const area = weapon.areaMult(player);
    const radius = weapon.def.orbitRadius * area;
    weapon.satAngle += weapon.def.orbitSpeed * dt;

    const sx = player.x + Math.cos(weapon.satAngle) * radius;
    const sy = player.y + Math.sin(weapon.satAngle) * radius;

    if (weapon.cooldown <= 0 && enemies.length > 0) {
      const nearest = this.findNearest({ x: sx, y: sy }, enemies, 350);
      if (nearest) {
        const angle = angleBetween(sx, sy, nearest.x, nearest.y);
        this.projectiles.push(new Projectile(
          sx, sy, angle, 450, weapon.getDamage(player),
          { color: weapon.def.color, homing: true, sprite: weapon.def.sprite, lifetime: 2 }
        ));
        weapon.cooldown = weapon.getCooldown(player);
      }
    }

    weapon._sx = sx;
    weapon._sy = sy;
  }

  fireBoomerang(weapon, player, enemies) {
    if (enemies.length === 0) return false;
    const nearest = this.findNearest(player, enemies, 400);
    if (!nearest) return false;
    const angle = angleBetween(player.x, player.y, nearest.x, nearest.y);
    const area = weapon.areaMult(player);
    const p = new Projectile(
      player.x, player.y, angle, weapon.def.speed, weapon.getDamage(player),
      {
        color: weapon.def.color,
        pierce: weapon.def.pierce || 5,
        sprite: weapon.def.sprite,
        boomerang: true,
        maxRange: weapon.def.maxRange * area,
        lifetime: 4,
      }
    );
    this.projectiles.push(p);
    return true;
  }

  fireNova(weapon, player, enemies, particles) {
    const area = weapon.areaMult(player);
    const radius = weapon.def.radius * area * (1 + (weapon.level - 1) * 0.08);
    const damage = weapon.getDamage(player);
    for (const enemy of enemies) {
      if (dist(player.x, player.y, enemy.x, enemy.y) < radius + enemy.radius) {
        enemy.takeDamage(damage, player.x, player.y);
        particles.hit(enemy.x, enemy.y, weapon.def.color);
      }
    }
    this.novaEffects.push({
      x: player.x, y: player.y, radius, color: weapon.def.color, life: 0.35, maxLife: 0.35,
    });
    Audio.play('nova');
    return true;
  }

  fireRain(weapon, player, enemies, bounds) {
    if (enemies.length === 0) return false;
    const count = (weapon.def.count || 3) + Math.floor((weapon.level - 1) / 3);
    const area = weapon.areaMult(player);
    const strikeR = weapon.def.strikeRadius * area;
    const damage = weapon.getDamage(player);

    for (let i = 0; i < count; i++) {
      const target = randomPick(enemies);
      const delay = 0.15 + i * 0.08;
      this.rainMarkers.push({
        x: target.x + randomRange(-20, 20),
        y: target.y + randomRange(-20, 20),
        timer: delay,
        maxTimer: delay,
        radius: strikeR,
        damage,
        color: weapon.def.color,
        life: 0.3,
        hit: false,
      });
    }
    return true;
  }

  fireCross(weapon, player, enemies) {
    if (enemies.length === 0) return false;
    const damage = weapon.getDamage(player);
    for (let i = 0; i < 4; i++) {
      const angle = player.facing + (i / 4) * TAU;
      this.projectiles.push(new Projectile(
        player.x, player.y, angle, weapon.def.speed, damage,
        {
          color: weapon.def.color,
          pierce: 3,
          lifetime: 1.5,
          radius: 7,
          sprite: 'weapon_cross',
        }
      ));
    }
    return true;
  }

  findNearest(from, enemies, maxRange) {
    let nearest = null;
    let nearestDist = maxRange;
    for (const e of enemies) {
      const d = dist(from.x, from.y, e.x, e.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  draw(ctx, player) {
    for (const weapon of player.weapons) {
      if (weapon.def.type === 'satellite' && weapon._sx != null) {
        ctx.save();
        ctx.strokeStyle = weapon.def.color;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(weapon._sx, weapon._sy);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = weapon.def.color;
        ctx.shadowColor = weapon.def.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(weapon._sx, weapon._sy, 10, 0, TAU);
        ctx.fill();
        ctx.restore();

        Sprites.draw(ctx, weapon.def.sprite || 'weapon_drone', weapon._sx, weapon._sy, {
          scale: 0.8,
          rotation: weapon.satAngle,
        });
        continue;
      }

      if (weapon.def.type !== 'orbit') continue;

      const count = weapon.def.count + Math.floor((weapon.level - 1) / 2);
      const radius = weapon.def.radius;
      const ballR = weapon.def.ballRadius;

      ctx.save();
      ctx.strokeStyle = weapon.def.color;
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.x, player.y, radius, 0, TAU);
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < count; i++) {
        const angle = weapon.orbitAngle + (i / count) * TAU;
        const bx = player.x + Math.cos(angle) * radius;
        const by = player.y + Math.sin(angle) * radius;

        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = weapon.def.color;
        ctx.shadowColor = weapon.def.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(bx, by, ballR + 3, 0, TAU);
        ctx.fill();
        ctx.restore();

        Sprites.draw(ctx, weapon.def.sprite || 'weapon_orbit', bx, by, {
          scale: 0.95,
          rotation: angle,
        });
      }
    }

    for (const effect of this.meleeEffects) {
      const t = effect.life / effect.maxLife;
      const alpha = Math.min(1, t * 1.5);
      const col = effect.color || '#ffd93d';
      const rgb = WeaponSystem._hexToRgb(col);

      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);

      const start = -effect.arc / 2;
      const end = effect.arc / 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, effect.range, start, end);
      ctx.closePath();
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 * alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, effect.range, start, end);
      ctx.closePath();
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.38 * alpha})`;
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * alpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      for (let s = 0; s < 3; s++) {
        const slashA = start + (end - start) * ((s + 1) / 4);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(slashA) * effect.range * 0.92, Math.sin(slashA) * effect.range * 0.92);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, effect.range * 0.85, start + 0.08, end - 0.08);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      let whipX, whipY, whipRot;
      if (effect.weaponId === 'whip') {
        const bladeAngle = end - 0.12;
        const lx = Math.cos(bladeAngle) * effect.range * 0.75;
        const ly = Math.sin(bladeAngle) * effect.range * 0.75;
        whipX = effect.x + Math.cos(effect.angle) * lx - Math.sin(effect.angle) * ly;
        whipY = effect.y + Math.sin(effect.angle) * lx + Math.cos(effect.angle) * ly;
        whipRot = effect.angle + bladeAngle;
      }

      ctx.restore();

      if (effect.weaponId === 'whip') {
        Sprites.draw(ctx, 'weapon_whip', whipX, whipY, {
          rotation: whipRot,
          scale: 1.15,
          alpha,
        });
      }
    }

    for (const effect of this.novaEffects) {
      const t = effect.life / (effect.maxLife || 0.35);
      const expand = 1.05 - t * 0.25;
      const rgb = WeaponSystem._hexToRgb(effect.color);

      for (let ring = 0; ring < 3; ring++) {
        const rt = t + ring * 0.08;
        const r = effect.radius * expand * (1 + ring * 0.06);
        ctx.save();
        ctx.strokeStyle = effect.color;
        ctx.globalAlpha = Math.max(0, (1 - rt) * (0.55 - ring * 0.12));
        ctx.lineWidth = 4 - ring;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, r, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.08 * (1 - rt)})`;
        ctx.fill();
        ctx.restore();
      }
    }

    for (const m of this.rainMarkers) {
      const maxT = m.maxTimer || 0.15;
      ctx.save();

      if (m.timer > 0) {
        const progress = 1 - m.timer / maxT;
        const topY = m.y - 90 + progress * 75;
        ctx.strokeStyle = m.color;
        ctx.globalAlpha = 0.35 + progress * 0.35;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, topY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - 4, m.y - 8);
        ctx.lineTo(m.x + 4, m.y - 8);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = m.color;
        ctx.globalAlpha = 0.25;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, TAU);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = m.color + '66';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * 0.45, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const effect of this.lightningEffects) {
      const t = effect.life / (effect.maxLife || 0.28);
      const alpha = Math.min(1, t * 1.8);

      ctx.save();
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 8;
      ctx.globalAlpha = alpha * 0.25;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(effect.points[0].x, effect.points[0].y);
      for (let i = 1; i < effect.points.length; i++) {
        const p = effect.points[i];
        const prev = effect.points[i - 1];
        const mx = (prev.x + p.x) / 2 + (Math.random() - 0.5) * 24;
        const my = (prev.y + p.y) / 2 + (Math.random() - 0.5) * 24;
        ctx.lineTo(mx, my);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha * 0.85;
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.7;
      ctx.shadowBlur = 0;
      ctx.stroke();

      for (let i = 1; i < effect.points.length; i++) {
        const p = effect.points[i];
        ctx.fillStyle = effect.color;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const p of this.projectiles) {
      p.draw(ctx);
    }
  }

  static _hexToRgb(hex) {
    if (!hex || hex[0] !== '#') return { r: 255, g: 217, b: 61 };
    const n = parseInt(hex.slice(1), 16);
    if (hex.length >= 7) {
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    return { r: 255, g: 217, b: 61 };
  }
}
