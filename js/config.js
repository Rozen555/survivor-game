const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

const ANCHOR_CONFIG = {
  deployRadius: 90,
  driftDamageMult: 0.35,
  driftAreaMult: 0.78,
  driftAttackSpeedMult: 0.82,
  anchoredDamageMult: 1,
  anchoredAreaMult: 1,
  anchoredAttackSpeedMult: 1.08,
  anchoredRegen: 2.5,
  haulSpeedMult: 1.38,
  haulDuration: 1.8,
  haulCooldown: 2.8,
  haulInvincible: 0.28,
  pullStrength: 38,
  ghostAnchorMax: 2,
  ghostLife: 8,
  deployPulseRadius: 118,
  chainSlowMult: 0.65,
  chainHitWidth: 15,
  chainLinkSpacing: 14,
};

const ANCHOR_TYPES = {
  iron: {
    id: 'iron',
    name: '铁锚',
    icon: '⚓',
    armorBonus: 2,
    regenBonus: 0.8,
    damageMult: 1,
    areaMult: 1.08,
  },
  thunder: {
    id: 'thunder',
    name: '雷锚',
    icon: '⚡',
    deployPulseDamage: 22,
    pulseRadius: 100,
    stormDps: 10,
    stormTick: 0.3,
    stormSlow: 0.72,
    damageMult: 1,
    areaMult: 1.38,
  },
  magnet: {
    id: 'magnet',
    name: '磁锚',
    icon: '🧲',
    pickupMult: 1.55,
    towerDamage: 22,
    towerDamagePerLevel: 1.75,
    towerRange: 290,
    towerShootCd: 0.56,
    towerProjSpeed: 520,
    damageMult: 1,
    areaMult: 1.25,
  },
  spirit: {
    id: 'spirit',
    name: '灵锚',
    icon: '👻',
    summonBoost: 1.22,
    summonFrenzySpeed: 1.4,
    damageMult: 1,
    areaMult: 1.28,
  },
};

const CHARACTERS = {
  warrior: {
    name: '战士',
    maxHp: 120,
    speed: 205,
    damage: 1.02,
    armor: 1,
    startWeapon: 'whip',
    anchorType: 'iron',
    color: '#ff6b6b',
  },
  mage: {
    name: '法师',
    maxHp: 95,
    speed: 200,
    damage: 1.4,
    armor: 0,
    startWeapon: 'magic',
    anchorType: 'thunder',
    color: '#70a1ff',
  },
  ranger: {
    name: '游侠',
    maxHp: 105,
    speed: 260,
    damage: 1.0,
    armor: 1,
    startWeapon: 'knife',
    anchorType: 'magnet',
    color: '#6bcb77',
  },
  summoner: {
    name: '召唤师',
    maxHp: 100,
    speed: 195,
    damage: 0.92,
    summonDamageMult: 1.12,
    armor: 0,
    startSummon: 'turret',
    anchorType: 'spirit',
    color: '#a29bfe',
  },
};

const SUMMON_TYPES = {
  turret: {
    name: '魔法炮塔',
    icon: '🗼',
    desc: '部署炮塔，自动射击敌人',
    behavior: 'turret',
    hp: 115,
    damage: 19,
    range: 320,
    shootCd: 0.82,
    radius: 14,
    color: '#74b9ff',
    projColor: '#a29bfe',
  },
  boar: {
    name: '野猪',
    icon: '🐗',
    desc: '快速冲锋，撞击敌人',
    behavior: 'charger',
    hp: 85,
    damage: 13,
    speed: 132,
    chargeSpeed: 265,
    chargeCd: 1.9,
    radius: 13,
    color: '#8B4513',
    attackRange: 32,
  },
  wolf: {
    name: '野狼',
    icon: '🐺',
    desc: '高速撕咬最近敌人',
    behavior: 'melee',
    hp: 62,
    damage: 15,
    speed: 182,
    radius: 12,
    color: '#636e72',
    attackRange: 26,
    attackCd: 0.5,
  },
  bear: {
    name: '棕熊',
    icon: '🐻',
    desc: '高生命近战，重击敌人',
    behavior: 'melee',
    hp: 170,
    damage: 28,
    speed: 94,
    radius: 20,
    color: '#6d4c41',
    attackRange: 32,
    attackCd: 0.86,
  },
  mammoth: {
    name: '猛犸象',
    icon: '🦣',
    desc: '践踏周围，造成范围伤害',
    behavior: 'stomp',
    hp: 275,
    damage: 36,
    speed: 62,
    radius: 28,
    color: '#b2bec3',
    attackRange: 44,
    attackCd: 1.28,
    aoeRadius: 62,
  },
  eagle: {
    name: '猎鹰',
    icon: '🦅',
    desc: '盘旋俯冲，远程打击',
    behavior: 'ranged',
    hp: 50,
    damage: 14,
    speed: 168,
    radius: 11,
    color: '#e17055',
    shootRange: 280,
    shootCd: 0.95,
    projSpeed: 360,
    projColor: '#fab1a0',
  },
  golem: {
    name: '石魔',
    icon: '🗿',
    desc: '岩体坦克，重拳近身',
    behavior: 'melee',
    hp: 240,
    damage: 24,
    speed: 72,
    radius: 18,
    color: '#7f8c8d',
    attackRange: 34,
    attackCd: 1.05,
  },
  imp: {
    name: '小恶魔',
    icon: '👿',
    desc: '快速投掷地狱火球',
    behavior: 'ranged',
    hp: 44,
    damage: 13,
    speed: 140,
    radius: 11,
    color: '#6c5ce7',
    shootRange: 250,
    shootCd: 0.62,
    projSpeed: 380,
    projColor: '#a29bfe',
  },
  spider: {
    name: '魔蛛',
    icon: '🕷️',
    desc: '撕咬并减速敌人',
    behavior: 'melee',
    hp: 58,
    damage: 14,
    speed: 148,
    radius: 11,
    color: '#2d3436',
    attackRange: 24,
    attackCd: 0.55,
    slowOnHit: 1.8,
  },
  wisp: {
    name: '星灵',
    icon: '✨',
    desc: '飘浮释放连锁闪电',
    behavior: 'chain',
    hp: 46,
    damage: 16,
    radius: 10,
    color: '#ffeaa7',
    chainRange: 260,
    chainCd: 1.1,
    chainBounces: 2,
    chainJump: 115,
  },
  scorpion: {
    name: '毒蝎',
    icon: '🦂',
    desc: '尾刺扫击周围敌人',
    behavior: 'stomp',
    hp: 72,
    damage: 18,
    speed: 110,
    radius: 14,
    color: '#00b894',
    attackRange: 36,
    attackCd: 0.95,
    aoeRadius: 42,
  },
  skeleton: {
    name: '骷髅兵',
    icon: '💀',
    desc: '不死仆从，均衡近战',
    behavior: 'melee',
    hp: 78,
    damage: 17,
    speed: 128,
    radius: 13,
    color: '#dfe6e9',
    attackRange: 28,
    attackCd: 0.72,
  },
  dragon: {
    name: '火龙',
    icon: '🐉',
    desc: '集齐7种召唤后解锁 · 烈焰焚敌',
    behavior: 'dragon',
    isUltimate: true,
    unlockMinTypes: 7,
    hp: 620,
    damage: 82,
    speed: 128,
    radius: 30,
    color: '#d63031',
    wingColor: '#e17055',
    fireColor: '#ff7675',
    coreColor: '#fdcb6e',
    leash: 320,
    breathRange: 260,
    breathCd: 0.76,
    breathArc: 0.58,
    stompCd: 1.4,
    aoeRadius: 96,
    shootCd: 0.88,
    projSpeed: 420,
    projColor: '#ff7675',
    projAoe: 58,
  },
};

const DRAGON_UNLOCK_SUMMON_TYPES = 7;

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

function rollSummonerStarterBonus(excludeId = 'turret') {
  const pool = Object.keys(SUMMON_TYPES).filter(id => id !== 'dragon' && id !== excludeId);
  return pool.length ? randomPick(pool) : null;
}

