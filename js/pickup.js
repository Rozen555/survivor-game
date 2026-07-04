class Pickup {
  constructor(x, y, type, value) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value;
    this.radius = type === 'gold' || type === 'coinBag' ? 8 : type === 'treasure' ? 10 : 6;
    this.vx = randomRange(-30, 30);
    this.vy = randomRange(-30, 30);
    this.lifetime = 30;
    this.wobble = Math.random() * TAU;
    this.magnetized = false;
  }

  update(dt, player) {
    this.lifetime -= dt;
    this.wobble += dt * 4;

    const d = dist(this.x, this.y, player.x, player.y);

    if (d < player.pickupRange) {
      this.magnetized = true;
    }

    if (this.magnetized) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const speed = Math.min(400, 200 + (player.pickupRange - d) * 3);
      this.x += Math.cos(angle) * speed * dt;
      this.y += Math.sin(angle) * speed * dt;
    } else {
      this.vx *= 0.95;
      this.vy *= 0.95;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    if (d < player.radius + this.radius) {
      return this.collect(player);
    }

    return null;
  }

  collect(player) {
    if (this.type === 'xp' || this.type === 'soul') {
      return { type: 'xp', value: this.value, pickupKind: this.type };
    }
    if (this.type === 'gold' || this.type === 'coinBag') {
      player.gold += this.value;
      return { type: 'gold', value: this.value, pickupKind: this.type };
    }
    if (this.type === 'treasure') {
      const gold = this.value;
      const xp = Math.max(2, Math.floor(this.value * 0.6));
      player.gold += gold;
      return { type: 'treasure', gold, xp, pickupKind: this.type };
    }
    if (this.type === 'health') {
      player.hp = Math.min(player.hp + this.value, player.maxHp);
      return { type: 'health', value: this.value };
    }
    return null;
  }

  draw(ctx) {
    const bob = Math.sin(this.wobble) * 2;

    ctx.save();
    ctx.translate(this.x, this.y + bob);

    if (this.type === 'xp') {
      ctx.fillStyle = '#5352ed';
      ctx.shadowColor = '#5352ed';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this.radius, 0);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'soul') {
      ctx.fillStyle = '#a29bfe';
      ctx.shadowColor = '#a29bfe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -this.radius - 1);
      ctx.lineTo(this.radius + 1, 0);
      ctx.lineTo(0, this.radius + 1);
      ctx.lineTo(-this.radius - 1, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#dfe6e9';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (this.type === 'gold') {
      ctx.fillStyle = '#ffd93d';
      ctx.shadowColor = '#ffd93d';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, TAU);
      ctx.fill();
    } else if (this.type === 'coinBag') {
      ctx.fillStyle = '#f39c12';
      ctx.shadowColor = '#f39c12';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffd93d';
      ctx.beginPath();
      ctx.arc(0, -1, this.radius - 2, 0, TAU);
      ctx.fill();
    } else if (this.type === 'treasure') {
      ctx.fillStyle = '#e17055';
      ctx.shadowColor = '#ffd93d';
      ctx.shadowBlur = 12;
      ctx.fillRect(-this.radius, -this.radius * 0.6, this.radius * 2, this.radius * 1.2);
      ctx.fillStyle = '#ffd93d';
      ctx.fillRect(-this.radius + 2, -this.radius * 0.6 + 2, this.radius * 2 - 4, 4);
    } else {
      ctx.fillStyle = '#ff6b6b';
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', 0, 4);
    }

    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  hit(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = randomRange(0, TAU);
      const speed = randomRange(50, 150);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: randomRange(0.2, 0.5),
        size: randomRange(2, 5),
      });
    }
  }

  death(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = randomRange(0, TAU);
      const speed = randomRange(30, 120);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: randomRange(0.3, 0.8),
        size: randomRange(3, 7),
      });
    }
  }

  levelUp(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * TAU;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 100,
        vy: Math.sin(angle) * 100,
        color: '#ffd93d',
        life: 0.6,
        size: 4,
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life * 2;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
