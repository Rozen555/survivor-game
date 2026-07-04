const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const CHARACTERS = {
  warrior: {
    name: '战士',
    maxHp: 120,
    speed: 180,
    damage: 1.1,
    armor: 2,
    startWeapon: 'whip',
    color: '#ff6b6b',
  },
  mage: {
    name: '法师',
    maxHp: 80,
    speed: 170,
    damage: 1.4,
    armor: 0,
    startWeapon: 'magic',
    color: '#70a1ff',
  },
  ranger: {
    name: '游侠',
    maxHp: 90,
    speed: 220,
    damage: 1.0,
    armor: 1,
    startWeapon: 'knife',
    color: '#6bcb77',
  },
  summoner: {
    name: '召唤师',
    maxHp: 85,
    speed: 165,
    damage: 0.85,
    armor: 0,
    startSummon: 'turret',
    color: '#a29bfe',
  },
};

const SUMMON_TYPES = {
  turret: {
    name: '魔法炮塔',
    icon: '🗼',
    desc: '部署炮塔，自动射击敌人',
    behavior: 'turret',
    hp: 90,
    damage: 14,
    range: 300,
    shootCd: 0.95,
    radius: 14,
    color: '#74b9ff',
    projColor: '#a29bfe',
  },
  boar: {
    name: '野猪',
    icon: '🐗',
    desc: '快速冲锋，撞击敌人',
    behavior: 'charger',
    hp: 65,
    damage: 9,
    speed: 125,
    chargeSpeed: 240,
    chargeCd: 2.2,
    radius: 13,
    color: '#8B4513',
    attackRange: 30,
  },
  wolf: {
    name: '野狼',
    icon: '🐺',
    desc: '高速撕咬最近敌人',
    behavior: 'melee',
    hp: 48,
    damage: 11,
    speed: 170,
    radius: 12,
    color: '#636e72',
    attackRange: 24,
    attackCd: 0.6,
  },
  bear: {
    name: '棕熊',
    icon: '🐻',
    desc: '高生命近战，重击敌人',
    behavior: 'melee',
    hp: 130,
    damage: 20,
    speed: 88,
    radius: 17,
    color: '#6d4c41',
    attackRange: 28,
    attackCd: 1.0,
  },
  mammoth: {
    name: '猛犸象',
    icon: '🦣',
    desc: '践踏周围，造成范围伤害',
    behavior: 'stomp',
    hp: 210,
    damage: 26,
    speed: 58,
    radius: 22,
    color: '#b2bec3',
    attackRange: 38,
    attackCd: 1.5,
    aoeRadius: 55,
  },
  eagle: {
    name: '猎鹰',
    icon: '🦅',
    desc: '盘旋俯冲，远程打击',
    behavior: 'ranged',
    hp: 38,
    damage: 10,
    speed: 155,
    radius: 11,
    color: '#e17055',
    shootRange: 260,
    shootCd: 1.15,
    projSpeed: 340,
    projColor: '#fab1a0',
  },
  dragon: {
    name: '火龙',
    icon: '🐉',
    desc: '集齐5种召唤后解锁 · 烈焰焚敌',
    behavior: 'dragon',
    isUltimate: true,
    unlockMinTypes: 5,
    hp: 360,
    damage: 44,
    speed: 108,
    radius: 28,
    color: '#d63031',
    wingColor: '#e17055',
    fireColor: '#ff7675',
    coreColor: '#fdcb6e',
    leash: 280,
    breathRange: 200,
    breathCd: 1.1,
    breathArc: 0.48,
    stompCd: 2.0,
    aoeRadius: 72,
    shootCd: 1.35,
    projSpeed: 360,
    projColor: '#ff7675',
    projAoe: 40,
  },
};

const DRAGON_UNLOCK_SUMMON_TYPES = 5;

function countUniqueSummons(summons) {
  return new Set((summons || []).map(s => s.id)).size;
}

function canOfferDragon(summons) {
  const ids = new Set((summons || []).map(s => s.id));
  return countUniqueSummons(summons) >= DRAGON_UNLOCK_SUMMON_TYPES && !ids.has('dragon');
}

function getAvailableSummonsForUpgrade(summons) {
  const owned = new Set((summons || []).map(s => s.id));
  return Object.keys(SUMMON_TYPES).filter(id => {
    if (owned.has(id)) return false;
    if (id === 'dragon') return canOfferDragon(summons);
    return true;
  });
}