const WEAPONS = {
  whip: {
    id: 'whip',
    name: '鞭刃',
    icon: '🌀',
    type: 'melee',
    damage: 11,
    cooldown: 0.85,
    range: 90,
    arc: Math.PI * 0.52,
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
  seekerBolt: {
    id: 'seekerBolt',
    name: '追踪弹',
    icon: '🎯',
    type: 'projectile',
    damage: 7,
    cooldown: 0.48,
    speed: 380,
    count: 2,
    homing: true,
    color: '#ffeaa7',
    sprite: 'weapon_magic',
    desc: '双发追踪弹幕',
  },
  shockRing: {
    id: 'shockRing',
    name: '震击环',
    icon: '💫',
    type: 'nova',
    damage: 12,
    cooldown: 1.75,
    radius: 98,
    color: '#a29bfe',
    desc: '周期性释放冲击波',
  },
  bladeDance: {
    id: 'bladeDance',
    name: '刃舞',
    icon: '🗡️',
    type: 'orbit',
    damage: 8,
    cooldown: 0,
    count: 4,
    radius: 54,
    orbitSpeed: 3.4,
    ballRadius: 10,
    color: '#dfe6e9',
    sprite: 'weapon_knife',
    desc: '四把旋转飞刃',
  },
  scatterShot: {
    id: 'scatterShot',
    name: '散射弹',
    icon: '💠',
    type: 'cross',
    damage: 7,
    cooldown: 1.05,
    speed: 400,
    color: '#81ecec',
    desc: '四向散射弹幕',
  },
  bombRain: {
    id: 'bombRain',
    name: '炸弹雨',
    icon: '💣',
    type: 'rain',
    damage: 10,
    cooldown: 2.4,
    count: 4,
    strikeRadius: 32,
    color: '#fdcb6e',
    desc: '随机轰炸区域',
  },
  ricochetAxe: {
    id: 'ricochetAxe',
    name: '弹跳斧',
    icon: '🪓',
    type: 'boomerang',
    damage: 11,
    cooldown: 0.88,
    speed: 430,
    maxRange: 145,
    pierce: 12,
    color: '#636e72',
    sprite: 'weapon_axe',
    desc: '高速穿透回旋斧',
  },
  pulseLaser: {
    id: 'pulseLaser',
    name: '脉冲激光',
    icon: '🔴',
    type: 'instant',
    damage: 9,
    cooldown: 0.65,
    range: 260,
    chains: 2,
    color: '#ff7675',
    desc: '快速连锁激光',
  },
};

const CLASS_WEAPON_PREFERENCES = {
  warrior: ['whip', 'axe', 'holy', 'orbit', 'shockRing', 'bladeDance', 'ricochetAxe', 'lightning'],
  mage: ['magic', 'fireball', 'lightning', 'drone', 'rain', 'seekerBolt', 'shockRing', 'bombRain', 'pulseLaser'],
  ranger: ['knife', 'cross', 'rain', 'axe', 'scatterShot', 'seekerBolt', 'drone', 'fireball'],
  summoner: ['spiritBolt', 'hexOrb', 'seekerBolt', 'shockRing'],
};

const CLASS_ATTACK_UPGRADES = [
  {
    id: 'battleFury',
    name: '战意沸腾',
    icon: '⚔️',
    classes: ['warrior'],
    minDifficulty: 0,
    desc: '攻击范围 +10% · 护甲 +2',
    apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.1; p.armor += 2; },
  },
  {
    id: 'ironWill',
    name: '钢铁意志',
    icon: '🛡️',
    classes: ['warrior'],
    minDifficulty: 2,
    desc: '生命 +20 · 伤害 +8%',
    apply: (p) => { p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp); p.damageMult *= 1.08; },
  },
  {
    id: 'lastStand',
    name: '背水一战',
    icon: '🔥',
    classes: ['warrior'],
    minDifficulty: 5,
    desc: '伤害 +12% · 击杀回血 +2',
    apply: (p) => { p.damageMult *= 1.12; p.lifesteal = (p.lifesteal || 0) + 2; },
  },
  {
    id: 'veteranGuard',
    name: '老兵架势',
    icon: '🪖',
    classes: ['warrior'],
    minDifficulty: 1,
    desc: '护甲 +1 · 生命 +10',
    apply: (p) => { p.armor += 1; p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); },
  },
  {
    id: 'shieldMaster',
    name: '盾墙大师',
    icon: '🏰',
    classes: ['warrior'],
    minDifficulty: 2,
    desc: '护甲 +3 · 生命 +15',
    apply: (p) => { p.armor += 3; p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp); },
  },
  {
    id: 'colossus',
    name: '巨人之力',
    icon: '🗿',
    classes: ['warrior'],
    minDifficulty: 4,
    desc: '伤害 +10% · 范围 +8%',
    apply: (p) => { p.damageMult *= 1.1; p.areaMult = (p.areaMult || 1) * 1.08; },
  },
  {
    id: 'bloodRage',
    name: '嗜血狂怒',
    icon: '🩸',
    classes: ['warrior'],
    minDifficulty: 6,
    desc: '攻速 +12% · 吸血 +2',
    apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.12; p.lifesteal = (p.lifesteal || 0) + 2; },
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
    minDifficulty: 2,
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
    id: 'sparkBolt',
    name: '火花弹',
    icon: '⚡',
    classes: ['mage'],
    minDifficulty: 1,
    desc: '伤害 +8% · 攻速 +6%',
    apply: (p) => { p.damageMult *= 1.08; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.06; },
  },
  {
    id: 'frostArmor',
    name: '霜甲术',
    icon: '❄️',
    classes: ['mage'],
    minDifficulty: 2,
    desc: '护甲 +3 · 范围 +12%',
    apply: (p) => { p.armor += 3; p.areaMult = (p.areaMult || 1) * 1.12; },
  },
  {
    id: 'arcaneBattery',
    name: '奥术电池',
    icon: '🔋',
    classes: ['mage'],
    minDifficulty: 4,
    desc: '投射物 +1 · 伤害 +8%',
    apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.damageMult *= 1.08; },
  },
  {
    id: 'voidConduit',
    name: '虚空传导',
    icon: '🌌',
    classes: ['mage'],
    minDifficulty: 6,
    desc: '伤害 +16% · 额外施法 +10%',
    apply: (p) => { p.damageMult *= 1.16; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.1); },
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
    minDifficulty: 2,
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
    id: 'steadyAim',
    name: '稳准瞄准',
    icon: '🎯',
    classes: ['ranger'],
    minDifficulty: 1,
    desc: '暴击 +6% · 范围 +8%',
    apply: (p) => { p.critChance += 0.06; p.areaMult = (p.areaMult || 1) * 1.08; },
  },
  {
    id: 'poisonTip',
    name: '淬毒箭矢',
    icon: '🧪',
    classes: ['ranger'],
    minDifficulty: 2,
    desc: '伤害 +10% · 攻速 +8%',
    apply: (p) => { p.damageMult *= 1.1; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; },
  },
  {
    id: 'arrowStorm',
    name: '箭雨风暴',
    icon: '🌧️',
    classes: ['ranger'],
    minDifficulty: 4,
    desc: '投射物 +1 · 范围 +10%',
    apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.areaMult = (p.areaMult || 1) * 1.1; },
  },
  {
    id: 'deadeye',
    name: '死神之眼',
    icon: '👁️',
    classes: ['ranger'],
    minDifficulty: 6,
    desc: '暴击 +12% · 额外攻击 +12%',
    apply: (p) => { p.critChance += 0.12; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.12); },
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
    minDifficulty: 2,
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
  {
    id: 'minorPact',
    name: '小契约',
    icon: '📜',
    classes: ['summoner'],
    minDifficulty: 1,
    desc: '召唤伤害 +12% · 伤害 +5%',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.12; p.damageMult *= 1.05; },
  },
  {
    id: 'pactDepth',
    name: '深渊契约',
    icon: '🕯️',
    classes: ['summoner'],
    minDifficulty: 2,
    desc: '召唤伤害 +15% · 再生 +1',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.15; p.regen += 1; },
  },
  {
    id: 'swarmMind',
    name: '群兽之心',
    icon: '🐾',
    classes: ['summoner'],
    minDifficulty: 4,
    desc: '召唤伤害 +12% · 拾取 +20%',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.12; p.pickupRange *= 1.2; },
  },
  {
    id: 'elderBinding',
    name: '远古束缚',
    icon: '⛓️',
    classes: ['summoner'],
    minDifficulty: 6,
    desc: '召唤伤害 +20% · 护甲 +3',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.2; p.armor += 3; },
  },
  {
    id: 'spiritCrown',
    name: '灵王冠冕',
    icon: '👑',
    classes: ['summoner'],
    minDifficulty: 7,
    desc: '召唤伤害 +15% · 伤害 +10%',
    apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.15; p.damageMult *= 1.1; },
  },
  {
    id: 'ironAnchorWall',
    name: '铁锚壁垒',
    icon: '⚓',
    classes: ['warrior'],
    minDifficulty: 1,
    desc: '锚定护甲 +2 · 锚定回血 +0.6/s',
    apply: (p) => {
      p.anchorArmorBonus = (p.anchorArmorBonus || 0) + 2;
      p.anchorRegenFlat = (p.anchorRegenFlat || 0) + 0.6;
    },
  },
  {
    id: 'ironAnchorCrush',
    name: '重锚镇压',
    icon: '🔗',
    classes: ['warrior'],
    minDifficulty: 3,
    desc: '锚区 +15% · 拉拽 +20% · 锚伤 +10%',
    apply: (p) => {
      p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.15;
      p.anchorPullMult = (p.anchorPullMult || 1) * 1.2;
      p.anchorDamageBonus = (p.anchorDamageBonus || 1) * 1.1;
    },
  },
  {
    id: 'ironUnbreakable',
    name: '不灭铁链',
    icon: '🛡️',
    classes: ['warrior'],
    minDifficulty: 5,
    desc: '锚定护甲 +3 · 收锚无敌 +0.12s',
    apply: (p) => {
      p.anchorArmorBonus = (p.anchorArmorBonus || 0) + 3;
      p.haulInvincibleBonus = (p.haulInvincibleBonus || 0) + 0.12;
    },
  },
  {
    id: 'thunderStormCore',
    name: '雷暴核心',
    icon: '⚡',
    classes: ['mage'],
    minDifficulty: 1,
    desc: '雷暴/脉冲伤害 +22%',
    apply: (p) => { p.stormDamageMult = (p.stormDamageMult || 1) * 1.22; },
  },
  {
    id: 'thunderFieldAmp',
    name: '引雷领域',
    icon: '⛈️',
    classes: ['mage'],
    minDifficulty: 3,
    desc: '锚区 +12% · 雷暴频率 +18%',
    apply: (p) => {
      p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.12;
      p.stormTickMult = (p.stormTickMult || 1) * 1.18;
    },
  },
  {
    id: 'thunderCataclysm',
    name: '万钧雷劫',
    icon: '🌩️',
    classes: ['mage'],
    minDifficulty: 5,
    desc: '雷暴伤害 +20% · 拉拽 +18%',
    apply: (p) => {
      p.stormDamageMult = (p.stormDamageMult || 1) * 1.2;
      p.anchorPullMult = (p.anchorPullMult || 1) * 1.18;
    },
  },
  {
    id: 'towerForge',
    name: '箭塔锻造',
    icon: '🏹',
    classes: ['ranger'],
    minDifficulty: 1,
    desc: '箭塔伤害 +25%',
    apply: (p) => { p.towerDamageMult = (p.towerDamageMult || 1) * 1.25; },
  },
  {
    id: 'magnetHarvest',
    name: '磁锚猎场',
    icon: '🧲',
    classes: ['ranger'],
    minDifficulty: 3,
    desc: '锚定拾取 +30% · 箭塔射程 +15%',
    apply: (p) => {
      p.anchorPickupMultBonus = (p.anchorPickupMultBonus || 1) * 1.3;
      p.towerRangeMult = (p.towerRangeMult || 1) * 1.15;
    },
  },
  {
    id: 'towerBarrage',
    name: '连射箭塔',
    icon: '🎯',
    classes: ['ranger'],
    minDifficulty: 5,
    desc: '箭塔伤害 +15% · 射速 +20%',
    apply: (p) => {
      p.towerDamageMult = (p.towerDamageMult || 1) * 1.15;
      p.towerSpeedMult = (p.towerSpeedMult || 1) * 1.2;
    },
  },
  {
    id: 'spiritAnchorPact',
    name: '缚灵深契',
    icon: '👻',
    classes: ['summoner'],
    minDifficulty: 1,
    desc: '锚定召唤伤害 +18% · 狂暴 +12%',
    apply: (p) => {
      p.summonBoostMult = (p.summonBoostMult || 1) * 1.18;
      p.summonFrenzyMult = (p.summonFrenzyMult || 1) * 1.12;
    },
  },
  {
    id: 'spiritNexus',
    name: '魂潮阵眼',
    icon: '🌀',
    classes: ['summoner'],
    minDifficulty: 3,
    desc: '锚区 +10% · 召唤狂暴 +20%',
    apply: (p) => {
      p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.1;
      p.summonFrenzyMult = (p.summonFrenzyMult || 1) * 1.2;
    },
  },
  {
    id: 'spiritRampage',
    name: '魂潮狂怒',
    icon: '💢',
    classes: ['summoner'],
    minDifficulty: 5,
    desc: '锚定伤害 +12% · 召唤伤害 +15%',
    apply: (p) => {
      p.anchorDamageBonus = (p.anchorDamageBonus || 1) * 1.12;
      p.summonBoostMult = (p.summonBoostMult || 1) * 1.15;
    },
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
    hp: 28,
    speed: 60,
    damage: 5,
    radius: 14,
    xp: 3,
    gold: 2,
    color: '#6bcb77',
  },
  bat: {
    name: '蝙蝠',
    hp: 18,
    speed: 130,
    damage: 3,
    radius: 10,
    xp: 2,
    gold: 2,
    color: '#a29bfe',
  },
  skeleton: {
    name: '骷髅',
    hp: 42,
    speed: 45,
    damage: 8,
    radius: 16,
    xp: 5,
    gold: 3,
    color: '#dfe6e9',
  },
  brute: {
    name: '蛮兽',
    hp: 95,
    speed: 35,
    damage: 15,
    radius: 22,
    xp: 12,
    gold: 8,
    color: '#e17055',
  },
  goblin: {
    name: '哥布林',
    hp: 22,
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
    hp: 58,
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
    hp: 24,
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
    hp: 40,
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
    hp: 32,
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
    hp: 50,
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
    hp: 36,
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
    hp: 16,
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
    hp: 26,
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
    hp: 14,
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
    hp: 20,
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
    hp: 30,
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
    hp: 28,
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
    hp: 44,
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
    hp: 68,
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
    hp: 410,
    speed: 62,
    damage: 20,
    radius: 24,
    xp: 35,
    gold: 25,
    color: '#fdcb6e',
    isElite: true,
    behavior: 'elite',
    chargeSpeed: 360,
    chargeCd: 1.7,
    shootCd: 1.9,
    projSpeed: 330,
  },
  eliteMage: {
    name: '奥术执法者',
    eliteIcon: '🔮',
    auraColor: '#a29bfe',
    hp: 340,
    speed: 50,
    damage: 18,
    radius: 22,
    xp: 38,
    gold: 28,
    color: '#a29bfe',
    isElite: true,
    behavior: 'eliteMage',
    shootRange: 300,
    shootCd: 1.1,
    projSpeed: 300,
    novaCd: 3.0,
  },
  eliteBerserker: {
    name: '血狂战鬼',
    eliteIcon: '🩸',
    auraColor: '#ff4757',
    hp: 580,
    speed: 72,
    damage: 25,
    radius: 26,
    xp: 40,
    gold: 30,
    color: '#e84393',
    isElite: true,
    behavior: 'eliteBerserker',
    chargeSpeed: 420,
    chargeCd: 1.1,
    shootCd: 99,
  },
  elitePhantom: {
    name: '影魅刺客',
    eliteIcon: '👁',
    auraColor: '#74b9ff',
    hp: 300,
    speed: 98,
    damage: 22,
    radius: 20,
    xp: 36,
    gold: 26,
    color: '#74b9ff',
    isElite: true,
    behavior: 'elitePhantom',
    alpha: 0.82,
    dashCd: 1.4,
    dashSpeed: 480,
    dashTime: 0.38,
    chargeSpeed: 480,
  },
  eliteWarlock: {
    name: '灾厄术士',
    eliteIcon: '💀',
    auraColor: '#6c5ce7',
    hp: 380,
    speed: 46,
    damage: 20,
    radius: 23,
    xp: 37,
    gold: 27,
    color: '#6c5ce7',
    isElite: true,
    behavior: 'eliteWarlock',
    shootCd: 1.5,
    projSpeed: 270,
    summonCd: 3.2,
    summonType: 'skeleton',
    summonCount: 3,
  },
  boss: {
    name: '深渊魔王',
    bossIcon: '☠',
    auraColor: '#d63031',
    hp: 4200,
    speed: 58,
    damage: 48,
    radius: 42,
    xp: 200,
    gold: 100,
    color: '#d63031',
    isBoss: true,
    behavior: 'boss',
    chargeSpeed: 480,
    shootCd: 1.6,
    projSpeed: 300,
    novaRadius: 175,
  },
  bossHydra: {
    name: '多头邪龙',
    bossIcon: '🐉',
    auraColor: '#00b894',
    hp: 3900,
    speed: 60,
    damage: 45,
    radius: 40,
    xp: 210,
    gold: 95,
    color: '#00cec9',
    isBoss: true,
    behavior: 'bossHydra',
    chargeSpeed: 420,
    shootCd: 1.2,
    projSpeed: 310,
    headCount: 8,
  },
  bossTitan: {
    name: '熔岩巨神',
    bossIcon: '🔥',
    auraColor: '#e17055',
    hp: 5200,
    speed: 42,
    damage: 55,
    radius: 46,
    xp: 230,
    gold: 110,
    color: '#e17055',
    isBoss: true,
    behavior: 'bossTitan',
    chargeSpeed: 380,
    shootCd: 1.8,
    projSpeed: 260,
    novaRadius: 195,
    slamRadius: 150,
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
  { id: 'maxHp', name: '生命强化', icon: '❤️', desc: '最大生命 +15', minDifficulty: 0, apply: (p) => { p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp); } },
  { id: 'speed', name: '迅捷', icon: '👟', desc: '移动速度 +8%', minDifficulty: 0, apply: (p) => { p.speed *= 1.08; } },
  { id: 'damage', name: '力量', icon: '💪', desc: '伤害 +10%', minDifficulty: 0, apply: (p) => { p.damageMult *= 1.1; } },
  { id: 'armor', name: '护甲', icon: '🛡️', desc: '护甲 +2', minDifficulty: 0, apply: (p) => { p.armor += 2; } },
  { id: 'sturdy', name: '结实', icon: '🪵', desc: '生命 +10 · 护甲 +1', minDifficulty: 0, apply: (p) => { p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); p.armor += 1; } },
  { id: 'vitalityMinor', name: '小滋养', icon: '🍎', desc: '生命 +12 · 回复 8', minDifficulty: 0, apply: (p) => { p.maxHp += 12; p.hp = Math.min(p.hp + 20, p.maxHp); } },
  { id: 'pickup', name: '磁力', icon: '🧲', desc: '拾取范围 +20%', minDifficulty: 0, apply: (p) => { p.pickupRange *= 1.2; } },
  { id: 'warmth', name: '暖流', icon: '☀️', desc: '再生 +0.5 · 生命 +8', minDifficulty: 1, apply: (p) => { p.regen += 0.5; p.maxHp += 8; p.hp = Math.min(p.hp + 8, p.maxHp); } },
  { id: 'focus', name: '专注', icon: '🎯', desc: '伤害 +6% · 攻速 +5%', minDifficulty: 1, apply: (p) => { p.damageMult *= 1.06; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.05; } },
  { id: 'regen', name: '再生', icon: '💚', desc: '每秒回复 1 生命', minDifficulty: 1, apply: (p) => { p.regen += 1; } },
  { id: 'xpBoost', name: '学识', icon: '📚', desc: '经验获取 +15%', minDifficulty: 1, apply: (p) => { p.xpMult *= 1.15; } },
  { id: 'crit', name: '暴击', icon: '🎯', desc: '暴击率 +5%', minDifficulty: 2, apply: (p) => { p.critChance += 0.05; } },
  { id: 'maxHp2', name: '坚韧', icon: '🏋️', desc: '最大生命 +25', minDifficulty: 2, apply: (p) => { p.maxHp += 25; p.hp = Math.min(p.hp + 25, p.maxHp); } },
  { id: 'goldBoost', name: '贪婪', icon: '💰', desc: '金币掉落 +15%', minDifficulty: 2, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.15; } },
  { id: 'nimble', name: '灵巧', icon: '🦋', desc: '速度 +6% · 拾取 +12%', minDifficulty: 2, apply: (p) => { p.speed *= 1.06; p.pickupRange *= 1.12; } },
  { id: 'bulwark', name: '壁垒', icon: '🧱', desc: '护甲 +3 · 生命 +12', minDifficulty: 2, apply: (p) => { p.armor += 3; p.maxHp += 12; p.hp = Math.min(p.hp + 12, p.maxHp); } },
  { id: 'thrift', name: '勤俭', icon: '🏦', desc: '金币 +10% · 经验 +8%', minDifficulty: 2, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.1; p.xpMult *= 1.08; } },
  { id: 'might', name: '蛮力', icon: '🔨', desc: '伤害 +8% · 生命 +10', minDifficulty: 2, apply: (p) => { p.damageMult *= 1.08; p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); } },
  { id: 'scholar', name: '博学者', icon: '🎓', desc: '经验 +12% · 金币 +10%', minDifficulty: 4, apply: (p) => { p.xpMult *= 1.12; p.goldMult = (p.goldMult || 1) * 1.1; } },
  { id: 'vitality', name: '活力', icon: '🌿', desc: '最大生命 +35 · 回复 10', minDifficulty: 5, apply: (p) => { p.maxHp += 35; p.hp = Math.min(p.hp + 45, p.maxHp); } },
  { id: 'adrenaline', name: '肾上腺素', icon: '💉', desc: '速度 +10% · 攻速 +8%', minDifficulty: 4, apply: (p) => { p.speed *= 1.1; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; } },
  { id: 'fortune', name: '鸿运', icon: '🍀', desc: '金币与经验 +15%', minDifficulty: 6, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.15; p.xpMult *= 1.15; } },
  { id: 'titan', name: '泰坦之躯', icon: '🗿', desc: '生命 +40 · 护甲 +4', minDifficulty: 6, apply: (p) => { p.maxHp += 40; p.hp = Math.min(p.hp + 40, p.maxHp); p.armor += 4; } },
  { id: 'voidStep', name: '虚空步', icon: '🌀', desc: '速度 +14% · 拾取 +15%', minDifficulty: 5, apply: (p) => { p.speed *= 1.14; p.pickupRange *= 1.15; } },
  { id: 'martyr', name: '殉道者', icon: '✝️', desc: '伤害 +12% · 生命 -8', minDifficulty: 5, apply: (p) => { p.damageMult *= 1.12; p.maxHp = Math.max(20, p.maxHp - 8); p.hp = Math.min(p.hp, p.maxHp); } },
  { id: 'ascension', name: '飞升', icon: '✨', desc: '伤害 +12% · 经验 +20%', minDifficulty: 8, apply: (p) => { p.damageMult *= 1.12; p.xpMult *= 1.2; } },
  { id: 'transcend', name: '超凡', icon: '🌟', desc: '全属性 +6%', minDifficulty: 8, apply: (p) => { p.damageMult *= 1.06; p.speed *= 1.06; p.xpMult *= 1.06; p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp); } },
  { id: 'scavenger', name: '拾荒者', icon: '🎒', desc: '拾取 +18% · 金币 +8%', minDifficulty: 1, apply: (p) => { p.pickupRange *= 1.18; p.goldMult = (p.goldMult || 1) * 1.08; } },
  { id: 'momentum', name: '动量', icon: '🏃', desc: '速度 +7% · 攻速 +5%', minDifficulty: 2, apply: (p) => { p.speed *= 1.07; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.05; } },
  { id: 'resilience', name: '韧性', icon: '🧬', desc: '生命 +18 · 再生 +0.5', minDifficulty: 2, apply: (p) => { p.maxHp += 18; p.hp = Math.min(p.hp + 18, p.maxHp); p.regen += 0.5; } },
  { id: 'hoarder', name: '囤积癖', icon: '📦', desc: '金币 +12% · 经验 +10%', minDifficulty: 3, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.12; p.xpMult *= 1.1; } },
  { id: 'anchor', name: '稳如磐石', icon: '⚓', desc: '护甲 +3 · 生命 +14', minDifficulty: 3, apply: (p) => { p.armor += 3; p.maxHp += 14; p.hp = Math.min(p.hp + 14, p.maxHp); } },
  { id: 'wanderer', name: '流浪者', icon: '🧭', desc: '速度 +10% · 拾取 +10%', minDifficulty: 4, apply: (p) => { p.speed *= 1.1; p.pickupRange *= 1.1; } },
  { id: 'phoenixSpark', name: '凤凰余烬', icon: '🔥', desc: '再生 +1.5 · 生命 +10', minDifficulty: 5, apply: (p) => { p.regen += 1.5; p.maxHp += 10; p.hp = Math.min(p.hp + 10, p.maxHp); } },
  { id: 'echo', name: '回响', icon: '🔔', desc: '经验 +10% · 额外攻击 +6%', minDifficulty: 4, apply: (p) => { p.xpMult *= 1.1; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.06); } },
  { id: 'anchorWell', name: '锚泉', icon: '💧', desc: '锚定回血 +20%', minDifficulty: 0, apply: (p) => { p.anchorRegenMult = (p.anchorRegenMult || 1) * 1.2; } },
  { id: 'anchorFooting', name: '稳锚基座', icon: '🪨', desc: '锚区范围 +12%', minDifficulty: 1, apply: (p) => { p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.12; } },
  { id: 'ghostTideStat', name: '残潮印记', icon: '🌫️', desc: '幽灵锚点 +4 秒', minDifficulty: 2, apply: (p) => { p.ghostLifeBonus = (p.ghostLifeBonus || 0) + 4; } },
  { id: 'haulCharm', name: '收锚护符', icon: '🧿', desc: '收锚无敌 +0.15 秒', minDifficulty: 2, apply: (p) => { p.haulInvincibleBonus = (p.haulInvincibleBonus || 0) + 0.15; } },
  { id: 'anchorSanctuary', name: '锚域庇护', icon: '🏝️', desc: '锚定护甲 +1 · 回血 +0.5/s', minDifficulty: 3, apply: (p) => { p.anchorArmorBonus = (p.anchorArmorBonus || 0) + 1; p.anchorRegenFlat = (p.anchorRegenFlat || 0) + 0.5; } },
];

