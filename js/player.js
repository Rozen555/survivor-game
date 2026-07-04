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
    this.summonDamageMult = char.summonDamageMult || 1;
    this.mechanics = createDefaultMechanics();
    this.killCombo = 0;
    this.killComboTimer = 0;
    this.tempBuffs = [];
    this.stillTime = 0;

    this.anchorState = 'drift';
    this.anchorX = 0;
    this.anchorY = 0;
    this.anchorDuration = 0;
    this.haulTimer = 0;
    this.haulCooldown = 0;
    this.ghostAnchors = [];
    this.anchorRadiusMult = 1;
    this.anchorPullMult = 1;
    this.anchorDamageBonus = 1;
    this.anchorArmorBonus = 0;
    this.haulSpeedMult = 1;
    this.haulCooldownMult = 1;
    this.ghostAnchorMax = ANCHOR_CONFIG.ghostAnchorMax;
    this.anchorChainSlow = 0;
    this.anchorRegenMult = 1;
    this.anchorRegenFlat = 0;
    this.anchorAtkspeedBonus = 1;
    this.ghostLifeBonus = 0;
    this.haulInvincibleBonus = 0;
    this.towerDamageMult = 1;
    this.towerRangeMult = 1;
    this.towerSpeedMult = 1;
    this.stormDamageMult = 1;
    this.stormTickMult = 1;
    this.summonFrenzyMult = 1;
    this.summonBoostMult = 1;
    this.anchorPickupMultBonus = 1;
    this._anchorPulsePending = false;

    this.vx = 0;
    this.vy = 0;
    this.facing = 0;
    this.weapons = [];
    this.summons = [];
    this.bonusStarterSummon = null;
    this.startWeapon = char.startWeapon || null;
    this.startSummon = char.startSummon || null;

    this.xp = 0;
    this.level = 1;
    this.xpToNext = getXpToNext(1);
    this.gold = 0;

    this.upgradeHistory = {};

    this.moveInput = { x: 0, y: 0 };
  }

  initWeapons(weaponSystem) {
    if (this.startWeapon) {
      weaponSystem.addWeapon(this, this.startWeapon);
    }
    if (this.startSummon) {
      this.summons.push({ id: this.startSummon, level: 1 });
      if (this.charId === 'summoner') {
        const bonus = rollSummonerStarterBonus(this.startSummon);
        if (bonus) {
          this.summons.push({ id: bonus, level: 1 });
          this.bonusStarterSummon = bonus;
        }
      }
    }
  }

  update(dt, bounds) {
    const speedMult = this.getSpeedMult();
    this.vx = this.moveInput.x * this.speed * speedMult;
    this.vy = this.moveInput.y * this.speed * speedMult;

    if (this.moveInput.x !== 0 || this.moveInput.y !== 0) {
      this.facing = Math.atan2(this.moveInput.y, this.moveInput.x);
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.anchorState === 'anchored') {
      const dx = this.x - this.anchorX;
      const dy = this.y - this.anchorY;
      const d = Math.hypot(dx, dy);
      const maxR = this.getAnchorRadius();
      if (d > maxR) {
        this.x = this.anchorX + (dx / d) * maxR;
        this.y = this.anchorY + (dy / d) * maxR;
      }
    }

    this.x = clamp(this.x, this.radius, bounds.width - this.radius);
    this.y = clamp(this.y, this.radius, bounds.height - this.radius);

    if (this.regen > 0) {
      this.hp = Math.min(this.hp + this.regen * dt, this.maxHp);
    }

    this.applyAnchorVitality(dt);

    if (this.invincible > 0) {
      this.invincible -= dt;
    }
  }

  applyAnchorVitality(dt) {
    if (this.anchorState !== 'anchored') return;

    const typeDef = this.getAnchorTypeDef();
    const regen = (ANCHOR_CONFIG.anchoredRegen + (typeDef.regenBonus || 0) + (this.anchorRegenFlat || 0))
      * (this.anchorRegenMult || 1);
    this.hp = Math.min(this.hp + regen * dt, this.maxHp);
  }

  isDrifting() {
    return this.anchorState === 'drift' || this.anchorState === 'hauling';
  }

  getAnchorTypeDef() {
    const id = CHARACTERS[this.charId]?.anchorType || 'iron';
    return ANCHOR_TYPES[id];
  }

  getAnchorRadius() {
    return ANCHOR_CONFIG.deployRadius * (this.anchorRadiusMult || 1);
  }

  isAnchored() {
    return this.anchorState === 'anchored';
  }

  getSpeedMult() {
    if (this.anchorState === 'hauling') {
      return ANCHOR_CONFIG.haulSpeedMult * (this.haulSpeedMult || 1);
    }
    return 1;
  }

  getPickupRangeMult() {
    if (this.anchorState === 'anchored') {
      return (this.getAnchorTypeDef().pickupMult || 1) * (this.anchorPickupMultBonus || 1);
    }
    return 1;
  }

  getEffectivePickupRange() {
    return this.pickupRange * this.getPickupRangeMult();
  }

  getAreaMult() {
    let mult = this.areaMult || 1;
    if (this.anchorState === 'anchored') {
      mult *= ANCHOR_CONFIG.anchoredAreaMult * (this.getAnchorTypeDef().areaMult || 1);
    } else if (this.isDrifting()) {
      mult *= ANCHOR_CONFIG.driftAreaMult;
    }
    return mult;
  }

  getAttackSpeedMult() {
    let mult = this.attackSpeedMult || 1;
    if (this.anchorState === 'anchored') {
      mult *= ANCHOR_CONFIG.anchoredAttackSpeedMult * (this.anchorAtkspeedBonus || 1);
    } else if (this.isDrifting()) {
      mult *= ANCHOR_CONFIG.driftAttackSpeedMult;
    }
    if (this.killCombo > 0 && this.mechanics?.killStreak > 0) {
      mult *= 1 + Math.min(0.55, this.killCombo * 0.035);
    }
    for (const buff of this.tempBuffs) {
      if (buff.id === 'frenzy') mult *= 1.25;
    }
    return mult;
  }

  getDamageMult() {
    let mult = this.damageMult || 1;
    if (this.anchorState === 'anchored') {
      mult *= ANCHOR_CONFIG.anchoredDamageMult
        * (this.getAnchorTypeDef().damageMult || 1)
        * (this.anchorDamageBonus || 1);
    } else if (this.isDrifting()) {
      mult *= ANCHOR_CONFIG.driftDamageMult;
    }
    for (const buff of this.tempBuffs) {
      if (buff.id === 'frenzy') mult *= 1.15;
    }
    return mult;
  }

  getSummonDamageMult() {
    let mult = this.summonDamageMult || 1;
    if (this.anchorState === 'anchored') {
      mult *= (this.getAnchorTypeDef().summonBoost || 1) * (this.summonBoostMult || 1);
    }
    return mult;
  }

  addTempBuff(id, duration) {
    const existing = this.tempBuffs.find(b => b.id === id);
    if (existing) {
      existing.time = Math.max(existing.time, duration);
      return;
    }
    this.tempBuffs.push({ id, time: duration });
  }

  takeDamage(amount) {
    if (this.invincible > 0) return 0;
    let reduced = amount;
    if (this.anchorState === 'anchored') {
      reduced -= (this.getAnchorTypeDef().armorBonus || 0) + (this.anchorArmorBonus || 0);
    }
    const actual = Math.max(1, reduced - this.armor);
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
      this.xpToNext = getXpToNext(this.level);
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
