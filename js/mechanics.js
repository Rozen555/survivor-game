function createDefaultMechanics() {
  return {
    burnOnHit: 0,
    chainChance: 0,
    chainBounces: 2,
    thorns: 0,
    poisonCloud: 0,
    killStreak: 0,
    holyAura: 0,
    slowOnHit: 0,
    critExplode: 0,
    execute: 0,
    magnetPulse: 0,
    omnivamp: 0,
    novaOnKill: 0,
    orbitBlades: 0,
    bleedOnHit: 0,
    frostField: 0,
    overkillSplash: 0,
    shieldNova: 0,
    greedMark: 0,
    giantSlayer: 0,
    eliteHunter: 0,
    vampiricFrenzy: 0,
    hexMark: 0,
    moltenTrail: 0,
    soulHarvest: 0,
    staticCharge: 0,
    timeWarp: 0,
    phoenixCore: 0,
    ricochet: 0,
    dotAmp: 0,
    pickupSpark: 0,
    counterStrike: 0,
    whirlwind: 0,
    anchorShot: 0,
    markDetonate: 0,
  };
}

function applyMechanicDamageMods(dmg, enemy, m, player) {
  if (!m) return dmg;
  if (enemy.hexMark?.stacks > 0) {
    dmg = Math.floor(dmg * (1 + 0.07 * enemy.hexMark.stacks));
  }
  if (m.anchorShot > 0 && player?.stillTime > 0.6) {
    dmg = Math.floor(dmg * (1 + Math.min(0.4, player.stillTime * 0.05 * m.anchorShot)));
  }
  for (const buff of player?.tempBuffs || []) {
    if (buff.id === 'counter') dmg = Math.floor(dmg * 1.38);
    if (buff.id === 'spark') dmg = Math.floor(dmg * 1.14);
  }
  if (m.giantSlayer > 0 && enemy.hp / enemy.maxHp >= 0.68) {
    dmg = Math.floor(dmg * (1 + 0.14 * m.giantSlayer));
  }
  if (m.eliteHunter > 0 && (enemy.isElite || enemy.isBoss)) {
    dmg = Math.floor(dmg * (1 + 0.22 * m.eliteHunter));
  }
  if (m.execute > 0 && enemy.hp / enemy.maxHp <= 0.35) {
    dmg = Math.floor(dmg * (1 + 0.22 * m.execute));
  }
  return dmg;
}

