class Player {
  constructor(charId, x, y) {
    const char = CHARACTERS[charId];
    this.charId = charId;
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.color = char.color;

    this.maxHp = char.maxHp;
    this.hp = char.maxHp;
    this.speed = char.speed;
    this.damageMult = char.damage;
    this.armor = char.armor;
    this.pickupRange = 80;
    this.regen = 0;
    this.xpMult = 1;
    this.critChance = 0.05;
    this.invincible = 0;
    this.attackSpeedMult = 1;
    this.extraCast = 0;
    this.areaMult = 1;
    this.lifesteal = 0;
    this.bonusProjectiles = 0;
    this.goldMult = 1;
    this.summonDamageMult = 1;

    this.vx = 0;
    this.vy = 0;
    this.facing = 0;
    this.weapons = [];
    this.summons = [];
    this.startWeapon = char.startWeapon || null;
    this.startSummon = char.startSummon || null;

    this.xp = 0;
    this.level = 1;
    this.xpToNext = 10;
    this.gold = 0;

    this.moveInput = { x: 0, y: 0 };
  }

  initWeapons(weaponSystem) {
    if (this.startWeapon) {
      weaponSystem.addWeapon(this, this.startWeapon);
    }
    if (this.startSummon) {
      this.summons.push({ id: this.startSummon, level: 1 });
    }
  }

  update(dt, bounds) {
    this.vx = this.moveInput.x * this.speed;
    this.vy = this.moveInput.y * this.speed;

    if (this.moveInput.x !== 0 || this.moveInput.y !== 0) {
      this.facing = Math.atan2(this.moveInput.y, this.moveInput.x);
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.x = clamp(this.x, this.radius, bounds.width - this.radius);
    this.y = clamp(this.y, this.radius, bounds.height - this.radius);

    if (this.regen > 0) {
      this.hp = Math.min(this.hp + this.regen * dt, this.maxHp);
    }

    if (this.invincible > 0) {
      this.invincible -= dt;
    }
  }

  takeDamage(amount) {
    if (this.invincible > 0) return 0;
    const actual = Math.max(1, amount - this.armor);
    this.hp -= actual;
    this.invincible = 0.5;
    return actual;
  }

  addXp(amount) {
    const gained = Math.floor(amount * this.xpMult);
    this.xp += gained;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(10 + this.level * 8 + this.level * this.level * 0.5);
      return true;
    }
    return false;
  }

  draw(ctx) {
    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      Sprites.drawPlayer(ctx, this);
      ctx.restore();
      return;
    }
    Sprites.drawPlayer(ctx, this);
  }
}
