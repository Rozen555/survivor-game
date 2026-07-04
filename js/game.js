const GameState = {
  MENU: 'menu',
  MODIFIER_PICK: 'modifierPick',
  PLAYING: 'playing',
  LEVELUP: 'levelup',
  SHOP: 'shop',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
  VICTORY: 'victory',
};

class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.bounds = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    this.state = GameState.MENU;
    this.selectedChar = 'warrior';
    this.player = null;
    this.enemies = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.spawner = new EnemySpawner();
    this.weapons = new WeaponSystem();
    this.summons = new SummonSystem();
    this.particles = new ParticleSystem();

    this.time = 0;
    this.kills = 0;
    this.waveTimer = 0;
    this.currentWave = 1;
    this.pendingUpgrades = [];
    this.difficulty = getDifficulty(2);
    this.runModifiers = [];
    this.runModifierFx = mergeRunModifierEffects([]);

    this.camera = { x: 0, y: 0, shake: 0 };
    this.announcement = null;
    this.modifierPickTotal = RUN_MODIFIER_PICK_COUNT;

    this.keys = {};
    this.setupInput();
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === GameState.PLAYING) {
          this.state = GameState.PAUSED;
          this.ui.showPause();
          Audio.play('pause');
        } else if (this.state === GameState.PAUSED) {
          this.state = GameState.PLAYING;
          this.ui.hidePause();
          Audio.play('resume');
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  start(charId, difficulty = 2) {
    this.selectedChar = charId;
    this.difficulty = getDifficulty(difficulty);
    this.player = new Player(charId, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    this.enemies = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.weapons = new WeaponSystem();
    this.summons = new SummonSystem();
    this.particles = new ParticleSystem();
    this.spawner.setDifficulty(this.difficulty);
    this.spawner.reset();
    this.player.weapons = [];
    this.player.summons = [];
    this.player.initWeapons(this.weapons);
    this.summons.sync(this.player);

    this.time = 0;
    this.kills = 0;
    this.waveTimer = 0;
    this.currentWave = 1;
    this.announcement = null;
    this.runModifiers = [];
    this.runModifierFx = mergeRunModifierEffects([]);
    this.mechanics = new MechanicsSystem(this);

    this.ui.hideAllScreens();
    this.ui.hideHud();
    this.beginModifierPick();
  }

  beginModifierPick() {
    this.state = GameState.MODIFIER_PICK;
    const slot = this.runModifiers.length;
    const offers = generateModifierOffers(
      3,
      this.difficulty.level,
      this.runModifiers.map(m => m.id),
      slot
    );
    this.ui.showModifierPick(
      offers,
      slot + 1,
      this.modifierPickTotal,
      this.difficulty,
      (mod) => this.selectRunModifier(mod)
    );
  }

  selectRunModifier(mod) {
    this.runModifiers.push(mod);
    if (this.runModifiers.length < this.modifierPickTotal) {
      this.beginModifierPick();
      return;
    }
    this.finishStartAfterModifiers();
  }

  finishStartAfterModifiers() {
    this.runModifierFx = mergeRunModifierEffects(this.runModifiers);
    for (const mod of this.runModifiers) {
      if (mod.apply) mod.apply(this.player);
      if (mod.grantMechanic) {
        const pool = getMechanicUpgradesForDifficulty(this.difficulty.level);
        if (pool.length) randomPick(pool).apply(this.player);
      }
    }

    this.state = GameState.PLAYING;
    this.ui.hideModifierPick();
    this.ui.showHud();
    this.ui.updateHud(this.player, this.time, this.kills, this.difficulty, this.runModifiers);
    this.ui.updateWeapons(this.player.weapons, this.player.summons, this.player);
    if (this.player.summons.length) this.summons.sync(this.player);
    Audio.play('start');

    const lines = [];
    if (this.runModifiers.length) {
      lines.push(`本局词缀：${this.runModifiers.map(m => `${m.icon}${m.name}`).join(' · ')}`);
    }
    if (this.player.charId === 'summoner' && this.player.bonusStarterSummon) {
      const def = SUMMON_TYPES[this.player.bonusStarterSummon];
      lines.push(`${def.icon} 初始同伴：${def.name}`);
    }
    if (lines.length) {
      this.triggerAnnouncement(lines.join(' · '), lines.length > 1 ? '#fdcb6e' : '#a29bfe', 4.5);
      if (this.player.bonusStarterSummon) Audio.play('summon');
    }
  }

  update(dt) {
    if (this.state !== GameState.PLAYING) return;

    dt = Math.min(dt, 0.05);

    this.time += dt;
    this.waveTimer += dt;

    // Input
    this.player.moveInput.x = 0;
    this.player.moveInput.y = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.player.moveInput.y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) this.player.moveInput.y += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.player.moveInput.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.player.moveInput.x += 1;

    const len = Math.hypot(this.player.moveInput.x, this.player.moveInput.y);
    if (len > 0) {
      this.player.moveInput.x /= len;
      this.player.moveInput.y /= len;
    }

    this.player.update(dt, this.bounds);
    if (this.player.hp > 0 && this.player.hp / this.player.maxHp < 0.25) {
      Audio.play('lowHp');
    }
    this.weapons.update(dt, this.player, this.enemies, this.bounds, this.particles, this);
    if (this.player.summons.length) {
      this.summons.update(dt, this.player, this.enemies, this.bounds, this.particles);
    }
    if (this.mechanics) this.mechanics.update(dt);
    this.spawner.update(dt, this);

    // Enemy-player collision & behaviors
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player, this);
      if (dist(enemy.x, enemy.y, this.player.x, this.player.y) < enemy.radius + this.player.radius) {
        const dmg = this.player.takeDamage(enemy.damage);
        if (dmg > 0) {
          this.camera.shake = 5;
          this.particles.hit(this.player.x, this.player.y, '#ff4757');
          Audio.play('hurt');
          if (this.mechanics) this.mechanics.onPlayerDamaged(dmg, enemy);
        }
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.update(dt);
      if (!proj.alive) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }
      if (dist(proj.x, proj.y, this.player.x, this.player.y) < proj.radius + this.player.radius) {
        const dmg = this.player.takeDamage(proj.damage);
        if (dmg > 0) {
          this.camera.shake = 4;
          this.particles.hit(this.player.x, this.player.y, proj.color);
          Audio.play('hurt');
        }
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Check enemy deaths from weapon damage
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].hp <= 0) {
        this.killEnemy(this.enemies[i]);
        this.enemies.splice(i, 1);
      }
    }

    // Pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const result = this.pickups[i].update(dt, this.player);
      if (this.pickups[i].lifetime <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }
      if (result) {
        if (this._applyPickupResult(result)) {
          this.triggerLevelUp();
        }
        this.pickups.splice(i, 1);
      }
    }

    this.particles.update(dt);

    if (this.announcement) {
      this.announcement.timer -= dt;
      if (this.announcement.timer <= 0) this.announcement = null;
    }

    if (this.camera.shake > 0) {
      this.camera.shake *= 0.9;
      if (this.camera.shake < 0.5) this.camera.shake = 0;
    }

    // Wave complete -> shop (waves 1-9) or victory (wave 10)
    if (this.waveTimer >= WAVE_DURATION && this.spawner.isWaveComplete() && this.enemies.length === 0) {
      if (this.currentWave >= TOTAL_WAVES) {
        this.collectAllPickups();
        this.state = GameState.VICTORY;
        Audio.play('victory');
        this.ui.showGameOver(true, this.time, this.kills, this.player.level, this.currentWave, this.difficulty);
        document.getElementById('gameover-title')?.replaceChildren(document.createTextNode('你已胜利'));
        return;
      }
      this.finishWave();
      return;
    }

    if (this.player.hp <= 0) {
      this.state = GameState.GAMEOVER;
      Audio.play('gameOver');
      this.ui.showGameOver(false, this.time, this.kills, this.player.level, this.currentWave, this.difficulty);
      document.getElementById('gameover-title')?.replaceChildren(document.createTextNode('你已死亡'));
      return;
    }

    this.ui.updateHud(this.player, this.time, this.kills, this.difficulty, this.runModifiers);
  }

  triggerAnnouncement(text, color, duration = 3) {
    this.announcement = { text, color, timer: duration };
    Audio.play('announce');
  }

  killEnemy(enemy) {
    if (this.mechanics) this.mechanics.onKill(enemy, this.player);

    if (enemy.type === 'exploder') {
      Audio.play('explode');
      const r = enemy._def.explodeRadius || 70;
      if (dist(enemy.x, enemy.y, this.player.x, this.player.y) < r + this.player.radius) {
        const dmg = this.player.takeDamage(enemy._def.explodeDamage || 20);
        if (dmg > 0) {
          this.camera.shake = 8;
          this.particles.hit(this.player.x, this.player.y, '#fdcb6e');
          Audio.play('hurt');
        }
      }
      this.particles.death(enemy.x, enemy.y, '#fdcb6e');
      for (let i = 0; i < 12; i++) {
        this.particles.hit(
          enemy.x + randomRange(-r, r) * 0.3,
          enemy.y + randomRange(-r, r) * 0.3,
          '#ffeaa7'
        );
      }
    }

    if (enemy.type === 'splitter') {
      Audio.play('split');
      const count = enemy._def.splitCount || 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * TAU + Math.random() * 0.5;
        const distOff = enemy.radius + 8;
        this.spawner.spawnEnemy(
          this,
          'miniSlime',
          enemy.x + Math.cos(angle) * distOff,
          enemy.y + Math.sin(angle) * distOff,
          this.spawner.wave * 0.5
        );
      }
    }

    this.kills++;
    if (enemy.isBoss) {
      // boss death fanfare handled below
    } else if (enemy.isElite) {
      Audio.play('eliteKill');
    } else {
      Audio.play('kill');
    }
    if (this.player.lifesteal > 0) {
      this.player.hp = Math.min(this.player.hp + this.player.lifesteal, this.player.maxHp);
    }
    this.pickups.push(new Pickup(enemy.x, enemy.y, 'xp', enemy.xp));
    if (Math.random() < Math.min(0.85, GOLD_DROP_CHANCE * (this.player.goldMult || 1))) {
      this.pickups.push(new Pickup(enemy.x + 10, enemy.y, 'gold', enemy.gold));
    }
    this.spawnBonusDrops(enemy);
    if (enemy.isElite) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        this.particles.hit(
          enemy.x + Math.cos(a) * enemy.radius,
          enemy.y + Math.sin(a) * enemy.radius * 0.5,
          enemy._def.auraColor || enemy.color
        );
      }
      this.camera.shake = Math.max(this.camera.shake || 0, 5);
    }
    if (enemy.isBoss) {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU;
        this.particles.hit(
          enemy.x + Math.cos(a) * (enemy.radius + 20),
          enemy.y + Math.sin(a) * (enemy.radius + 10),
          enemy._def.auraColor || enemy.color
        );
      }
      this.camera.shake = Math.max(this.camera.shake || 0, 14);
      Audio.play('boss');
    }
    if (enemy.type !== 'exploder') {
      this.particles.death(enemy.x, enemy.y, enemy.color);
    }
  }

  spawnBonusDrops(enemy) {
    const dl = this.difficulty.level;
    const fx = this.runModifierFx;
    const dropMult = fx.dropChanceMult || 1;

    if (enemy.isBoss) {
      this.pickups.push(new Pickup(enemy.x, enemy.y - 10, 'treasure', 8 + dl * 4));
      this.pickups.push(new Pickup(enemy.x + 12, enemy.y - 6, 'relic', 2));
      if (Math.random() < 0.45) {
        this.pickups.push(new Pickup(enemy.x - 10, enemy.y - 4, 'prism', 1));
      }
      return;
    }

    if (enemy.isElite) {
      if (Math.random() < 0.6) {
        this.pickups.push(new Pickup(enemy.x, enemy.y - 8, 'soul', Math.max(3, Math.floor(enemy.xp * 1.8))));
      } else {
        this.pickups.push(new Pickup(enemy.x + 8, enemy.y - 6, 'coinBag', Math.max(3, Math.floor(enemy.gold * 1.5))));
      }
      if (fx.eliteBonusDrop && Math.random() < 0.5) {
        this.pickups.push(new Pickup(enemy.x - 8, enemy.y - 4, 'prism', 1));
      }
      if (Math.random() < 0.28 * dropMult) {
        this.pickups.push(new Pickup(enemy.x - 6, enemy.y + 4, 'relic', 1));
      }
    }

    const baseHealthChance = (dl >= 2 ? 0.028 + dl * 0.004 : 0.02) * dropMult;
    if (Math.random() < baseHealthChance) {
      this.pickups.push(new Pickup(enemy.x - 10, enemy.y, 'health', 10 + dl * 2));
    }
    if (dl >= 2 && Math.random() < (0.032 + dl * 0.004) * (fx.soulMult || 1) * dropMult) {
      this.pickups.push(new Pickup(enemy.x, enemy.y - 8, 'soul', Math.max(2, Math.floor(enemy.xp * 1.6))));
    }
    if (dl >= 3 && Math.random() < (0.02 + dl * 0.003) * dropMult) {
      this.pickups.push(new Pickup(enemy.x + 6, enemy.y - 6, 'coinBag', Math.max(2, Math.floor(enemy.gold * 1.35))));
    }
    if (dl >= 5 && Math.random() < (0.012 + dl * 0.002) * (fx.treasureMult || 1) * dropMult) {
      this.pickups.push(new Pickup(enemy.x - 6, enemy.y - 6, 'treasure', 5 + dl * 3));
    }
    if (fx.prismChance > 0 && Math.random() < fx.prismChance * dropMult) {
      this.pickups.push(new Pickup(enemy.x + 4, enemy.y + 2, 'prism', 1));
    }
  }

  _applyPrismReward(power = 1) {
    const rolls = [
      () => {
        this.player.hp = Math.min(this.player.hp + 15 * power, this.player.maxHp);
        return { msg: '恢复生命', leveled: false };
      },
      () => {
        this.player.gold += Math.floor(8 * power);
        return { msg: `+${Math.floor(8 * power)} 金币`, leveled: false };
      },
      () => ({
        msg: `+${Math.floor(12 * power)} 经验`,
        leveled: this.player.addXp(Math.floor(12 * power)),
      }),
      () => {
        this.player.damageMult *= 1 + 0.03 * power;
        return { msg: '伤害提升', leveled: false };
      },
      () => ({
        msg: '狂热 8 秒',
        leveled: false,
        apply: () => { this.player.addTempBuff('frenzy', 8); },
      }),
      () => {
        this.player.critChance += 0.02 * power;
        return { msg: '暴击提升', leveled: false };
      },
      () => {
        this.player.pickupRange *= 1.08;
        return { msg: '磁力增强', leveled: false };
      },
    ];
    const { msg, leveled, apply } = randomPick(rolls)();
    if (apply) apply();
    this.triggerAnnouncement(`🔷 棱彩：${msg}`, '#74b9ff', 2);
    return leveled;
  }

  _applyRelicReward(power = 1) {
    const rolls = [
      () => {
        this.player.hp = Math.min(this.player.hp + 25 * power, this.player.maxHp);
        return { msg: '大量生命', leveled: false };
      },
      () => {
        const gold = Math.floor(18 * power);
        this.player.gold += gold;
        return { msg: `+${gold} 金币`, leveled: false };
      },
      () => ({
        msg: `+${Math.floor(22 * power)} 经验`,
        leveled: this.player.addXp(Math.floor(22 * power)),
      }),
      () => {
        this.player.damageMult *= 1 + 0.05 * power;
        return { msg: '强力伤害', leveled: false };
      },
      () => {
        this.player.attackSpeedMult = (this.player.attackSpeedMult || 1) * (1 + 0.08 * power);
        return { msg: '攻速爆发', leveled: false };
      },
      () => {
        this.player.bonusProjectiles = (this.player.bonusProjectiles || 0) + 1;
        return { msg: '额外投射物', leveled: false };
      },
    ];
    const { msg, leveled } = randomPick(rolls)();
    this.triggerAnnouncement(`✨ 遗物：${msg}`, '#fdcb6e', 2.5);
    return leveled;
  }

  triggerLevelUp(openShopAfter = false) {
    this.state = GameState.LEVELUP;
    Audio.play('levelUp');
    const optionCount = this.runModifierFx?.levelUpOptions || 3;
    this.pendingUpgrades = this.generateUpgrades(optionCount) || [];
    if (!this.pendingUpgrades.length) {
      this.state = GameState.PLAYING;
      if (openShopAfter) this.openShop();
      return;
    }
    this.particles.levelUp(this.player.x, this.player.y);
    this.ui.showLevelUp(this.pendingUpgrades, this.player.level, (upgrade) => {
      this.applyUpgrade(upgrade);
      this.ui.hideLevelUp();
      this.ui.updateWeapons(this.player.weapons, this.player.summons, this.player);
      if (openShopAfter) {
        this.openShop();
      } else {
        this.state = GameState.PLAYING;
      }
    });
  }

  _applyPickupResult(result) {
    if (this.mechanics) this.mechanics.onPickupCollected(this.player);
    if (result.type === 'xp') {
      Audio.play(result.pickupKind === 'soul' ? 'soul' : 'xp');
      return this.player.addXp(result.value);
    }
    if (result.type === 'gold') {
      Audio.play(result.pickupKind === 'coinBag' ? 'coinBag' : 'gold');
      return false;
    }
    if (result.type === 'treasure') {
      Audio.play('treasure');
      return this.player.addXp(result.xp);
    }
    if (result.type === 'health') {
      Audio.play('heal');
      return false;
    }
    if (result.type === 'prism') {
      Audio.play('treasure');
      return this._applyPrismReward(result.value || 1);
    }
    if (result.type === 'relic') {
      Audio.play('treasure');
      return this._applyRelicReward(result.value || 1);
    }
    return false;
  }

  collectAllPickups() {
    if (!this.pickups.length) return false;

    const remaining = this.pickups.splice(0);
    let leveled = false;

    for (const pickup of remaining) {
      const result = pickup.collect(this.player);
      if (result && this._applyPickupResult(result)) {
        leveled = true;
      }
    }

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      this.particles.hit(
        this.player.x + Math.cos(a) * 24,
        this.player.y + Math.sin(a) * 16,
        i % 2 ? '#ffd93d' : '#5352ed'
      );
    }

    return leveled;
  }

  finishWave() {
    const leveled = this.collectAllPickups();
    if (leveled) {
      this.triggerLevelUp(true);
      return;
    }
    this.openShop();
  }

  generateUpgrades(count) {
    if (this.player.charId === 'summoner') {
      return this.generateSummonerUpgrades(count);
    }
    return this.generateClassUpgrades(count);
  }

  _weaponUpgradeOption(id, isNew) {
    const w = WEAPONS[id];
    return {
      type: 'weapon',
      id,
      name: w.name,
      desc: w.desc,
      icon: w.icon,
      isNew,
      isClass: !!(w.classes && w.classes.includes(this.player.charId)),
    };
  }

  _weaponLevelOption(id) {
    const w = WEAPONS[id];
    const slot = this.player.weapons.find(x => x.id === id);
    if (!w || !slot) return null;
    return {
      type: 'weaponLevel',
      id,
      name: `${w.name} Lv.${(slot.level || 1) + 1}`,
      desc: '提升武器等级与伤害',
      icon: w.icon,
      isNew: false,
      isClass: !!(w.classes && w.classes.includes(this.player.charId)),
    };
  }

  _upgradeKey(opt) {
    return opt ? `${opt.type}:${opt.id}` : '';
  }

  _tryPushUpgrade(options, used, opt) {
    if (!opt) return false;
    const key = this._upgradeKey(opt);
    if (used.has(key)) return false;
    used.add(key);
    options.push(opt);
    return true;
  }

  _pickWeightedUpgrade(candidates) {
    if (!candidates.length) return null;
    let total = 0;
    for (const c of candidates) total += c.weight;
    let roll = Math.random() * total;
    for (const c of candidates) {
      roll -= c.weight;
      if (roll <= 0) return c;
    }
    return candidates[candidates.length - 1];
  }

  _upgradeRepeatFactor(key) {
    const count = this.player.upgradeHistory[key] || 0;
    if (count === 0) return 1;
    const base = this.runModifierFx.repeatPenaltySoft ? 0.55 : 0.35;
    return Math.pow(base, count);
  }

  _applyCandidateWeight(candidates) {
    for (const c of candidates) {
      const key = this._upgradeKey(c.opt);
      const boost = this.runModifierFx.upgradeWeightBoost[c.kind] || 1;
      c.weight *= this._upgradeRepeatFactor(key) * boost;
    }
    return candidates.filter(c => c.weight > 0.01);
  }

  _fillDiverseUpgrades(options, used, getCandidates, count, onPick) {
    const groups = [
      ['newWeapon', 'summon', 'weaponLevel', 'summonLevel'],
      ['mechanic'],
      ['classAttack', 'attack'],
      ['stat'],
    ];

    for (const kinds of groups) {
      if (options.length >= count) break;
      let candidates = getCandidates(used).filter(c => kinds.includes(c.kind));
      candidates = this._applyCandidateWeight(candidates);
      if (!candidates.length) continue;
      const pick = this._pickWeightedUpgrade(candidates);
      if (pick && this._tryPushUpgrade(options, used, pick.opt)) {
        onPick(pick);
      }
    }

    while (options.length < count) {
      let candidates = getCandidates(used);
      candidates = this._applyCandidateWeight(candidates);
      if (!candidates.length) break;
      const pick = this._pickWeightedUpgrade(candidates);
      if (!pick || !this._tryPushUpgrade(options, used, pick.opt)) break;
      onPick(pick);
    }
  }

  _classUpgradeCandidates(used, ctx) {
    const { pools, unownedWeapons, ownedWeapons, exclusiveOwned } = ctx;
    const candidates = [];

    for (const id of unownedWeapons) {
      if (!used.has(`weapon:${id}`)) {
        candidates.push({ kind: 'newWeapon', weight: 34, opt: this._weaponUpgradeOption(id, true) });
      }
    }

    const levelPool = exclusiveOwned.length > 0 ? exclusiveOwned : ownedWeapons;
    for (const id of levelPool) {
      if (!used.has(`weaponLevel:${id}`)) {
        const opt = this._weaponLevelOption(id);
        if (opt) {
          candidates.push({ kind: 'weaponLevel', weight: 22, opt });
        }
      }
    }

    for (const pick of pools.classAttack) {
      if (!used.has(`classAttack:${pick.id}`)) {
        candidates.push({
          kind: 'classAttack',
          weight: 18,
          opt: {
            type: 'classAttack',
            id: pick.id,
            name: pick.name,
            desc: pick.desc,
            icon: pick.icon,
            isNew: false,
            isClass: true,
          },
        });
      }
    }

    for (const pick of pools.attack) {
      if (!used.has(`attack:${pick.id}`)) {
        candidates.push({
          kind: 'attack',
          weight: 14,
          opt: {
            type: 'attack',
            id: pick.id,
            name: pick.name,
            desc: pick.desc,
            icon: pick.icon,
            isNew: false,
          },
        });
      }
    }

    for (const stat of pools.stat) {
      if (!used.has(`stat:${stat.id}`)) {
        candidates.push({
          kind: 'stat',
          weight: 12,
          opt: { type: 'stat', id: stat.id, name: stat.name, desc: stat.desc, icon: stat.icon, isNew: false },
        });
      }
    }

    for (const mech of getMechanicUpgradesForDifficulty(this.difficulty.level)) {
      if (!used.has(`mechanic:${mech.id}`)) {
        candidates.push({
          kind: 'mechanic',
          weight: 20,
          opt: {
            type: 'mechanic',
            id: mech.id,
            name: mech.name,
            desc: mech.desc,
            icon: mech.icon,
            isNew: true,
          },
        });
      }
    }

    return candidates;
  }

  _summonerUpgradeCandidates(used, ctx) {
    const { pools, unownedSummons, unownedWeapons } = ctx;
    const summonCount = countUniqueSummons(this.player.summons);
    const needsMoreSummons = summonCount < DRAGON_UNLOCK_SUMMON_TYPES;
    const missingSummons = DRAGON_UNLOCK_SUMMON_TYPES - summonCount;
    const candidates = [];

    for (const id of unownedSummons) {
      if (!used.has(`summon:${id}`)) {
        const def = SUMMON_TYPES[id];
        candidates.push({
          kind: 'summon',
          weight: needsMoreSummons
            ? 260 + missingSummons * 40 + (def.isUltimate ? 25 : 0)
            : 46,
          opt: {
            type: 'summon',
            id,
            name: def.name,
            desc: def.desc,
            icon: def.icon,
            isNew: true,
            isClass: true,
            isUltimate: !!def.isUltimate,
          },
        });
      }
    }

    for (const slot of this.player.summons) {
      const id = slot.id;
      if (!used.has(`summonLevel:${id}`)) {
        const def = SUMMON_TYPES[id];
        if (!def) continue;
        candidates.push({
          kind: 'summonLevel',
          weight: needsMoreSummons ? 4 : 22,
          opt: {
            type: 'summonLevel',
            id,
            name: `${def.name} Lv.${(slot.level || 1) + 1}`,
            desc: '提升召唤物伤害、生命与攻击',
            icon: def.icon,
            isNew: false,
            isClass: true,
            isUltimate: id === 'dragon',
          },
        });
      }
    }

    for (const id of unownedWeapons) {
      if (!used.has(`weapon:${id}`)) {
        candidates.push({
          kind: 'newWeapon',
          weight: needsMoreSummons ? 2 : 12,
          opt: this._weaponUpgradeOption(id, true),
        });
      }
    }

    for (const pick of pools.classAttack) {
      if (!used.has(`classAttack:${pick.id}`)) {
        candidates.push({
          kind: 'classAttack',
          weight: needsMoreSummons ? 4 : 14,
          opt: {
            type: 'classAttack',
            id: pick.id,
            name: pick.name,
            desc: pick.desc,
            icon: pick.icon,
            isNew: false,
            isClass: true,
          },
        });
      }
    }

    for (const stat of pools.stat) {
      if (!used.has(`stat:${stat.id}`)) {
        candidates.push({
          kind: 'stat',
          weight: needsMoreSummons ? 3 : 12,
          opt: { type: 'stat', id: stat.id, name: stat.name, desc: stat.desc, icon: stat.icon, isNew: false },
        });
      }
    }

    for (const pick of pools.attack) {
      if (!used.has(`attack:${pick.id}`)) {
        candidates.push({
          kind: 'attack',
          weight: needsMoreSummons ? 2 : 10,
          opt: {
            type: 'attack',
            id: pick.id,
            name: pick.name,
            desc: pick.desc,
            icon: pick.icon,
            isNew: false,
          },
        });
      }
    }

    for (const mech of getMechanicUpgradesForDifficulty(this.difficulty.level)) {
      if (!used.has(`mechanic:${mech.id}`)) {
        candidates.push({
          kind: 'mechanic',
          weight: needsMoreSummons ? 5 : 18,
          opt: {
            type: 'mechanic',
            id: mech.id,
            name: mech.name,
            desc: mech.desc,
            icon: mech.icon,
            isNew: true,
          },
        });
      }
    }

    return candidates;
  }

  generateClassUpgrades(count) {
    const charId = this.player.charId;
    const pools = getClassUpgradesForDifficulty(charId, this.difficulty.level);
    const ctx = {
      pools,
      unownedWeapons: getClassWeaponPool(charId).filter(id => !this.player.weapons.some(w => w.id === id)),
      ownedWeapons: this.player.weapons.map(w => w.id),
      exclusiveOwned: this.player.weapons
        .map(w => w.id)
        .filter(id => WEAPONS[id]?.classes?.includes(charId)),
    };
    const used = new Set();
    const options = [];

    this._fillDiverseUpgrades(options, used, (u) => this._classUpgradeCandidates(u, ctx), count, (pick) => {
      if (pick.kind === 'newWeapon') {
        ctx.unownedWeapons = ctx.unownedWeapons.filter(id => id !== pick.opt.id);
      }
    });

    return options;
  }

  generateSummonerUpgrades(count) {
    const charId = 'summoner';
    const pools = getClassUpgradesForDifficulty(charId, this.difficulty.level);
    const ctx = {
      pools,
      unownedWeapons: getClassWeaponPool(charId).filter(id => !this.player.weapons.some(w => w.id === id)),
      owned: this.player.summons.map(s => s.id),
      unownedSummons: getAvailableSummonsForUpgrade(this.player.summons),
    };
    const used = new Set();
    const options = [];

    if (canOfferDragon(this.player.summons)) {
      const def = SUMMON_TYPES.dragon;
      this._tryPushUpgrade(options, used, {
        type: 'summon',
        id: 'dragon',
        name: def.name,
        desc: def.desc,
        icon: def.icon,
        isNew: true,
        isClass: true,
        isUltimate: true,
      });
      ctx.unownedSummons = ctx.unownedSummons.filter(id => id !== 'dragon');
    }

    const summonCount = countUniqueSummons(this.player.summons);
    const needsMoreSummons = summonCount < DRAGON_UNLOCK_SUMMON_TYPES;
    const missingSummons = DRAGON_UNLOCK_SUMMON_TYPES - summonCount;
    if (needsMoreSummons && ctx.unownedSummons.length) {
      const guaranteeSlots = Math.min(2, missingSummons, count - options.length);
      for (let g = 0; g < guaranteeSlots; g++) {
        const pool = ctx.unownedSummons.filter(id => !used.has(`summon:${id}`));
        if (!pool.length) break;
        const id = pool[Math.floor(Math.random() * pool.length)];
        const def = SUMMON_TYPES[id];
        if (!def) continue;
        if (this._tryPushUpgrade(options, used, {
          type: 'summon',
          id,
          name: def.name,
          desc: def.desc,
          icon: def.icon,
          isNew: true,
          isClass: true,
          isUltimate: !!def.isUltimate,
        })) {
          ctx.unownedSummons = ctx.unownedSummons.filter(x => x !== id);
        }
      }
    }

    this._fillDiverseUpgrades(options, used, (u) => this._summonerUpgradeCandidates(u, ctx), count, (pick) => {
      if (pick.kind === 'summon') {
        ctx.unownedSummons = ctx.unownedSummons.filter(id => id !== pick.opt.id);
      } else if (pick.kind === 'newWeapon') {
        ctx.unownedWeapons = ctx.unownedWeapons.filter(id => id !== pick.opt.id);
      }
    });

    return options.slice(0, count);
  }

  addOrLevelSummon(id) {
    const existing = this.player.summons.find(s => s.id === id);
    if (existing) {
      existing.level = Math.min(8, existing.level + 1);
    } else {
      this.player.summons.push({ id, level: 1 });
    }
    this.summons.sync(this.player);
  }

  applyUpgrade(upgrade) {
    const historyKey = this._upgradeKey(upgrade);
    if (historyKey) {
      this.player.upgradeHistory[historyKey] = (this.player.upgradeHistory[historyKey] || 0) + 1;
    }

    if (upgrade.type === 'weapon') {
      this.weapons.addWeapon(this.player, upgrade.id);
    } else if (upgrade.type === 'weaponLevel') {
      this.weapons.addWeapon(this.player, upgrade.id);
    } else if (upgrade.type === 'summon' || upgrade.type === 'summonLevel') {
      const isNewSummon = upgrade.type === 'summon';
      const isNewDragon = isNewSummon && upgrade.id === 'dragon';
      this.addOrLevelSummon(upgrade.id);
      if (isNewDragon) {
        this.triggerAnnouncement('🐉 火龙降临！', '#ff6348');
        this.camera.shake = 10;
        Audio.play('summon');
      } else if (isNewSummon) {
        Audio.play('summon');
      }
    } else if (upgrade.type === 'classAttack') {
      const atk = CLASS_ATTACK_UPGRADES.find(s => s.id === upgrade.id);
      if (atk) atk.apply(this.player);
      if (this.player.summons.length) this.summons.sync(this.player);
    } else if (upgrade.type === 'attack') {
      const atk = ATTACK_UPGRADES.find(s => s.id === upgrade.id);
      if (atk) atk.apply(this.player);
    } else if (upgrade.type === 'stat') {
      const stat = STAT_UPGRADES.find(s => s.id === upgrade.id);
      if (stat) stat.apply(this.player);
    } else if (upgrade.type === 'mechanic') {
      const mech = MECHANIC_UPGRADES.find(m => m.id === upgrade.id);
      if (mech) {
        mech.apply(this.player);
        this.triggerAnnouncement(`${mech.icon} 机制：${mech.name}`, '#55efc4', 2);
      }
    }
  }

  openShop() {
    const waveBonus = Math.floor(
      (WAVE_GOLD_BONUS + this.currentWave * 3) * this.difficulty.rewardMult * GOLD_REWARD_MULT
    );
    this.player.gold += waveBonus;

    this.state = GameState.SHOP;
    Audio.play('shop');
    const shopSlots = Math.min(8, this.difficulty.shopSlots + (this.runModifierFx.shopSlotBonus || 0));
    this.shopOffers = generateShopOffers(
      shopSlots,
      this.difficulty.level,
      this.currentWave,
      { shopTagQuota: this.runModifierFx.shopTagQuota }
    );
    this.ui.showShop(
      this.player,
      this.currentWave,
      this.shopOffers,
      this.difficulty,
      (index) => {
        const item = this.shopOffers[index];
        if (!item || item.sold) return false;
        if (this.player.gold < item.cost) return false;
        this.player.gold -= item.cost;
        item.apply(this.player);
        item.sold = true;
        Audio.play('buy');
        return true;
      },
      () => {
        this.currentWave++;
        this.spawner.nextWave();
        this.waveTimer = 0;
        this.state = GameState.PLAYING;
        Audio.play('wave');
        this.ui.hideShop();
      }
    );
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();

    // Camera shake
    if (this.camera.shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.camera.shake * 2,
        (Math.random() - 0.5) * this.camera.shake * 2
      );
    }

    // Background grid
    this.drawBackground(ctx);

    // Pickups
    for (const p of this.pickups) p.draw(ctx);

    // Enemies
    for (const e of this.enemies) e.draw(ctx);

    for (const proj of this.enemyProjectiles) proj.draw(ctx);

    if (this.player) {
      this.summons.draw(ctx);
      this.weapons.draw(ctx, this.player);
      if (this.mechanics) this.mechanics.draw(ctx);
      this.player.draw(ctx);
    }

    // Particles
    this.particles.draw(ctx);

    if (this.player) {
      this.drawWaveInfo(ctx);
      this.drawAnnouncement(ctx);
    }

    ctx.restore();
  }

  drawBackground(ctx) {
    IsaacBackground.draw(ctx);
  }

  drawWaveInfo(ctx) {
    const waveProgress = Math.min(1, this.waveTimer / WAVE_DURATION);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT - 20, 200, 8);
    ctx.fillStyle = '#ffd93d';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT - 20, 200 * waveProgress, 8);

    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `波次 ${this.currentWave}/${TOTAL_WAVES} · 难度 ${this.difficulty.level}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 28
    );
  }

  drawAnnouncement(ctx) {
    if (!this.announcement) return;
    const a = this.announcement;
    const alpha = Math.min(1, a.timer);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 170, 72, 340, 44);
    ctx.strokeStyle = a.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 170, 72, 340, 44);
    ctx.fillStyle = a.color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(a.text, CANVAS_WIDTH / 2, 102);
    ctx.restore();
  }
}