const MECHANIC_UPGRADES = [
  {
    id: 'emberTouch',
    name: '余烬之触',
    icon: '🔥',
    desc: '攻击点燃敌人，持续灼烧',
    minDifficulty: 0,
    apply: (p) => { p.mechanics.burnOnHit += 1; },
  },
  {
    id: 'chainSpark',
    name: '闪电链',
    icon: '⚡',
    desc: '命中 18% 弹射附近敌人',
    minDifficulty: 1,
    apply: (p) => {
      p.mechanics.chainChance = Math.min(0.55, (p.mechanics.chainChance || 0) + 0.18);
      p.mechanics.chainBounces = Math.max(p.mechanics.chainBounces || 2, 3);
    },
  },
  {
    id: 'frostTouch',
    name: '霜寒之触',
    icon: '❄️',
    desc: '攻击减速敌人 2 秒',
    minDifficulty: 0,
    apply: (p) => { p.mechanics.slowOnHit += 1; },
  },
  {
    id: 'thornSkin',
    name: '荆棘皮肤',
    icon: '🌵',
    desc: '近身碰撞反弹伤害',
    minDifficulty: 1,
    apply: (p) => { p.mechanics.thorns += 10; },
  },
  {
    id: 'toxicRemains',
    name: '毒雾残骸',
    icon: '☠️',
    desc: '击杀留下毒雾区域',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.poisonCloud += 1; },
  },
  {
    id: 'killFrenzy',
    name: '杀戮狂热',
    icon: '💢',
    desc: '连杀提升攻速，2.5 秒内续杯',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.killStreak = 1; },
  },
  {
    id: 'sanctuary',
    name: '圣域光环',
    icon: '✝️',
    desc: '周身持续灼烫邪物（类大蒜）',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.holyAura += 1; },
  },
  {
    id: 'volatileCrit',
    name: '爆裂临界',
    icon: '💥',
    desc: '暴击时小范围爆炸',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.critExplode += 1; },
  },
  {
    id: 'executioner',
    name: '处刑者',
    icon: '🪓',
    desc: '对 35% 血以下敌人额外伤害',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.execute += 1; },
  },
  {
    id: 'magnetPulse',
    name: '磁力脉冲',
    icon: '🧲',
    desc: '每 8 秒吸附全图掉落物',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.magnetPulse += 1; },
  },
  {
    id: 'plagueStack',
    name: '瘟疫叠加',
    icon: '🦠',
    desc: '毒雾更大更久 · 击杀毒雾 +1',
    minDifficulty: 4,
    apply: (p) => { p.mechanics.poisonCloud += 1; },
  },
  {
    id: 'infernoCore',
    name: '炼狱核心',
    icon: '🌋',
    desc: '点燃伤害 +50% · 灼烧可扩散',
    minDifficulty: 5,
    apply: (p) => { p.mechanics.burnOnHit += 2; },
  },
  {
    id: 'stormChain',
    name: '雷暴导体',
    icon: '🌩️',
    desc: '闪电链 +12% · 弹射 +1 次',
    minDifficulty: 5,
    apply: (p) => {
      p.mechanics.chainChance = Math.min(0.65, (p.mechanics.chainChance || 0) + 0.12);
      p.mechanics.chainBounces = (p.mechanics.chainBounces || 2) + 1;
    },
  },
  {
    id: 'omnivamp',
    name: '全能吸血',
    icon: '🩸',
    desc: '造成伤害的 4% 转化为生命',
    minDifficulty: 1,
    apply: (p) => { p.mechanics.omnivamp += 1; },
  },
  {
    id: 'orbitKnives',
    name: '回旋刃',
    icon: '🗡️',
    desc: '环绕飞刃自动切割敌人',
    minDifficulty: 1,
    apply: (p) => { p.mechanics.orbitBlades += 1; },
  },
  {
    id: 'killNova',
    name: '爆裂入账',
    icon: '💣',
    desc: '击杀时产生范围爆炸',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.novaOnKill += 1; },
  },
  {
    id: 'hemorrhage',
    name: '放血',
    icon: '🩹',
    desc: '攻击叠加重伤流血',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.bleedOnHit += 1; },
  },
  {
    id: 'permafrost',
    name: '永冻领域',
    icon: '🧊',
    desc: '周期减速并伤害周围敌人',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.frostField += 1; },
  },
  {
    id: 'retribution',
    name: '以牙还牙',
    icon: '🔰',
    desc: '受击时释放冲击波',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.shieldNova += 1; },
  },
  {
    id: 'goldReaper',
    name: '黄金收割',
    icon: '💰',
    desc: '击杀概率额外掉落金币',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.greedMark += 1; },
  },
  {
    id: 'coupDeGrace',
    name: '恩赐解脱',
    icon: '💀',
    desc: '命中残血敌人造成溅射',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.overkillSplash += 1; },
  },
  {
    id: 'giantSlayer',
    name: '巨人杀手',
    icon: '🏔️',
    desc: '对高生命敌人额外伤害',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.giantSlayer += 1; },
  },
  {
    id: 'bladeStorm',
    name: '刃舞风暴',
    icon: '🌪️',
    desc: '飞刃 +1 · 转速更快',
    minDifficulty: 4,
    apply: (p) => { p.mechanics.orbitBlades += 1; },
  },
  {
    id: 'eliteBounty',
    name: '赏金猎人',
    icon: '🎖️',
    desc: '对精英与 Boss 额外伤害',
    minDifficulty: 4,
    apply: (p) => { p.mechanics.eliteHunter += 1; },
  },
  {
    id: 'vampiricFrenzy',
    name: '嗜血狂潮',
    icon: '😈',
    desc: '全能吸血 +3% · 击杀进入狂乱',
    minDifficulty: 4,
    apply: (p) => {
      p.mechanics.omnivamp += 1;
      p.mechanics.vampiricFrenzy = 1;
    },
  },
  {
    id: 'bloodPlague',
    name: '血疫',
    icon: '🦠',
    desc: '重伤叠层更高 · 可扩散',
    minDifficulty: 5,
    apply: (p) => { p.mechanics.bleedOnHit += 2; },
  },
  {
    id: 'supernova',
    name: '超新星',
    icon: '☀️',
    desc: '击杀爆炸更大更强',
    minDifficulty: 5,
    apply: (p) => { p.mechanics.novaOnKill += 1; },
  },
  {
    id: 'deepFreeze',
    name: '深度冻结',
    icon: '❄️',
    desc: '永冻领域 +1 · 减速更强',
    minDifficulty: 5,
    apply: (p) => { p.mechanics.frostField += 1; },
  },
  {
    id: 'hexGambit',
    name: '海克斯赌局',
    icon: '🎰',
    desc: '暴击时 25% 再触发闪电链',
    minDifficulty: 4,
    apply: (p) => {
      p.mechanics.critExplode += 1;
      p.mechanics.chainChance = Math.min(0.5, (p.mechanics.chainChance || 0) + 0.1);
    },
  },
  {
    id: 'potatoHarvest',
    name: '土豆丰收',
    icon: '🥔',
    desc: '黄金收割 +1 · 磁力脉冲 +1',
    minDifficulty: 3,
    apply: (p) => {
      p.mechanics.greedMark += 1;
      p.mechanics.magnetPulse += 1;
    },
  },
  {
    id: 'hexMark',
    name: '海克斯印记',
    icon: '🔷',
    desc: '攻击叠印记，印记目标受伤更高',
    minDifficulty: 1,
    apply: (p) => { p.mechanics.hexMark += 1; },
  },
  {
    id: 'moltenTrail',
    name: '熔火轨迹',
    icon: '🌋',
    desc: '移动时在脚下留下灼烧',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.moltenTrail += 1; },
  },
  {
    id: 'soulHarvest',
    name: '灵魂收割',
    icon: '👻',
    desc: '击杀回血 · 概率掉落灵魂球',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.soulHarvest += 1; },
  },
  {
    id: 'staticCharge',
    name: '静电充能',
    icon: '🔋',
    desc: '连续命中释放电击环',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.staticCharge += 1; },
  },
  {
    id: 'timeWarp',
    name: '时空扭曲',
    icon: '⏳',
    desc: '周期减速全场敌人',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.timeWarp += 1; },
  },
  {
    id: 'phoenixCore',
    name: '凤凰余烬',
    icon: '🪶',
    desc: '低生命时大幅再生',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.phoenixCore += 1; },
  },
  {
    id: 'ricochet',
    name: '弹射弹道',
    icon: '🪃',
    desc: '命中 16% 弹射附近敌人',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.ricochet += 1; },
  },
  {
    id: 'curseBrand',
    name: '诅咒烙印',
    icon: '☣️',
    desc: '点燃/流血/毒雾伤害 +35%',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.dotAmp += 1; },
  },
  {
    id: 'pickupSpark',
    name: '拾取火花',
    icon: '✨',
    desc: '拾取掉落物后短暂增伤',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.pickupSpark += 1; },
  },
  {
    id: 'counterStrike',
    name: '反击架势',
    icon: '🥊',
    desc: '受击后下次攻击大幅增伤',
    minDifficulty: 2,
    apply: (p) => { p.mechanics.counterStrike += 1; },
  },
  {
    id: 'whirlwind',
    name: '旋风斩',
    icon: '🌀',
    desc: '周期对周围敌人斩击',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.whirlwind += 1; },
  },
  {
    id: 'anchorShot',
    name: '锚定狙击',
    icon: '🎯',
    desc: '站立越久伤害越高',
    minDifficulty: 3,
    apply: (p) => { p.mechanics.anchorShot += 1; },
  },
  {
    id: 'markDetonate',
    name: '印记引爆',
    icon: '💠',
    desc: '印记 +1 · 击杀引爆印记',
    minDifficulty: 4,
    apply: (p) => { p.mechanics.hexMark += 1; p.mechanics.markDetonate = 1; },
  },
  {
    id: 'elementFusion',
    name: '元素融合',
    icon: '🔮',
    desc: '点燃 + 减速 · 诅咒烙印 +1',
    minDifficulty: 4,
    apply: (p) => {
      p.mechanics.burnOnHit += 1;
      p.mechanics.slowOnHit += 1;
      p.mechanics.dotAmp += 1;
    },
  },
  {
    id: 'spinToWin',
    name: '旋转至胜',
    icon: '🎡',
    desc: '旋风斩 +1 · 飞刃 +1',
    minDifficulty: 5,
    apply: (p) => {
      p.mechanics.whirlwind += 1;
      p.mechanics.orbitBlades += 1;
    },
  },
  {
    id: 'arcaneBattery',
    name: '奥术电池',
    icon: '⚙️',
    desc: '静电 +1 · 时空扭曲 +1',
    minDifficulty: 5,
    apply: (p) => {
      p.mechanics.staticCharge += 1;
      p.mechanics.timeWarp += 1;
    },
  },
];

function getMechanicUpgradesForDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  return MECHANIC_UPGRADES.filter(u => (u.minDifficulty ?? 0) <= lv);
}

function applyPlayerDamage(game, enemy, weapon, player, fromX, fromY) {
  const roll = weapon.rollDamage(player);
  let dmg = applyMechanicDamageMods(roll.damage, enemy, player.mechanics, player);
  const killed = enemy.takeDamage(dmg, fromX, fromY);
  if (game?.mechanics) {
    game.mechanics.onHit(enemy, { damage: dmg, crit: roll.crit }, fromX, fromY, player);
  }
  return killed;
}

function applyPlayerDamageValue(game, enemy, player, damage, fromX, fromY, isCrit = false) {
  const dmg = applyMechanicDamageMods(damage, enemy, player.mechanics, player);
  const killed = enemy.takeDamage(dmg, fromX, fromY);
  if (game?.mechanics) {
    game.mechanics.onHit(enemy, { damage: dmg, crit: isCrit }, fromX, fromY, player);
  }
  return killed;
}

class MechanicsSystem {
  constructor(game) {
    this.game = game;
    this.zones = [];
    this.chainEffects = [];
    this.auraPulse = 0;
    this.magnetTimer = 6;
    this.holyTick = 0;
    this.frostTick = 0;
    this.orbitAngle = 0;
    this.orbitHitCd = new Map();
    this.shieldNovaCd = 0;
    this.trailTimer = 0;
    this.staticHits = 0;
    this.timeWarpTimer = 8;
    this.whirlwindTimer = 0;
    this._inProcSplash = false;
    this._inKillNova = false;
  }