const ATTACK_UPGRADES = [
  { id: 'extraCast', name: '双重释放', icon: '⚡', desc: '15% 概率额外攻击一次', minDifficulty: 0, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); } },
  { id: 'sharpEdge', name: '锐锋', icon: '🔪', desc: '伤害 +6%', minDifficulty: 0, apply: (p) => { p.damageMult *= 1.06; } },
  { id: 'attackSpeed', name: '极速', icon: '⏩', desc: '攻击速度 +12%', minDifficulty: 0, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.12; } },
  { id: 'quickHands', name: '快手', icon: '👋', desc: '攻击速度 +8%', minDifficulty: 1, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; } },
  { id: 'area', name: '范围扩大', icon: '📐', desc: '攻击范围 +15%', minDifficulty: 1, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.15; } },
  { id: 'lifesteal', name: '吸血', icon: '🩸', desc: '击杀回复 2 生命', minDifficulty: 2, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 2; } },
  { id: 'scope', name: '瞄准镜', icon: '🔭', desc: '范围 +10% · 暴击 +4%', minDifficulty: 2, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.1; p.critChance += 0.04; } },
  { id: 'bloodlust', name: '血之渴望', icon: '🫀', desc: '伤害 +8% · 吸血 +1', minDifficulty: 2, apply: (p) => { p.damageMult *= 1.08; p.lifesteal = (p.lifesteal || 0) + 1; } },
  { id: 'wideSwing', name: '广域', icon: '🌐', desc: '攻击范围 +8%', minDifficulty: 2, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.08; } },
  { id: 'lifeTap', name: '生命汲取', icon: '💧', desc: '击杀回复 1 生命', minDifficulty: 2, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 1; } },
  { id: 'rapidVolley', name: '速射', icon: '🏹', desc: '攻速 +10% · 投射物 +1', minDifficulty: 4, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; } },
  { id: 'extraCast2', name: '连击释放', icon: '💥', desc: '25% 概率额外攻击一次', minDifficulty: 4, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.25); } },
  { id: 'elemental', name: '元素附魔', icon: '🔥', desc: '伤害 +10% · 范围 +8%', minDifficulty: 4, apply: (p) => { p.damageMult *= 1.1; p.areaMult = (p.areaMult || 1) * 1.08; } },
  { id: 'multishot', name: '分裂弹', icon: '🔱', desc: '投射物数量 +1', minDifficulty: 5, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; } },
  { id: 'cooldown', name: '冷却缩减', icon: '❄️', desc: '全武器冷却 -8%', minDifficulty: 5, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; } },
  { id: 'twinCast', name: '双子施法', icon: '👯', desc: '额外攻击 +12% · 攻速 +6%', minDifficulty: 5, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.12); p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.06; } },
  { id: 'giantSlayer', name: '巨人杀手', icon: '⚔️', desc: '伤害 +14%', minDifficulty: 5, apply: (p) => { p.damageMult *= 1.14; } },
  { id: 'execution', name: '处决', icon: '🗡️', desc: '暴击率 +8% · 伤害 +8%', minDifficulty: 6, apply: (p) => { p.critChance += 0.08; p.damageMult *= 1.08; } },
  { id: 'munitions', name: '弹药库', icon: '📦', desc: '投射物 +1 · 伤害 +6%', minDifficulty: 6, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.damageMult *= 1.06; } },
  { id: 'berserk', name: '狂怒', icon: '🔥', desc: '伤害 +18% · 攻速 +10%', minDifficulty: 7, apply: (p) => { p.damageMult *= 1.18; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; } },
  { id: 'chainMaster', name: '连锁大师', icon: '⛓️', desc: '伤害 +10% · 额外攻击 +15%', minDifficulty: 7, apply: (p) => { p.damageMult *= 1.1; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); } },
  { id: 'overdrive', name: '过载', icon: '✨', desc: '额外攻击 +20% · 范围 +12%', minDifficulty: 8, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.2); p.areaMult = (p.areaMult || 1) * 1.12; } },
  { id: 'annihilation', name: '湮灭', icon: '💀', desc: '伤害 +15% · 暴击 +10%', minDifficulty: 8, apply: (p) => { p.damageMult *= 1.15; p.critChance += 0.1; } },
  { id: 'flurry', name: '连打', icon: '👊', desc: '攻速 +14%', minDifficulty: 1, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.14; } },
  { id: 'precision', name: '精准', icon: '🎯', desc: '暴击 +6% · 伤害 +5%', minDifficulty: 2, apply: (p) => { p.critChance += 0.06; p.damageMult *= 1.05; } },
  { id: 'shockwave', name: '冲击波', icon: '💫', desc: '范围 +10% · 伤害 +6%', minDifficulty: 2, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.1; p.damageMult *= 1.06; } },
  { id: 'vampEdge', name: '吸血刃', icon: '🦷', desc: '吸血 +2 · 伤害 +5%', minDifficulty: 3, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 2; p.damageMult *= 1.05; } },
  { id: 'scatterMind', name: '散射思维', icon: '🎆', desc: '投射物 +1 · 范围 +6%', minDifficulty: 3, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.areaMult = (p.areaMult || 1) * 1.06; } },
  { id: 'overloadMinor', name: '微过载', icon: '⚙️', desc: '额外攻击 +10% · 攻速 +6%', minDifficulty: 4, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.1); p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.06; } },
  { id: 'pierce', name: '穿透', icon: '📌', desc: '伤害 +9% · 暴击 +4%', minDifficulty: 4, apply: (p) => { p.damageMult *= 1.09; p.critChance += 0.04; } },
  { id: 'frenzy', name: '狂乱', icon: '🌀', desc: '攻速 +12% · 额外攻击 +8%', minDifficulty: 5, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.12; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.08); } },
  { id: 'anchorChain', name: '链长延伸', icon: '⛓️', desc: '锚区范围 +18% · 拉拽 +15%', minDifficulty: 0, apply: (p) => { p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.18; p.anchorPullMult = (p.anchorPullMult || 1) * 1.15; } },
  { id: 'anchorHaul', name: '急收锚', icon: '🌊', desc: '收锚加速 +25% · 冷却 -20%', minDifficulty: 1, apply: (p) => { p.haulSpeedMult = (p.haulSpeedMult || 1) * 1.25; p.haulCooldownMult = (p.haulCooldownMult || 1) * 0.8; } },
  { id: 'anchorDepth', name: '深锚', icon: '⚓', desc: '锚定时伤害 +12% · 锚定护甲 +2', minDifficulty: 2, apply: (p) => { p.anchorDamageBonus = (p.anchorDamageBonus || 1) * 1.12; p.anchorArmorBonus = (p.anchorArmorBonus || 0) + 2; } },
  { id: 'ghostAnchor', name: '双锚影', icon: '👥', desc: '幽灵锚点 +1 · 链间减速敌人', minDifficulty: 3, apply: (p) => { p.ghostAnchorMax = (p.ghostAnchorMax || ANCHOR_CONFIG.ghostAnchorMax) + 1; p.anchorChainSlow = (p.anchorChainSlow || 0) + 1; } },
  { id: 'anchorResonance', name: '锚击共鸣', icon: '🔔', desc: '锚定时伤害 +10% · 锚定攻速 +8%', minDifficulty: 1, apply: (p) => { p.anchorDamageBonus = (p.anchorDamageBonus || 1) * 1.1; p.anchorAtkspeedBonus = (p.anchorAtkspeedBonus || 1) * 1.08; } },
  { id: 'tidalGrip', name: '潮汐紧箍', icon: '🌀', desc: '锚区拉拽 +22%', minDifficulty: 1, apply: (p) => { p.anchorPullMult = (p.anchorPullMult || 1) * 1.22; } },
  { id: 'anchorSpecialAmp', name: '锚物增幅', icon: '✨', desc: '雷暴/箭塔/召唤狂暴 +12%', minDifficulty: 2, apply: (p) => { p.stormDamageMult = (p.stormDamageMult || 1) * 1.12; p.towerDamageMult = (p.towerDamageMult || 1) * 1.12; p.summonFrenzyMult = (p.summonFrenzyMult || 1) * 1.12; } },
  { id: 'anchorMastery', name: '抛锚精通', icon: '⚓', desc: '收锚加速 +15% · 冷却 -12%', minDifficulty: 3, apply: (p) => { p.haulSpeedMult = (p.haulSpeedMult || 1) * 1.15; p.haulCooldownMult = (p.haulCooldownMult || 1) * 0.88; } },
  { id: 'ironTether', name: '铁链束缚', icon: '🔗', desc: '锚区 +10% · 链间减速 +1', minDifficulty: 4, apply: (p) => { p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.1; p.anchorChainSlow = (p.anchorChainSlow || 0) + 1; } },
];

