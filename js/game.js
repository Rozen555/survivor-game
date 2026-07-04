const GameState = {
  MENU: 'menu',
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

    this.camera = { x: 0, y: 0, shake: 0 };
    this.announcement = null;

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
        } else if (this.state === GameState.PAUSED) {
          this.state = GameState.PLAYING;
          this.ui.hidePause();
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
    this.state = GameState.PLAYING;

    this.ui.hideAllScreens();
    this.ui.showHud();
    this.ui.updateHud(this.player, this.time, this.kills, this.difficulty);
    this.ui.updateWeapons(this.player.weapons, this.player.summons);
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
    this.weapons.update(dt, this.player, this.enemies, this.bounds, this.particles);
    if (this.player.summons.length) {
      this.summons.update(dt, this.player, this.enemies, this.bounds, this.particles);
    }
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
        if (result.type === 'xp') {
          Audio.play('xp');
          const leveled = this.player.addXp(result.value);
          if (leveled) {
            this.triggerLevelUp();
          }
        } else if (result.type === 'gold') {
          Audio.play('gold');
        } else if (result.type === 'treasure') {
          Audio.play('gold');
          const leveled = this.player.addXp(result.xp);
          if (leveled) {
            this.triggerLevelUp();
          }
        } else if (result.type === 'health') {
          Audio.play('heal');
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
        this.state = GameState.VICTORY;
        Audio.play('victory');
        this.ui.showGameOver(true, this.time, this.kills, this.player.level, this.currentWave, this.difficulty);
        return;
      }
      this.openShop();
      return;
    }

    if (this.player.hp <= 0) {
      this.state = GameState.GAMEOVER;
      Audio.play('gameOver');
      this.ui.showGameOver(false, this.time, this.kills, this.player.level, this.currentWave, this.difficulty);
    }

    this.ui.updateHud(this.player, this.time, this.kills, this.difficulty);
  }

  triggerAnnouncement(text, color, duration = 3) {
    this.announcement = { text, color, timer: duration };
  }

  killEnemy(enemy) {
    if (enemy.type === 'exploder') {
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
    Audio.play('kill');
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
    const baseHealthChance = dl >= 2 ? 0.02 + dl * 0.004 : 0.02;
    if (Math.random() < baseHealthChance) {
      this.pickups.push(new Pickup(enemy.x - 10, enemy.y, 'health', 10 + dl * 2));
    }
    if (dl >= 3 && Math.random() < 0.025 + dl * 0.004) {
      this.pickups.push(new Pickup(enemy.x, enemy.y - 8, 'soul', Math.max(2, Math.floor(enemy.xp * 1.6))));
    }
    if (dl >= 5 && Math.random() < 0.022 + dl * 0.003) {
      this.pickups.push(new Pickup(enemy.x + 6, enemy.y - 6, 'coinBag', Math.max(3, Math.floor(enemy.gold * 2))));
    }
    if (dl >= 7 && Math.random() < 0.012 + dl * 0.002) {
      this.pickups.push(new Pickup(enemy.x - 6, enemy.y - 6, 'treasure', 8 + dl * 4));
    }
  }

  triggerLevelUp() {
    this.state = GameState.LEVELUP;
    Audio.play('levelUp');
    this.pendingUpgrades = this.generateUpgrades(3);
    this.particles.levelUp(this.player.x, this.player.y);
    this.ui.showLevelUp(this.pendingUpgrades, (upgrade) => {
      this.applyUpgrade(upgrade);
      this.state = GameState.PLAYING;
      this.ui.hideLevelUp();
      this.ui.updateWeapons(this.player.weapons, this.player.summons);
    });
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
    return {
      type: 'weaponLevel',
      id,
      name: `${w.name} Lv.${slot.level + 1}`,
      desc: '提升武器等级与伤害',
      icon: w.icon,
      isNew: false,
      isClass: !!(w.classes && w.classes.includes(this.player.charId)),
    };
  }

  generateClassUpgrades(count) {
    const charId = this.player.charId;
    const pools = getClassUpgradesForDifficulty(charId, this.difficulty.level);
    const classWeapons = getClassWeaponPool(charId);
    const ownedWeapons = this.player.weapons.map(w => w.id);
    let unownedWeapons = classWeapons.filter(id => !ownedWeapons.includes(id));
    const exclusiveOwned = ownedWeapons.filter(id => WEAPONS[id]?.classes?.includes(charId));
    const used = new Set();
    const options = [];

    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let opt = null;

      if (unownedWeapons.length > 0 && roll < 0.46) {
        const pool = unownedWeapons.filter(id => !used.has('w_' + id));
        const id = randomPick(pool);
        if (id) {
          used.add('w_' + id);
          unownedWeapons = unownedWeapons.filter(wid => wid !== id);
          opt = this._weaponUpgradeOption(id, true);
        }
      } else if (ownedWeapons.length > 0 && roll < 0.72) {
        const levelPool = exclusiveOwned.length > 0 && Math.random() < 0.68
          ? exclusiveOwned
          : ownedWeapons;
        const id = randomPick(levelPool);
        opt = this._weaponLevelOption(id);
      } else if (pools.classAttack.length > 0 && roll < 0.88) {
        const classPool = pools.classAttack.filter(a => !used.has('c_' + a.id));
        const pick = randomPick(classPool.length ? classPool : pools.classAttack);
        used.add('c_' + pick.id);
        opt = {
          type: 'classAttack',
          id: pick.id,
          name: pick.name,
          desc: pick.desc,
          icon: pick.icon,
          isNew: false,
          isClass: true,
        };
      } else if (roll < 0.94) {
        const attackPool = pools.attack.filter(a => !used.has('a_' + a.id));
        const pick = randomPick(attackPool.length ? attackPool : pools.attack);
        used.add('a_' + pick.id);
        opt = {
          type: 'attack',
          id: pick.id,
          name: pick.name,
          desc: pick.desc,
          icon: pick.icon,
          isNew: false,
        };
      } else {
        const stat = randomPick(pools.stat);
        opt = {
          type: 'stat',
          id: stat.id,
          name: stat.name,
          desc: stat.desc,
          isNew: false,
        };
      }

      if (opt) options.push(opt);
      else if (ownedWeapons.length > 0) {
        options.push(this._weaponLevelOption(randomPick(ownedWeapons)));
      } else if (unownedWeapons.length > 0) {
        const id = randomPick(unownedWeapons);
        options.push(this._weaponUpgradeOption(id, true));
      } else {
        const stat = randomPick(pools.stat);
        options.push({ type: 'stat', id: stat.id, name: stat.name, desc: stat.desc, isNew: false });
      }
    }

    return options;
  }

  generateSummonerUpgrades(count) {
    const charId = 'summoner';
    const pools = getClassUpgradesForDifficulty(charId, this.difficulty.level);
    const summonerWeapons = getClassWeaponPool(charId);
    const ownedWeapons = this.player.weapons.map(w => w.id);
    let unownedWeapons = summonerWeapons.filter(id => !ownedWeapons.includes(id));
    const owned = this.player.summons.map(s => s.id);
    let unownedSummons = getAvailableSummonsForUpgrade(this.player.summons);
    const dragonReady = canOfferDragon(this.player.summons);
    let dragonReserved = false;
    const used = new Set();
    const options = [];

    for (let i = 0; i < count; i++) {
      if (dragonReady && !dragonReserved) {
        dragonReserved = true;
        const def = SUMMON_TYPES.dragon;
        options.push({
          type: 'summon',
          id: 'dragon',
          name: def.name,
          desc: def.desc,
          icon: def.icon,
          isNew: true,
          isClass: true,
          isUltimate: true,
        });
        used.add('s_dragon');
        unownedSummons = unownedSummons.filter(id => id !== 'dragon');
        continue;
      }

      const roll = Math.random();
      let opt = null;

      if (unownedSummons.length > 0 && roll < 0.46) {
        const pool = unownedSummons.filter(id => !used.has('s_' + id));
        const id = randomPick(pool);
        if (id) {
          used.add('s_' + id);
          unownedSummons = unownedSummons.filter(sid => sid !== id);
          const def = SUMMON_TYPES[id];
          opt = {
            type: 'summon',
            id,
            name: def.name,
            desc: def.desc,
            icon: def.icon,
            isNew: true,
            isClass: true,
          };
        }
      } else if (owned.length > 0 && roll < 0.68) {
        const id = randomPick(owned);
        const slot = this.player.summons.find(s => s.id === id);
        const def = SUMMON_TYPES[id];
        opt = {
          type: 'summonLevel',
          id,
          name: `${def.name} Lv.${slot.level + 1}`,
          desc: '提升召唤物伤害、生命与攻击',
          icon: def.icon,
          isNew: false,
          isClass: true,
          isUltimate: id === 'dragon',
        };
      } else if (unownedWeapons.length > 0 && roll < 0.78) {
        const pool = unownedWeapons.filter(id => !used.has('w_' + id));
        const id = randomPick(pool);
        if (id) {
          used.add('w_' + id);
          unownedWeapons = unownedWeapons.filter(wid => wid !== id);
          opt = this._weaponUpgradeOption(id, true);
        }
      } else if (pools.classAttack.length > 0 && roll < 0.9) {
        const classPool = pools.classAttack.filter(a => !used.has('c_' + a.id));
        const pick = randomPick(classPool.length ? classPool : pools.classAttack);
        used.add('c_' + pick.id);
        opt = {
          type: 'classAttack',
          id: pick.id,
          name: pick.name,
          desc: pick.desc,
          icon: pick.icon,
          isNew: false,
          isClass: true,
        };
      } else if (roll < 0.96) {
        const stat = randomPick(pools.stat);
        opt = {
          type: 'stat',
          id: stat.id,
          name: stat.name,
          desc: stat.desc,
          isNew: false,
        };
      } else {
        const pick = randomPick(pools.attack);
        opt = {
          type: 'attack',
          id: pick.id,
          name: pick.name,
          desc: pick.desc,
          icon: pick.icon,
          isNew: false,
        };
      }

      if (opt) options.push(opt);
      else if (owned.length > 0) {
        const id = randomPick(owned);
        const slot = this.player.summons.find(s => s.id === id);
        const def = SUMMON_TYPES[id];
        options.push({
          type: 'summonLevel',
          id,
          name: `${def.name} Lv.${slot.level + 1}`,
          desc: '提升召唤物伤害、生命与攻击',
          icon: def.icon,
          isNew: false,
          isClass: true,
        });
      }
    }

    return options;
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
    if (upgrade.type === 'weapon') {
      this.weapons.addWeapon(this.player, upgrade.id);
    } else if (upgrade.type === 'weaponLevel') {
      this.weapons.addWeapon(this.player, upgrade.id);
    } else if (upgrade.type === 'summon' || upgrade.type === 'summonLevel') {
      const isNewDragon = upgrade.type === 'summon' && upgrade.id === 'dragon';
      this.addOrLevelSummon(upgrade.id);
      if (isNewDragon) {
        this.triggerAnnouncement('🐉 火龙降临！', '#ff6348');
        this.camera.shake = 10;
        Audio.play('boss');
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
    }
  }

  openShop() {
    const waveBonus = Math.floor((WAVE_GOLD_BONUS + this.currentWave * 2) * this.difficulty.rewardMult);
    this.player.gold += waveBonus;

    this.state = GameState.SHOP;
    Audio.play('shop');
    this.shopOffers = generateShopOffers(this.difficulty.shopSlots, this.difficulty.level);
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