const WEAPONS = {
  whip: {
    id: 'whip',
    name: '鞭刃',
    icon: '🌀',
    type: 'melee',
    damage: 12,
    cooldown: 0.8,
    range: 95,
    arc: Math.PI * 0.55,
    color: '#ffd93d',
    sprite: 'weapon_whip',
    desc: '横扫前方敌人',
  },
  magic: {
    id: 'magic',
    name: '魔弹',
    icon: '✨',
    type: 'projectile',
    damage: 8,
    cooldown: 0.5,
    speed: 400,
    count: 1,
    homing: true,
    color: '#70a1ff',
    sprite: 'weapon_magic',
    desc: '追踪最近的敌人',
  },
  knife: {
    id: 'knife',
    name: '飞刀',
    icon: '🗡️',
    type: 'projectile',
    damage: 6,
    cooldown: 0.35,
    speed: 500,
    count: 1,
    pierce: 2,
    color: '#aaa',
    sprite: 'weapon_knife',
    desc: '快速穿透飞刀',
  },
  lightning: {
    id: 'lightning',
    name: '闪电链',
    icon: '⚡',
    type: 'instant',
    damage: 15,
    cooldown: 1.2,
    range: 200,
    chains: 3,
    color: '#ffeaa7',
    desc: '连锁攻击多个敌人',
  },
  orbit: {
    id: 'orbit',
    name: '护体球',
    icon: '🔮',
    type: 'orbit',
    damage: 10,
    cooldown: 0,
    count: 3,
    radius: 60,
    orbitSpeed: 2.5,
    ballRadius: 12,
    color: '#a29bfe',
    sprite: 'weapon_orbit',
    desc: '环绕身体的伤害球',
  },
  fireball: {
    id: 'fireball',
    name: '火球',
    icon: '🔥',
    type: 'projectile',
    damage: 20,
    cooldown: 1.5,
    speed: 300,
    count: 1,
    aoe: 50,
    color: '#e17055',
    sprite: 'weapon_fireball',
    desc: '爆炸范围伤害',
  },
  axe: {
    id: 'axe',
    name: '回旋斧',
    icon: '🪓',
    type: 'boomerang',
    damage: 14,
    cooldown: 1.1,
    speed: 380,
    maxRange: 160,
    pierce: 8,
    color: '#b2bec3',
    sprite: 'weapon_axe',
    desc: '飞出后返回的回旋斧',
  },
  holy: {
    id: 'holy',
    name: '圣光',
    icon: '☀️',
    type: 'nova',
    damage: 16,
    cooldown: 2.0,
    radius: 110,
    color: '#ffeaa7',
    desc: '释放环形圣光冲击',
  },
  rain: {
    id: 'rain',
    name: '箭雨',
    icon: '🌧️',
    type: 'rain',
    damage: 6,
    cooldown: 2.2,
    count: 3,
    strikeRadius: 26,
    color: '#55efc4',
    desc: '随机落下箭雨打击',
  },
  cross: {
    id: 'cross',
    name: '十字斩',
    icon: '✝️',
    type: 'cross',
    damage: 9,
    cooldown: 1.3,
    speed: 420,
    range: 350,
    color: '#fd79a8',
    desc: '四向十字弹幕',
  },
  drone: {
    id: 'drone',
    name: '浮游炮',
    icon: '🛸',
    type: 'satellite',
    damage: 8,
    cooldown: 0.55,
    orbitRadius: 85,
    orbitSpeed: 2.2,
    color: '#74b9ff',
    sprite: 'weapon_drone',
    desc: '环绕浮游并自动射击',
  },
  cleave: {
    id: 'cleave',
    name: '顺劈斩',
    icon: '⚔️',
    type: 'melee',
    damage: 17,
    cooldown: 0.95,
    range: 108,
    arc: Math.PI * 0.68,
    color: '#ff6b6b',
    sprite: 'weapon_whip',
    desc: '战士专属 · 大范围横扫',
    classes: ['warrior'],
  },
  shieldWave: {
    id: 'shieldWave',
    name: '盾冲波',
    icon: '🛡️',
    type: 'nova',
    damage: 14,
    cooldown: 1.7,
    radius: 92,
    color: '#ff7675',
    desc: '战士专属 · 近身冲击波',
    classes: ['warrior'],
  },
  whirlwind: {
    id: 'whirlwind',
    name: '旋风刃',
    icon: '🌪️',
    type: 'orbit',
    damage: 13,
    cooldown: 0,
    count: 2,
    radius: 58,
    orbitSpeed: 3.1,
    ballRadius: 14,
    color: '#ffd93d',
    sprite: 'weapon_axe',
    desc: '战士专属 · 旋转利刃',
    classes: ['warrior'],
  },
  frostbolt: {
    id: 'frostbolt',
    name: '冰箭术',
    icon: '❄️',
    type: 'projectile',
    damage: 11,
    cooldown: 0.55,
    speed: 390,
    count: 1,
    pierce: 4,
    color: '#74b9ff',
    sprite: 'weapon_magic',
    desc: '法师专属 · 穿透冰箭',
    classes: ['mage'],
  },
  arcaneBurst: {
    id: 'arcaneBurst',
    name: '奥术爆发',
    icon: '💫',
    type: 'instant',
    damage: 11,
    cooldown: 1.0,
    range: 235,
    chains: 5,
    color: '#a29bfe',
    desc: '法师专属 · 多段奥术链',
    classes: ['mage'],
  },
  meteor: {
    id: 'meteor',
    name: '陨石术',
    icon: '☄️',
    type: 'rain',
    damage: 13,
    cooldown: 2.0,
    count: 2,
    strikeRadius: 34,
    color: '#e17055',
    desc: '法师专属 · 天降陨石',
    classes: ['mage'],
  },
  volley: {
    id: 'volley',
    name: '连射',
    icon: '🏹',
    type: 'projectile',
    damage: 6,
    cooldown: 0.82,
    speed: 470,
    count: 4,
    pierce: 1,
    color: '#6bcb77',
    sprite: 'weapon_knife',
    desc: '游侠专属 · 四箭齐发',
    classes: ['ranger'],
  },
  explosiveArrow: {
    id: 'explosiveArrow',
    name: '爆炸箭',
    icon: '💥',
    type: 'projectile',
    damage: 15,
    cooldown: 1.35,
    speed: 340,
    count: 1,
    aoe: 46,
    color: '#00b894',
    sprite: 'weapon_fireball',
    desc: '游侠专属 · 命中爆炸',
    classes: ['ranger'],
  },
  fanArrows: {
    id: 'fanArrows',
    name: '扇形箭',
    icon: '🎯',
    type: 'cross',
    damage: 10,
    cooldown: 1.1,
    speed: 440,
    color: '#55efc4',
    sprite: 'weapon_cross',
    desc: '游侠专属 · 四向箭幕',
    classes: ['ranger'],
  },
  spiritBolt: {
    id: 'spiritBolt',
    name: '灵魂弹',
    icon: '👻',
    type: 'projectile',
    damage: 9,
    cooldown: 0.58,
    speed: 360,
    count: 1,
    homing: true,
    color: '#a29bfe',
    sprite: 'weapon_magic',
    desc: '召唤师专属 · 追踪灵魂弹',
    classes: ['summoner'],
  },
  hexOrb: {
    id: 'hexOrb',
    name: '诅咒法球',
    icon: '🔮',
    type: 'orbit',
    damage: 9,
    cooldown: 0,
    count: 2,
    radius: 52,
    orbitSpeed: 2.8,
    ballRadius: 11,
    color: '#6c5ce7',
    sprite: 'weapon_orbit',
    desc: '召唤师专属 · 诅咒法球',
    classes: ['summoner'],
  },
};