const SHOP_ITEMS = [
  { id: 'waterDrop', icon: '💧', name: '清水滴', desc: '恢复 10 生命', cost: 8, minDifficulty: 0, maxWave: 5, apply: (p) => { p.hp = Math.min(p.hp + 10, p.maxHp); } },
  { id: 'pepBar', icon: '🍫', name: '能量棒', desc: '速度 +5%', cost: 8, minDifficulty: 0, maxWave: 5, apply: (p) => { p.speed *= 1.05; } },
  { id: 'flint', icon: '🔪', name: '燧石片', desc: '伤害 +5%', cost: 9, minDifficulty: 0, maxWave: 5, apply: (p) => { p.damageMult *= 1.05; } },
  { id: 'ragWrap', icon: '🧶', name: '破布缠', desc: '护甲 +1 · 恢复 5 生命', cost: 10, minDifficulty: 0, maxWave: 5, apply: (p) => { p.armor += 1; p.hp = Math.min(p.hp + 5, p.maxHp); } },
  { id: 'copperCoin', icon: '🪙', name: '古铜币', desc: '金币 +6%', cost: 11, minDifficulty: 0, maxWave: 5, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.06; } },
  { id: 'bandage', icon: '🩹', name: '绷带', desc: '恢复 15 生命', cost: 12, minDifficulty: 0, maxWave: 4, apply: (p) => { p.hp = Math.min(p.hp + 15, p.maxHp); } },
  { id: 'scoutBoots', icon: '👣', name: '斥候靴', desc: '速度 +6%', cost: 12, minDifficulty: 0, maxWave: 4, apply: (p) => { p.speed *= 1.06; } },
  { id: 'woodShield', icon: '🪵', name: '木盾', desc: '护甲 +1', cost: 14, minDifficulty: 0, maxWave: 4, apply: (p) => { p.armor += 1; } },
  { id: 'studyNotes', icon: '📝', name: '学习笔记', desc: '经验 +10%', cost: 14, minDifficulty: 0, maxWave: 4, apply: (p) => { p.xpMult *= 1.1; } },
  { id: 'luckyPenny', icon: '🪙', name: '幸运铜币', desc: '金币 +8%', cost: 15, minDifficulty: 0, maxWave: 4, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.08; } },
  { id: 'copperRing', icon: '💍', name: '铜戒', desc: '伤害 +6%', cost: 16, minDifficulty: 0, maxWave: 4, apply: (p) => { p.damageMult *= 1.06; } },
  { id: 'herbTea', icon: '🌿', name: '草药茶', desc: '每秒回复 +0.5 生命', cost: 18, minDifficulty: 0, maxWave: 4, apply: (p) => { p.regen += 0.5; } },
  { id: 'padArmor', icon: '🧱', name: '粗布护垫', desc: '护甲 +2 · 生命 +8', cost: 20, minDifficulty: 0, maxWave: 4, apply: (p) => { p.armor += 2; p.maxHp += 8; p.hp = Math.min(p.hp + 8, p.maxHp); } },
  { id: 'whetstone', icon: '🪨', name: '磨刀石', desc: '伤害 +8%', cost: 20, minDifficulty: 0, maxWave: 4, apply: (p) => { p.damageMult *= 1.08; } },
  { id: 'fieldRation', icon: '🥖', name: '野战口粮', desc: '恢复 20 生命', cost: 24, minDifficulty: 0, maxWave: 5, apply: (p) => { p.hp = Math.min(p.hp + 20, p.maxHp); } },
  { id: 'leatherVest', icon: '🦺', name: '皮甲背心', desc: '护甲 +2 · 生命 +12', cost: 26, minDifficulty: 0, maxWave: 5, apply: (p) => { p.armor += 2; p.maxHp += 12; p.hp = Math.min(p.hp + 12, p.maxHp); } },
  { id: 'ironSword', icon: '🗡️', name: '铁剑胚', desc: '伤害 +10%', cost: 28, minDifficulty: 0, maxWave: 5, apply: (p) => { p.damageMult *= 1.1; } },
  { id: 'heal', icon: '🧪', name: '治疗药水', desc: '恢复 30 生命', cost: 22, minDifficulty: 0, apply: (p) => { p.hp = Math.min(p.hp + 30, p.maxHp); } },
  { id: 'armorShop', icon: '🛡️', name: '护甲片', desc: '护甲 +3', cost: 30, minDifficulty: 0, apply: (p) => { p.armor += 3; } },
  { id: 'maxHpShop', icon: '❤️', name: '生命上限', desc: '最大生命 +20', cost: 38, minDifficulty: 1, apply: (p) => { p.maxHp += 20; p.hp += 20; } },
  { id: 'speedShop', icon: '👟', name: '速度提升', desc: '速度 +10%', cost: 38, minDifficulty: 1, apply: (p) => { p.speed *= 1.1; } },
  { id: 'hasteBoots', icon: '🥾', name: '神行靴', desc: '速度 +15%', cost: 48, minDifficulty: 2, apply: (p) => { p.speed *= 1.15; } },
  { id: 'megaHeal', icon: '💊', name: '大治疗', desc: '恢复 55 生命', cost: 42, minDifficulty: 2, apply: (p) => { p.hp = Math.min(p.hp + 55, p.maxHp); } },
  { id: 'goldShop', icon: '💰', name: '招财符', desc: '金币掉落 +12%', cost: 45, minDifficulty: 2, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.12; } },
  { id: 'damageShop', icon: '⚔️', name: '伤害提升', desc: '伤害 +15%', cost: 48, minDifficulty: 2, apply: (p) => { p.damageMult *= 1.15; } },
  { id: 'strikeOil', icon: '🛢️', name: '攻击油', desc: '伤害 +8%', cost: 32, minDifficulty: 2, apply: (p) => { p.damageMult *= 1.08; } },
  { id: 'magnetPatch', icon: '🧲', name: '吸铁片', desc: '拾取范围 +15%', cost: 30, minDifficulty: 2, apply: (p) => { p.pickupRange *= 1.15; } },
  { id: 'shopHolyRing', icon: '✝️', name: '圣环碎片', desc: '周身伤害光环', cost: 72, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.holyAura += 1; } },
  { id: 'shopOmnivamp', icon: '🩸', name: '吸血核心', desc: '全能吸血 · 伤害转生命', cost: 58, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.omnivamp += 1; } },
  { id: 'shopOrbitKnife', icon: '🗡️', name: '回旋镖片', desc: '环绕飞刃切割', cost: 62, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.orbitBlades += 1; } },
  { id: 'shopKillNova', icon: '💣', name: '爆破符文', desc: '击杀范围爆炸', cost: 70, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.novaOnKill += 1; } },
  { id: 'shopBleedBlade', icon: '🩹', name: '锯齿刃', desc: '攻击叠加重伤', cost: 64, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.bleedOnHit += 1; } },
  { id: 'shopFrostPrism', icon: '🧊', name: '寒霜棱镜', desc: '永冻减速领域', cost: 74, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.frostField += 1; } },
  { id: 'shopShieldNova', icon: '🔰', name: '反击护符', desc: '受击释放冲击波', cost: 66, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.shieldNova += 1; } },
  { id: 'shopGreedSigil', icon: '💰', name: '贪婪印记', desc: '击杀额外掉金币', cost: 56, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.greedMark += 1; } },
  { id: 'shopGiantSlayer', icon: '🏔️', name: '巨人猎手', desc: '对高生命敌人增伤', cost: 78, minDifficulty: 4, tag: 'mechanic', apply: (p) => { p.mechanics.giantSlayer += 1; } },
  { id: 'shopEliteHunter', icon: '🎖️', name: '精英猎具', desc: '对精英 Boss 增伤', cost: 84, minDifficulty: 4, tag: 'mechanic', apply: (p) => { p.mechanics.eliteHunter += 1; } },
  { id: 'shopChainCoil', icon: '⚡', name: '雷线圈', desc: '闪电链 +15%', cost: 68, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.chainChance = Math.min(0.5, (p.mechanics.chainChance || 0) + 0.15); } },
  { id: 'shopMagnetPulse', icon: '🧲', name: '脉冲磁核', desc: '周期吸附全图掉落', cost: 76, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.magnetPulse += 1; } },
  { id: 'shopKillFrenzy', icon: '💢', name: '杀戮纹章', desc: '连杀提升攻速', cost: 60, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.killStreak = 1; } },
  { id: 'shopExecutioner', icon: '🪓', name: '处刑印记', desc: '对残血敌人增伤', cost: 72, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.execute += 1; } },
  { id: 'shopVolatileCrit', icon: '💥', name: '爆裂芯片', desc: '暴击小范围爆炸', cost: 80, minDifficulty: 4, tag: 'mechanic', apply: (p) => { p.mechanics.critExplode += 1; } },
  { id: 'shopOverkill', icon: '💀', name: '溅射断头台', desc: '残血命中造成溅射', cost: 86, minDifficulty: 4, tag: 'mechanic', apply: (p) => { p.mechanics.overkillSplash += 1; } },
  { id: 'shopHexGambit', icon: '🎰', name: '海克斯骰子', desc: '暴击链与爆炸组合', cost: 95, minDifficulty: 5, tag: 'mechanic', apply: (p) => {
    p.mechanics.critExplode += 1;
    p.mechanics.chainChance = Math.min(0.45, (p.mechanics.chainChance || 0) + 0.08);
  } },
  { id: 'shopPotatoCrate', icon: '🥔', name: '土豆货箱', desc: '黄金收割 + 磁力脉冲', cost: 88, minDifficulty: 4, tag: 'mechanic', apply: (p) => {
    p.mechanics.greedMark += 1;
    p.mechanics.magnetPulse += 1;
  } },
  { id: 'shopHexMark', icon: '🔷', name: '印记水晶', desc: '攻击叠海克斯印记', cost: 54, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.hexMark += 1; } },
  { id: 'shopMoltenTrail', icon: '🌋', name: '熔火靴', desc: '移动留下灼烧轨迹', cost: 66, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.moltenTrail += 1; } },
  { id: 'shopSoulHarvest', icon: '👻', name: '灵魂提灯', desc: '击杀回血 · 掉灵魂球', cost: 62, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.soulHarvest += 1; } },
  { id: 'shopStaticCoil', icon: '🔋', name: '静电线圈', desc: '连击释放电击环', cost: 70, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.staticCharge += 1; } },
  { id: 'shopTimeWarp', icon: '⏳', name: '时空沙漏', desc: '周期全场减速', cost: 82, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.timeWarp += 1; } },
  { id: 'shopPhoenix', icon: '🪶', name: '凤凰羽毛', desc: '低血大幅再生', cost: 76, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.phoenixCore += 1; } },
  { id: 'shopRicochet', icon: '🪃', name: '弹射器', desc: '命中弹射附近敌人', cost: 64, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.ricochet += 1; } },
  { id: 'shopCurseBrand', icon: '☣️', name: '诅咒烙铁', desc: '持续伤害 +35%', cost: 74, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.dotAmp += 1; } },
  { id: 'shopPickupSpark', icon: '✨', name: '拾取电容', desc: '拾取后短暂增伤', cost: 52, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.pickupSpark += 1; } },
  { id: 'shopCounter', icon: '🥊', name: '反击手套', desc: '受击后下次攻击增伤', cost: 58, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.counterStrike += 1; } },
  { id: 'shopWhirlwind', icon: '🌀', name: '旋风护符', desc: '周期范围斩击', cost: 78, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.whirlwind += 1; } },
  { id: 'shopAnchor', icon: '🎯', name: '锚定镜片', desc: '抛锚或站立越久伤害越高', cost: 68, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.anchorShot += 1; } },
  { id: 'shopAnchorWell', icon: '💧', name: '锚泉护符', desc: '锚定回血 +25%', cost: 42, minDifficulty: 1, apply: (p) => { p.anchorRegenMult = (p.anchorRegenMult || 1) * 1.25; } },
  { id: 'shopTidalChain', icon: '⛓️', name: '潮汐链轮', desc: '锚区 +12% · 拉拽 +18%', cost: 55, minDifficulty: 2, apply: (p) => { p.anchorRadiusMult = (p.anchorRadiusMult || 1) * 1.12; p.anchorPullMult = (p.anchorPullMult || 1) * 1.18; } },
  { id: 'shopHaulBoots', icon: '🌊', name: '收锚神行靴', desc: '收锚加速 +20% · 冷却 -15%', cost: 48, minDifficulty: 1, apply: (p) => { p.haulSpeedMult = (p.haulSpeedMult || 1) * 1.2; p.haulCooldownMult = (p.haulCooldownMult || 1) * 0.85; } },
  { id: 'shopAnchorAmp', icon: '✨', name: '锚物核心', desc: '雷暴/箭塔/狂暴 +15%', cost: 72, minDifficulty: 3, apply: (p) => {
    p.stormDamageMult = (p.stormDamageMult || 1) * 1.15;
    p.towerDamageMult = (p.towerDamageMult || 1) * 1.15;
    p.summonFrenzyMult = (p.summonFrenzyMult || 1) * 1.15;
  } },
  { id: 'shopGhostAnchor', icon: '👥', name: '幽灵锚核', desc: '幽灵锚点 +1 · +3 秒', cost: 65, minDifficulty: 3, apply: (p) => {
    p.ghostAnchorMax = (p.ghostAnchorMax || ANCHOR_CONFIG.ghostAnchorMax) + 1;
    p.ghostLifeBonus = (p.ghostLifeBonus || 0) + 3;
  } },
  { id: 'shopMarkDetonate', icon: '💠', name: '引爆符文', desc: '印记 · 击杀引爆', cost: 92, minDifficulty: 4, tag: 'mechanic', apply: (p) => { p.mechanics.hexMark += 1; p.mechanics.markDetonate = 1; } },
  { id: 'shopElementFusion', icon: '🔮', name: '元素熔炉', desc: '点燃减速 · 诅咒增伤', cost: 98, minDifficulty: 4, tag: 'mechanic', apply: (p) => {
    p.mechanics.burnOnHit += 1;
    p.mechanics.slowOnHit += 1;
    p.mechanics.dotAmp += 1;
  } },
  { id: 'shopSpinWin', icon: '🎡', name: '旋转核心', desc: '旋风斩 + 飞刃', cost: 105, minDifficulty: 5, tag: 'mechanic', apply: (p) => {
    p.mechanics.whirlwind += 1;
    p.mechanics.orbitBlades += 1;
  } },
  { id: 'shopEmber', icon: '🔥', name: '余烬护符', desc: '攻击点燃敌人', cost: 52, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.burnOnHit += 1; } },
  { id: 'shopThorns', icon: '🌵', name: '荆棘刺', desc: '近身反弹伤害', cost: 48, minDifficulty: 2, tag: 'mechanic', apply: (p) => { p.mechanics.thorns += 8; } },
  { id: 'shopPoisonFlask', icon: '☠️', name: '毒雾瓶', desc: '击杀留下毒雾', cost: 65, minDifficulty: 3, tag: 'mechanic', apply: (p) => { p.mechanics.poisonCloud += 1; } },
  { id: 'summonCharm', icon: '🐾', name: '驯兽铃', desc: '召唤伤害 +12%', cost: 40, minDifficulty: 2, apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.12; } },
  { id: 'minorCast', icon: '✨', name: '微施法', desc: '额外攻击 +8%', cost: 44, minDifficulty: 2, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.08); } },
  { id: 'critChip', icon: '🎯', name: '暴击芯片', desc: '暴击率 +5%', cost: 46, minDifficulty: 2, apply: (p) => { p.critChance += 0.05; } },
  { id: 'ironSkin', icon: '🪨', name: '铁皮强化', desc: '护甲 +5 · 生命 +15', cost: 52, minDifficulty: 2, apply: (p) => { p.armor += 5; p.maxHp += 15; p.hp += 15; } },
  { id: 'lifestealShop', icon: '🩸', name: '吸血戒指', desc: '击杀回血 +2', cost: 48, minDifficulty: 2, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 2; } },
  { id: 'summonShop', icon: '🐺', name: '唤灵契约', desc: '召唤物伤害 +20%', cost: 55, minDifficulty: 2, apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.2; } },
  { id: 'xpShop', icon: '📚', name: '智慧卷轴', desc: '经验获取 +20%', cost: 50, minDifficulty: 2, apply: (p) => { p.xpMult *= 1.2; } },
  { id: 'areaShop', icon: '📐', name: '范围护符', desc: '攻击范围 +12%', cost: 50, minDifficulty: 2, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.12; } },
  { id: 'attackSpeedShop', icon: '⏩', name: '攻速护符', desc: '攻击速度 +10%', cost: 55, minDifficulty: 2, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; } },
  { id: 'regenShop', icon: '💚', name: '再生护符', desc: '每秒回复 +1 生命', cost: 55, minDifficulty: 2, apply: (p) => { p.regen += 1; } },
  { id: 'bloodPact', icon: '🫀', name: '血之契约', desc: '伤害 +12% · 吸血 +2', cost: 62, minDifficulty: 4, apply: (p) => { p.damageMult *= 1.12; p.lifesteal = (p.lifesteal || 0) + 2; } },
  { id: 'extraCastShop', icon: '⚡', name: '双重释放', desc: '额外攻击 +10%', cost: 65, minDifficulty: 4, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.1); } },
  { id: 'critShop', icon: '🎯', name: '暴击护符', desc: '暴击率 +8%', cost: 68, minDifficulty: 4, apply: (p) => { p.critChance += 0.08; } },
  { id: 'pickupShop', icon: '🧲', name: '强磁护符', desc: '拾取范围 +25%', cost: 58, minDifficulty: 4, apply: (p) => { p.pickupRange *= 1.25; } },
  { id: 'magnetCore', icon: '🔮', name: '聚宝磁核', desc: '拾取范围 +35%', cost: 72, minDifficulty: 4, apply: (p) => { p.pickupRange *= 1.35; } },
  { id: 'arcaneLens', icon: '👁️', name: '奥术透镜', desc: '范围 +18% · 暴击 +6%', cost: 78, minDifficulty: 5, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.18; p.critChance += 0.06; } },
  { id: 'extraCastShop2', icon: '💥', name: '连击释放', desc: '额外攻击 +15%', cost: 85, minDifficulty: 5, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); } },
  { id: 'multishotShop', icon: '🔱', name: '分裂核心', desc: '投射物数量 +1', cost: 92, minDifficulty: 5, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; } },
  { id: 'cooldownShop', icon: '❄️', name: '冷却水晶', desc: '攻击速度 +15%', cost: 88, minDifficulty: 5, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.15; } },
  { id: 'soulHarvest', icon: '👻', name: '灵魂收割', desc: '经验 +25% · 击杀回血 +1', cost: 82, minDifficulty: 5, apply: (p) => { p.xpMult *= 1.25; p.lifesteal = (p.lifesteal || 0) + 1; } },
  { id: 'fortuneShop', icon: '🍀', name: '幸运宝箱', desc: '金币与经验 +12%', cost: 95, minDifficulty: 6, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.12; p.xpMult *= 1.12; } },
  { id: 'warBanner', icon: '🚩', name: '战旗', desc: '伤害 +18% · 攻速 +8%', cost: 98, minDifficulty: 6, apply: (p) => { p.damageMult *= 1.18; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; } },
  { id: 'vampShop', icon: '🦇', name: '吸血鬼之牙', desc: '击杀回血 +4', cost: 102, minDifficulty: 6, apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 4; } },
  { id: 'legendArmor', icon: '🏰', name: '传奇护甲', desc: '护甲 +8 · 生命 +30', cost: 118, minDifficulty: 7, apply: (p) => { p.armor += 8; p.maxHp += 30; p.hp += 30; } },
  { id: 'legendBlade', icon: '👑', name: '王者之刃', desc: '伤害 +22% · 暴击 +5%', cost: 128, minDifficulty: 7, apply: (p) => { p.damageMult *= 1.22; p.critChance += 0.05; } },
  { id: 'dragonScale', icon: '🐉', name: '龙鳞护符', desc: '生命 +40 · 护甲 +4', cost: 135, minDifficulty: 7, apply: (p) => { p.maxHp += 40; p.hp += 40; p.armor += 4; } },
  { id: 'relicShop', icon: '💎', name: '远古圣物', desc: '全属性小幅强化', cost: 145, minDifficulty: 8, apply: (p) => { p.damageMult *= 1.1; p.speed *= 1.08; p.maxHp += 25; p.hp += 25; p.armor += 2; } },
  { id: 'overdriveShop', icon: '✨', name: '过载模块', desc: '额外攻击 +18% · 范围 +10%', cost: 138, minDifficulty: 8, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.18); p.areaMult = (p.areaMult || 1) * 1.1; } },
  { id: 'apocalypse', icon: '☄️', name: '末日核心', desc: '伤害 +25% · 额外攻击 +12%', cost: 165, minDifficulty: 8, apply: (p) => { p.damageMult *= 1.25; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.12); } },
  { id: 'fullHeal', icon: '🍶', name: '完全恢复', desc: '生命回满', cost: 55, minDifficulty: 2, apply: (p) => { p.hp = p.maxHp; } },
  { id: 'thornMail', icon: '🌵', name: '荆棘铠甲', desc: '护甲 +6 · 吸血 +1', cost: 58, minDifficulty: 2, apply: (p) => { p.armor += 6; p.lifesteal = (p.lifesteal || 0) + 1; } },
  { id: 'swiftPotion', icon: '⚗️', name: '疾风药剂', desc: '速度 +12%', cost: 42, minDifficulty: 1, apply: (p) => { p.speed *= 1.12; } },
  { id: 'powerTome', icon: '📖', name: '力量典籍', desc: '伤害 +12%', cost: 52, minDifficulty: 2, apply: (p) => { p.damageMult *= 1.12; } },
  { id: 'guardianShield', icon: '🛡️', name: '守护者盾', desc: '护甲 +4 · 生命 +25', cost: 68, minDifficulty: 2, apply: (p) => { p.armor += 4; p.maxHp += 25; p.hp += 25; } },
  { id: 'hunterCharm', icon: '🎖️', name: '猎人徽章', desc: '暴击 +6% · 攻速 +8%', cost: 70, minDifficulty: 4, apply: (p) => { p.critChance += 0.06; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.08; } },
  { id: 'elementCore', icon: '🔥', name: '元素核心', desc: '伤害 +10% · 范围 +12%', cost: 74, minDifficulty: 4, apply: (p) => { p.damageMult *= 1.1; p.areaMult = (p.areaMult || 1) * 1.12; } },
  { id: 'spiritBond', icon: '🔗', name: '灵魂纽带', desc: '召唤伤害 +18%', cost: 68, minDifficulty: 4, apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.18; } },
  { id: 'treasureMap', icon: '🗺️', name: '藏宝图', desc: '金币 +15% · 经验 +12%', cost: 76, minDifficulty: 4, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.15; p.xpMult *= 1.12; } },
  { id: 'phoenixAsh', icon: '🪶', name: '凤凰灰烬', desc: '再生 +2 · 生命 +20', cost: 80, minDifficulty: 5, apply: (p) => { p.regen += 2; p.maxHp += 20; p.hp += 20; } },
  { id: 'stormRune', icon: '⛈️', name: '风暴符文', desc: '额外攻击 +12% · 攻速 +10%', cost: 86, minDifficulty: 5, apply: (p) => { p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.12); p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; } },
  { id: 'giantGauntlet', icon: '🥊', name: '巨人手套', desc: '伤害 +16% · 生命 +15', cost: 88, minDifficulty: 5, apply: (p) => { p.damageMult *= 1.16; p.maxHp += 15; p.hp += 15; } },
  { id: 'voidShard', icon: '🌑', name: '虚空碎片', desc: '投射物 +1 · 暴击 +5%', cost: 105, minDifficulty: 6, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.critChance += 0.05; } },
  { id: 'celestialOrb', icon: '🌙', name: '天界宝珠', desc: '范围 +15% · 拾取 +20%', cost: 92, minDifficulty: 6, apply: (p) => { p.areaMult = (p.areaMult || 1) * 1.15; p.pickupRange *= 1.2; } },
  { id: 'demonPact', icon: '😈', name: '恶魔契约', desc: '伤害 +20% · 吸血 +3', cost: 112, minDifficulty: 7, apply: (p) => { p.damageMult *= 1.2; p.lifesteal = (p.lifesteal || 0) + 3; } },
  { id: 'eternalFlame', icon: '🔥', name: '永恒之火', desc: '伤害 +15% · 攻速 +12%', cost: 108, minDifficulty: 7, apply: (p) => { p.damageMult *= 1.15; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.12; } },
  { id: 'worldTree', icon: '🌳', name: '世界树种子', desc: '生命 +50 · 再生 +1', cost: 125, minDifficulty: 7, apply: (p) => { p.maxHp += 50; p.hp += 50; p.regen += 1; } },
  { id: 'chronoGear', icon: '⚙️', name: '时空齿轮', desc: '攻速 +18% · 额外攻击 +10%', cost: 142, minDifficulty: 8, apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.18; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.1); } },
  { id: 'godslayer', icon: '⚡', name: '弑神之刃', desc: '伤害 +28% · 暴击 +8%', cost: 175, minDifficulty: 8, apply: (p) => { p.damageMult *= 1.28; p.critChance += 0.08; } },
  { id: 'titanHeart', icon: '❤️‍🔥', name: '泰坦之心', desc: '生命 +80 · 再生 +2', cost: 185, minDifficulty: 6, minWave: 6, apply: (p) => { p.maxHp += 80; p.hp += 80; p.regen += 2; } },
  { id: 'infinityEdge', icon: '🌠', name: '无尽锋刃', desc: '伤害 +30% · 暴击 +10%', cost: 198, minDifficulty: 7, minWave: 7, apply: (p) => { p.damageMult *= 1.3; p.critChance += 0.1; } },
  { id: 'crownOfKings', icon: '👑', name: '王者冠冕', desc: '伤害 +18% · 生命 +45 · 护甲 +5', cost: 215, minDifficulty: 7, minWave: 7, apply: (p) => { p.damageMult *= 1.18; p.maxHp += 45; p.hp += 45; p.armor += 5; } },
  { id: 'abyssCrown', icon: '🌌', name: '深渊王冠', desc: '伤害 +25% · 额外攻击 +15%', cost: 228, minDifficulty: 7, minWave: 8, apply: (p) => { p.damageMult *= 1.25; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); } },
  { id: 'primordialShard', icon: '💠', name: '原初碎片', desc: '投射物 +1 · 伤害 +20%', cost: 245, minDifficulty: 8, minWave: 8, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.damageMult *= 1.2; } },
  { id: 'singularityCore', icon: '🌀', name: '奇点核心', desc: '伤害 +22% · 攻速 +18% · 范围 +15%', cost: 262, minDifficulty: 8, minWave: 8, apply: (p) => { p.damageMult *= 1.22; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.18; p.areaMult = (p.areaMult || 1) * 1.15; } },
  { id: 'omegaRelic', icon: '☀️', name: '欧米伽圣物', desc: '全属性大幅强化', cost: 288, minDifficulty: 8, minWave: 9, apply: (p) => { p.damageMult *= 1.2; p.speed *= 1.12; p.maxHp += 60; p.hp += 60; p.armor += 6; p.critChance += 0.08; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.12); } },
  { id: 'warlordPlate', icon: '🦾', name: '战神重甲', desc: '生命 +55 · 护甲 +7 · 伤害 +12%', cost: 168, minDifficulty: 6, minWave: 6, apply: (p) => { p.maxHp += 55; p.hp += 55; p.armor += 7; p.damageMult *= 1.12; } },
  { id: 'stormBreaker', icon: '⛈️', name: '破阵雷锤', desc: '伤害 +20% · 范围 +15%', cost: 182, minDifficulty: 6, minWave: 7, apply: (p) => { p.damageMult *= 1.2; p.areaMult = (p.areaMult || 1) * 1.15; } },
  { id: 'bloodMoon', icon: '🌙', name: '血月之契', desc: '伤害 +15% · 吸血 +5', cost: 195, minDifficulty: 7, minWave: 7, apply: (p) => { p.damageMult *= 1.15; p.lifesteal = (p.lifesteal || 0) + 5; } },
  { id: 'eternityElixir', icon: '🍶', name: '永恒灵药', desc: '生命回满 · 上限 +40', cost: 298, minDifficulty: 6, minWave: 7, apply: (p) => { p.maxHp += 40; p.hp = p.maxHp; } },
  { id: 'voidEmperor', icon: '👁️', name: '虚空帝冕', desc: '伤害 +25% · 额外攻击 +15% · 暴击 +8%', cost: 312, minDifficulty: 7, minWave: 8, apply: (p) => { p.damageMult *= 1.25; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); p.critChance += 0.08; } },
  { id: 'immortalShell', icon: '🐢', name: '不朽壳甲', desc: '生命 +100 · 护甲 +10 · 再生 +3', cost: 328, minDifficulty: 7, minWave: 8, apply: (p) => { p.maxHp += 100; p.hp += 100; p.armor += 10; p.regen += 3; } },
  { id: 'goldenEmpire', icon: '🏛️', name: '黄金帝国', desc: '金币 +20% · 经验 +18%', cost: 305, minDifficulty: 6, minWave: 7, apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.2; p.xpMult *= 1.18; } },
  { id: 'celestialAegis', icon: '🛡️', name: '天界圣盾', desc: '护甲 +12 · 生命 +90 · 吸血 +3', cost: 348, minDifficulty: 7, minWave: 8, apply: (p) => { p.armor += 12; p.maxHp += 90; p.hp += 90; p.lifesteal = (p.lifesteal || 0) + 3; } },
  { id: 'apexHunter', icon: '🏹', name: '巅峰猎杀者', desc: '伤害 +32% · 攻速 +15%', cost: 358, minDifficulty: 8, minWave: 9, apply: (p) => { p.damageMult *= 1.32; p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.15; } },
  { id: 'multiverseCannon', icon: '🔱', name: '多元重炮', desc: '投射物 +1 · 伤害 +22% · 范围 +12%', cost: 372, minDifficulty: 8, minWave: 9, apply: (p) => { p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.damageMult *= 1.22; p.areaMult = (p.areaMult || 1) * 1.12; } },
  { id: 'dragonBlood', icon: '🐉', name: '龙血精华', desc: '召唤伤害 +35% · 自身伤害 +18%', cost: 338, minDifficulty: 7, minWave: 8, apply: (p) => { p.summonDamageMult = (p.summonDamageMult || 1) * 1.35; p.damageMult *= 1.18; } },
  { id: 'cataclysmEngine', icon: '💥', name: '灾变引擎', desc: '伤害 +28% · 额外攻击 +18% · 攻速 +12%', cost: 395, minDifficulty: 8, minWave: 9, apply: (p) => { p.damageMult *= 1.28; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.18); p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.12; } },
  { id: 'apotheosis', icon: '🌟', name: '神格升华', desc: '终极全属性强化', cost: 428, minDifficulty: 8, minWave: 9, apply: (p) => { p.damageMult *= 1.22; p.speed *= 1.1; p.maxHp += 80; p.hp += 80; p.armor += 8; p.critChance += 0.1; p.bonusProjectiles = (p.bonusProjectiles || 0) + 1; p.extraCast = Math.min(0.75, (p.extraCast || 0) + 0.15); p.summonDamageMult = (p.summonDamageMult || 1) * 1.15; } },
];

