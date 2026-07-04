// 程序化像素贴图 — 无需外部图片文件，双击 index.html 即可运行
const Sprites = {
  cache: {},
  ready: false,

  init() {
    if (this.ready) return;
    this._bakeAll();
    this.ready = true;
  },

  _palette(base) {
    return {
      '.': null,
      'k': '#1a1a2e',
      's': '#2d2d44',
      'o': 'rgba(0,0,0,0.35)',
      ...base,
    };
  },

  _bake(name, rows, palette, scale = 2) {
    const pal = this._palette(palette);
    const h = rows.length;
    const w = rows[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const ch = rows[y][x];
        if (!ch || ch === '.' || !pal[ch]) continue;
        ctx.fillStyle = pal[ch];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    this.cache[name] = { canvas, w: canvas.width, h: canvas.height, pivotX: canvas.width / 2, pivotY: canvas.height / 2 };
  },

  _bakeAll() {
    const PS = 3; // 人物用更大像素

    // ── 玩家：战士（俯视，朝屏幕下方）──
    this._bake('player_warrior_0', [
      '......hhhhhh......',
      '.....hffffffh.....',
      '....hffeeffh....',
      '....hffffffh....',
      '...krrrrrrrrk...',
      '...krrrrrrrrk...',
      '...kwwrrrrwwk...',
      '....krrrrrrk....',
      '.....krrrrk.....',
      '.....kggggk.....',
      '.....kg..gk.....',
      '......kgk.......',
    ], { h: '#ffd93d', f: '#ffccaa', e: '#2d3436', r: '#ff6b6b', w: '#ffd93d', g: '#444455', k: '#1a1a2e' }, PS);

    this._bake('player_warrior_1', [
      '......hhhhhh......',
      '.....hffffffh.....',
      '....hffeeffh....',
      '....hffffffh....',
      '...krrrrrrrrk...',
      '...krrrrrrrrk...',
      '...kwwrrrrwwk...',
      '....krrrrrrk....',
      '.....krrrrk.....',
      '.....kggggk.....',
      '....kg....gk....',
      '....kg....gk....',
    ], { h: '#ffd93d', f: '#ffccaa', e: '#2d3436', r: '#ff6b6b', w: '#ffd93d', g: '#444455', k: '#1a1a2e' }, PS);

    // ── 玩家：法师 ──
    this._bake('player_mage_0', [
      '.......bb.......',
      '......bbbb......',
      '.....bbffbb.....',
      '....bbfeebb....',
      '....bbffbb....',
      '...bbbbbbbb...',
      '...bbbbbbbb...',
      '....bbbbbb....',
      '.....bbbb.....',
      '.....bpppb.....',
      '.....bp.pb.....',
      '......p.p......',
    ], { b: '#70a1ff', f: '#ffccaa', e: '#2d3436', p: '#5352ed' }, PS);

    this._bake('player_mage_1', [
      '.......bb.......',
      '......bbbb......',
      '.....bbffbb.....',
      '....bbfeebb....',
      '....bbffbb....',
      '...bbbbbbbb...',
      '...bbbbbbbb...',
      '....bbbbbb....',
      '.....bbbb.....',
      '....bpppppb....',
      '....bp...pb....',
      '....bp...pb....',
    ], { b: '#70a1ff', f: '#ffccaa', e: '#2d3436', p: '#5352ed' }, PS);

    // ── 玩家：游侠 ──
    this._bake('player_ranger_0', [
      '......gggg......',
      '.....gffffg.....',
      '....gffeeffg....',
      '....gffffffg....',
      '...gggggggg...',
      '...gggggggg...',
      '....gggggg....',
      '.....gggg.....',
      '.....gbbbg.....',
      '.....gb.bg.....',
      '.....gb.bg.....',
      '......g.g......',
    ], { g: '#6bcb77', f: '#ffccaa', e: '#2d3436', b: '#8B6914' }, PS);

    this._bake('player_ranger_1', [
      '......gggg......',
      '.....gffffg.....',
      '....gffeeffg....',
      '....gffffffg....',
      '...gggggggg...',
      '...gggggggg...',
      '....gggggg....',
      '.....gggg.....',
      '.....gbbbg.....',
      '....gb...bg....',
      '....gb...bg....',
      '....gb...bg....',
    ], { g: '#6bcb77', f: '#ffccaa', e: '#2d3436', b: '#8B6914' }, PS);

    // ── 玩家：召唤师（兜帽、法阵、法杖）──
    this._bake('player_summoner_0', [
      '.....hhhhhh.....',
      '....hhhhhhhh....',
      '...hhhffeehhh...',
      '...hhhhhhhhhh...',
      '..kvvvvvvvvvvk..',
      '..kvvgtttgpgvvk.',
      '..kvvppppppvvk..',
      '..kvvppccppvvk..',
      '..kvvgtttgpgvvk.',
      '...kvvvvvvvvvk..',
      '....kvvvvvvvk...',
      '.....kvvvvvk....',
      '.....kvssssvk...',
      '.....ks..ssk....',
      '......k....k....',
      '.......k..k.....',
      '........kk......',
      '.........wwc....',
      '........wccc....',
      '.........wc.....',
    ], {
      h: '#2d1b4e', f: '#ffccaa', e: '#2d3436',
      v: '#5f4bb6', p: '#a29bfe', g: '#ffd93d',
      c: '#00cec9', t: '#74b9ff', k: '#12081f',
      w: '#5d4037', s: '#3d3d55',
    }, PS);

    this._bake('player_summoner_1', [
      '.....hhhhhh.....',
      '....hhhhhhhh....',
      '...hhhffeehhh...',
      '...hhhhhhhhhh...',
      '..kvvvvvvvvvvk..',
      '..kvvgtttgpgvvk.',
      '..kvvppppppvvk..',
      '..kvvppccppvvk..',
      '..kvvgtttgpgvvk.',
      '...kvvvvvvvvvk..',
      '....kvvvvvvvk...',
      '.....kvvvvvk....',
      '....ks....sk....',
      '....k......k....',
      '.....k....k.....',
      '......k..k......',
      '.......kk.......',
      '....wwc.........',
      '...wccc....t....',
      '....wc.....t....',
    ], {
      h: '#2d1b4e', f: '#ffccaa', e: '#2d3436',
      v: '#5f4bb6', p: '#a29bfe', g: '#ffd93d',
      c: '#00cec9', t: '#74b9ff', k: '#12081f',
      w: '#5d4037', s: '#3d3d55',
    }, PS);

    // ── 召唤物 ──
    const SS = 2;
    this._bake('summon_turret_0', [
      '....ssssss....',
      '...sbbbbbs...',
      '..sbccccbs..',
      '..sbccccbs..',
      '..sbbbbbbbs..',
      '...sbbbbbs...',
      '....ssssss....',
      '.....ccc.....',
      '.....ccc.....',
      '......c......',
    ], { s: '#3d3d55', b: '#5352ed', c: '#00cec9' }, SS);

    this._bake('summon_turret_1', [
      '....ssssss....',
      '...sbbbbbs...',
      '..sbcccbcbs..',
      '..sbccccbs..',
      '..sbbbbbbbs..',
      '...sbbbbbs...',
      '....ssssss....',
      '.....ccc.....',
      '.....ccc.....',
      '......c......',
    ], { s: '#3d3d55', b: '#5352ed', c: '#81ecec' }, SS);

    this._bake('summon_boar_0', [
      '..............',
      '....bbbbbb....',
      '...bbbbbbbb...',
      '..bbbbbbbbbb..',
      '.bbbbbbeebbbb.',
      '.bbbbbbebbbbbb',
      '..bbbbbbbbbb..',
      '...bb....bb...',
      '..bb......bb..',
      '.b...........b',
    ], { b: '#8B4513', e: '#2d3436', t: '#5a3a1a' }, SS);

    this._bake('summon_boar_1', [
      '..............',
      '....bbbbbb....',
      '...bbbbbbbb...',
      '..bbbbbbbbbb..',
      '.bbbbbbeebbbb.',
      '.bbbbbbebbbbbb',
      '..bbbbbbbbbb..',
      '...bb....bb...',
      '..b........b..',
      '.b..........b.',
    ], { b: '#8B4513', e: '#2d3436', t: '#5a3a1a' }, SS);

    this._bake('summon_wolf_0', [
      '.....gggg.....',
      '....gggggg....',
      '...gggeegg....',
      '...ggggggg....',
      '..ggggggggg...',
      '..ggggggggg...',
      '.ggg....ggg...',
      '.gg......gg...',
      '..g......g....',
    ], { g: '#636e72', e: '#dfe6e9' }, SS);

    this._bake('summon_wolf_1', [
      '.....gggg.....',
      '....gggggg....',
      '...gggeegg....',
      '...ggggggg....',
      '..ggggggggg...',
      '..ggggggggg...',
      '.ggg....ggg...',
      '..g......g....',
      '...g....g.....',
    ], { g: '#636e72', e: '#dfe6e9' }, SS);

    this._bake('summon_bear_0', [
      '...bbbb.......',
      '...bbbb.......',
      '..bbbbbbbb....',
      '.bbbbbbbbbb...',
      '.bbbbebbbbbb..',
      '.bbbbbbbbbbb..',
      '..bbbbbbbbbb..',
      '...bb....bb...',
      '..bb......bb..',
      '..bb......bb..',
    ], { b: '#6d4c41', e: '#2d3436' }, SS);

    this._bake('summon_mammoth_0', [
      '.....tttt.....',
      '....tttttt....',
      '...tttttttt...',
      '..tttttttttt..',
      '.tttttttttttt.',
      '.ttttettttttt.',
      '.tttttttttttt.',
      'ttt........ttt',
      'tt..........tt',
      'tt..........tt',
    ], { t: '#b2bec3', e: '#2d3436' }, SS);

    this._bake('summon_eagle_0', [
      '..............',
      '.....rrrr.....',
      '....rrrrrr....',
      '...rrreeerr...',
      '...rrrrrrrr...',
      '..rrrrrrrrrr..',
      '.rrr......rrr.',
      'rr..........rr',
    ], { r: '#e17055', e: '#fff' }, SS);

    this._bake('summon_eagle_1', [
      'rr..........rr',
      '.rrr......rrr.',
      '..rrrrrrrrrr..',
      '...rrrrrrrr...',
      '...rrreeerr...',
      '....rrrrrr....',
      '.....rrrr.....',
      '..............',
    ], { r: '#e17055', e: '#fff' }, SS);

    this._bake('summon_dragon_0', [
      '.......rrrr.......',
      '......rrrrrr......',
      '.....rrryyyrr.....',
      '....rrryyyowrr....',
      '...rrryyyoowrr...',
      '..bbrrryyoowrrbb..',
      '.bbrrryyeowwrrbb.',
      'bbrrryyeeowrrbb',
      '.brrryyeeowrrb.',
      '..ryyywwwyyr..',
      '..rywwwwwwyr..',
      '...rwwwwwwr...',
      '....rr..rr....',
    ], { r: '#d63031', y: '#fdcb6e', o: '#e17055', w: '#ff7675', e: '#fff', b: '#2d1b4e' }, 2);

    this._bake('summon_dragon_1', [
      '...bb.......bb...',
      '...bb.......bb...',
      '.......rrrr.......',
      '......rrrrrr......',
      '.....rrryyyrr.....',
      '....rrryyyowrr....',
      '...rrryyyoowrr...',
      '..bbrrryyoowrrbb..',
      '.bbrrryyeowwrrbb.',
      'bbrrryyeeowrrbb',
      '.brrryyeeowrrb.',
      '..ryyywwwyyr..',
      '..rywwwwwwyr..',
      '...rwwwwwwr...',
    ], { r: '#d63031', y: '#fdcb6e', o: '#e17055', w: '#ff7675', e: '#fff', b: '#2d1b4e' }, 2);

    // ── 怪物：史莱姆 ──
    this._bake('enemy_slime_0', [
      '.....gggg.....',
      '...gggggggg...',
      '..gggggggggg..',
      '.gggggggggggg.',
      'gggggggggggggg',
      'gggggggggggggg',
      'ggggeeeegggggg',
      'ggggeeeegggggg',
      '.gggggggggggg.',
      '..gggggggggg..',
      '...gggggggg...',
      '.....gggg.....',
    ], { g: '#6bcb77', e: '#1a1a2e' });

    this._bake('enemy_slime_1', [
      '....gggggg....',
      '..gggggggggg..',
      '.gggggggggggg.',
      'gggggggggggggg',
      'gggggggggggggg',
      'gggggggggggggg',
      'ggggeeeceegggg',
      'ggggeeeceegggg',
      'gggggggggggggg',
      '.gggggggggggg.',
      '..gggggggggg..',
      '....gggggg....',
    ], { g: '#6bcb77', e: '#1a1a2e', c: '#fff' });

    // ── 怪物：蝙蝠 ──
    this._bake('enemy_bat_0', [
      'bb...........bb',
      'bbb.........bbb',
      '.bbb.......bbb.',
      '..bbbb...bbbb..',
      '...bbbbbbbbb...',
      '....bbbbbbb....',
      '.....bbbbb.....',
      '......beb......',
      '......beb......',
      '.....bbbbb.....',
      '....bbbbbbb....',
      '...bbbbbbbbb...',
    ], { b: '#a29bfe', e: '#ff4757' });

    this._bake('enemy_bat_1', [
      '...............',
      'bb...........bb',
      'bbb.........bbb',
      '.bbb.......bbb.',
      '..bbbb...bbbb..',
      '...bbbbbbbbb...',
      '....bbbbbbb....',
      '.....bebeb.....',
      '....bbbbbbb....',
      '...bbbbbbbbb...',
      '..bbbbbbbbbbb..',
      '.bbbbbbbbbbbbb.',
    ], { b: '#a29bfe', e: '#ff4757' });

    // ── 怪物：骷髅 ──
    this._bake('enemy_skeleton_0', [
      '.....wwww.....',
      '....wwwwww....',
      '...wwweeww....',
      '...wwweeww....',
      '....wwwwww....',
      '.....wwww.....',
      '......ww......',
      '.....wwww.....',
      '....wwwwww....',
      '....ww..ww....',
      '....ww..ww....',
      '....ww..ww....',
    ], { w: '#dfe6e9', e: '#2d3436' });

    // ── 怪物：蛮兽 ──
    this._bake('enemy_brute_0', [
      '.....oooo.....',
      '...oooooooo...',
      '..oooooooooo..',
      '.oooooooooooo.',
      'oooooooooooooo',
      'oooeooooooeooo',
      'oooooooooooooo',
      '.oooooooooooo.',
      '..oooooooooo..',
      '..ot......to..',
      '..ot......to..',
      '..ot......to..',
    ], { o: '#e17055', e: '#ffd93d', t: '#2d3436' });

    // ── 怪物：哥布林 ──
    this._bake('enemy_goblin_0', [
      '.....ggg.....',
      '....ggggg....',
      '...gggeggg...',
      '...ggggggg...',
      '....ggggg....',
      '.....ggg.....',
      '....gt.tg....',
      '....gt.tg....',
      '....ggggg....',
      '.....ggg.....',
      '.....ggg.....',
      '.....ggg.....',
    ], { g: '#55efc4', e: '#d63031', t: '#2d3436' });

    this._bake('enemy_goblin_1', [
      '.....ggg.....',
      '....ggggg....',
      '...gggeggg...',
      '...ggggggg...',
      '....ggggg....',
      '.....ggg.....',
      '....gt.tg....',
      '....gt.tg....',
      '....ggggg....',
      '....gg..gg...',
      '....gg..gg...',
      '....gg..gg...',
    ], { g: '#55efc4', e: '#d63031', t: '#2d3436' });

    // ── 怪物：僵尸 ──
    this._bake('enemy_zombie_0', [
      '.....zzzz.....',
      '....zzzzzz....',
      '...zzzezzz....',
      '...zzzzzzz....',
      '....zzzzzz....',
      '.....zzzz.....',
      '.....zzzz.....',
      '....zzzzzz....',
      '....zz..zz....',
      '....zz..zz....',
      '....zz..zz....',
      '....zz..zz....',
    ], { z: '#636e72', e: '#00b894' });

    // ── 怪物：幽灵 ──
    this._bake('enemy_ghost_0', [
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbeebb....',
      '...bbbbbbb....',
      '....bbbbbb....',
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbbbbbb...',
      '.bbbbbbbbbbbb.',
      '..bbb.bbb.bbb.',
      '...bb...bb....',
      '....b...b.....',
    ], { b: '#74b9ff', e: '#fff' });

    this._bake('enemy_ghost_1', [
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbeebb....',
      '...bbbbbbb....',
      '....bbbbbb....',
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbbbbbb...',
      '.bbbbbbbbbbbb.',
      '..bb.bbb.bb.b.',
      '...b.....b....',
      '....b...b.....',
    ], { b: '#74b9ff', e: '#fff' });

    // ── 怪物：邪法师 ──
    this._bake('enemy_mage_0', [
      '.....pppp.....',
      '....pppppp....',
      '...pppeppp....',
      '...ppppppp....',
      '....pppppp....',
      '.....pppp.....',
      '....pppppp....',
      '...pppppppp...',
      '...pppppppp...',
      '....pp..pp....',
      '....pp..pp....',
      '....pp..pp....',
    ], { p: '#a29bfe', e: '#ffeaa7' });

    // ── 怪物：爆弹怪 ──
    this._bake('enemy_exploder_0', [
      '.....yyyy.....',
      '....yyyyyy....',
      '...yyyyyyyy...',
      '...yyyeeyyy...',
      '...yyyyyyyy...',
      '....yyyyyy....',
      '.....yyyy.....',
      '.....r.r......',
      '.....r.r......',
      '.....yyyy.....',
      '....yyyyyy....',
      '....yyyyyy....',
    ], { y: '#fdcb6e', e: '#d63031', r: '#e17055' });

    this._bake('enemy_exploder_1', [
      '.....yyyy.....',
      '....yyyyyy....',
      '...yyyyyyyy...',
      '...yyyeeyyy...',
      '...yyyyyyyy...',
      '....yyyyyy....',
      '.....yyyy.....',
      '.....r.r......',
      '.....r.r......',
      '.....yyyy.....',
      '....yy..yy....',
      '....yy..yy....',
    ], { y: '#fdcb6e', e: '#d63031', r: '#e17055' });

    // ── 怪物：冲锋兽 ──
    this._bake('enemy_charger_0', [
      '.....hhhh.....',
      '....hhhhhh....',
      '...hhheehh....',
      '...hhhhhhhh...',
      '....hhhhhh....',
      '.....hhhh.....',
      '....hhhhhh....',
      '...hhhhhhhh...',
      '...hh....hh...',
      '...hh....hh...',
      '...hh....hh...',
      '...hh....hh...',
    ], { h: '#e84393', e: '#ffd93d' });

    // ── 怪物：分裂怪 ──
    this._bake('enemy_splitter_0', [
      '.....tttt.....',
      '....tttttt....',
      '...tttetttt...',
      '...tttttttt...',
      '....tttttt....',
      '.....tttt.....',
      '....tttttt....',
      '...tttttttt...',
      '...tttttttt...',
      '....tt..tt....',
      '....tt..tt....',
      '....tt..tt....',
    ], { t: '#00b894', e: '#fff' });

    this._bake('enemy_splitter_1', [
      '.....tttt.....',
      '....tttttt....',
      '...tttetttt...',
      '...tttttttt...',
      '....tttttt....',
      '.....tttt.....',
      '....tttttt....',
      '...tttttttt...',
      '...tttttttt...',
      '....tt..tt....',
      '....tt..tt....',
      '....tt..tt....',
    ], { t: '#00b894', e: '#fff' });

    // ── 怪物：小史莱姆 ──
    this._bake('enemy_miniSlime_0', [
      '....gggg....',
      '..gggggggg..',
      '.gggggggggg.',
      'gggggggggggg',
      'ggggeeeegggg',
      '.gggggggggg.',
      '..gggggggg..',
      '....gggg....',
    ], { g: '#6bcb77', e: '#1a1a2e' });

    this._bake('enemy_miniSlime_1', [
      '...gggggg...',
      '.gggggggggg.',
      'gggggggggggg',
      'gggggggggggg',
      'ggggeeeegggg',
      'gggggggggggg',
      '.gggggggggg.',
      '...gggggg...',
    ], { g: '#6bcb77', e: '#1a1a2e' });

    // ── 怪物：毒蜘蛛 ──
    this._bake('enemy_spider_0', [
      '.....ssss.....',
      '...ssssssss...',
      '..ssseeeess..',
      '.ssssssssss.',
      '..s.ssss.s..',
      '.s.s.s.s.s.s.',
      's....ss....s',
      '.....ss.....',
      '.....ss.....',
      '.....ss.....',
      '.....ss.....',
      '.....ss.....',
    ], { s: '#2d1b4e', e: '#ff4757' });

    this._bake('enemy_spider_1', [
      '.....ssss.....',
      '...ssssssss...',
      '..ssseeeess..',
      '.ssssssssss.',
      's.s.ssss.s.s',
      '.s.s.s.s.s.s',
      '.....ss.....',
      's....ss....s',
      '.....ss.....',
      '.....ss.....',
      '.....ss.....',
      '.....ss.....',
    ], { s: '#2d1b4e', e: '#ff4757' });

    // ── 怪物：腐蝇 ──
    this._bake('enemy_fly_0', [
      '....gggg....',
      '...ggeeggg...',
      '....gggg....',
      '..gg....gg..',
      '.g........g.',
      '.g........g.',
      '..gg....gg..',
      '....gggg....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
    ], { g: '#27ae60', e: '#1a1a2e' });

    this._bake('enemy_fly_1', [
      '.....gg.....',
      '....gggg....',
      '...ggeeggg...',
      '....gggg....',
      '...gg..gg...',
      '..g......g..',
      '...gg..gg...',
      '....gggg....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
    ], { g: '#27ae60', e: '#1a1a2e' });

    // ── 怪物：蛆虫 ──
    this._bake('enemy_maggot_0', [
      '.....wwww.....',
      '...wwwwwwww...',
      '..wwwwwwwwww..',
      '.wwwwwwwwwwww.',
      '..wwwwwwwwww..',
      '...wwwwwwww...',
      '....wwwwww....',
      '.....wwww.....',
      '......ww......',
      '......ww......',
      '......ww......',
      '......ww......',
    ], { w: '#ecf0f1', e: '#bdc3c7' });

    this._bake('enemy_maggot_1', [
      '......ww......',
      '.....wwww.....',
      '....wwwwww....',
      '...wwwwwwww...',
      '..wwwwwwwwww..',
      '.wwwwwwwwwwww.',
      '..wwwwwwwwww..',
      '...wwwwwwww...',
      '....wwwwww....',
      '.....wwww.....',
      '......ww......',
      '......ww......',
    ], { w: '#ecf0f1', e: '#bdc3c7' });

    // ── 怪物：魔眼 ──
    this._bake('enemy_eye_0', [
      '.....rrrr.....',
      '...rrrrrrrr...',
      '..rrreeerrr..',
      '.rrrrrrrrrrr.',
      '.rrrrrrrrrrr.',
      '..rrrrrrrrr..',
      '...rrrrrrr...',
      '....rrrrr....',
      '.....rrr.....',
      '.....rrr.....',
      '.....rrr.....',
      '.....rrr.....',
    ], { r: '#c0392b', e: '#2c3e50' });

    this._bake('enemy_eye_1', [
      '.....rrrr.....',
      '...rrrrrrrr...',
      '..rrreceerrr..',
      '.rrrrrrrrrrr.',
      '.rrrrrrrrrrr.',
      '..rrrrrrrrr..',
      '...rrrrrrr...',
      '....rrrrr....',
      '.....rrr.....',
      '.....rrr.....',
      '.....rrr.....',
      '.....rrr.....',
    ], { r: '#c0392b', e: '#2c3e50', c: '#fff' });

    // ── 怪物：跳蚤 ──
    this._bake('enemy_hopper_0', [
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbeebbb...',
      '....bbbbbb....',
      '.....bbbb.....',
      '....bbbbbb....',
      '....bb..bb....',
      '....bb..bb....',
      '.....bbbb.....',
      '.....bbbb.....',
      '.....bbbb.....',
      '.....bbbb.....',
    ], { b: '#8B4513', e: '#ffd93d' });

    // ── 怪物：裂口者 ──
    this._bake('enemy_gaper_0', [
      '.....rrrr.....',
      '...rrrrrrrr...',
      '..rrrwwrrr..',
      '..rrrwwrrr..',
      '.rrrrrrrrrr.',
      '..rrr..rrr..',
      '...rr..rr...',
      '....rrrr....',
      '.....rr.....',
      '.....rr.....',
      '.....rr.....',
      '.....rr.....',
    ], { r: '#e74c3c', w: '#2c3e50' });

    this._bake('enemy_gaper_1', [
      '.....rrrr.....',
      '...rrrrrrrr...',
      '..rrrwwrrr..',
      '..rrrwwrrr..',
      '.rrrrrrrrrr.',
      '..rrrrrrrr..',
      '...rrrrrr...',
      '....rrrr....',
      '.....rr.....',
      '.....rr.....',
      '.....rr.....',
      '.....rr.....',
    ], { r: '#e74c3c', w: '#2c3e50' });

    // ── 怪物：肿胀尸 ──
    this._bake('enemy_bloater_0', [
      '.....zzzz.....',
      '...zzzzzzzz...',
      '..zzzzzzzzzz..',
      '.zzzzzzzzzzzz.',
      'zzzzzzzzzzzzzz',
      'zzzzeezzeezzzz',
      'zzzzzzzzzzzzzz',
      '.zzzzzzzzzzzz.',
      '..zzzzzzzzzz..',
      '...zz....zz...',
      '...zz....zz...',
      '...zz....zz...',
    ], { z: '#7f8c8d', e: '#2ecc71' });

    // ── 怪物：精英（多种） ──
    this._bake('enemy_eliteKnight_0', [
      '.....yyyy.....',
      '....yyyyyy....',
      '...yyyeeyy....',
      '...yyyyyyyy...',
      '....yyyyyy....',
      '.....yyyy.....',
      '....yyyyyy....',
      '...yyyyyyyy...',
      '...yy....yy...',
      '...yy....yy...',
      '...yy....yy...',
      '...yy....yy...',
    ], { y: '#fdcb6e', e: '#d63031' }, 3);

    this._bake('enemy_eliteMage_0', [
      '......pp......',
      '.....pppp.....',
      '....ppbbpp....',
      '...ppbbbbpp...',
      '...ppbebbpp...',
      '....ppbbpp....',
      '.....pppp.....',
      '.....llll.....',
      '....ll..ll....',
      '....ll..ll....',
      '....ll..ll....',
      '....ll..ll....',
    ], { p: '#a29bfe', b: '#6c5ce7', e: '#fff', l: '#dfe6e9' }, 3);

    this._bake('enemy_eliteBerserker_0', [
      '.....rrrr.....',
      '....rrrrrr....',
      '...rrreeerr...',
      '...rrrrrrrr...',
      '....rrrrrr....',
      '.....rrrr.....',
      '....rrrrrr....',
      '...rrrrrrrr...',
      '...rr....rr...',
      '...rr....rr...',
      '...rr....rr...',
      '...rr....rr...',
    ], { r: '#e84393', e: '#ff4757' }, 3);

    this._bake('enemy_elitePhantom_0', [
      '......bb......',
      '.....bbbb.....',
      '....bbeebb....',
      '...bbbbbbbb...',
      '...bbbeebb....',
      '....bbbbbb....',
      '.....bbbb.....',
      '.....bbbb.....',
      '....bb..bb....',
      '....bb..bb....',
      '....bb..bb....',
      '....bb..bb....',
    ], { b: '#74b9ff', e: '#fff' }, 3);

    this._bake('enemy_eliteWarlock_0', [
      '......vv......',
      '.....vvvv.....',
      '....vvwwvv....',
      '...vvwwwwvv...',
      '...vvweewvv...',
      '....vvwwvv....',
      '.....vvvv.....',
      '.....cccc.....',
      '....cc..cc....',
      '....cc..cc....',
      '....cc..cc....',
      '....cc..cc....',
    ], { v: '#6c5ce7', w: '#a29bfe', e: '#fff', c: '#2d3436' }, 3);

    // ── 怪物：BOSS（多种） ──
    this._bake('enemy_boss_0', [
      '....yyyy....',
      '..yrrrrrry..',
      '.yrrrrrrrry.',
      'yrrreeeerrry',
      'yrrreeeerrry',
      'yrrrrrrrrrry',
      '.yrrrrrrrry.',
      '..yrrrrrry..',
      '...yrrrrry...',
      '..yrr..rry..',
      '..yrr..rry..',
      '..yrr..rry..',
    ], { y: '#ffd93d', r: '#d63031', e: '#fff' }, 3);

    this._bake('enemy_bossHydra_0', [
      '...gg..gg...',
      '..ggg..ggg..',
      '.gggggggggg.',
      'ggggeegggggg',
      'gggggggggggg',
      '.gggggggggg.',
      '..gggggggg..',
      '...gggggg...',
      '..gg....gg..',
      '..gg....gg..',
      '..gg....gg..',
      '..gg....gg..',
    ], { g: '#00cec9', e: '#55efc4' }, 3);

    this._bake('enemy_bossTitan_0', [
      '.....oooo.....',
      '....oooooo....',
      '...oooyyoo....',
      '...oooooooo...',
      '....oooooo....',
      '.....oooo.....',
      '....oooooo....',
      '...oooooooo...',
      '...oo....oo...',
      '...oo....oo...',
      '...oo....oo...',
      '...oo....oo...',
    ], { o: '#e17055', y: '#fdcb6e' }, 3);

    // ── 武器贴图 ──
    this._bake('weapon_knife', [
      '......ss......',
      '.....sss......',
      '....ssss......',
      '...sssss......',
      '..ssssss......',
      '.sssssss......',
      'ssssssss......',
      '.lllllll......',
      '..lllll.......',
      '...lll........',
      '....l.........',
      '..............',
    ], { s: '#dfe6e9', l: '#8B6914' });

    this._bake('weapon_magic', [
      '......bb......',
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbbbbbb...',
      '...bbbebbb....',
      '....bbbbbb....',
      '.....bbbb.....',
      '......bb......',
      '..............',
      '..............',
      '..............',
      '..............',
    ], { b: '#70a1ff', e: '#fff' });

    this._bake('weapon_fireball', [
      '......oo......',
      '.....oyyyo.....',
      '....oyyyyo....',
      '...oyyyyyo...',
      '...oyewyyo...',
      '...oyyyyyo...',
      '....oyyyyo....',
      '.....oyyyo.....',
      '......oo......',
      '..............',
      '..............',
      '..............',
    ], { o: '#e17055', y: '#ffd93d', e: '#fff', w: '#ff7675' });

    this._bake('weapon_orbit', [
      '......pp......',
      '.....pppp.....',
      '....ppbbpp....',
      '...ppbbbbpp...',
      '...ppbebbpp...',
      '...ppbbbbpp...',
      '....ppbbpp....',
      '.....pppp.....',
      '......pp......',
      '..............',
      '..............',
      '..............',
    ], { p: '#a29bfe', b: '#6c5ce7', e: '#fff' });

    this._bake('weapon_whip', [
      '..............',
      '..............',
      '........yyyy..',
      '.......yyyyy..',
      '......yyyyyy..',
      '.....yyyyyyy..',
      '....yyyyyyyy..',
      '...yyyyyyyyy..',
      '..yyyyyyyyyy..',
      '.yyyyyyyyyyy..',
      'yyyyyyyyyyyy..',
      'yyyyyyyyyyyy..',
    ], { y: '#ffd93d' });

    this._bake('weapon_axe', [
      '......ss......',
      '.....ssss.....',
      '....ssssss....',
      '...ssssssss...',
      '...ssssssss...',
      '..ssssssssss..',
      '...lllllll....',
      '....lllll.....',
      '.....lll......',
      '......l.......',
      '..............',
      '..............',
    ], { s: '#b2bec3', l: '#636e72' });

    this._bake('weapon_cross', [
      '......pp......',
      '......pp......',
      '......pp......',
      '...pppppppp...',
      '...pppppppp...',
      '......pp......',
      '......pp......',
      '......pp......',
      '..............',
      '..............',
      '..............',
      '..............',
    ], { p: '#fd79a8' });

    this._bake('weapon_drone', [
      '......gg......',
      '.....gbbbg.....',
      '....gbbbbbg....',
      '...gbbeebbg...',
      '...gbbbbbbg...',
      '....gbbbbbg....',
      '.....gbbbg.....',
      '......ggg......',
      '......ccc......',
      '..............',
      '..............',
      '..............',
    ], { g: '#74b9ff', b: '#0984e3', e: '#fff', c: '#00cec9' });

    this._bake('shadow', [
      '....oooo....',
      '..oooooooo..',
      '.oooooooooo.',
      'oooooooooooo',
      '.oooooooooo.',
      '..oooooooo..',
      '....oooo....',
    ], { o: 'rgba(0,0,0,0.35)' }, 2);
  },

  get(name) {
    this.init();
    return this.cache[name];
  },

  draw(ctx, name, x, y, opts = {}) {
    const spr = this.get(name);
    if (!spr) return;

    const scale = opts.scale ?? 1;
    const rot = opts.rotation ?? 0;
    const alpha = opts.alpha ?? 1;
    const flash = opts.flash ?? false;
    const flipX = opts.flipX ?? false;
    const w = spr.w * scale;
    const h = spr.h * scale;

    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (flipX) ctx.scale(-1, 1);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;

    if (flash) {
      ctx.filter = 'brightness(2.5) saturate(0.3)';
    }

    ctx.drawImage(spr.canvas, -w / 2, -h / 2, w, h);
    ctx.restore();
  },

  drawShadow(ctx, x, y, scaleX = 1, scaleY = 0.35, yOffset = 14) {
    const spr = this.get('shadow');
    if (!spr) return;
    ctx.save();
    ctx.translate(x, y + yOffset);
    ctx.scale(scaleX, scaleY);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(spr.canvas, -spr.w / 2, -spr.h / 2);
    ctx.restore();
  },

  drawPlayer(ctx, player) {
    if (player.charId !== 'summoner' && KnightSprites.ready && KnightSprites.drawPlayer(ctx, player)) return;

    const moving = Math.hypot(player.vx, player.vy) > 10;
    const frame = moving ? (Math.floor(Date.now() / 150) % 2) : 0;
    const name = `player_${player.charId}_${frame}`;
    const flipX = Math.cos(player.facing) < -0.15;

    Sprites.drawShadow(ctx, player.x, player.y, 1.1);

    if (player.charId === 'summoner') {
      Sprites.drawSummonerAura(ctx, player);
    }

    Sprites.draw(ctx, name, player.x, player.y, { flipX });

    if (player.charId === 'summoner' && moving) {
      Sprites.drawSummonerTrail(ctx, player);
    }

    // 朝向指示（小三角，不旋转整个人物）
    if (moving && player.charId !== 'summoner') {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.facing);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(12, -6);
      ctx.lineTo(12, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },

  drawSummonerAura(ctx, player) {
    const t = Date.now() * 0.003;
    const pulse = 0.35 + Math.sin(t * 2) * 0.18;

    ctx.save();
    ctx.translate(player.x, player.y + 13);
    ctx.strokeStyle = `rgba(162, 155, 254, ${pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 7, 0, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = `rgba(0, 206, 201, ${pulse * 0.65})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 4.5, 0, 0, TAU);
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const a = t + (i / 4) * TAU;
      const px = Math.cos(a) * 14;
      const py = Math.sin(a) * 5 - 4;
      ctx.fillStyle = `rgba(116, 185, 255, ${0.45 + Math.sin(t * 3 + i) * 0.25})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  },

  drawSummonerTrail(ctx, player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.facing + Math.PI);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(162, 155, 254, ${0.25 - i * 0.07})`;
      ctx.beginPath();
      ctx.arc(16 + i * 7, (i - 1) * 3, 2.5 - i * 0.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  },

  drawSummon(ctx, entity) {
    const animated = ['turret', 'boar', 'wolf', 'eagle', 'dragon'];
    const frame = animated.includes(entity.typeId)
      ? Math.floor(entity.wobble * 2) % 2
      : 0;
    const name = `summon_${entity.typeId}_${frame}`;
    const scaleMap = {
      turret: 1.05,
      boar: 1.0,
      wolf: 0.95,
      bear: 1.15,
      mammoth: 1.25,
      eagle: 1.0,
      dragon: 1.55,
    };
    const scale = scaleMap[entity.typeId] || 1;
    const flipX = Math.cos(entity.facing || 0) < -0.1;
    const bob = entity.typeId === 'dragon'
      ? Math.sin(entity.wobble * 1.3) * 4
      : Math.sin(entity.wobble) * 1.5;

    Sprites.drawShadow(ctx, entity.x, entity.y + bob, scale * (entity.typeId === 'dragon' ? 1.1 : 0.8), 0.35);

    if (entity.typeId === 'dragon') {
      const pulse = 0.35 + Math.sin(entity.wobble * 2.5) * 0.15;
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 10, '#ff7675', pulse * 0.35);
      Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob, entity.radius + 16, '#fdcb6e', pulse * 0.28);
      for (let i = 0; i < 3; i++) {
        const a = entity.wobble * 2 + (i / 3) * TAU;
        ctx.save();
        ctx.fillStyle = `rgba(255, 118, 117, ${0.35 + Math.sin(entity.wobble * 4 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(
          entity.x + Math.cos(a) * (entity.radius + 8),
          entity.y + bob + Math.sin(a) * 6 - 6,
          2.5, 0, TAU
        );
        ctx.fill();
        ctx.restore();
      }
    } else if (entity.level >= 5) {
      ctx.save();
      ctx.translate(entity.x, entity.y + bob);
      ctx.strokeStyle = `rgba(255, 217, 61, ${0.25 + Math.sin(entity.wobble * 2) * 0.12})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, entity.radius + 5, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    const spr = Sprites.get(name);
    if (spr) {
      Sprites.draw(ctx, name, entity.x, entity.y + bob, {
        scale,
        flipX,
        flash: entity.flash > 0,
        rotation: entity.typeId === 'eagle' ? Math.sin(entity.wobble) * 0.2 : 0,
      });
      return true;
    }
    return false;
  },

  drawEnemy(ctx, enemy) {
    const animated = [
      'slime', 'bat', 'goblin', 'ghost', 'exploder', 'splitter', 'miniSlime',
      'spider', 'fly', 'maggot', 'eye', 'gaper', 'bloater', 'hopper',
    ];
    const frame = animated.includes(enemy.type)
      ? Math.floor(enemy.wobble * 2) % 2
      : 0;
    let name = `enemy_${enemy.type}_${frame}`;
    if (!Sprites.get(name)) name = `enemy_${enemy.type}_0`;

    const scaleMap = {
      brute: 1.15,
      boss: 1.4,
      bossHydra: 1.38,
      bossTitan: 1.48,
      eliteKnight: 1.24,
      eliteMage: 1.18,
      eliteBerserker: 1.28,
      elitePhantom: 1.14,
      eliteWarlock: 1.2,
      bloater: 1.12,
      zombie: 1.05,
      gaper: 1.0,
      charger: 1.08,
      hopper: 0.88,
      spider: 0.95,
      eye: 0.92,
      miniSlime: 0.75,
      maggot: 0.72,
      fly: 0.68,
      goblin: 0.9,
    };
    const scale = scaleMap[enemy.type] || (enemy.isBoss ? 1.35 : enemy.isElite ? 1.2 : 1);
    const bob = Math.sin(enemy.wobble) * (
      enemy.type === 'fly' || enemy.type === 'bat' ? 3.5
        : enemy.type === 'hopper' ? 2.5
          : enemy.isBoss ? 2.8
            : enemy.isElite ? 1.8
              : 1.2
    );
    const drawY = enemy.y + bob;
    const aura = enemy._def.auraColor || enemy.color;

    Sprites.drawShadow(ctx, enemy.x, enemy.y, scale * (enemy.isBoss ? 1.15 : enemy.isElite ? 0.95 : 0.85));

    if (enemy.type === 'ghost' || enemy.behavior === 'ghost' || enemy.behavior === 'elitePhantom') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius * 1.4, aura, 0.2);
    }
    if (enemy.type === 'exploder') {
      const pulse = 0.5 + Math.sin(enemy.wobble * 4) * 0.35;
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 6 + pulse * 4, '#fdcb6e', pulse * 0.45);
    }
    if (enemy.charging) {
      Sprites._drawChargeStreak(ctx, enemy);
    }
    if (enemy.type === 'mage' || enemy.behavior === 'ranged' || enemy.behavior === 'eliteMage') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius * 0.9, aura, 0.12 + Math.sin(enemy.wobble * 3) * 0.06);
    }
    if (enemy.isElite) {
      Sprites._drawEliteEffects(ctx, enemy, drawY, aura, scale);
    }
    if (enemy.isBoss) {
      Sprites._drawBossEffects(ctx, enemy, drawY, aura, scale);
    }

    const spr = Sprites.get(name);
    if (spr) {
      Sprites.draw(ctx, name, enemy.x, drawY, {
        scale,
        flash: enemy.flash > 0,
        alpha: enemy.alpha,
        rotation: enemy.type === 'spider' ? Math.sin(enemy.wobble) * 0.18
          : (enemy.charging && enemy.chargeDir)
            ? Math.atan2(enemy.chargeDir.y, enemy.chargeDir.x)
            : 0,
      });
    } else {
      Sprites._drawEnemyFallback(ctx, enemy, drawY, scale);
    }

    if (enemy.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.7, enemy.flash * 4);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(enemy.x, drawY, enemy.radius * scale * 0.9, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  },

  _drawEliteEffects(ctx, enemy, drawY, aura, scale) {
    const pulse = 0.35 + Math.sin(enemy.wobble * 2.5) * 0.18;
    Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius + 8, aura, pulse * 0.22);
    Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 10 + pulse * 3, aura, pulse * 0.42);
    Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 16, aura, pulse * 0.18);

    for (let i = 0; i < 4; i++) {
      const a = enemy.wobble * 1.8 + (i / 4) * TAU;
      ctx.save();
      ctx.fillStyle = aura;
      ctx.globalAlpha = 0.35 + Math.sin(enemy.wobble * 3 + i) * 0.2;
      ctx.beginPath();
      ctx.arc(
        enemy.x + Math.cos(a) * (enemy.radius + 12),
        drawY + Math.sin(a) * (enemy.radius * 0.35),
        2 + (i % 2),
        0, TAU
      );
      ctx.fill();
      ctx.restore();
    }

    if (enemy.type === 'eliteBerserker' && enemy.charging) {
      ctx.save();
      ctx.strokeStyle = '#ff4757';
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, drawY, enemy.radius + 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    if (enemy.type === 'eliteWarlock') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY - enemy.radius * 0.5, enemy.radius * 0.6, '#6c5ce7', 0.15 + Math.sin(enemy.wobble * 4) * 0.08);
    }
  },

  _drawBossEffects(ctx, enemy, drawY, aura, scale) {
    const pulse = 0.25 + Math.sin(enemy.wobble * 1.5) * 0.12;
    const pulse2 = 0.15 + Math.sin(enemy.wobble * 2.2 + 1) * 0.08;

    Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius + 18, aura, pulse * 0.28);
    Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 14, aura, pulse * 0.35);
    Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 22, aura, pulse2 * 0.22);
    Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 30, aura, pulse2 * 0.12);

    ctx.save();
    ctx.translate(enemy.x, drawY + enemy.radius * 0.55);
    ctx.scale(scale * 1.1, 0.35);
    ctx.fillStyle = aura;
    ctx.globalAlpha = 0.12 + pulse * 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 10, 0, TAU);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < 6; i++) {
      const a = -enemy.wobble * 0.9 + (i / 6) * TAU;
      ctx.save();
      ctx.fillStyle = enemy.type === 'bossTitan' ? '#fdcb6e' : enemy.type === 'bossHydra' ? '#55efc4' : '#ff7675';
      ctx.globalAlpha = 0.4 + Math.sin(enemy.wobble * 2 + i) * 0.25;
      ctx.beginPath();
      ctx.arc(
        enemy.x + Math.cos(a) * (enemy.radius + 24),
        drawY + Math.sin(a) * 8 - 6,
        3,
        0, TAU
      );
      ctx.fill();
      ctx.restore();
    }

    if (enemy.bossTimer != null && enemy.bossTimer < 0.6) {
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, drawY, enemy.radius + 8, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  },

  _drawEnemyGlow(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  },

  _drawEnemyRing(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    ctx.restore();
  },

  _drawChargeStreak(ctx, enemy) {
    if (!enemy.chargeDir) return;
    ctx.save();
    ctx.strokeStyle = enemy.color;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y);
    ctx.lineTo(
      enemy.x - enemy.chargeDir.x * (enemy.radius + 14),
      enemy.y - enemy.chargeDir.y * (enemy.radius + 14)
    );
    ctx.stroke();
    ctx.restore();
  },

  _drawEnemyFallback(ctx, enemy, y, scale) {
    const r = enemy.radius * 0.85 * scale;
    ctx.save();
    ctx.translate(enemy.x, y);
    ctx.globalAlpha = enemy.alpha || 1;
    ctx.fillStyle = enemy.color;

    if (enemy.type === 'slime' || enemy.type === 'miniSlime') {
      ctx.beginPath();
      ctx.ellipse(0, 2, r, r * 0.82, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(-r * 0.35, -r * 0.15, r * 0.22, r * 0.22);
      ctx.fillRect(r * 0.12, -r * 0.15, r * 0.22, r * 0.22);
    } else if (enemy.type === 'bat' || enemy.type === 'fly') {
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(-r * 0.2, -r * 0.5);
      ctx.lineTo(r * 0.3, 0);
      ctx.lineTo(-r * 0.2, r * 0.5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  },
};

Sprites.init();