const CLASS_WEAPON_PREFERENCES = {
  warrior: ['whip', 'axe', 'holy', 'orbit'],
  mage: ['magic', 'fireball', 'lightning', 'drone', 'rain'],
  ranger: ['knife', 'cross', 'rain', 'axe'],
  summoner: ['spiritBolt', 'hexOrb'],
};

const CLASS_ATTACK_UPGRADES = [
  {
    id: 'battleFury',
    name: '战意沸腾',
    icon: '⚔️',
    classes: ['warrior'],
    minDifficulty: 0,
    desc: '攻击范围 +12% · 护甲 +3',
    apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.12; p.armor += 3; },
  },
  {
    id: 'ironWill',
    name: '钢铁意志',
    icon: '🛡️',
    classes: ['warrior'],
    minDifficulty: 3,
    desc: '生命 +30 · 伤害 +10%',
    apply: (p) => { p.maxHp += 30; p.hp = Math.min(p.hp + 30, p.maxHp); p.damageMult *= 1.1; },
  },
  {
    id: 'lastStand',
    name: '背水一战',
    icon: '🔥',
    classes: ['warrior'],
    minDifficulty: 5,
    desc: '伤害 +15% · 击杀回血 +3',
    apply: (p) => { p.damageMult *= 1.15; p.lifesteal = (p.lifesteal || 0) + 3; },
  },
  {
    id: 'arcaneFocus',
    name: '奥术专注',
    icon: '🔮',
    classes: ['mage'],
    minDifficulty: 0,
    desc: '伤害 +12% · 额外施法 +10%',
    apply: (p) => { p.damageMult *= 1.12; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.1); },
  },
  {
    id: 'manaSurge',
    name: '魔力涌流',
    icon: '💠',
    classes: ['mage'],
    minDifficulty: 3,
    desc: '攻速 +15% · 范围 +10%',
    apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.15; p.areaMult = (p.areaMult || 1) * 1.1; },
  },
  {
    id: 'spellWeave',
    name: '法术编织',
    icon: '✨',
    classes: ['mage'],
    minDifficulty: 5,
    desc: '额外施法 +15% · 经验 +12%',
    apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); p.xpMult *= 1.12; },
  },
  {
    id: 'eagleEye',
    name: '鹰眼',
    icon: '🎯',
    classes: ['ranger'],
    minDifficulty: 0,
    desc: '暴击 +10% · 投射物 +1',
    apply: (p) => { p.critChance += 0.1; p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; },
  },
  {
    id: 'windWalker',
    name: '风行者',
    icon: '💨',
    classes: ['ranger'],
    minDifficulty: 3,
    desc: '速度 +12% · 攻速 +10%',
    apply: (p) => { p.speed *= 1.12; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; },
  },
  {
    id: 'hunterMark',
    name: '猎人印记',
    icon: '🏹',
    classes: ['ranger'],
    minDifficulty: 5,
    desc: '伤害 +12% · 暴击 +5%',
    apply: (p) => { p.damageMult *= 1.12; p.critChance += 0.05; },
  },
  {
    id: 'soulLink',
    name: '灵魂链接',
    icon: '🔗',
    classes: ['summoner'],
    minDifficulty: 0,
    desc: '召唤物伤害 +20%',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.2; },
  },
  {
    id: 'packMaster',
    name: '兽群统领',
    icon: '🐾',
    classes: ['summoner'],
    minDifficulty: 3,
    desc: '召唤伤害 +15% · 拾取 +15%',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.15; p.pickupRange *= 1.15; },
  },
  {
    id: 'ritualPower',
    name: '仪式增幅',
    icon: '📿',
    classes: ['summoner'],
    minDifficulty: 5,
    desc: '召唤伤害 +18% · 自身伤害 +8%',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.18; p.damageMult *= 1.08; },
  },
];

