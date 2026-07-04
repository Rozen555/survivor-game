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
    const SL = 3;

    this._bake('summon_turret_0', [
      '......ssssss......',
      '.....sbbbbbbbs.....',
      '....sbllWWllbs....',
      '....sbccwwccbs....',
      '...sbbbccWWcbbbs...',
      '...sbccccccccbs...',
      '....sbccbbccbs....',
      '...sbbbccccbbbs...',
      '....ssbbbbbbss....',
      '.....ssssssss.....',
      '......dddddd......',
      '......dssssd......',
      '.......ssss.......',
      '........ss........',
    ], { s: '#2d3436', b: '#5352ed', c: '#00cec9', l: '#81ecec', w: '#dff9fb', W: '#fff', d: '#636e72' }, SS);

    this._bake('summon_turret_1', [
      '......ssssss......',
      '.....sbbbbbbbs.....',
      '....sbccWWccbs....',
      '....sbwwllwwbs....',
      '...sbbbccWWcbbbs...',
      '...sbccccccccbs...',
      '....sbccbbccbs....',
      '...sbbbccccbbbs...',
      '....ssbbbbbbss....',
      '.....llllllll.....',
      '......dddddd......',
      '......dssssd......',
      '.......ssss.......',
      '........ss........',
    ], { s: '#2d3436', b: '#5352ed', c: '#00cec9', l: '#81ecec', w: '#dff9fb', W: '#fff', d: '#636e72' }, SS);

    this._bake('summon_boar_0', [
      '................',
      '....hhhhhhhh....',
      '...hbbbbbbbbh...',
      '..hbbbbbbeebbbh.',
      '.hbbbbbbbtbbbbbh',
      '.bbbbbbbbbbbbbb.',
      '..bbbbnnnnbbbb..',
      '...bb......bb...',
      '..bb........bb..',
      '.bb..........bb.',
      '..tt........tt..',
    ], { b: '#8B4513', h: '#5a3a1a', e: '#2d3436', t: '#f5deb3', n: '#3e2723' }, SS);

    this._bake('summon_boar_1', [
      '................',
      '....hhhhhhhh....',
      '...hbbbbbbbbh...',
      '..hbbbbbbeebbbh.',
      '.hbbbbbbbtbbbbbh',
      '.bbbbbbbbbbbbbb.',
      '..bbbbnnnnbbbb..',
      '...bb......bb...',
      '..b..........b..',
      '.bb..........bb.',
      '..tt........tt..',
    ], { b: '#8B4513', h: '#5a3a1a', e: '#2d3436', t: '#f5deb3', n: '#3e2723' }, SS);

    this._bake('summon_wolf_0', [
      '......gggg......',
      '.....gGGGGg.....',
      '....gggeegg.....',
      '...gggGGggggg...',
      '..gggggggggggg..',
      '..ggggnnnggggg..',
      '..wwgg..ggww....',
      '..gg......gg....',
      '.g..........g...',
      '..tt........tt..',
    ], { g: '#4a5568', G: '#636e72', e: '#ecf0f1', n: '#2d3436', w: '#95a5a6', t: '#b2bec3' }, SS);

    this._bake('summon_wolf_1', [
      '......gggg......',
      '.....gGGGGg.....',
      '....gggeegg.....',
      '...gggGGggggg...',
      '..gggggggggggg..',
      '..ggggnnnggggg..',
      '..g........g....',
      '...g......g.....',
      '....g....g......',
      '.....tt..tt.....',
    ], { g: '#4a5568', G: '#636e72', e: '#ecf0f1', n: '#2d3436', w: '#95a5a6', t: '#b2bec3' }, SS);

    this._bake('summon_bear_0', [
      '......bb......bb......',
      '.....BBBBBBBBBBBB.....',
      '....BBBBBBBBBBBBBB....',
      '...BBBBBBeeBBBBBBBB...',
      '..BBBBBBmmnnBBBBBBBB..',
      '..BBBBBBBBBBBBBBBBBB..',
      '.BBBBBBBBBBBBBBBBBBBB.',
      '.bbb..BBBBBBBBBB..bbb.',
      '..bb....BBBBBB....bb..',
      '..bb.....BBBB.....bb..',
      '.bb.......bb.......bb.',
      '..cc......cc......cc..',
    ], { b: '#4a3428', B: '#6d4c41', e: '#2d3436', m: '#8d6e63', n: '#3e2723', c: '#5d4037' }, SL);

    this._bake('summon_bear_1', [
      '......bb......bb......',
      '.....BBBBBBBBBBBB.....',
      '....BBBBBBBBBBBBBB....',
      '...BBBBBBeeBBBBBBBB...',
      '..BBBBBBmmnnBBBBBBBB..',
      '..BBBBBBBBBBBBBBBBBB..',
      '.BBBBBBBBBBBBBBBBBBBB.',
      '.bbb..BBBBBBBBBB..bbb.',
      '..bb....BBBBBB....bb..',
      '.bb......BBBB......bb.',
      'bb........bb........bb',
      'cc........cc........cc',
    ], { b: '#4a3428', B: '#6d4c41', e: '#2d3436', m: '#8d6e63', n: '#3e2723', c: '#5d4037' }, SL);

    this._bake('summon_mammoth_0', [
      '........tttttt........',
      '.......tttttttt.......',
      '......tttttttttt......',
      '.....tttttttttttt.....',
      '....tttttttttttttt....',
      '...tttteitttteitttt...',
      '....tttnnnnnntttt.....',
      '..tttttttttttttttttt..',
      '.tttttttttttttttttttt.',
      'tttttttttttttttttttttt',
      'hhh................hhh',
      'hh..hh..........hh..hh',
      'hh..cc..........cc..hh',
    ], { t: '#95a5a6', e: '#2d3436', i: '#ecf0f1', h: '#7f8c8d', n: '#636e72', c: '#576574' }, SL);

    this._bake('summon_mammoth_1', [
      '........tttttt........',
      '.......tttttttt.......',
      '......tttttttttt......',
      '.....tttttttttttt.....',
      '....tttttttttttttt....',
      '...tttteitttteitttt...',
      '....tttnnnnnntttt.....',
      '..tttttttttttttttttt..',
      '.tttttttttttttttttttt.',
      'tttttttttttttttttttttt',
      'hhh................hhh',
      'hh.hhh..........hhh.hh',
      'hh.hcc..........cch.hh',
    ], { t: '#95a5a6', e: '#2d3436', i: '#ecf0f1', h: '#7f8c8d', n: '#636e72', c: '#576574' }, SL);

    this._bake('summon_eagle_0', [
      '................',
      '.rr............rr.',
      '..rr..........rr..',
      '...rrrrrrrrrrrr...',
      '....wwweeewww.....',
      '.....yyyrrrr......',
      '......rrrr........',
      '.......rr.........',
      '........r.........',
      '................',
    ], { r: '#e17055', w: '#fff', e: '#2d3436', y: '#fdcb6e' }, SS);

    this._bake('summon_eagle_1', [
      '................',
      '.......rr.......',
      '......rrrr......',
      '.....rrrrrr.....',
      '....wwweeewww...',
      '...rrrrrrrrrr...',
      '..rr..........rr..',
      '.rr............rr.',
      '................',
      '................',
    ], { r: '#e17055', w: '#fff', e: '#2d3436', y: '#fdcb6e' }, SS);

    this._bake('summon_golem_0', [
      '......gggggg......',
      '.....gGGGGGg.....',
      '....gGGeeGGg....',
      '...gGGGmmGGGg...',
      '..gGGGGGGGGGGg..',
      '.gGGGGGGGGGGGGg.',
      '.gGGGGGGGGGGGGg.',
      '..gGGGGGGGGGGg..',
      '...gg......gg...',
      '..gg........gg..',
      '.gg..........gg.',
    ], { g: '#636e72', G: '#7f8c8d', e: '#2d3436', m: '#b2bec3' }, SL);

    this._bake('summon_golem_1', [
      '......gggggg......',
      '.....gGGGGGg.....',
      '....gGGeeGGg....',
      '...gGGGmmGGGg...',
      '..gGGGGGGGGGGg..',
      '.gGGGGGGGGGGGGg.',
      '.gGGGGGGGGGGGGg.',
      '..gGGGGGGGGGGg..',
      '...gg......gg...',
      '..gg........gg..',
      '.gg..........gg.',
      '..cc........cc..',
    ], { g: '#636e72', G: '#7f8c8d', e: '#2d3436', m: '#b2bec3', c: '#576574' }, SL);

    this._bake('summon_imp_0', [
      '......rrrr......',
      '.....rrRRrr.....',
      '....rrreeerr....',
      '...rrrmmrrrr....',
      '..rrrrrrrrrr....',
      '...ww....ww.....',
      '..tt......tt....',
      '...tt....tt.....',
      '................',
    ], { r: '#6c5ce7', R: '#a29bfe', e: '#fff', m: '#fd79a8', w: '#dfe6e9', t: '#2d3436' }, SS);

    this._bake('summon_imp_1', [
      '......rrrr......',
      '.....rrRRrr.....',
      '....rrreeerr....',
      '...rrrmmrrrr....',
      '..rrrrrrrrrr....',
      '...ww....ww.....',
      '..tt......tt....',
      '....tt..tt......',
      '.....tttt.......',
    ], { r: '#6c5ce7', R: '#a29bfe', e: '#fff', m: '#fd79a8', w: '#dfe6e9', t: '#2d3436' }, SS);

    this._bake('summon_spider_0', [
      '................',
      '...ll......ll...',
      '..llllllllllll..',
      '.llllllllllllll.',
      '.lllleeelllllll.',
      '..llllllllllll..',
      '...llllllllll...',
      '....ll....ll....',
      '...ll......ll...',
      '................',
    ], { l: '#2d3436', e: '#e17055' }, SS);

    this._bake('summon_spider_1', [
      '................',
      '...ll......ll...',
      '..llllllllllll..',
      '.llllllllllllll.',
      '.lllleeelllllll.',
      '..llllllllllll..',
      '...llllllllll...',
      '..ll........ll..',
      '.ll..........ll.',
      '................',
    ], { l: '#2d3436', e: '#e17055' }, SS);

    this._bake('summon_wisp_0', [
      '................',
      '......yyyy......',
      '.....yYYYYy.....',
      '....yYwwYYy.....',
      '....yYwwYYy.....',
      '.....yYYYYy.....',
      '......yyyy......',
      '.......yy.......',
      '................',
    ], { y: '#ffeaa7', Y: '#fdcb6e', w: '#fff' }, SS);

    this._bake('summon_wisp_1', [
      '................',
      '.....yyyyyy.....',
      '....yYYYYYYy....',
      '...yYYwwwwYYy...',
      '...yYYwwwwYYy...',
      '....yYYYYYYy....',
      '.....yyyyyy.....',
      '......yyyy......',
      '................',
    ], { y: '#ffeaa7', Y: '#fdcb6e', w: '#fff' }, SS);

    this._bake('summon_scorpion_0', [
      '................',
      '......gggg......',
      '.....ggGGgg.....',
      '....gggeegg.....',
      '...gggggggg.....',
      '..gggggggggg....',
      '...gg....gg.....',
      '..gg......gg....',
      '.tt........tt...',
      '................',
    ], { g: '#00b894', G: '#55efc4', e: '#2d3436', t: '#0984e3' }, SS);

    this._bake('summon_scorpion_1', [
      '................',
      '......tttt......',
      '.....gggggg.....',
      '....ggGGGGgg....',
      '...gggeeeegg....',
      '..gggggggggg....',
      '...gg....gg.....',
      '..gg......gg....',
      '.tt........tt...',
      '................',
    ], { g: '#00b894', G: '#55efc4', e: '#2d3436', t: '#0984e3' }, SS);

    this._bake('summon_skeleton_0', [
      '......wwww......',
      '.....wwEEww.....',
      '....wwwwwwww....',
      '....wwwwwwww....',
      '.....wwwwww.....',
      '......wwww......',
      '.....ww..ww.....',
      '....ww....ww....',
      '....ww....ww....',
      '................',
    ], { w: '#dfe6e9', E: '#2d3436' }, SS);

    this._bake('summon_skeleton_1', [
      '......wwww......',
      '.....wwEEww.....',
      '....wwwwwwww....',
      '....wwwwwwww....',
      '.....wwwwww.....',
      '......wwww......',
      '.....ww..ww.....',
      '....ww....ww....',
      '..ww........ww..',
      '................',
    ], { w: '#dfe6e9', E: '#2d3436' }, SS);

    this._bake('summon_dragon_0', [
      '........bb........bb........',
      '........rrrrrrrrrrrr........',
      '.......rrryyyyyyyrrr.......',
      '......rrryyyyowyyyrrr......',
      '.....rrryyyyooowyyyrrr.....',
      '....bbrrryyyyeeowyyyrrbb....',
      '...bbrrryyyyeeoowyyrrrbb...',
      '..bbrrrrrrrreeowwrrrrrbb..',
      '.bbrrrrrrrrreowwrrrrrrbb.',
      'bbrrrrrrrrrrrwwrrrrrrrrbb',
      '.brrryyyyyyywwyyyyyyrrb.',
      '..ryyywwwwwwwwwwwwwyyr..',
      '..rywwwwwwwwwwwwwwwyr..',
      '...rwwwwwwwwwwwwwwwr...',
      '....rrrr......rrrr....',
      '.....ff........ff.....',
    ], { r: '#d63031', y: '#fdcb6e', o: '#e17055', w: '#ff7675', e: '#fff', b: '#2d1b4e', f: '#6c5ce7' }, SL);

    this._bake('summon_dragon_1', [
      'bb..............bb........bb',
      'bb..............bb........bb',
      '........rrrrrrrrrrrr........',
      '.......rrryyyyyyyrrr.......',
      '......rrryyyyowyyyrrr......',
      '.....rrryyyyooowyyyrrr.....',
      '....bbrrryyyyeeowyyyrrbb....',
      '...bbrrryyyyeeoowyyrrrbb...',
      '..bbrrrrrrrreeowwrrrrrbb..',
      '.bbrrrrrrrrreowwrrrrrrbb.',
      'bbrrrrrrrrrrrwwrrrrrrrrbb',
      '.brrryyyyyyywwyyyyyyrrb.',
      '..ryyywwwwwwwwwwwwwyyr..',
      '..rywwwwwwwwwwwwwwwyr..',
      '...rwwwwwwwwwwwwwwwr...',
      '....ff............ff....',
    ], { r: '#d63031', y: '#fdcb6e', o: '#e17055', w: '#ff7675', e: '#fff', b: '#2d1b4e', f: '#6c5ce7' }, SL);

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

    this._bake('enemy_skeleton_1', [
      '.....wwww.....',
      '....wwwwww....',
      '...wwweeww....',
      '...wwwwwwww...',
      '....wwwwww....',
      '.....wwww.....',
      '.....wwww.....',
      '......ww......',
      '.....wwww.....',
      '....ww..ww....',
      '...ww....ww...',
      '...ww....ww...',
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

    this._bake('enemy_brute_1', [
      '.....oooo.....',
      '...oooooooo...',
      '..oooooooooo..',
      '.oooooooooooo.',
      'oooooooooooooo',
      'oooeooooooeooo',
      'oooooooooooooo',
      '.oooooooooooo.',
      '..oooooooooo..',
      '..ot..oot.....',
      '..ot..oot.....',
      '....otoot.....',
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

    this._bake('enemy_zombie_1', [
      '.....zzzz.....',
      '....zzzzzz....',
      '...zzzezzz....',
      '...zzzzzzz....',
      '....zzzzzz....',
      '.....zzzz.....',
      '....gggggg....',
      '...gggggggg...',
      '....zz..zz....',
      '...zz....zz...',
      '....zz..zz....',
      '....zz..zz....',
    ], { z: '#636e72', e: '#00b894', g: '#2ecc71' });

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

    this._bake('enemy_mage_1', [
      '.....pppp.....',
      '....pppppp....',
      '...pppeppp....',
      '...ppppppp....',
      '....pppppp....',
      '.....pppp.....',
      '....ssssss....',
      '...ssssssss...',
      '...ssssssss...',
      '....ss..ss....',
      '....ss..ss....',
      '....ss..ss....',
    ], { p: '#a29bfe', e: '#ffeaa7', s: '#6c5ce7' });

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

    this._bake('enemy_charger_1', [
      '.....hhhh.....',
      '....hhhhhh....',
      '...hhhhhhhh...',
      '...hhheehh....',
      '....hhhhhh....',
      '.....hhhh.....',
      '....hhhhhh....',
      '...hhhhhhhh...',
      '...hh....hh...',
      '..hh......hh..',
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

    this._bake('enemy_hopper_1', [
      '.....bbbb.....',
      '....bbbbbb....',
      '...bbbeebbb...',
      '....bbbbbb....',
      '.....bbbb.....',
      '....bbbbbb....',
      '....bb..bb....',
      '....bb..bb....',
      '.....bbbb.....',
      '....bb..bb....',
      '...bb....bb...',
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

    this._bake('enemy_bloater_1', [
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
      '..zz......zz..',
      '...zz....zz...',
    ], { z: '#7f8c8d', e: '#2ecc71' });

    // ── 怪物：精英（各具特色造型） ──
    this._bake('enemy_eliteKnight_0', [
      '....ssss......',
      '...syyyyys....',
      '..syreeeys....',
      '.syyyyyyyys...',
      '..yyyyyyyy....',
      '...yyyyyy.....',
      '...ssssss.....',
      '..ss....ss....',
      '..ss....ss....',
      '..ss....ss....',
      '..ss....ss....',
      '..ss....ss....',
      '..ss....ss....',
      '..ss....ss....',
    ], { y: '#fdcb6e', e: '#d63031', s: '#b2bec3' }, 3);

    this._bake('enemy_eliteKnight_1', [
      '....ssss......',
      '...syyyyys....',
      '..syreeeys....',
      '.syyyyyyyys...',
      '..yyyyyyyy....',
      '...yyyyyy.....',
      '..ssssssss....',
      '.ss......ss...',
      '..ss....ss....',
      '...ss..ss.....',
      '....ssss......',
      '.....ss.......',
      '.....ss.......',
      '.....ss.......',
    ], { y: '#fdcb6e', e: '#d63031', s: '#dfe6e9' }, 3);

    this._bake('enemy_eliteMage_0', [
      '.....ww.......',
      '....wwww......',
      '...wwssww.....',
      '..wwweeww.....',
      '..wwssssww....',
      '...wwwwww.....',
      '....pppp......',
      '...pbbbbp.....',
      '...pbebbp.....',
      '...pbbbbp.....',
      '...pl..lp.....',
      '...pl..lp.....',
      '...pl..lp.....',
      '...pl..lp.....',
    ], { w: '#74b9ff', s: '#0984e3', p: '#a29bfe', b: '#6c5ce7', e: '#fff', l: '#dfe6e9' }, 3);

    this._bake('enemy_eliteMage_1', [
      '.....ww.......',
      '....wwww......',
      '...wwssww.....',
      '..wwweeww.....',
      '..wwssssww....',
      '...wwwwww.....',
      '....ssss......',
      '...s....s.....',
      '....s..s......',
      '.....ss.......',
      '...pl..lp.....',
      '...pl..lp.....',
      '...pl..lp.....',
      '...pl..lp.....',
    ], { w: '#74b9ff', s: '#0984e3', p: '#a29bfe', b: '#6c5ce7', e: '#fff', l: '#dfe6e9' }, 3);

    this._bake('enemy_eliteBerserker_0', [
      '..aa......aa..',
      '.aaa......aaa.',
      'aaarreeerraaa.',
      '.aaaaaaaaaaaa.',
      '..aaaaaaaaaa..',
      '...aaaaaaaa...',
      '...aaaaaaaa...',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
    ], { a: '#e84393', r: '#ff4757', e: '#fff' }, 3);

    this._bake('enemy_eliteBerserker_1', [
      '..aa......aa..',
      'aaa........aaa',
      'aaarreeerraaa.',
      'aaaaaaaaaaaaaa',
      '.aaaaaaaaaaaa.',
      '..aaaaaaaaaa..',
      '...aaaaaaaa...',
      '..aa......aa..',
      '.aa........aa.',
      'aa..........aa',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
      '..aa......aa..',
    ], { a: '#e84393', r: '#ff4757', e: '#fff' }, 3);

    this._bake('enemy_elitePhantom_0', [
      '...bb....bb...',
      '..bbbeeebbb...',
      '.bbbbbbbbbbbb.',
      '..bbbeebbb....',
      '...bbbbbbb....',
      '....bbbbbb....',
      '.....bbbb.....',
      '....bbbbbbb...',
      '...bb....bb...',
      '...bb....bb...',
      '....bbbbbb....',
      '.....bbbb.....',
      '......bb......',
      '......bb......',
    ], { b: '#74b9ff', e: '#fff' }, 3);

    this._bake('enemy_elitePhantom_1', [
      'bb..........bb',
      '.bbbeeebbb....',
      '..bbbbbbbbbbb.',
      '...bbbeebbb...',
      '....bbbbbbb...',
      '.....bbbbbb...',
      '......bbbb....',
      '....bbbbbbb...',
      '...bb....bb...',
      '....bbbbbb....',
      '.....bbbb.....',
      '......bb......',
      '......bb......',
      '......bb......',
    ], { b: '#74b9ff', e: '#fff' }, 3);

    this._bake('enemy_eliteWarlock_0', [
      '......vv......',
      '.....vvvv.....',
      '....vvssvv....',
      '...vvssssvv...',
      '...vvseesvv...',
      '....vvssvv....',
      '.....vvvv.....',
      '....cccccc....',
      '...cc....cc...',
      '...cc....cc...',
      '...cc....cc...',
      '...cc....cc...',
      '...cc....cc...',
      '...cc....cc...',
    ], { v: '#6c5ce7', s: '#2d3436', e: '#fff', c: '#1a1a2e' }, 3);

    this._bake('enemy_eliteWarlock_1', [
      '......vv......',
      '.....vvvv.....',
      '....vvssvv....',
      '...vvssssvv...',
      '...vvseesvv...',
      '....vvssvv....',
      '.....vvvv.....',
      '....pppppp....',
      '...p......p...',
      '....p....p....',
      '.....p..p.....',
      '...cc....cc...',
      '...cc....cc...',
      '...cc....cc...',
    ], { v: '#6c5ce7', s: '#2d3436', e: '#fff', c: '#1a1a2e', p: '#fd79a8' }, 3);

    // ── 怪物：BOSS（三种截然不同） ──
    this._bake('enemy_boss_0', [
      '....yyyy......',
      '..yrrrrrry....',
      '.yrreeweery...',
      'yrrrrrrrrrry..',
      'yyrrrrrrrryy..',
      '.yrrrrrrrry...',
      '..yrrrrrry....',
      '...yrrrrr.....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
    ], { y: '#ffd93d', r: '#d63031', e: '#fff', w: '#ff7675' }, 3);

    this._bake('enemy_boss_1', [
      '....yyyy......',
      'yrrrrrrrrrry..',
      'yrreeweewery..',
      'yrrrrrrrrrry..',
      'yyrrrrrrrryy..',
      '.yrrrrrrrry...',
      '..yrrrrrry....',
      '...yrrrrr.....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
      '..yr....ry....',
    ], { y: '#ffd93d', r: '#d63031', e: '#fff', w: '#ff7675' }, 3);

    this._bake('enemy_bossHydra_0', [
      '...gg..gg..gg...',
      '..ggg.ggg.ggg...',
      '.gggeeggeeggeeg.',
      'gggggggggggggg..',
      '.gggggggggggg...',
      '..gggggggggg....',
      '...gggggggg.....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
    ], { g: '#00cec9', e: '#55efc4' }, 3);

    this._bake('enemy_bossHydra_1', [
      '..gg....gg....gg',
      'gg..ggg..ggg..gg',
      'gggeeggeeggeeggg',
      'gggggggggggggggg',
      '.gggggggggggg...',
      '..gggggggggg....',
      '...gggggggg.....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
      '..gg......gg....',
    ], { g: '#00cec9', e: '#55efc4' }, 3);

    this._bake('enemy_bossTitan_0', [
      '....oooo......',
      '...oyyyyo.....',
      '..oooooooo....',
      '.oooyyyyoo....',
      '.oooooooooo...',
      '..oooooooo....',
      '...ooooooo....',
      '..oooooooo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
    ], { o: '#e17055', y: '#fdcb6e' }, 3);

    this._bake('enemy_bossTitan_1', [
      '....oooo......',
      '...oyyyyo.....',
      '..oooyyooo....',
      '.oooooooooo...',
      '.oooyyyyoo....',
      '..oooooooo....',
      '...ooooooo....',
      '..oooooooo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
      '..oo....oo....',
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
    const animated = [
      'turret', 'boar', 'wolf', 'bear', 'mammoth', 'eagle',
      'golem', 'imp', 'spider', 'wisp', 'scorpion', 'skeleton', 'dragon',
    ];
    const frame = animated.includes(entity.typeId)
      ? Math.floor(entity.wobble * 2) % 2
      : 0;
    const name = `summon_${entity.typeId}_${frame}`;
    const scaleMap = {
      turret: 1.1,
      boar: 1.08,
      wolf: 1.02,
      bear: 1.38,
      mammoth: 1.5,
      eagle: 1.1,
      golem: 1.32,
      imp: 1.05,
      spider: 1.08,
      wisp: 1.12,
      scorpion: 1.06,
      skeleton: 1.08,
      dragon: 1.42,
    };
    const scale = scaleMap[entity.typeId] || 1;
    const charging = entity.typeId === 'boar' && entity.charging;
    const flipX = !charging && Math.cos(entity.facing || 0) < -0.1;
    const bob = entity.typeId === 'dragon'
      ? Math.sin(entity.wobble * 1.3) * 4
      : entity.typeId === 'mammoth'
        ? Math.sin(entity.wobble * 0.8) * 2.2
        : entity.typeId === 'bear'
          ? Math.sin(entity.wobble * 1.1) * 1.8
          : entity.typeId === 'eagle'
            ? Math.sin(entity.wobble * 1.6) * 2.5
            : Math.sin(entity.wobble) * 1.5;
    const shadowMult = entity.typeId === 'mammoth' ? 1.2
      : entity.typeId === 'bear' ? 1.05
      : entity.typeId === 'golem' ? 1.08
      : entity.typeId === 'dragon' ? 1.12
      : entity.typeId === 'boar' && charging ? 0.95
      : 0.85;

    Sprites.drawShadow(ctx, entity.x, entity.y + bob, scale * shadowMult, entity.typeId === 'mammoth' ? 0.42 : 0.35);

    if (entity.typeId === 'turret') {
      const pulse = 0.2 + Math.sin(entity.wobble * 3) * 0.1;
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob - 4, 16, '#00cec9', pulse);
      Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob - 2, 18 + Math.sin(entity.wobble * 2) * 2, '#5352ed', 0.12 + pulse * 0.15);
    } else if (entity.typeId === 'boar' && charging) {
      const back = entity.facing || 0;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.fillStyle = `rgba(139, 69, 19, ${0.25 - i * 0.07})`;
        ctx.beginPath();
        ctx.arc(
          entity.x - Math.cos(back) * (10 + i * 5),
          entity.y + bob - Math.sin(back) * (10 + i * 5),
          3 - i * 0.6, 0, TAU
        );
        ctx.fill();
        ctx.restore();
      }
    } else if (entity.typeId === 'boar') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 2, '#8B4513', 0.06);
    } else if (entity.typeId === 'wolf') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 2, '#b2bec3', 0.08);
    } else if (entity.typeId === 'eagle') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 4, '#fab1a0', 0.1 + Math.sin(entity.wobble * 2) * 0.04);
    } else if (entity.typeId === 'wisp') {
      const pulse = 0.25 + Math.sin(entity.wobble * 4) * 0.12;
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob - 4, entity.radius + 8, '#ffeaa7', pulse);
      Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob - 2, entity.radius + 12, '#fdcb6e', pulse * 0.35);
    } else if (entity.typeId === 'imp') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 3, '#a29bfe', 0.12 + Math.sin(entity.wobble * 3) * 0.05);
    } else if (entity.typeId === 'spider') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 2, '#636e72', 0.08);
    } else if (entity.typeId === 'scorpion') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 3, '#55efc4', 0.1);
      if (entity.flash > 0) {
        Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob, entity.radius + 10, '#00b894', entity.flash * 0.35);
      }
    } else if (entity.typeId === 'golem') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 4, '#b2bec3', 0.07);
      if (entity.flash > 0) {
        Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob, entity.radius + 12, '#ecf0f1', entity.flash * 0.3);
      }
    } else if (entity.typeId === 'skeleton') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 2, '#dfe6e9', 0.06);
    } else if (entity.typeId === 'dragon') {
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
    } else if (entity.typeId === 'mammoth') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 6, '#b2bec3', 0.12 + Math.sin(entity.wobble * 0.6) * 0.04);
      if (entity.flash > 0) {
        Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob, entity.radius + 14, '#ecf0f1', entity.flash * 0.35);
      }
    } else if (entity.typeId === 'bear') {
      Sprites._drawEnemyGlow(ctx, entity.x, entity.y + bob, entity.radius + 4, '#8d6e63', 0.08 + Math.sin(entity.wobble * 0.9) * 0.03);
      if (entity.flash > 0) {
        Sprites._drawEnemyRing(ctx, entity.x, entity.y + bob, entity.radius + 10, '#8d6e63', entity.flash * 0.4);
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
      let rotation = 0;
      if (charging) {
        rotation = entity.facing || 0;
      } else if (entity.typeId === 'eagle') {
        rotation = Math.sin(entity.wobble) * 0.22 + (frame === 1 ? 0.12 : -0.05);
      } else if (entity.typeId === 'wisp') {
        rotation = Math.sin(entity.wobble * 1.5) * 0.08;
      }
      Sprites.draw(ctx, name, entity.x, entity.y + bob, {
        scale,
        flipX,
        flash: entity.flash > 0,
        rotation,
      });
      return true;
    }
    return false;
  },

  drawEnemy(ctx, enemy) {
    const animated = [
      'slime', 'bat', 'goblin', 'ghost', 'exploder', 'splitter', 'miniSlime',
      'spider', 'fly', 'maggot', 'eye', 'gaper', 'bloater', 'hopper', 'brute',
      'skeleton', 'zombie', 'mage', 'charger',
      'eliteKnight', 'eliteMage', 'eliteBerserker', 'elitePhantom', 'eliteWarlock',
      'boss', 'bossHydra', 'bossTitan',
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
      skeleton: 1.0,
      mage: 1.05,
    };
    const scale = scaleMap[enemy.type] || (enemy.isBoss ? 1.35 : enemy.isElite ? 1.2 : 1);
    const bob = Math.sin(enemy.wobble) * (
      enemy.type === 'fly' || enemy.type === 'bat' ? 3.5
        : enemy.type === 'hopper' ? 2.5
          : enemy.type === 'bloater' ? 1.8
            : enemy.type === 'elitePhantom' ? 3.2
              : enemy.type === 'eliteMage' ? 2.2
                : enemy.type === 'bossHydra' ? 2.4
                  : enemy.type === 'bossTitan' ? 1.4
                    : enemy.isBoss ? 2.8
                      : enemy.isElite ? 1.8
                        : 1.2
    );
    const drawY = enemy.y + bob;
    const aura = enemy._def.auraColor || enemy.color;

    Sprites.drawShadow(ctx, enemy.x, enemy.y, scale * (enemy.isBoss ? 1.15 : enemy.isElite ? 0.95 : 0.85));

    if (!enemy.isElite && !enemy.isBoss) {
      Sprites._drawEnemyTint(ctx, enemy, drawY, scale);
    }

    Sprites._drawEnemyTypeEffects(ctx, enemy, drawY, scale, aura);

    if (enemy.charging) {
      Sprites._drawChargeStreak(ctx, enemy);
    }
    if (enemy.isElite) {
      Sprites._drawEliteEffects(ctx, enemy, drawY, aura, scale);
    }
    if (enemy.isBoss) {
      Sprites._drawBossEffects(ctx, enemy, drawY, aura, scale);
    }

    const spr = Sprites.get(name);
    if (spr) {
      const flipX = (enemy.type === 'goblin' || enemy.type === 'charger')
        && Math.cos(enemy.wobble * 1.5) < 0;
      let rotation = 0;
      if (enemy.type === 'spider') {
        rotation = Math.sin(enemy.wobble) * 0.18;
      } else if (enemy.charging && enemy.chargeDir) {
        rotation = Math.atan2(enemy.chargeDir.y, enemy.chargeDir.x) * 0.35;
      } else if (enemy.type === 'elitePhantom') {
        rotation = Math.sin(enemy.wobble * 1.4) * 0.14;
      } else if (enemy.type === 'bossHydra') {
        rotation = Math.sin(enemy.wobble * 0.9) * 0.1;
      } else if (enemy.type === 'bossTitan') {
        rotation = Math.sin(enemy.wobble * 0.5) * 0.05;
      }
      let drawAlpha = enemy.alpha;
      if (enemy.type === 'elitePhantom') {
        drawAlpha = (enemy.alpha || 1) * (0.68 + Math.sin(enemy.wobble * 3.2) * 0.22);
      } else if (enemy.type === 'eliteMage') {
        drawAlpha = (enemy.alpha || 1) * (0.88 + Math.sin(enemy.wobble * 2) * 0.08);
      }
      Sprites.draw(ctx, name, enemy.x, drawY, {
        scale,
        flipX,
        flash: enemy.flash > 0,
        alpha: drawAlpha,
        rotation,
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

  _drawEnemyTint(ctx, enemy, drawY, scale) {
    ctx.save();
    ctx.globalAlpha = 0.1 + Math.sin(enemy.wobble * 2) * 0.05;
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(enemy.x, drawY, enemy.radius * scale * 0.92, enemy.radius * scale * 0.72, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  },

  _drawEnemyTypeEffects(ctx, enemy, drawY, scale, aura) {
    const t = enemy.type;
    const w = enemy.wobble;

    if (t === 'ghost' || enemy.behavior === 'ghost') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius * 1.4, aura, 0.22);
      for (let i = 1; i <= 2; i++) {
        ctx.save();
        ctx.globalAlpha = 0.12 / i;
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.ellipse(enemy.x - i * 8, drawY, enemy.radius * 0.7, enemy.radius * 0.5, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    if (t === 'exploder') {
      const pulse = 0.5 + Math.sin(w * 4) * 0.35;
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 6 + pulse * 4, '#fdcb6e', pulse * 0.5);
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius * 0.5, '#e17055', pulse * 0.15);
    }

    if (t === 'mage' || enemy.behavior === 'ranged' || t === 'eye') {
      const pulse = 0.12 + Math.sin(w * 3) * 0.08;
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius * (t === 'eye' ? 1.1 : 0.9), aura, pulse);
      if (t === 'eye') {
        ctx.save();
        ctx.strokeStyle = '#ff4757';
        ctx.globalAlpha = 0.25 + Math.sin(w * 5) * 0.15;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(enemy.x, drawY, enemy.radius * 0.35, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    if (t === 'charger' && enemy.charging) {
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 5, '#ff4757', 0.45);
    }

    if (t === 'splitter' || t === 'miniSlime') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius * 0.65, '#00b894', 0.12 + Math.sin(w * 2) * 0.06);
    }

    if (t === 'bloater') {
      for (let i = 0; i < 2; i++) {
        const by = drawY - enemy.radius - 4 - i * 6 - Math.sin(w * 2 + i) * 3;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(enemy.x + (i - 0.5) * 8, by, 2.5, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    if (t === 'spider') {
      ctx.save();
      ctx.strokeStyle = '#a29bfe';
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + w * 0.5;
        ctx.beginPath();
        ctx.moveTo(enemy.x, drawY);
        ctx.lineTo(enemy.x + Math.cos(a) * (enemy.radius + 10), drawY + Math.sin(a) * (enemy.radius + 6));
        ctx.stroke();
      }
      ctx.restore();
    }

    if (t === 'bat' || t === 'fly') {
      ctx.save();
      ctx.fillStyle = t === 'fly' ? '#2ecc71' : '#a29bfe';
      ctx.globalAlpha = 0.3 + Math.sin(w * 6) * 0.2;
      ctx.beginPath();
      ctx.arc(enemy.x - 10, drawY - 4, 2, 0, TAU);
      ctx.arc(enemy.x + 10, drawY - 4, 2, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (t === 'zombie' || t === 'maggot') {
      ctx.save();
      ctx.fillStyle = t === 'zombie' ? '#2ecc71' : '#bdc3c7';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(enemy.x + 6, drawY - enemy.radius, 1.5, 0, TAU);
      ctx.arc(enemy.x - 4, drawY - enemy.radius - 4, 1.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (t === 'brute') {
      Sprites._drawEnemyRing(ctx, enemy.x, drawY + enemy.radius * 0.4, enemy.radius * 0.9, '#e17055', 0.15);
    }

    if (t === 'gaper') {
      ctx.save();
      ctx.fillStyle = '#2c3e50';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(enemy.x, drawY + 2, enemy.radius * 0.45, enemy.radius * 0.3, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (t === 'slime') {
      ctx.save();
      ctx.fillStyle = '#6bcb77';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.ellipse(enemy.x, drawY + enemy.radius * 0.6, enemy.radius * 0.5, 3, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  },

  _drawEliteEffects(ctx, enemy, drawY, aura, scale) {
    const t = enemy.type;
    const w = enemy.wobble;
    const pulse = 0.35 + Math.sin(w * 2.5) * 0.18;

    if (t === 'eliteKnight') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius + 6, '#fdcb6e', pulse * 0.2);
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 11, '#b2bec3', pulse * 0.35);
      ctx.save();
      ctx.strokeStyle = '#fdcb6e';
      ctx.globalAlpha = 0.35 + Math.sin(w * 2) * 0.15;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x - enemy.radius * 0.55, drawY, enemy.radius * 0.45, -0.8, 0.8);
      ctx.stroke();
      ctx.restore();
      if (enemy.charging) Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 5, '#ffd93d', 0.5);
    } else if (t === 'eliteMage') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY - enemy.radius * 0.35, enemy.radius * 0.55, '#74b9ff', 0.2 + Math.sin(w * 3) * 0.1);
      for (let i = 0; i < 3; i++) {
        const a = w * 2.2 + (i / 3) * TAU;
        ctx.save();
        ctx.fillStyle = i % 2 ? '#a29bfe' : '#74b9ff';
        ctx.globalAlpha = 0.45;
        ctx.fillRect(
          enemy.x + Math.cos(a) * (enemy.radius + 10) - 1.5,
          drawY + Math.sin(a) * (enemy.radius * 0.3) - 6,
          3, 6
        );
        ctx.restore();
      }
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 14, '#6c5ce7', pulse * 0.25);
    } else if (t === 'eliteBerserker') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius + 8, '#ff4757', pulse * 0.28);
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.fillStyle = '#e84393';
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(enemy.x + (i - 1) * 7, drawY + enemy.radius * 0.55, 2, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      if (enemy.charging) {
        Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 6, '#ff4757', 0.55);
        ctx.save();
        ctx.strokeStyle = '#ff4757';
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.radius, drawY);
        ctx.lineTo(enemy.x + enemy.radius * 1.2, drawY);
        ctx.stroke();
        ctx.restore();
      }
    } else if (t === 'elitePhantom') {
      for (let i = 1; i <= 3; i++) {
        ctx.save();
        ctx.globalAlpha = 0.1 / i;
        ctx.fillStyle = '#74b9ff';
        ctx.beginPath();
        ctx.ellipse(enemy.x - i * 9, drawY, enemy.radius * 0.75, enemy.radius * 0.5, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 12, '#74b9ff', pulse * 0.2);
    } else if (t === 'eliteWarlock') {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY - enemy.radius * 0.45, enemy.radius * 0.5, '#6c5ce7', 0.18 + Math.sin(w * 4) * 0.1);
      ctx.save();
      ctx.strokeStyle = '#fd79a8';
      ctx.globalAlpha = 0.25 + Math.sin(w * 3) * 0.12;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(enemy.x, drawY + enemy.radius * 0.35, enemy.radius * 0.75, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2;
        ctx.fillStyle = '#a29bfe';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(
          enemy.x + Math.cos(a + w) * (enemy.radius * 0.55) - 1,
          drawY + enemy.radius * 0.35 + Math.sin(a + w) * (enemy.radius * 0.55) - 3,
          2, 5
        );
      }
      ctx.restore();
    } else {
      Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius + 8, aura, pulse * 0.22);
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 12, aura, pulse * 0.3);
    }
  },

  _drawBossEffects(ctx, enemy, drawY, aura, scale) {
    const t = enemy.type;
    const w = enemy.wobble;
    const pulse = 0.25 + Math.sin(w * 1.5) * 0.12;
    const pulse2 = 0.15 + Math.sin(w * 2.2 + 1) * 0.08;

    Sprites._drawEnemyGlow(ctx, enemy.x, drawY, enemy.radius + 18, aura, pulse * 0.28);
    Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 14, aura, pulse * 0.35);

    if (t === 'boss') {
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 26, '#ffd93d', pulse2 * 0.25);
      for (let i = -1; i <= 1; i++) {
        ctx.save();
        ctx.fillStyle = '#ffd93d';
        ctx.globalAlpha = 0.5 + Math.sin(w * 3 + i) * 0.2;
        ctx.beginPath();
        ctx.moveTo(enemy.x + i * 10, drawY - enemy.radius - 6);
        ctx.lineTo(enemy.x + i * 6 - 4, drawY - enemy.radius - 14);
        ctx.lineTo(enemy.x + i * 6 + 4, drawY - enemy.radius - 14);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      if (enemy.bossTimer != null && enemy.bossTimer < 0.6) {
        Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 10, '#ff7675', 0.45);
      }
    } else if (t === 'bossHydra') {
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 24, '#55efc4', pulse2 * 0.22);
      for (let i = -1; i <= 1; i++) {
        const hx = enemy.x + i * (enemy.radius * 0.55);
        const hy = drawY - enemy.radius - 4 + Math.sin(w * 2 + i) * 3;
        Sprites._drawEnemyGlow(ctx, hx, hy, enemy.radius * 0.22, '#00cec9', 0.25 + Math.sin(w * 4 + i) * 0.12);
        ctx.save();
        ctx.fillStyle = '#55efc4';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(hx, hy + 4, 4, 3, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = '#2ecc71';
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(enemy.x + (i - 1) * 12, drawY + enemy.radius * 0.5, 2.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    } else if (t === 'bossTitan') {
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 28, '#fdcb6e', pulse2 * 0.2);
      ctx.save();
      ctx.strokeStyle = '#fdcb6e';
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + w * 0.3;
        ctx.beginPath();
        ctx.moveTo(enemy.x, drawY);
        ctx.lineTo(
          enemy.x + Math.cos(a) * (enemy.radius + 18),
          drawY + Math.sin(a) * (enemy.radius + 10)
        );
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < 5; i++) {
        const ex = enemy.x + Math.sin(w * 2 + i * 1.7) * 8;
        const ey = drawY - enemy.radius - 4 - (i * 5 + Math.sin(w * 3 + i) * 4);
        ctx.save();
        ctx.fillStyle = '#e17055';
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(ex, ey, 2 + (i % 2), 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      if (enemy.bossTimer != null && enemy.bossTimer < 0.6) {
        Sprites._drawEnemyRing(ctx, enemy.x, drawY + enemy.radius * 0.3, enemy.radius * 0.9, '#e17055', 0.4);
      }
    } else {
      Sprites._drawEnemyRing(ctx, enemy.x, drawY, enemy.radius + 22, aura, pulse2 * 0.22);
    }

    ctx.save();
    ctx.translate(enemy.x, drawY + enemy.radius * 0.55);
    ctx.scale(scale * 1.1, 0.35);
    ctx.fillStyle = aura;
    ctx.globalAlpha = 0.12 + pulse * 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 10, 0, TAU);
    ctx.fill();
    ctx.restore();
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
    const t = enemy.type;
    ctx.save();
    ctx.translate(enemy.x, y);
    ctx.globalAlpha = enemy.alpha || 1;
    ctx.fillStyle = enemy.color;

    if (t === 'slime' || t === 'miniSlime') {
      ctx.beginPath();
      ctx.ellipse(0, 2, r, r * 0.82, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(-r * 0.35, -r * 0.15, r * 0.22, r * 0.22);
      ctx.fillRect(r * 0.12, -r * 0.15, r * 0.22, r * 0.22);
    } else if (t === 'bat' || t === 'fly') {
      const wing = Math.sin(enemy.wobble * 4) * 4;
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.moveTo(-r - wing, 0);
      ctx.lineTo(-r * 0.2, -r * 0.55);
      ctx.lineTo(0, 0);
      ctx.lineTo(-r * 0.2, r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r + wing, 0);
      ctx.lineTo(r * 0.2, -r * 0.55);
      ctx.lineTo(0, 0);
      ctx.lineTo(r * 0.2, r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(-2, -2, 4, 4);
    } else if (t === 'eye') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.45, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.2, 0, TAU);
      ctx.fill();
    } else if (t === 'brute') {
      ctx.fillRect(-r, -r * 0.8, r * 2, r * 1.6);
      ctx.fillStyle = '#ffd93d';
      ctx.fillRect(-r * 0.5, -r * 0.3, r * 0.25, r * 0.25);
      ctx.fillRect(r * 0.25, -r * 0.3, r * 0.25, r * 0.25);
    } else if (t === 'skeleton') {
      ctx.fillRect(-r * 0.6, -r, r * 1.2, r * 0.55);
      ctx.fillRect(-r * 0.35, -r * 0.2, r * 0.7, r * 1.1);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(-r * 0.2, -r * 0.35, r * 0.15, r * 0.15);
      ctx.fillRect(r * 0.05, -r * 0.35, r * 0.15, r * 0.15);
    } else if (t === 'gaper') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.15, r * 0.55, r * 0.35, 0, 0, TAU);
      ctx.fill();
    } else if (t === 'eliteKnight') {
      ctx.fillStyle = '#fdcb6e';
      ctx.fillRect(-r * 0.55, -r * 0.95, r * 1.1, r * 1.2);
      ctx.fillStyle = '#b2bec3';
      ctx.fillRect(-r * 0.75, -r * 0.35, r * 0.35, r * 0.7);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(-r * 0.15, -r * 0.55, r * 0.12, r * 0.12);
      ctx.fillRect(r * 0.03, -r * 0.55, r * 0.12, r * 0.12);
    } else if (t === 'eliteMage') {
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.lineTo(-r * 0.55, -r * 0.35);
      ctx.lineTo(r * 0.55, -r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(-r * 0.45, -r * 0.35, r * 0.9, r * 1.1);
    } else if (t === 'eliteBerserker') {
      ctx.fillStyle = '#e84393';
      ctx.fillRect(-r * 0.85, -r * 0.55, r * 1.7, r * 0.45);
      ctx.fillRect(-r * 0.55, -r * 0.1, r * 1.1, r * 0.85);
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(-r * 0.95, -r * 0.75, r * 0.25, r * 0.35);
      ctx.fillRect(r * 0.7, -r * 0.75, r * 0.25, r * 0.35);
    } else if (t === 'elitePhantom') {
      ctx.globalAlpha = (enemy.alpha || 1) * 0.65;
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.85, r * 0.65, 0, 0, TAU);
      ctx.fill();
    } else if (t === 'eliteWarlock') {
      ctx.fillStyle = '#6c5ce7';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(-r * 0.5, -r * 0.2);
      ctx.lineTo(r * 0.5, -r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(-r * 0.45, -r * 0.2, r * 0.9, r * 1.05);
    } else if (t === 'boss') {
      ctx.fillStyle = '#d63031';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffd93d';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.35, -r * 0.95);
        ctx.lineTo(i * r * 0.2 - r * 0.12, -r * 1.25);
        ctx.lineTo(i * r * 0.2 + r * 0.12, -r * 1.25);
        ctx.closePath();
        ctx.fill();
      }
    } else if (t === 'bossHydra') {
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(-r * 0.85, -r * 0.15, r * 1.7, r * 0.95);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(i * r * 0.55, -r * 0.55, r * 0.28, 0, TAU);
        ctx.fill();
      }
    } else if (t === 'bossTitan') {
      ctx.fillStyle = '#e17055';
      ctx.fillRect(-r * 0.95, -r * 0.95, r * 1.9, r * 1.9);
      ctx.strokeStyle = '#fdcb6e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.5);
      ctx.lineTo(r * 0.2, r * 0.35);
      ctx.moveTo(r * 0.35, -r * 0.55);
      ctx.lineTo(-r * 0.15, r * 0.45);
      ctx.stroke();
    } else if (enemy.isBoss || enemy.isElite) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = enemy._def.auraColor || enemy.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-r * 0.2, -r * 0.25, r * 0.15, r * 0.15);
      ctx.fillRect(r * 0.05, -r * 0.25, r * 0.15, r * 0.15);
    }
    ctx.restore();
  },
};

Sprites.init();