const SHOP_OFFER_COUNT = 4;

const RUN_MODIFIERS = [
  { id: 'goldRush', name: '黄金之潮', icon: '💰', desc: '本局金币 +25%', type: 'blessing', apply: (p) => { p.goldMult = (p.goldMult || 1) * 1.25; } },
  { id: 'xpSurge', name: '经验井喷', icon: '📈', desc: '本局经验 +20%', type: 'blessing', apply: (p) => { p.xpMult *= 1.2; } },
  { id: 'bountyLand', name: '丰饶之地', icon: '🌾', desc: '额外掉落 +60%', type: 'blessing', dropChanceMult: 1.6 },
  { id: 'varietyPack', name: '百变升级', icon: '🎲', desc: '升级选项 +1', type: 'blessing', levelUpOptions: 4 },
  { id: 'merchants', name: '商人云集', icon: '🏪', desc: '商店 +1 栏', type: 'blessing', shopSlotBonus: 1 },
  { id: 'weaponFocus', name: '武器大师', icon: '⚔️', desc: '更易出现新武器/召唤', type: 'blessing', upgradeWeightBoost: { newWeapon: 1.55, summon: 1.5, weaponLevel: 1.2 } },
  { id: 'treasureHunter', name: '猎宝人', icon: '🗺️', desc: '宝箱概率 ×2', type: 'blessing', treasureMult: 2 },
  { id: 'soulTide', name: '灵魂潮汐', icon: '👻', desc: '灵魂球 +80%', type: 'blessing', soulMult: 1.8 },
  { id: 'luckyStar', name: '幸运星', icon: '⭐', desc: '精英额外掉落', type: 'blessing', eliteBonusDrop: true },
  { id: 'prismatic', name: '棱彩共鸣', icon: '🔷', desc: '击杀概率掉棱彩', type: 'blessing', prismChance: 0.016 },
  { id: 'hasteAura', name: '迅捷光环', icon: '💨', desc: '攻速 +10%', type: 'blessing', apply: (p) => { p.attackSpeedMult = (p.attackSpeedMult || 1) * 1.1; } },
  { id: 'shopVariety', name: '奇货可居', icon: '🎁', desc: '商店品类更杂', type: 'blessing', shopTagQuota: true },
  { id: 'glassCannon', name: '玻璃大炮', icon: '💥', desc: '伤害 +15% · 生命 -15%', type: 'mixed', apply: (p) => { p.damageMult *= 1.15; p.maxHp = Math.max(30, Math.floor(p.maxHp * 0.85)); p.hp = Math.min(p.hp, p.maxHp); } },
  { id: 'ironCarapace', name: '铁皮躯壳', icon: '🛡️', desc: '护甲 +4 · 速度 -8%', type: 'mixed', apply: (p) => { p.armor += 4; p.speed *= 0.92; } },
  { id: 'bloodPactRun', name: '血契', icon: '🩸', desc: '伤害 +12% · 再生 -0.5', type: 'mixed', apply: (p) => { p.damageMult *= 1.12; p.regen = Math.max(0, p.regen - 0.5); } },
  { id: 'wildCards', name: '百变牌组', icon: '🃏', desc: '升级重复惩罚减轻', type: 'blessing', repeatPenaltySoft: true },
  { id: 'arcaneSeed', name: '法则种子', icon: '🌱', desc: '开局获得随机机制', type: 'blessing', grantMechanic: true },
];