function getClassWeaponPool(charId) {
  const ids = [];
  for (const id of Object.keys(WEAPONS)) {
    const w = WEAPONS[id];
    if (w.classes) {
      if (w.classes.includes(charId)) ids.push(id);
    } else if ((CLASS_WEAPON_PREFERENCES[charId] || []).includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

function getClassUpgradesForDifficulty(charId, level) {
  const lv = clampDifficultyLevel(level);
  const pools = getUpgradesForDifficulty(lv);
  return {
    stat: pools.stat,
    attack: pools.attack,
    classAttack: CLASS_ATTACK_UPGRADES.filter(
      u => u.classes.includes(charId) && (u.minDifficulty ?? 0) <= lv
    ),
  };
}

function getCharacterLabel(charId) {
  return CHARACTERS[charId]?.name || charId;
}

const ENEMIES = {
  slime: {
    name: '史莱姆',
    hp: 15,
    speed: 60,
    damage: 5,
    radius: 14,
    xp: 3,
    gold: 2,
    color: '#6bcb77',
  },
  bat: {
    name: '蝙蝠',
    hp: 8,
    speed: 130,
    damage: 3,
    radius: 10,
    xp: 2,
    gold: 2,
    color: '#a29bfe',
  },
  skeleton: {
    name: '骷髅',
    hp: 30,
    speed: 45,
    damage: 8,
    radius: 16,
    xp: 5,
    gold: 3,
    color: '#dfe6e9',
  },
  brute: {
    name: '蛮兽',
    hp: 80,
    speed: 35,
    damage: 15,
    radius: 22,
    xp: 12,
    gold: 8,
    color: '#e17055',
  },
  goblin: {
    name: '哥布林',
    hp: 10,
    speed: 95,
    damage: 4,
    radius: 11,
    xp: 2,
    gold: 2,
    color: '#55efc4',
    behavior: 'zigzag',
  },
  zombie: {
    name: '僵尸',
    hp: 45,
    speed: 28,
    damage: 10,
    radius: 17,
    xp: 6,
    gold: 3,
    color: '#636e72',
    behavior: 'chase',
  },
  ghost: {
    name: '幽灵',
    hp: 12,
    speed: 105,
    damage: 5,
    radius: 12,
    xp: 4,
    gold: 3,
    color: '#74b9ff',
    behavior: 'ghost',
    alpha: 0.7,
  },
  mage: {
    name: '邪法师',
    hp: 28,
    speed: 38,
    damage: 6,
    radius: 14,
    xp: 8,
    gold: 4,
    color: '#a29bfe',
    behavior: 'ranged',
    shootRange: 260,
    shootCd: 1.6,
    projSpeed: 240,
  },
  exploder: {
    name: '爆弹怪',
    hp: 20,
    speed: 88,
    damage: 6,
    radius: 13,
    xp: 5,
    gold: 3,
    color: '#fdcb6e',
    behavior: 'chase',
    explodeRadius: 75,
    explodeDamage: 22,
  },
  charger: {
    name: '冲锋兽',
    hp: 38,
    speed: 48,
    damage: 14,
    radius: 16,
    xp: 7,
    gold: 3,
    color: '#e84393',
    behavior: 'charger',
    chargeSpeed: 300,
    chargeCd: 2.8,
  },
  splitter: {
    name: '分裂怪',
    hp: 24,
    speed: 52,
    damage: 6,
    radius: 15,
    xp: 5,
    gold: 2,
    color: '#00b894',
    behavior: 'chase',
    splitCount: 2,
  },
  miniSlime: {
    name: '小史莱姆',
    hp: 8,
    speed: 72,
    damage: 3,
    radius: 9,
    xp: 1,
    gold: 1,
    color: '#6bcb77',
    behavior: 'chase',
  },
  spider: {
    name: '毒蜘蛛',
    hp: 14,
    speed: 78,
    damage: 5,
    radius: 12,
    xp: 3,
    gold: 2,
    color: '#2d1b4e',
    behavior: 'zigzag',
  },
  fly: {
    name: '腐蝇',
    hp: 6,
    speed: 120,
    damage: 3,
    radius: 8,
    xp: 2,
    gold: 2,
    color: '#2ecc71',
    behavior: 'ghost',
    alpha: 0.85,
  },
  maggot: {
    name: '蛆虫',
    hp: 10,
    speed: 42,
    damage: 4,
    radius: 9,
    xp: 2,
    gold: 2,
    color: '#dfe6e9',
    behavior: 'chase',
  },
  eye: {
    name: '魔眼',
    hp: 18,
    speed: 32,
    damage: 7,
    radius: 13,
    xp: 5,
    gold: 3,
    color: '#c0392b',
    behavior: 'ranged',
    shootRange: 220,
    shootCd: 2.0,
    projSpeed: 200,
  },
  hopper: {
    name: '跳蚤',
    hp: 16,
    speed: 65,
    damage: 7,
    radius: 11,
    xp: 4,
    gold: 2,
    color: '#8B4513',
    behavior: 'charger',
    chargeSpeed: 260,
    chargeCd: 2.0,
  },
  gaper: {
    name: '裂口者',
    hp: 32,
    speed: 52,
    damage: 9,
    radius: 15,
    xp: 6,
    gold: 3,
    color: '#e74c3c',
    behavior: 'chase',
  },
  bloater: {
    name: '肿胀尸',
    hp: 55,
    speed: 22,
    damage: 11,
    radius: 18,
    xp: 7,
    gold: 4,
    color: '#7f8c8d',
    behavior: 'chase',
  },
  eliteKnight: {
    name: '精英骑士',
    eliteIcon: '⚔',
    auraColor: '#fdcb6e',
    hp: 160,
    speed: 58,
    damage: 18,
    radius: 24,
    xp: 35,
    gold: 25,
    color: '#fdcb6e',
    isElite: true,
    behavior: 'elite',
    chargeSpeed: 280,
    chargeCd: 2.2,
    shootCd: 2.4,
    projSpeed: 300,
  },
  eliteMage: {
    name: '奥术执法者',
    eliteIcon: '🔮',
    auraColor: '#a29bfe',
    hp: 130,
    speed: 46,
    damage: 16,
    radius: 22,
    xp: 38,
    gold: 28,
    color: '#a29bfe',
    isElite: true,
    behavior: 'eliteMage',
    shootRange: 300,
    shootCd: 1.5,
    projSpeed: 280,
    novaCd: 4.5,
  },
  eliteBerserker: {
    name: '血狂战鬼',
    eliteIcon: '🩸',
    auraColor: '#ff4757',
    hp: 210,
    speed: 68,
    damage: 22,
    radius: 26,
    xp: 40,
    gold: 30,
    color: '#e84393',
    isElite: true,
    behavior: 'eliteBerserker',
    chargeSpeed: 340,
    chargeCd: 1.5,
    shootCd: 99,
  },
  elitePhantom: {
    name: '影魅刺客',
    eliteIcon: '👁',
    auraColor: '#74b9ff',
    hp: 115,
    speed: 92,
    damage: 20,
    radius: 20,
    xp: 36,
    gold: 26,
    color: '#74b9ff',
    isElite: true,
    behavior: 'elitePhantom',
    alpha: 0.82,
    dashCd: 2.0,
    dashSpeed: 400,
    dashTime: 0.32,
    chargeSpeed: 400,
  },
  eliteWarlock: {
    name: '灾厄术士',
    eliteIcon: '💀',
    auraColor: '#6c5ce7',
    hp: 145,
    speed: 42,
    damage: 17,
    radius: 23,
    xp: 37,
    gold: 27,
    color: '#6c5ce7',
    isElite: true,
    behavior: 'eliteWarlock',
    shootCd: 2.0,
    projSpeed: 240,
    summonCd: 4.8,
    summonType: 'skeleton',
    summonCount: 2,
  },
  boss: {
    name: '深渊魔王',
    bossIcon: '☠',
    auraColor: '#d63031',
    hp: 900,
    speed: 44,
    damage: 30,
    radius: 40,
    xp: 200,
    gold: 100,
    color: '#d63031',
    isBoss: true,
    behavior: 'boss',
    chargeSpeed: 340,
    shootCd: 2.0,
    projSpeed: 220,
    novaRadius: 130,
  },
  bossHydra: {
    name: '多头邪龙',
    bossIcon: '🐉',
    auraColor: '#00b894',
    hp: 780,
    speed: 48,
    damage: 26,
    radius: 38,
    xp: 210,
    gold: 95,
    color: '#00cec9',
    isBoss: true,
    behavior: 'bossHydra',
    chargeSpeed: 300,
    shootCd: 1.6,
    projSpeed: 260,
    headCount: 5,
  },
  bossTitan: {
    name: '熔岩巨神',
    bossIcon: '🔥',
    auraColor: '#e17055',
    hp: 1150,
    speed: 30,
    damage: 36,
    radius: 44,
    xp: 230,
    gold: 110,
    color: '#e17055',
    isBoss: true,
    behavior: 'bossTitan',
    chargeSpeed: 280,
    shootCd: 2.4,
    projSpeed: 200,
    novaRadius: 155,
    slamRadius: 110,
  },
};

const ELITE_TYPES = [
  'eliteKnight',
  'eliteMage',
  'eliteBerserker',
  'elitePhantom',
  'eliteWarlock',
];

const BOSS_TYPES = ['boss', 'bossHydra', 'bossTitan'];

function getRandomEliteType() {
  return randomPick(ELITE_TYPES);
}

function getRandomBossType() {
  return randomPick(BOSS_TYPES);
}

const STAT_UPGRADES = [
  { id: 'maxHp', name: '生命强化', desc: '最大生命 +15', minDifficulty: 0, apply: (p) => { p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp); } },
  { id: 'speed', name: '迅捷', desc: '移动速度 +8%', minDifficulty: 0, apply: (p) => { p.speed *= 1.08; } },
  { id: 'damage', name: '力量', desc: '伤害 +10%', minDifficulty: 0, apply: (p) => { p.damageMult *= 1.1; } },
  { id: 'armor', name: '护甲', desc: '护甲 +2', minDifficulty: 0, apply: (p) => { p.armor += 2; } },
  { id: 'pickup', name: '磁力', desc: '拾取范围 +20%', minDifficulty: 1, apply: (p) => { p.pickupRange *= 1.2; } },
  { id: 'regen', name: '再生', desc: '每秒回复 1 生命', minDifficulty: 2, apply: (p) => { p.regen += 1; } },
  { id: 'xpBoost', name: '学识', desc: '经验获取 +15%', minDifficulty: 2, apply: (p) => { p.xpMult *= 1.15; } },
  { id: 'crit', name: '暴击', desc: '暴击率 +5%', minDifficulty: 3, apply: (p) => { p.critChance += 0.05; } },
  { id: 'maxHp2', name: '坚韧', desc: '最大生命 +25', minDifficulty: 3, apply: (p) => { p.maxHp += 25; p.hp = Math.min(p.hp + 25, p.maxHp); } },
  { id: 'goldBoost', name: '贪婪', desc: '金币掉落 +20%', minDifficulty: 2, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.2; } },
  { id: 'vitality', name: '活力', desc: '最大生命 +35 · 回复 10', minDifficulty: 5, apply: (p) => { p.maxHp += 35; p.hp = Math.min(p.hp + 45, p.maxHp); } },
  { id: 'fortune', name: '鸿运', desc: '金币与经验 +18%', minDifficulty: 6, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.18; p.xpMult *= 1.18; } },
  { id: 'ascension', name: '飞升', desc: '伤害 +12% · 经验 +20%', minDifficulty: 8, apply: (p) => { p.damageMult *= 1.12; p.xpMult *= 1.2; } },
];

