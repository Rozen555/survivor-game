let nextSummonEntityId = 1;

class SummonProjectile {
  constructor(x, y, angle, speed, damage, color, radius = 5, aoe = 0) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.color = color;
    this.radius = radius;
    this.lifetime = 2.5;
    this.alive = true;
    this.hitIds = new Set();
    this.aoe = aoe;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.aoe > 0 ? 16 : 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + (this.aoe > 0 ? 2 : 1), 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(this.x - 1, this.y - 1, this.radius * 0.4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

class SummonEntity {
  constructor(typeId, level, slotIndex, total, player) {
    const def = SUMMON_TYPES[typeId];
    this.entityId = nextSummonEntityId++;
    this.typeId = typeId;
    this.level = level;
    this.def = def;
    this.slotIndex = slotIndex;
    this.orbitAngle = (slotIndex / Math.max(1, total)) * TAU;
    this.orbitDist = typeId === 'dragon' ? 62 + slotIndex * 10 : 52 + slotIndex * 14;
    this.leash = def.leash || 220;

    const statScale = def.isUltimate ? 1.25 : 1;
    const scale = (1 + (level - 1) * 0.22) * statScale;
    this.maxHp = Math.floor(def.hp * scale);
    this.hp = this.maxHp;
    this.damage = Math.floor(def.damage * (1 + (level - 1) * 0.18) * (player.damageMult || 1) * (player.summonDamageMult || 1));
    this.radius = def.radius;
    this.speed = (def.speed || 0) * (1 + (level - 1) * 0.06);
    this.x = player.x;
    this.y = player.y;
    this.homeX = player.x;
    this.homeY = player.y;
    this.cooldown = Math.random() * 0.4;
    this.chargeTimer = Math.random() * 1.5;
    this.charging = false;
    this.chargeDir = { x: 0, y: 0 };
    this.chargeTime = 0;
    this.wobble = Math.random() * TAU;
    this.flash = 0;
    this.facing = 0;
    this.breathTimer = typeId === 'dragon' ? 0.4 : 0;
    this.stompTimer = typeId === 'dragon' ? 0.8 : 0;
  }

  getHomePosition(player) {
    const angle = this.orbitAngle + player.facing * 0.15;
    return {
      x: player.x + Math.cos(angle) * this.orbitDist,
      y: player.y + Math.sin(angle) * this.orbitDist,
    };
  }

  findNearest(enemies, from, maxRange) {
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

  moveToward(tx, ty, speed, dt) {
    const d = dist(this.x, this.y, tx, ty);
    if (d < 4) return;
    this.facing = Math.atan2(ty - this.y, tx - this.x);
    const step = speed * dt;
    const t = Math.min(1, step / d);
    this.x += (tx - this.x) * t;
    this.y += (ty - this.y) * t;
  }

  updateTurret(dt, player, enemies, bounds, system, particles) {
    const home = this.getHomePosition(player);
    this.homeX = home.x;
    this.homeY = home.y;
    this.x = home.x;
    this.y = home.y;

    this.cooldown -= dt;
    if (this.cooldown > 0 || enemies.length === 0) return;

    const target = this.findNearest(enemies, this, this.def.range);
    if (!target) return;

    const angle = angleBetween(this.x, this.y, target.x, target.y);
    this.facing = angle;
    system.projectiles.push(new SummonProjectile(
      this.x, this.y, angle,
      420 + this.level * 15,
      this.damage,
      this.def.projColor || this.def.color,
      5 + Math.floor(this.level / 3)
    ));
    this.cooldown = this.def.shootCd * Math.max(0.45, 1 - (this.level - 1) * 0.06);
  }

  updateMelee(dt, player, enemies, bounds, system, particles) {
    const home = this.getHomePosition(player);
    this.homeX = home.x;
    this.homeY = home.y;

    const target = this.findNearest(enemies, player, this.leash + 80);
    const distHome = dist(this.x, this.y, home.x, home.y);
    const distPlayer = dist(this.x, this.y, player.x, player.y);

    if (target && distPlayer < this.leash) {
      this.moveToward(target.x, target.y, this.speed, dt);
    } else if (distHome > 8) {
      this.moveToward(home.x, home.y, this.speed * 1.2, dt);
    }

    this.x = clamp(this.x, this.radius, bounds.width - this.radius);
    this.y = clamp(this.y, this.radius, bounds.height - this.radius);

    this.cooldown -= dt;
    if (this.cooldown > 0) return;

    for (const enemy of enemies) {
      if (dist(this.x, this.y, enemy.x, enemy.y) < this.def.attackRange + enemy.radius) {
        enemy.takeDamage(this.damage, this.x, this.y);
        particles.hit(enemy.x, enemy.y, this.def.color);
        this.flash = 0.12;
        this.cooldown = this.def.attackCd * Math.max(0.5, 1 - (this.level - 1) * 0.05);
        break;
      }
    }
  }

  updateCharger(dt, player, enemies, bounds, system, particles) {
    const home = this.getHomePosition(player);
    this.homeX = home.x;
    this.homeY = home.y;

    if (this.charging) {
      this.chargeTime -= dt;
      this.x += this.chargeDir.x * this.def.chargeSpeed * dt;
      this.y += this.chargeDir.y * this.def.chargeSpeed * dt;
      this.x = clamp(this.x, this.radius, bounds.width - this.radius);
      this.y = clamp(this.y, this.radius, bounds.height - this.radius);

      for (const enemy of enemies) {
        if (dist(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
          enemy.takeDamage(this.damage, this.x, this.y);
          particles.hit(enemy.x, enemy.y, this.def.color);
        }
      }

      if (this.chargeTime <= 0) this.charging = false;
      return;
    }

    const target = this.findNearest(enemies, player, this.leash + 60);
    if (target && dist(this.x, this.y, player.x, player.y) < this.leash) {
      this.chargeTimer -= dt;
      if (this.chargeTimer <= 0) {
        this.charging = true;
        this.chargeTime = 0.35;
        this.chargeTimer = this.def.chargeCd;
        const angle = angleBetween(this.x, this.y, target.x, target.y);
        this.facing = angle;
        this.chargeDir.x = Math.cos(angle);
        this.chargeDir.y = Math.sin(angle);
        return;
      }
      this.moveToward(target.x, target.y, this.speed, dt);
    } else {
      this.moveToward(home.x, home.y, this.speed * 1.1, dt);
    }

    this.x = clamp(this.x, this.radius, bounds.width - this.radius);
    this.y = clamp(this.y, this.radius, bounds.height - this.radius);
  }

  updateStomp(dt, player, enemies, bounds, system, particles) {
    const home = this.getHomePosition(player);
    this.homeX = home.x;
    this.homeY = home.y;

    const target = this.findNearest(enemies, player, this.leash + 80);
    const distHome = dist(this.x, this.y, home.x, home.y);
    const distPlayer = dist(this.x, this.y, player.x, player.y);

    if (target && distPlayer < this.leash) {
      this.moveToward(target.x, target.y, this.speed, dt);
    } else if (distHome > 8) {
      this.moveToward(home.x, home.y, this.speed * 1.1, dt);
    }

    this.x = clamp(this.x, this.radius, bounds.width - this.radius);
    this.y = clamp(this.y, this.radius, bounds.height - this.radius);

    this.cooldown -= dt;
    if (this.cooldown > 0) return;

    const aoe = this.def.aoeRadius * (1 + (this.level - 1) * 0.05);
    let hit = false;
    for (const enemy of enemies) {
      if (dist(this.x, this.y, enemy.x, enemy.y) < aoe + enemy.radius) {
        enemy.takeDamage(Math.floor(this.damage * 0.85), this.x, this.y);
        particles.hit(enemy.x, enemy.y, this.def.color);
        hit = true;
      }
    }
    if (hit) {
      this.flash = 0.2;
      system.stompEffects.push({
        x: this.x, y: this.y, radius: aoe,
        color: this.def.color, life: 0.3, maxLife: 0.3,
      });
      this.cooldown = this.def.attackCd * Math.max(0.55, 1 - (this.level - 1) * 0.04);
    }
  }

  updateRanged(dt, player, enemies, bounds, system, particles) {
    const home = this.getHomePosition(player);
    this.homeX = home.x;
    this.homeY = home.y;

    const orbitT = Date.now() * 0.001 + this.slotIndex;
    this.x = home.x + Math.cos(orbitT * 2) * 12;
    this.y = home.y + Math.sin(orbitT * 2) * 8;

    this.cooldown -= dt;
    if (this.cooldown > 0 || enemies.length === 0) return;

    const target = this.findNearest(enemies, this, this.def.shootRange);
    if (!target) return;

    const angle = angleBetween(this.x, this.y, target.x, target.y);
    this.facing = angle;
    system.projectiles.push(new SummonProjectile(
      this.x, this.y, angle,
      this.def.projSpeed,
      this.damage,
      this.def.projColor || this.def.color,
      4
    ));
    this.cooldown = this.def.shootCd * Math.max(0.5, 1 - (this.level - 1) * 0.05);
  }

  updateDragon(dt, player, enemies, bounds, system, particles) {
    const home = this.getHomePosition(player);
    const hover = Math.sin(this.wobble * 1.3) * 11;
    this.homeX = home.x;
    this.homeY = home.y - 6;

    const target = this.findNearest(enemies, player, this.leash + 120);
    const distPlayer = dist(this.x, this.y, player.x, player.y);

    if (target && distPlayer < this.leash) {
      this.moveToward(target.x, target.y - 4, this.speed, dt);
    } else {
      this.moveToward(home.x, home.y + hover, this.speed * 0.75, dt);
    }

    this.x = clamp(this.x, this.radius, bounds.width - this.radius);
    this.y = clamp(this.y, this.radius, bounds.height - this.radius);

    if (target) {
      this.facing = angleBetween(this.x, this.y, target.x, target.y);
    }

    this.breathTimer -= dt;
    if (this.breathTimer <= 0 && target) {
      const range = this.def.breathRange;
      const halfArc = this.def.breathArc;
      const breathDmg = Math.floor(this.damage * 0.95);
      for (const enemy of enemies) {
        const d = dist(this.x, this.y, enemy.x, enemy.y);
        if (d > range + enemy.radius) continue;
        const ang = angleBetween(this.x, this.y, enemy.x, enemy.y);
        let diff = ang - this.facing;
        while (diff > Math.PI) diff -= TAU;
        while (diff < -Math.PI) diff += TAU;
        if (Math.abs(diff) < halfArc) {
          enemy.takeDamage(breathDmg, this.x, this.y);
          particles.hit(enemy.x, enemy.y, this.def.fireColor || '#ff7675');
        }
      }
      system.breathEffects.push({
        x: this.x,
        y: this.y,
        angle: this.facing,
        range,
        arc: halfArc * 2,
        color: this.def.fireColor || '#ff7675',
        core: this.def.coreColor || '#fdcb6e',
        life: 0.28,
        maxLife: 0.28,
      });
      this.breathTimer = this.def.breathCd * Math.max(0.55, 1 - (this.level - 1) * 0.04);
      this.flash = 0.18;
    }

    this.stompTimer -= dt;
    if (this.stompTimer <= 0) {
      const aoe = this.def.aoeRadius * (1 + (this.level - 1) * 0.04);
      let hit = false;
      for (const enemy of enemies) {
        if (dist(this.x, this.y, enemy.x, enemy.y) < aoe + enemy.radius) {
          enemy.takeDamage(Math.floor(this.damage * 0.8), this.x, this.y);
          particles.hit(enemy.x, enemy.y, this.def.coreColor || '#fdcb6e');
          hit = true;
        }
      }
      if (hit) {
        system.stompEffects.push({
          x: this.x, y: this.y, radius: aoe,
          color: this.def.fireColor || '#ff7675', life: 0.35, maxLife: 0.35,
        });
        this.flash = 0.22;
      }
      this.stompTimer = this.def.stompCd * Math.max(0.6, 1 - (this.level - 1) * 0.03);
    }

    this.cooldown -= dt;
    if (this.cooldown <= 0 && target) {
      const angle = angleBetween(this.x, this.y, target.x, target.y);
      system.projectiles.push(new SummonProjectile(
        this.x, this.y - 4, angle,
        this.def.projSpeed,
        Math.floor(this.damage * 0.75),
        this.def.projColor || '#ff7675',
        7,
        this.def.projAoe || 0
      ));
      this.cooldown = this.def.shootCd * Math.max(0.5, 1 - (this.level - 1) * 0.04);
    }
  }

  update(dt, player, enemies, bounds, system, particles) {
    this.wobble += dt * 4;
    if (this.flash > 0) this.flash -= dt;

    switch (this.def.behavior) {
      case 'turret': this.updateTurret(dt, player, enemies, bounds, system, particles); break;
      case 'melee': this.updateMelee(dt, player, enemies, bounds, system, particles); break;
      case 'charger': this.updateCharger(dt, player, enemies, bounds, system, particles); break;
      case 'stomp': this.updateStomp(dt, player, enemies, bounds, system, particles); break;
      case 'ranged': this.updateRanged(dt, player, enemies, bounds, system, particles); break;
      case 'dragon': this.updateDragon(dt, player, enemies, bounds, system, particles); break;
    }
  }

  draw(ctx) {
    if (Sprites.ready && Sprites.drawSummon(ctx, this)) return;

    const bob = Math.sin(this.wobble) * 1.5;
    const alpha = this.flash > 0 ? 0.75 : 1;

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.globalAlpha = alpha;
    ctx.rotate(this.facing || 0);

    if (this.typeId === 'turret') {
      ctx.fillStyle = '#3d3d55';
      ctx.fillRect(-14, 4, 28, 10);
      ctx.fillStyle = '#5352ed';
      ctx.fillRect(-10, -12, 20, 16);
      ctx.fillStyle = '#00cec9';
      ctx.shadowColor = '#00cec9';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -6, 6, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#81ecec';
      ctx.fillRect(-4, -10, 8, 6);
      ctx.fillStyle = '#dff9fb';
      ctx.fillRect(-2, -8, 4, 3);
    } else if (this.typeId === 'boar') {
      ctx.fillStyle = '#5a3a1a';
      ctx.beginPath();
      ctx.ellipse(0, -2, 15, 8, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = this.def.color;
      ctx.beginPath();
      ctx.ellipse(0, 2, 16, 11, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f5deb3';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(20, -2);
      ctx.lineTo(20, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(10, -2, 3, 3);
      ctx.fillRect(16, 0, 2, 2);
    } else if (this.typeId === 'wolf') {
      ctx.fillStyle = '#636e72';
      ctx.beginPath();
      ctx.moveTo(-14, 8);
      ctx.lineTo(14, 2);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b2bec3';
      ctx.beginPath();
      ctx.ellipse(0, 2, 8, 5, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(4, -2, 4, 4);
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(-8, 6, 4, 3);
      ctx.fillRect(4, 6, 4, 3);
    } else if (this.typeId === 'bear') {
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.ellipse(0, 2, 22, 18, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#6d4c41';
      ctx.beginPath();
      ctx.ellipse(0, 4, 16, 12, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#4a3428';
      ctx.beginPath();
      ctx.arc(-12, -14, 6, 0, TAU);
      ctx.arc(12, -14, 6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.ellipse(14, 2, 7, 5, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(16, 0, 3, 3);
      ctx.fillRect(12, 4, 3, 3);
      ctx.fillRect(18, 4, 3, 3);
    } else if (this.typeId === 'mammoth') {
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.ellipse(0, 4, 28, 22, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#b2bec3';
      ctx.beginPath();
      ctx.ellipse(0, 6, 20, 14, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(-30, 2, 12, 20);
      ctx.fillRect(18, 2, 12, 20);
      ctx.fillStyle = '#ecf0f1';
      ctx.beginPath();
      ctx.moveTo(-28, 6);
      ctx.lineTo(-38, 10);
      ctx.lineTo(-28, 14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(28, 6);
      ctx.lineTo(38, 10);
      ctx.lineTo(28, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#636e72';
      ctx.beginPath();
      ctx.ellipse(20, -2, 6, 8, 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(22, -4, 3, 3);
    } else if (this.typeId === 'eagle') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = this.def.color;
      ctx.beginPath();
      ctx.moveTo(-16, 6);
      ctx.lineTo(0, -12);
      ctx.lineTo(16, 6);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fdcb6e';
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(4, 8);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(-2, -4, 2, 2);
      ctx.fillRect(1, -4, 2, 2);
    } else if (this.typeId === 'dragon') {
      const wing = Math.sin(this.wobble * 2) * 5;
      ctx.fillStyle = this.def.wingColor || '#e17055';
      ctx.beginPath();
      ctx.moveTo(-10, -8 - wing);
      ctx.lineTo(-28, -16 - wing);
      ctx.lineTo(-16, 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -8 - wing);
      ctx.lineTo(28, -16 - wing);
      ctx.lineTo(16, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.def.color;
      ctx.beginPath();
      ctx.ellipse(0, 2, 24, 17, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = this.def.coreColor || '#fdcb6e';
      ctx.beginPath();
      ctx.ellipse(0, 8, 12, 8, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(12, -2, 5, 5);
      ctx.fillStyle = this.def.fireColor || '#ff7675';
      ctx.shadowColor = '#ff7675';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(32, -3);
      ctx.lineTo(30, 6);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = this.def.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }
}

class SummonSystem {
  constructor() {
    this.entities = [];
    this.projectiles = [];
    this.stompEffects = [];
    this.breathEffects = [];
  }

  sync(player) {
    const total = player.summons.length;
    this.entities = player.summons.map((slot, i) => {
      const prev = this.entities[i];
      const orbitDist = slot.id === 'dragon' ? 62 + i * 10 : 52 + i * 14;
      if (prev && prev.typeId === slot.id && prev.level === slot.level) {
        prev.slotIndex = i;
        prev.orbitDist = orbitDist;
        prev.orbitAngle = (i / Math.max(1, total)) * TAU;
        return prev;
      }
      return new SummonEntity(slot.id, slot.level, i, total, player);
    });
  }

  update(dt, player, enemies, bounds, particles) {
    if (!player.summons.length) return;

    if (this.entities.length !== player.summons.length) {
      this.sync(player);
    }

    for (const entity of this.entities) {
      entity.update(dt, player, enemies, bounds, this, particles);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      if (!p.alive || p.x < -40 || p.x > bounds.width + 40 || p.y < -40 || p.y > bounds.height + 40) {
        this.projectiles.splice(i, 1);
        continue;
      }
      for (const enemy of enemies) {
        if (p.hitIds.has(enemy.id)) continue;
        if (dist(p.x, p.y, enemy.x, enemy.y) < p.radius + enemy.radius) {
          p.hitIds.add(enemy.id);
          enemy.takeDamage(p.damage, p.x, p.y);
          particles.hit(enemy.x, enemy.y, p.color);
          if (p.aoe > 0) {
            for (const other of enemies) {
              if (other.id === enemy.id || p.hitIds.has(other.id)) continue;
              if (dist(p.x, p.y, other.x, other.y) < p.aoe + other.radius) {
                p.hitIds.add(other.id);
                other.takeDamage(Math.floor(p.damage * 0.55), p.x, p.y);
                particles.hit(other.x, other.y, p.color);
              }
            }
          }
          p.alive = false;
          break;
        }
      }
    }

    for (let i = this.stompEffects.length - 1; i >= 0; i--) {
      this.stompEffects[i].life -= dt;
      if (this.stompEffects[i].life <= 0) this.stompEffects.splice(i, 1);
    }
    for (let i = this.breathEffects.length - 1; i >= 0; i--) {
      this.breathEffects[i].life -= dt;
      if (this.breathEffects[i].life <= 0) this.breathEffects.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const fx of this.breathEffects) {
      const t = fx.life / fx.maxLife;
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.angle);
      const start = -fx.arc / 2;
      const end = fx.arc / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, fx.range * (0.85 + (1 - t) * 0.15), start, end);
      ctx.closePath();
      ctx.fillStyle = fx.color;
      ctx.globalAlpha = t * 0.35;
      ctx.fill();
      ctx.fillStyle = fx.core;
      ctx.globalAlpha = t * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, fx.range * 0.55 * t, start, end);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const fx of this.stompEffects) {
      const t = fx.life / fx.maxLife;
      ctx.save();
      ctx.strokeStyle = fx.color;
      ctx.globalAlpha = t * 0.6;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius * (1.15 - t * 0.2), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    for (const p of this.projectiles) p.draw(ctx);
    for (const entity of this.entities) entity.draw(ctx);
  }
}