function rollRunModifiers(difficultyLevel = 2) {
  const lv = clampDifficultyLevel(difficultyLevel);
  const blessings = RUN_MODIFIERS.filter(m => m.type === 'blessing');
  const mixed = RUN_MODIFIERS.filter(m => m.type === 'mixed');
  const picked = [];
  const used = new Set();

  const pickFrom = (pool) => {
    const available = pool.filter(m => !used.has(m.id));
    if (!available.length) return null;
    const mod = randomPick(available);
    used.add(mod.id);
    picked.push(mod);
    return mod;
  };

  pickFrom(blessings);
  if (lv >= 5 && Math.random() < 0.45) {
    pickFrom(mixed);
  } else {
    pickFrom(blessings);
  }
  return picked;
}

const RUN_MODIFIER_PICK_COUNT = 2;

function generateModifierOffers(count = 3, difficultyLevel = 2, excludeIds = [], slot = 0) {
  const lv = clampDifficultyLevel(difficultyLevel);
  let pool = RUN_MODIFIERS.filter(m => !excludeIds.includes(m.id));

  if (slot === 0) {
    pool = pool.filter(m => m.type === 'blessing');
  } else if (slot >= 1) {
    pool = lv >= 5
      ? pool.filter(m => m.type === 'blessing' || m.type === 'mixed')
      : pool.filter(m => m.type === 'blessing');
  }

  const offers = [];
  const used = new Set();
  while (offers.length < count && used.size < pool.length) {
    const available = pool.filter(m => !used.has(m.id));
    if (!available.length) break;
    const pick = randomPick(available);
    used.add(pick.id);
    offers.push(pick);
  }
  return offers;
}