const ATTACK_UPGRADES = [
  { id: 'extraCast', name: '双重释放', icon: '⚡', desc: '15% 概率额外攻击一次', minDifficulty: 0, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); } },
  { id: 'attackSpeed', name: '极速', icon: '⏩', desc: '攻击速度 +12%', minDifficulty: 1, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.12; } },
  { id: 'area', name: '范围扩大', icon: '📐', desc: '攻击范围 +15%', minDifficulty: 2, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.15; } },
  { id: 'lifesteal', name: '吸血', icon: '🩸', desc: '击杀回复 2 生命', minDifficulty: 3, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 2; } },
  { id: 'extraCast2', name: '连击释放', icon: '💥', desc: '25% 概率额外攻击一次', minDifficulty: 4, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.25); } },
  { id: 'multishot', name: '分裂弹', icon: '🔱', desc: '投射物数量 +1', minDifficulty: 5, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; } },
  { id: 'cooldown', name: '冷却缩减', icon: '❄️', desc: '全武器冷却 -8%', minDifficulty: 5, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; } },
  { id: 'execution', name: '处决', icon: '🗡️', desc: '暴击率 +8% · 伤害 +8%', minDifficulty: 6, apply: (p) => { p.critChance += 0.08; p.damageMult *= 1.08; } },
  { id: 'berserk', name: '狂怒', icon: '🔥', desc: '伤害 +18% · 攻速 +10%', minDifficulty: 7, apply: (p) => { p.damageMult *= 1.18; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; } },
  { id: 'overdrive', name: '过载', icon: '✨', desc: '额外攻击 +20% · 范围 +12%', minDifficulty: 8, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.2); p.areaMult = (p.areaMult || 1) * 1.12; } },
];