  update(dt) {
    const player = this.game.player;
    if (!player) return;

    this.auraPulse += dt;

    if (player.killComboTimer > 0) {
      player.killComboTimer -= dt;
      if (player.killComboTimer <= 0) player.killCombo = 0;
    }

    for (let i = player.tempBuffs.length - 1; i >= 0; i--) {
      player.tempBuffs[i].time -= dt;
      if (player.tempBuffs[i].time <= 0) player.tempBuffs.splice(i, 1);
    }

    for (const enemy of this.game.enemies) {
      this._tickBurn(enemy, dt);
      this._tickBleed(enemy, dt);
      if (enemy.hexMark?.time > 0) {
        enemy.hexMark.time -= dt;
        if (enemy.hexMark.time <= 0) enemy.hexMark = null;
      }
    }

    const moving = Math.hypot(player.vx, player.vy) > 18;
    if (moving) {
      player.stillTime = 0;
    } else {
      player.stillTime = (player.stillTime || 0) + dt;
    }

    if (player.mechanics.phoenixCore > 0 && player.hp / player.maxHp < 0.32) {
      player.hp = Math.min(player.maxHp, player.hp + (1.2 + player.mechanics.phoenixCore * 0.8) * dt);
    }

    if (player.mechanics.moltenTrail > 0 && moving) {
      this.trailTimer -= dt;
      if (this.trailTimer <= 0) {
        this.trailTimer = Math.max(0.18, 0.32 - player.mechanics.moltenTrail * 0.03);
        const lv = player.mechanics.moltenTrail;
        this.zones.push({
          x: player.x + randomRange(-6, 6),
          y: player.y + randomRange(-6, 6),
          radius: 22 + lv * 5,
          dps: 4 + lv * 2,
          life: 1.6 + lv * 0.25,
          tick: 0.28,
          color: '#e17055',
          type: 'fire',
        });
      }
    }

    if (player.mechanics.timeWarp > 0) {
      this.timeWarpTimer -= dt;
      if (this.timeWarpTimer <= 0) {
        this.timeWarpTimer = Math.max(6, 11 - player.mechanics.timeWarp * 0.8);
        for (const enemy of this.game.enemies) {
          this.applySlow(enemy, player.mechanics.timeWarp + 1);
        }
        this.game.triggerAnnouncement('⏳ 时空扭曲', '#a29bfe', 1.2);
      }
    }

    if (player.mechanics.whirlwind > 0) {
      this.whirlwindTimer -= dt;
      if (this.whirlwindTimer <= 0) {
        this.whirlwindTimer = Math.max(0.55, 1.05 - player.mechanics.whirlwind * 0.07);
        const radius = 72 + player.mechanics.whirlwind * 12;
        const dmg = 7 + player.mechanics.whirlwind * 4 + player.level;
        for (const enemy of this.game.enemies) {
          if (dist(player.x, player.y, enemy.x, enemy.y) < radius + enemy.radius) {
            enemy.takeDamage(dmg, player.x, player.y);
            this.game.particles.hit(enemy.x, enemy.y, '#dfe6e9');
          }
        }
      }
    }

    if (player.mechanics.orbitBlades > 0) {
      this._updateOrbitBlades(dt, player);
    }

    if (player.mechanics.frostField > 0) {
      this.frostTick -= dt;
      if (this.frostTick <= 0) {
        this.frostTick = Math.max(0.55, 1.1 - player.mechanics.frostField * 0.08);
        const radius = 62 + player.mechanics.frostField * 14;
        const dps = 3 + player.mechanics.frostField * 2;
        for (const enemy of this.game.enemies) {
          if (dist(player.x, player.y, enemy.x, enemy.y) < radius + enemy.radius) {
            enemy.takeDamage(dps, player.x, player.y);
            this.applySlow(enemy, player.mechanics.frostField);
            if (Math.random() < 0.2) {
              this.game.particles.hit(enemy.x, enemy.y, '#74b9ff');
            }
          }
        }
      }
    }

    if (this.shieldNovaCd > 0) this.shieldNovaCd -= dt;
    for (const [id, cd] of this.orbitHitCd) {
      const next = cd - dt;
      if (next <= 0) this.orbitHitCd.delete(id);
      else this.orbitHitCd.set(id, next);
    }

    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      z.life -= dt;
      z.tick -= dt;
      if (z.tick <= 0) {
        z.tick = 0.35;
        for (const enemy of this.game.enemies) {
          if (dist(z.x, z.y, enemy.x, enemy.y) < z.radius + enemy.radius) {
            const amp = z.type === 'poison' ? 1 + (player.mechanics.dotAmp || 0) * 0.35 : 1;
            enemy.takeDamage(z.dps * amp, z.x, z.y);
            this.game.particles.hit(enemy.x, enemy.y, z.color);
          }
        }
      }
      if (z.life <= 0) this.zones.splice(i, 1);
    }