function mergeRunModifierEffects(modifiers = []) {
  const fx = {
    dropChanceMult: 1,
    treasureMult: 1,
    soulMult: 1,
    levelUpOptions: 3,
    shopSlotBonus: 0,
    upgradeWeightBoost: {},
    eliteBonusDrop: false,
    prismChance: 0,
    shopTagQuota: false,
    repeatPenaltySoft: false,
  };
  for (const mod of modifiers) {
    if (mod.dropChanceMult) fx.dropChanceMult *= mod.dropChanceMult;
    if (mod.treasureMult) fx.treasureMult *= mod.treasureMult;
    if (mod.soulMult) fx.soulMult *= mod.soulMult;
    if (mod.levelUpOptions) fx.levelUpOptions = Math.max(fx.levelUpOptions, mod.levelUpOptions);
    if (mod.shopSlotBonus) fx.shopSlotBonus += mod.shopSlotBonus;
    if (mod.upgradeWeightBoost) {
      for (const [k, v] of Object.entries(mod.upgradeWeightBoost)) {
        fx.upgradeWeightBoost[k] = (fx.upgradeWeightBoost[k] || 1) * v;
      }
    }
    if (mod.eliteBonusDrop) fx.eliteBonusDrop = true;
    if (mod.prismChance) fx.prismChance += mod.prismChance;
    if (mod.shopTagQuota) fx.shopTagQuota = true;
    if (mod.repeatPenaltySoft) fx.repeatPenaltySoft = true;
  }
  return fx;
}