const SHOP_ITEMS = [
  { id: 'heal', icon: '🧪', name: '治疗药水', desc: '恢复 30 生命', cost: 15, minDifficulty: 0, apply: (p) => { p.hp = Math.min(p.hp + 30, p.maxHp); } },
  { id: 'armorShop', icon: '🛡️', name: '护甲片', desc: '护甲 +3', cost: 20, minDifficulty: 0, apply: (p) => { p.armor += 3; } },
  { id: 'maxHpShop', icon: '❤️', name: '生命上限', desc: '最大生命 +20', cost: 25, minDifficulty: 1, apply: (p) => { p.maxHp += 20; p.hp += 20; } },
  { id: 'speedShop', icon: '👟', name: '速度提升', desc: '速度 +10%', cost: 25, minDifficulty: 1, apply: (p) => { p.speed *= 1.1; } },
  { id: 'megaHeal', icon: '💊', name: '大治疗', desc: '恢复 55 生命', cost: 28, minDifficulty: 2, apply: (p) => { p.hp = Math.min(p.hp + 55, p.maxHp); } },
  { id: 'goldShop', icon: '💰', name: '招财符', desc: '金币掉落 +15%', cost: 28, minDifficulty: 2, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.15; } },
  { id: 'damageShop', icon: '⚔️', name: '伤害提升', desc: '伤害 +15%', cost: 30, minDifficulty: 2, apply: (p) => { p.damageMult *= 1.15; } },
  { id: 'lifestealShop', icon: '🩸', name: '吸血戒指', desc: '击杀回血 +2', cost: 30, minDifficulty: 3, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 2; } },
  { id: 'xpShop', icon: '📚', name: '智慧卷轴', desc: '经验获取 +20%', cost: 32, minDifficulty: 3, apply: (p) => { p.xpMult *= 1.2; } },
  { id: 'areaShop', icon: '📐', name: '范围护符', desc: '攻击范围 +12%', cost: 32, minDifficulty: 3, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.12; } },
  { id: 'attackSpeedShop', icon: '⏩', name: '攻速护符', desc: '攻击速度 +10%', cost: 35, minDifficulty: 3, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; } },
  { id: 'regenShop', icon: '💚', name: '再生护符', desc: '每秒回复 +1 生命', cost: 35, minDifficulty: 3, apply: (p) => { p.regen += 1; } },
  { id: 'extraCastShop', icon: '⚡', name: '双重释放', desc: '额外攻击 +10%', cost: 40, minDifficulty: 4, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.1); } },
  { id: 'critShop', icon: '🎯', name: '暴击护符', desc: '暴击率 +8%', cost: 42, minDifficulty: 4, apply: (p) => { p.critChance += 0.08; } },
  { id: 'pickupShop', icon: '🧲', name: '强磁护符', desc: '拾取范围 +25%', cost: 38, minDifficulty: 4, apply: (p) => { p.pickupRange *= 1.25; } },
  { id: 'extraCastShop2', icon: '💥', name: '连击释放', desc: '额外攻击 +15%', cost: 55, minDifficulty: 5, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); } },
  { id: 'multishotShop', icon: '🔱', name: '分裂核心', desc: '投射物数量 +1', cost: 60, minDifficulty: 5, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; } },
  { id: 'cooldownShop', icon: '❄️', name: '冷却水晶', desc: '攻击速度 +15%', cost: 58, minDifficulty: 5, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.15; } },
  { id: 'fortuneShop', icon: '🍀', name: '幸运宝箱', desc: '金币与经验 +15%', cost: 65, minDifficulty: 6, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.15; p.xpMult *= 1.15; } },
  { id: 'vampShop', icon: '🦇', name: '吸血鬼之牙', desc: '击杀回血 +4', cost: 68, minDifficulty: 6, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 4; } },
  { id: 'legendArmor', icon: '🏰', name: '传奇护甲', desc: '护甲 +8 · 生命 +30', cost: 78, minDifficulty: 7, apply: (p) => { p.armor += 8; p.maxHp += 30; p.hp += 30; } },
  { id: 'legendBlade', icon: '👑', name: '王者之刃', desc: '伤害 +22% · 暴击 +5%', cost: 88, minDifficulty: 7, apply: (p) => { p.damageMult *= 1.22; p.critChance += 0.05; } },
  { id: 'relicShop', icon: '💎', name: '远古圣物', desc: '全属性小幅强化', cost: 95, minDifficulty: 8, apply: (p) => { p.damageMult *= 1.1; p.speed *= 1.08; p.maxHp += 25; p.hp += 25; p.armor += 2; } },
  { id: 'overdriveShop', icon: '✨', name: '过载模块', desc: '额外攻击 +18% · 范围 +10%', cost: 92, minDifficulty: 8, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.18); p.areaMult = (p.areaMult || 1) * 1.1; } },
];