    if (player.mechanics.holyAura > 0) {
      this.holyTick -= dt;
      if (this.holyTick <= 0) {
        this.holyTick = 0.45;
        const radius = 55 + player.mechanics.holyAura * 12;
        const dps = 4 + player.mechanics.holyAura * 3;
        for (const enemy of this.game.enemies) {
          if (dist(player.x, player.y, enemy.x, enemy.y) < radius + enemy.radius) {
            enemy.takeDamage(dps, player.x, player.y);
            if (Math.random() < 0.35) {
              this.game.particles.hit(enemy.x, enemy.y, '#ffeaa7');
            }
          }
        }
      }
    }

    if (player.mechanics.magnetPulse > 0) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.magnetTimer = Math.max(5, 9 - player.mechanics.magnetPulse);
        for (const pickup of this.game.pickups) {
          pickup.magnetized = true;
        }
        this.game.triggerAnnouncement('🧲 磁力脉冲！', '#74b9ff', 1.5);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          this.game.particles.hit(
            player.x + Math.cos(a) * 30,
            player.y + Math.sin(a) * 30,
            '#74b9ff'
          );
        }
      }
    }

    for (let i = this.chainEffects.length - 1; i >= 0; i--) {
      this.chainEffects[i].life -= dt;
      if (this.chainEffects[i].life <= 0) this.chainEffects.splice(i, 1);
    }
  }

  _tickBurn(enemy, dt) {
    if (!enemy.burn || enemy.burn.time <= 0) return;
    enemy.burn.time -= dt;
    const amp = 1 + (this.game.player.mechanics.dotAmp || 0) * 0.35;
    enemy.hp -= enemy.burn.dps * amp * dt;
    if (Math.random() < 0.25) {
      this.game.particles.hit(enemy.x + randomRange(-4, 4), enemy.y + randomRange(-4, 4), '#e17055');
    }
    if (enemy.burn.spread > 0 && Math.random() < 0.08 * dt * 60) {
      for (const other of this.game.enemies) {
        if (other.id === enemy.id) continue;
        if (other.burn?.time > 0) continue;
        if (dist(enemy.x, enemy.y, other.x, other.y) < enemy.radius + other.radius + 20) {
          this.applyBurn(other, enemy.burn.spread);
          break;
        }
      }
    }
    if (enemy.burn.time <= 0) enemy.burn = null;
  }

  applyBurn(enemy, level) {
    const dps = 3 + level * 2.5;
    const spread = level >= 3 ? Math.floor(level / 3) : 0;
    enemy.burn = {
      dps,
      time: 3 + level * 0.4,
      spread,
    };
  }

  applySlow(enemy, level) {
    enemy.slow = {
      mult: Math.max(0.4, 0.72 - level * 0.05),
      time: 1.8 + level * 0.35,
    };
  }

  applyBleed(enemy, level) {
    const stacks = Math.min(8, (enemy.bleed?.stacks || 0) + 1);
    const spread = level >= 3 ? 1 : 0;
    enemy.bleed = {
      stacks,
      dps: 2 + stacks * (1.2 + level * 0.35),
      time: 2.8 + level * 0.5,
      spread,
    };
  }

  _tickBleed(enemy, dt) {
    if (!enemy.bleed || enemy.bleed.time <= 0) return;
    enemy.bleed.time -= dt;
    const amp = 1 + (this.game.player.mechanics.dotAmp || 0) * 0.35;
    enemy.hp -= enemy.bleed.dps * amp * dt;
    if (Math.random() < 0.18) {
      this.game.particles.hit(enemy.x + randomRange(-3, 3), enemy.y + randomRange(-3, 3), '#ff4757');
    }
    if (enemy.bleed.spread > 0 && Math.random() < 0.06 * dt * 60) {
      for (const other of this.game.enemies) {
        if (other.id === enemy.id || other.bleed?.time > 0) continue;
        if (dist(enemy.x, enemy.y, other.x, other.y) < enemy.radius + other.radius + 18) {
          this.applyBleed(other, enemy.bleed.spread + 1);
          break;
        }
      }
    }
    if (enemy.bleed.time <= 0) enemy.bleed = null;
  }

  _updateOrbitBlades(dt, player) {
    const level = player.mechanics.orbitBlades;
    this.orbitAngle += dt * (2.8 + level * 0.35);
    const count = 1 + level;
    const radius = 46 + level * 9;
    const bladeDmg = Math.floor(6 + level * 3 + player.level * 0.8);

    for (let i = 0; i < count; i++) {
      const a = this.orbitAngle + (i / count) * TAU;
      const bx = player.x + Math.cos(a) * radius;
      const by = player.y + Math.sin(a) * radius;
      for (const enemy of this.game.enemies) {
        const key = `${enemy.id}:${i}`;
        if (this.orbitHitCd.has(key)) continue;
        if (dist(bx, by, enemy.x, enemy.y) > 14 + enemy.radius) continue;
        enemy.takeDamage(bladeDmg, bx, by);
        this.game.particles.hit(enemy.x, enemy.y, '#dfe6e9');
        this.orbitHitCd.set(key, 0.32);
      }
    }
  }

  _splashDamage(x, y, baseDamage, player, radius, mult) {
    const dmg = Math.floor(baseDamage * mult);
    this._inProcSplash = true;
    try {
      for (const enemy of this.game.enemies) {
        if (enemy.hp <= 0) continue;
        if (dist(x, y, enemy.x, enemy.y) < radius + enemy.radius) {
          enemy.takeDamage(dmg, x, y);
          this.game.particles.hit(enemy.x, enemy.y, '#fab1a0');
        }
      }
    } finally {
      this._inProcSplash = false;
    }
  }

  _killNova(x, y, player, level) {
    if (this._inKillNova) return;
    this._inKillNova = true;
    const radius = 50 + level * 16;
    const dmg = 10 + level * 7 + player.level * 1.5;
    try {
      for (const enemy of this.game.enemies) {
        if (enemy.hp <= 0) continue;
        if (dist(x, y, enemy.x, enemy.y) < radius + enemy.radius) {
          enemy.takeDamage(dmg, x, y);
          this.game.particles.hit(enemy.x, enemy.y, '#fdcb6e');
        }
      }
    } finally {
      this._inKillNova = false;
    }
    this.game.camera.shake = Math.max(this.game.camera.shake || 0, 2 + level);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      this.game.particles.hit(
        x + Math.cos(a) * radius * 0.45,
        y + Math.sin(a) * radius * 0.35,
        '#ffeaa7'
      );
    }
  }

  applyMark(enemy, level) {
    enemy.hexMark = {
      stacks: Math.min(6, (enemy.hexMark?.stacks || 0) + 1),
      time: 2.8 + level * 0.35,
    };
  }

  _ricochetHit(source, damage, player, level) {
    let nearest = null;
    let nearestDist = 110 + level * 12;
    for (const e of this.game.enemies) {
      if (e.id === source.id) continue;
      const d = dist(source.x, source.y, e.x, e.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }
    if (!nearest) return;
    const dmg = Math.floor(damage * (0.42 + level * 0.05));
    applyPlayerDamageValue(this.game, nearest, player, dmg, source.x, source.y, false);
    this.chainEffects.push({
      points: [{ x: source.x, y: source.y }, { x: nearest.x, y: nearest.y }],
      life: 0.16,
    });
  }

  _dischargeStatic(player, level) {
    const radius = 78 + level * 14;
    const dmg = 9 + level * 5 + player.level;
    for (const enemy of this.game.enemies) {
      if (dist(player.x, player.y, enemy.x, enemy.y) < radius + enemy.radius) {
        enemy.takeDamage(dmg, player.x, player.y);
        this.game.particles.hit(enemy.x, enemy.y, '#ffeaa7');
      }
    }
    this.game.camera.shake = Math.max(this.game.camera.shake || 0, 2 + level * 0.5);
    Audio.play('lightning');
  }

  onHit(enemy, roll, fromX, fromY, player) {
    const m = player.mechanics;
    if (m.hexMark > 0) this.applyMark(enemy, m.hexMark);
    if (m.burnOnHit > 0) this.applyBurn(enemy, m.burnOnHit);
    if (m.slowOnHit > 0) this.applySlow(enemy, m.slowOnHit);
    if (m.bleedOnHit > 0) this.applyBleed(enemy, m.bleedOnHit);
    if (m.omnivamp > 0 && roll.damage > 0) {
      const heal = Math.max(1, Math.floor(roll.damage * 0.04 * m.omnivamp));
      player.hp = Math.min(player.maxHp, player.hp + heal);
    }
    if (m.ricochet > 0 && Math.random() < 0.14 + m.ricochet * 0.03) {
      this._ricochetHit(enemy, roll.damage, player, m.ricochet);
    }
    if (m.staticCharge > 0) {
      this.staticHits += 1;
      const need = Math.max(4, 7 - m.staticCharge);
      if (this.staticHits >= need) {
        this.staticHits = 0;
        this._dischargeStatic(player, m.staticCharge);
      }
    }
    if (m.chainChance > 0 && Math.random() < m.chainChance) {
      this._chainLightning(enemy, roll.damage, player, m.chainBounces || 2);
    }
    if (roll.crit && m.critExplode > 0) {
      this._critExplosion(enemy.x, enemy.y, roll.damage, player, m.critExplode);
      if (m.chainChance > 0 && Math.random() < 0.25) {
        this._chainLightning(enemy, roll.damage, player, Math.max(2, (m.chainBounces || 2) - 1));
      }
    }
    if (
      m.overkillSplash > 0 &&
      !this._inProcSplash &&
      enemy.hp > 0 &&
      enemy.hp / enemy.maxHp < 0.32
    ) {
      this._splashDamage(
        enemy.x, enemy.y, roll.damage, player,
        38 + m.overkillSplash * 12,
        0.22 + m.overkillSplash * 0.06
      );
    }
    if (player.tempBuffs.some(b => b.id === 'counter')) {
      player.tempBuffs = player.tempBuffs.filter(b => b.id !== 'counter');
    }
  }

  onKill(enemy, player) {
    const m = player.mechanics;
    if (m.markDetonate > 0 && enemy.hexMark?.stacks > 0) {
      this._killNova(enemy.x, enemy.y, player, 1 + enemy.hexMark.stacks * 0.35);
    }
    if (m.novaOnKill > 0) {
      this._killNova(enemy.x, enemy.y, player, m.novaOnKill);
    }
    if (m.soulHarvest > 0) {
      player.hp = Math.min(player.maxHp, player.hp + 2 + m.soulHarvest);
      if (Math.random() < 0.12 + m.soulHarvest * 0.06) {
        this.game.pickups.push(new Pickup(
          enemy.x + randomRange(-6, 6),
          enemy.y + randomRange(-6, 6),
          'soul',
          Math.max(3, Math.floor(enemy.xp * (0.8 + m.soulHarvest * 0.15)))
        ));
      }
    }
    if (m.greedMark > 0 && Math.random() < 0.22 + m.greedMark * 0.1) {
      this.game.pickups.push(new Pickup(
        enemy.x + randomRange(-8, 8),
        enemy.y + randomRange(-8, 8),
        'gold',
        4 + m.greedMark * 3
      ));
    }
    if (m.vampiricFrenzy > 0) {
      player.addTempBuff('frenzy', 3);
    }
    if (m.poisonCloud > 0) {
      this.zones.push({
        x: enemy.x,
        y: enemy.y,
        radius: 38 + m.poisonCloud * 10,
        dps: 5 + m.poisonCloud * 2,
        life: 3.5 + m.poisonCloud * 0.8,
        tick: 0.2,
        color: '#2ecc71',
        type: 'poison',
      });
      for (let i = 0; i < 8; i++) {
        this.game.particles.hit(
          enemy.x + randomRange(-20, 20),
          enemy.y + randomRange(-20, 20),
          '#2ecc71'
        );
      }
    }
    if (m.killStreak > 0) {
      player.killCombo = Math.min(25, (player.killCombo || 0) + 1);
      player.killComboTimer = 2.5;
    }
  }

  onPlayerDamaged(amount, enemy) {
    const player = this.game.player;
    const m = player.mechanics;
    const thorns = m.thorns || 0;
    if (thorns > 0 && enemy) {
      enemy.takeDamage(thorns, player.x, player.y);
      this.game.particles.hit(enemy.x, enemy.y, '#2ecc71');
      Audio.play('hit');
    }
    if (m.shieldNova > 0 && this.shieldNovaCd <= 0) {
      this.shieldNovaCd = Math.max(1.2, 2.4 - m.shieldNova * 0.15);
      const radius = 58 + m.shieldNova * 14;
      const dmg = 8 + m.shieldNova * 5 + player.level;
      for (const e of this.game.enemies) {
        if (dist(player.x, player.y, e.x, e.y) < radius + e.radius) {
          e.takeDamage(dmg, player.x, player.y);
          this.game.particles.hit(e.x, e.y, '#74b9ff');
        }
      }
      this.game.camera.shake = Math.max(this.game.camera.shake || 0, 3);
    }
    if (m.counterStrike > 0) {
      player.addTempBuff('counter', 2.5 + m.counterStrike * 0.4);
    }
  }

  onPickupCollected(player) {
    const m = player.mechanics;
    if (m.pickupSpark > 0) {
      player.addTempBuff('spark', 3 + m.pickupSpark * 0.5);
    }
  }

  _chainLightning(source, damage, player, bounces) {
    let current = source;
    let fromX = source.x;
    let fromY = source.y;
    const hit = new Set([source.id]);
    const points = [{ x: fromX, y: fromY }];

    for (let i = 0; i < bounces; i++) {
      let nearest = null;
      let nearestDist = 120;
      for (const e of this.game.enemies) {
        if (hit.has(e.id)) continue;
        const d = dist(current.x, current.y, e.x, e.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (!nearest) break;
      hit.add(nearest.id);
      const chainDmg = Math.floor(damage * (0.55 - i * 0.08));
      nearest.takeDamage(chainDmg, current.x, current.y);
      this.game.particles.hit(nearest.x, nearest.y, '#ffeaa7');
      points.push({ x: nearest.x, y: nearest.y });
      current = nearest;
    }

    if (points.length > 1) {
      this.chainEffects.push({ points, life: 0.22 });
      Audio.play('lightning');
    }
  }

  _critExplosion(x, y, damage, player, level) {
    const radius = 42 + level * 12;
    const dmg = Math.floor(damage * (0.35 + level * 0.08));
    for (const enemy of this.game.enemies) {
      if (dist(x, y, enemy.x, enemy.y) < radius + enemy.radius) {
        applyPlayerDamageValue(this.game, enemy, player, dmg, x, y, false);
        this.game.particles.hit(enemy.x, enemy.y, '#ff7675');
      }
    }
    this.game.camera.shake = Math.max(this.game.camera.shake || 0, 3 + level);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      this.game.particles.hit(x + Math.cos(a) * radius * 0.5, y + Math.sin(a) * radius * 0.35, '#ff7675');
    }
  }

  draw(ctx) {
    const player = this.game.player;
    if (!player) return;

    for (const z of this.zones) {
      ctx.save();
      ctx.globalAlpha = 0.15 + (z.life / 4) * 0.15;
      ctx.fillStyle = z.color;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = z.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    if (player.mechanics.holyAura > 0) {
      const radius = 55 + player.mechanics.holyAura * 12;
      const pulse = 0.85 + Math.sin(this.auraPulse * 4) * 0.08;
      ctx.save();
      ctx.strokeStyle = '#ffeaa7';
      ctx.globalAlpha = 0.22 + Math.sin(this.auraPulse * 3) * 0.08;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, radius * pulse, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#fdcb6e';
      ctx.globalAlpha = 0.06;
      ctx.fill();
      ctx.restore();
    }

    if (player.mechanics.frostField > 0) {
      const radius = 62 + player.mechanics.frostField * 14;
      ctx.save();
      ctx.strokeStyle = '#74b9ff';
      ctx.globalAlpha = 0.12 + Math.sin(this.auraPulse * 2.5) * 0.05;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(player.x, player.y, radius, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (player.mechanics.orbitBlades > 0) {
      const level = player.mechanics.orbitBlades;
      const count = 1 + level;
      const radius = 46 + level * 9;
      for (let i = 0; i < count; i++) {
        const a = this.orbitAngle + (i / count) * TAU;
        const bx = player.x + Math.cos(a) * radius;
        const by = player.y + Math.sin(a) * radius;
        ctx.save();
        ctx.fillStyle = '#dfe6e9';
        ctx.shadowColor = '#b2bec3';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bx, by, 5 + level * 0.4, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    for (const fx of this.chainEffects) {
      ctx.save();
      ctx.strokeStyle = '#ffeaa7';
      ctx.lineWidth = 2;
      ctx.globalAlpha = fx.life * 4;
      ctx.shadowColor = '#74b9ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(fx.points[0].x, fx.points[0].y);
      for (let i = 1; i < fx.points.length; i++) {
        ctx.lineTo(fx.points[i].x, fx.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (player.killCombo >= 3 && player.mechanics.killStreak > 0) {
      ctx.save();
      ctx.fillStyle = '#ff4757';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff4757';
      ctx.shadowBlur = 10;
      ctx.fillText(`${player.killCombo} 连杀`, player.x, player.y - player.radius - 28);
      ctx.restore();
    }

    if (player.mechanics.whirlwind > 0) {
      const radius = 72 + player.mechanics.whirlwind * 12;
      ctx.save();
      ctx.strokeStyle = '#dfe6e9';
      ctx.globalAlpha = 0.1 + Math.sin(this.auraPulse * 6) * 0.04;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, radius, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (player.mechanics.anchorShot > 0 && player.stillTime > 0.6) {
      ctx.save();
      ctx.strokeStyle = '#fdcb6e';
      ctx.globalAlpha = Math.min(0.35, player.stillTime * 0.08);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 10 + player.stillTime * 2, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    for (const buff of player.tempBuffs) {
      if (buff.id === 'spark') {
        ctx.save();
        ctx.strokeStyle = '#ffeaa7';
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 10, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (const buff of player.tempBuffs) {
      if (buff.id !== 'frenzy') continue;
      ctx.save();
      ctx.strokeStyle = '#e84393';
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 14, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
}