function inferShopTag(item) {
  if (item.tag) return item.tag;
  const text = `${item.name}${item.desc}`;
  if (/恢复|回复|生命|再生|绷带|药水|口粮|滋养|灵药|灰烬/.test(text)) return 'heal';
  if (/点燃|毒雾|圣环|荆棘|连锁|闪电|减速|处刑|脉冲|飞刃|爆炸|吸血|重伤|冻结|冲击|赏金|巨人|回旋|放血|永冻|贪婪|海克斯|土豆|机制|印记|熔火|灵魂|静电|时空|凤凰|弹射|诅咒|拾取|反击|旋风|锚定|锚域|锚物|雷锚|灵锚|幽灵|拉拽|收锚|引爆|元素|旋转/.test(text)) return 'mechanic';
  if (/伤害|攻速|暴击|投射|释放|攻击|猎杀|刃|锤|炮|连击|过载|湮灭|弑神/.test(text)) return 'offense';
  if (/护甲|护盾|盾|甲|壁垒|壳|重甲|圣盾/.test(text)) return 'defense';
  if (/金币|经验|招财|贪婪|藏宝|黄金|帝国|鸿运|学者/.test(text)) return 'economy';
  return 'utility';
}

function getUpgradesForDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  return {
    stat: STAT_UPGRADES.filter(u => (u.minDifficulty ?? 0) <= lv),
    attack: ATTACK_UPGRADES.filter(u => (u.minDifficulty ?? 0) <= lv),
  };
}

function getShopPoolForDifficulty(level, wave = 99) {
  const lv = clampDifficultyLevel(level);
  return SHOP_ITEMS.filter(i =>
    (i.minDifficulty ?? 0) <= lv
    && (i.maxWave == null || wave <= i.maxWave)
    && (i.minWave == null || wave >= i.minWave)
  );
}

function countEnemyTypesForDifficulty(level) {
  const lv = clampDifficultyLevel(level);
  return ENEMY_SPAWN_POOL.filter(p => (p.minDifficulty ?? 0) <= lv).length;
}

function countRewardTypesForDifficulty(level) {
  const shop = getShopPoolForDifficulty(level).length;
  const ups = getUpgradesForDifficulty(level);
  const mechanics = getMechanicUpgradesForDifficulty(level).length;
  const pickupKinds = 4 + Math.min(3, Math.floor(level / 2));
  return shop + ups.stat.length + ups.attack.length + mechanics + pickupKinds + RUN_MODIFIERS.length;
}

function generateShopOffers(count = SHOP_OFFER_COUNT, difficultyLevel = 2, wave = 1, options = {}) {
  const pool = getShopPoolForDifficulty(difficultyLevel, wave).map(item => ({ ...item, sold: false }));
  const offers = [];
  const used = new Set();

  const pickUnique = (candidates) => {
    const available = candidates.filter(i => !used.has(i.id));
    if (!available.length) return null;
    const pick = randomPick(available);
    used.add(pick.id);
    const idx = pool.findIndex(i => i.id === pick.id);
    if (idx >= 0) pool.splice(idx, 1);
    return { ...pick, sold: false };
  };

  const budgetCap = wave <= 1 ? 24 : wave <= 2 ? 30 : wave <= 3 ? 36 : 42;
  const budgetSlots = wave <= 3 ? 2 : 1;
  for (let b = 0; b < budgetSlots; b++) {
    const budgetPick = pickUnique(pool.filter(i => i.cost <= budgetCap));
    if (budgetPick) offers.push(budgetPick);
  }

  if (wave >= 9) {
    const luxuryPick = pickUnique(pool.filter(i => i.cost >= 280));
    if (luxuryPick) offers.push(luxuryPick);
  }
  if (wave >= 7) {
    const premiumPick = pickUnique(pool.filter(i => i.cost >= 180));
    if (premiumPick) offers.push(premiumPick);
  } else if (wave >= 5) {
    const highPick = pickUnique(pool.filter(i => i.cost >= 100));
    if (highPick) offers.push(highPick);
  }

  if (difficultyLevel >= 6 && wave >= 8) {
    const ultraPick = pickUnique(pool.filter(i => i.cost >= 300));
    if (ultraPick) offers.push(ultraPick);
  }

  if (difficultyLevel >= 4) {
    const midPick = pickUnique(pool.filter(i => i.cost >= 46 && i.cost <= 85));
    if (midPick) offers.push(midPick);
  } else if (difficultyLevel <= 3) {
    const valuePick = pickUnique(pool.filter(i => i.cost >= 28 && i.cost <= 55));
    if (valuePick) offers.push(valuePick);
  }

  if (difficultyLevel >= 5) {
    const rarePick = pickUnique(pool.filter(i => (i.minDifficulty ?? 0) >= 5));
    if (rarePick) offers.push(rarePick);
  }

  if (difficultyLevel >= 2) {
    const mechPick = pickUnique(pool.filter(i => inferShopTag(i) === 'mechanic'));
    if (mechPick) offers.push(mechPick);
  }

  if (difficultyLevel >= 5 && wave >= 4) {
    const mechPick2 = pickUnique(pool.filter(i => inferShopTag(i) === 'mechanic' && (i.minDifficulty ?? 0) >= 3));
    if (mechPick2) offers.push(mechPick2);
  }

  if (options.shopTagQuota) {
    for (const tag of ['heal', 'mechanic', 'offense', 'defense', 'economy']) {
      if (offers.length >= count) break;
      const tagged = pool.filter(i => inferShopTag(i) === tag);
      const tagPick = pickUnique(tagged);
      if (tagPick) offers.push(tagPick);
    }
  }

  while (offers.length < count && pool.length > 0) {
    const pick = pickUnique(pool);
    if (pick) offers.push(pick);
    else break;
  }
  return offers;
}

const WAVE_DURATION_BASE = 40;
const WAVE_DURATION_GROWTH = 3;
const WAVE_DURATION = WAVE_DURATION_BASE;
const TOTAL_WAVES = 10;

function getWaveDuration(wave = 1) {
  const w = Math.max(1, Math.floor(wave || 1));
  return WAVE_DURATION_BASE + (w - 1) * WAVE_DURATION_GROWTH;
}

function isMilestoneWave(wave = 1) {
  const w = Math.max(1, Math.floor(wave || 1));
  return w === 5 || w === 10;
}

function isTimedWave(wave = 1) {
  return !isMilestoneWave(wave);
}

function getWaveTimeRemaining(waveTimer, wave = 1) {
  if (!isTimedWave(wave)) return Infinity;
  return Math.max(0, getWaveDuration(wave) - waveTimer);
}

function isWaveTimedOut(waveTimer, wave = 1) {
  if (!isTimedWave(wave)) return false;
  return waveTimer >= getWaveDuration(wave);
}
const GOLD_DROP_CHANCE = 0.58;
const GOLD_REWARD_MULT = 1.0;
const XP_REWARD_MULT = 0.82;
const WAVE_GOLD_BONUS = 24;

function getXpToNext(level) {
  const lv = Math.max(1, Math.floor(level || 1));
  if (lv === 1) return 18;
  return Math.floor(16 + lv * 11 + lv * lv * 0.75);
}

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 8;

const DIFFICULTY_LABELS = {
  1: '入门',
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
    const rewardMult = 0.925 + Math.pow(t, 0.8) * 0.17;
    map[i] = {
      level: i,
      name: `难度 ${i}`,
      label: DIFFICULTY_LABELS[i],
      desc: i === MIN_DIFFICULTY ? '入门体验，最适合新手'
        : i === 2 ? '标准体验'
        : i === MAX_DIFFICULTY ? '海量强敌，商店栏位最多'
        : `敌人强化 ${Math.round(t * 100)}% · 奖励 ${Math.round(rewardMult * 100)}%`,
      hpMult: 0.78 + Math.pow(t, 0.88) * 2.45,
      minionHpMult: 0.88 + Math.pow(t, 0.72) * 3.85,
      wave1MinionHpMult: i <= 4 ? 1 : Math.max(0.55, 1.35 - i * 0.1),
      dmgMult: 0.7 + t * 1.15,
      bossDmgMult: 0.74 + Math.pow(t, 0.9) * 0.55,
      speedMult: 0.85 + t * 0.4,
      countMult: 0.75 + t * 1.1,
      spawnRateMult: 1.3 - t * 0.65,
      maxEnemyMult: 0.8 + t * 0.6,
      rewardMult,
      shopSlots: 3 + Math.floor(Math.min(i, 6) / 2),
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