const SHOP_OFFER_COUNT = 4;

function getUpgradesForDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  return {
    stat: STAT_UPGRADES.filter(u => (u.minDifficulty ?? 0) <= lv),
    attack: ATTACK_UPGRADES.filter(u => (u.minDifficulty ?? 0) <= lv),
  };
}

function getShopPoolForDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  return SHOP_ITEMS.filter(i => (i.minDifficulty ?? 0) <= lv);
}

function countEnemyTypesForDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  return ENEMY_SPAWN_POOL.filter(p => (p.minDifficulty ?? 0) <= lv).length;
}

function countRewardTypesForDifficulty(level) {
  const shop = getShopPoolForDifficulty(level).length;
  const ups = getUpgradesForDifficulty(level);
  const pickupKinds = 2 + Math.min(3, Math.floor(level / 2));
  return shop + ups.stat.length + ups.attack.length + pickupKinds;
}

function generateShopOffers(count = SHOP_OFFER_COUNT, difficultyLevel = 2) {
  const pool = getShopPoolForDifficulty(difficultyLevel).map(item => ({ ...item, sold: false }));
  const offers = [];

  const budgetPool = pool.filter(i => i.cost <= 22);
  if (budgetPool.length > 0) {
    const budgetPick = randomPick(budgetPool);
    pool.splice(pool.indexOf(budgetPick), 1);
    offers.push({ ...budgetPick, sold: false });
  }

  if (difficultyLevel >= 5) {
    const rarePool = pool.filter(i => (i.minDifficulty ?? 0) >= 5);
    if (rarePool.length > 0 && !offers.some(o => (o.minDifficulty ?? 0) >= 5)) {
      const rarePick = randomPick(rarePool);
      pool.splice(pool.indexOf(rarePick), 1);
      offers.push({ ...rarePick, sold: false });
    }
  }

  while (offers.length < count && pool.length > 0) {
    const pick = randomPick(pool);
    pool.splice(pool.indexOf(pick), 1);
    offers.push({ ...pick, sold: false });
  }
  return offers;
}

const WAVE_DURATION = 30;
const TOTAL_WAVES = 10;
const GOLD_DROP_CHANCE = 0.52;
const WAVE_GOLD_BONUS = 10;

const MIN_DIFFICULTY = 2;
const MAX_DIFFICULTY = 8;

const DIFFICULTY_LABELS = {
  2: '普通',
  3: '困难',
  4: '挑战',
  5: '残酷',
  6: '噩梦',
  7: '深渊',
  8: '炼狱',
};

function clampDifficultyLevel(level) {
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, Math.floor(level ?? MIN_DIFFICULTY)));
}

const DIFFICULTIES = (function buildDifficulties() {
  const map = {};
  for (let i = MIN_DIFFICULTY; i <= MAX_DIFFICULTY; i++) {
    const t = i / 8;
    map[i] = {
      level: i,
      name: `难度 ${i}`,
      label: DIFFICULTY_LABELS[i],
      desc: i === MIN_DIFFICULTY ? '标准体验，从此难度开始'
        : i === MAX_DIFFICULTY ? '海量强敌，高回报高栏位商店'
        : `敌人强化 ${Math.round(t * 100)}% · 奖励 ${Math.round((0.85 + t * 0.65) * 100)}%`,
      hpMult: 0.7 + t * 1.4,
      dmgMult: 0.7 + t * 1.15,
      speedMult: 0.85 + t * 0.4,
      countMult: 0.75 + t * 1.1,
      spawnRateMult: 1.3 - t * 0.65,
      maxEnemyMult: 0.8 + t * 0.6,
      rewardMult: 0.85 + t * 0.65,
      shopSlots: Math.min(6, 3 + Math.floor(i / 2)),
      enemyWaveShift: Math.round(2 - t * 5),
    };
  }
  return map;
})();

function getDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  const d = DIFFICULTIES[lv];
  return {
    ...d,
    enemyTypeCount: countEnemyTypesForDifficulty(lv),
    rewardTypeCount: countRewardTypesForDifficulty(lv),
  };
}

const ENEMY_SPAWN_POOL = [
  { type: 'slime', weight: 28, minWave: 1, minDifficulty: 0 },
  { type: 'goblin', weight: 24, minWave: 1, minDifficulty: 0 },
  { type: 'maggot', weight: 18, minWave: 2, minDifficulty: 0 },
  { type: 'fly', weight: 16, minWave: 2, minDifficulty: 0 },
  { type: 'spider', weight: 16, minWave: 2, minDifficulty: 1 },
  { type: 'bat', weight: 18, minWave: 2, minDifficulty: 1 },
  { type: 'zombie', weight: 16, minWave: 3, minDifficulty: 2 },
  { type: 'ghost', weight: 12, minWave: 4, minDifficulty: 3 },
  { type: 'eye', weight: 10, minWave: 4, minDifficulty: 3 },
  { type: 'splitter', weight: 10, minWave: 4, minDifficulty: 4 },
  { type: 'bloater', weight: 10, minWave: 5, minDifficulty: 4 },
  { type: 'exploder', weight: 10, minWave: 5, minDifficulty: 5 },
  { type: 'skeleton', weight: 14, minWave: 5, minDifficulty: 5 },
  { type: 'hopper', weight: 10, minWave: 5, minDifficulty: 5 },
  { type: 'gaper', weight: 10, minWave: 6, minDifficulty: 6 },
  { type: 'mage', weight: 9, minWave: 6, minDifficulty: 6 },
  { type: 'charger', weight: 10, minWave: 7, minDifficulty: 7 },
  { type: 'brute', weight: 8, minWave: 8, minDifficulty: 8 },
];
