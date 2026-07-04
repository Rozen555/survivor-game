class UI {
  constructor() {
    this.menuScreen = document.getElementById('menu-screen');
    this.hud = document.getElementById('hud');
    this.levelupScreen = document.getElementById('levelup-screen');
    this.modifierPickScreen = document.getElementById('modifier-pick-screen');
    this.modifierOptions = document.getElementById('modifier-options');
    this.modifierPickSubtitle = document.getElementById('modifier-pick-subtitle');
    this.modifierPickHint = document.getElementById('modifier-pick-hint');
    this.shopScreen = document.getElementById('shop-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.pauseScreen = document.getElementById('pause-screen');

    this.hpBar = document.getElementById('hp-bar');
    this.hpText = document.getElementById('hp-text');
    this.xpBar = document.getElementById('xp-bar');
    this.levelText = document.getElementById('level-text');
    this.timerText = document.getElementById('timer-text');
    this.killCount = document.getElementById('kill-count');
    this.weaponsDisplay = document.getElementById('weapons-display');
    this.upgradeOptions = document.getElementById('upgrade-options');
    this.levelupSubtitle = document.getElementById('levelup-subtitle');
    this.shopItems = document.getElementById('shop-items');
    this.goldText = document.getElementById('gold-text');
    this.shopWaveText = document.getElementById('shop-wave-text');
    this.gameoverTitle = document.getElementById('gameover-title');
    this._shopBuyHandler = null;

    this.selectedChar = 'warrior';
    this.selectedDifficulty = 2;
    this.setupMenu();
    this.setupDifficulty();
  }

  setupDifficulty() {
    this.diffLevelEl = document.getElementById('diff-level');
    this.diffLabelEl = document.getElementById('diff-label');
    this.diffDescEl = document.getElementById('diff-desc');
    const down = document.getElementById('diff-down');
    const up = document.getElementById('diff-up');

    const refresh = () => {
      const d = getDifficulty(this.selectedDifficulty);
      this.diffLevelEl.textContent = d.name;
      this.diffLabelEl.textContent = d.label;
      this.diffDescEl.textContent =
        `怪物 ${d.enemyTypeCount} 种 · 奖励 ${d.rewardTypeCount} 种 · ` +
        `商店 ${d.shopSlots} 栏 · 奖励 ×${d.rewardMult.toFixed(2)} · ` +
        `敌人 HP×${d.hpMult.toFixed(2)} 伤害×${d.dmgMult.toFixed(2)} · ` +
        `数量×${d.countMult.toFixed(2)}`;
    };

    down.addEventListener('click', () => {
      this.selectedDifficulty = Math.max(MIN_DIFFICULTY, this.selectedDifficulty - 1);
      refresh();
    });
    up.addEventListener('click', () => {
      this.selectedDifficulty = Math.min(MAX_DIFFICULTY, this.selectedDifficulty + 1);
      refresh();
    });
    refresh();
  }

  setupMenu() {
    const charBtns = document.querySelectorAll('.char-btn');
    charBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        charBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedChar = btn.dataset.char;
      });
    });
  }

  hideAllScreens() {
    this.menuScreen.classList.add('hidden');
    this.levelupScreen.classList.add('hidden');
    this.modifierPickScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
  }

  showHud() {
    this.hud.classList.remove('hidden');
  }

  hideHud() {
    this.hud.classList.add('hidden');
  }

  updateHud(player, time, kills, difficulty, runModifiers = []) {
    const hpRatio = player.hp / player.maxHp;
    this.hpBar.style.width = `${hpRatio * 100}%`;
    this.hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

    const xpRatio = player.xp / player.xpToNext;
    this.xpBar.style.width = `${xpRatio * 100}%`;
    this.levelText.textContent = `Lv.${player.level}`;

    this.timerText.textContent = formatTime(time);
    this.killCount.textContent = kills;

    const diffEl = document.getElementById('difficulty-hud');
    if (diffEl && difficulty) {
      diffEl.textContent = `难${difficulty.level}`;
      diffEl.title = `${difficulty.name} · ${difficulty.label}`;
    }

    const modEl = document.getElementById('run-modifiers-hud');
    if (modEl) {
      if (runModifiers.length) {
        modEl.textContent = runModifiers.map(m => `${m.icon}${m.name}`).join(' · ');
        modEl.title = runModifiers.map(m => `${m.name}：${m.desc}`).join('\n');
        modEl.classList.remove('hidden');
      } else {
        modEl.textContent = '';
        modEl.classList.add('hidden');
      }
    }
  }

  updateWeapons(weapons, summons, player) {
    let html = weapons.map(w => {
      const def = WEAPONS[w.id];
      return `<div class="weapon-badge">${def.icon} ${def.name} <span class="lvl">${w.level}</span></div>`;
    }).join('');
    if (summons && summons.length) {
      html += summons.map(s => {
        const def = SUMMON_TYPES[s.id];
        const cls = s.id === 'dragon' ? 'weapon-badge summon-badge dragon-badge' : 'weapon-badge summon-badge';
        return `<div class="${cls}">${def.icon} ${def.name} <span class="lvl">${s.level}</span></div>`;
      }).join('');
    }
    if (player?.mechanics) {
      const m = player.mechanics;
      const tags = [];
      if (m.burnOnHit > 0) tags.push(`🔥×${m.burnOnHit}`);
      if (m.chainChance > 0) tags.push('⚡链');
      if (m.holyAura > 0) tags.push(`✝️×${m.holyAura}`);
      if (m.poisonCloud > 0) tags.push(`☠️×${m.poisonCloud}`);
      if (m.killStreak > 0) tags.push('💢连杀');
      if (m.thorns > 0) tags.push('🌵刺');
      if (m.slowOnHit > 0) tags.push('❄️霜');
      if (m.critExplode > 0) tags.push('💥爆');
      if (m.execute > 0) tags.push('🪓斩');
      if (m.magnetPulse > 0) tags.push('🧲脉冲');
      if (m.omnivamp > 0) tags.push(`🩸吸×${m.omnivamp}`);
      if (m.orbitBlades > 0) tags.push(`🗡️刃×${m.orbitBlades}`);
      if (m.novaOnKill > 0) tags.push(`💣爆×${m.novaOnKill}`);
      if (m.bleedOnHit > 0) tags.push(`🩹血×${m.bleedOnHit}`);
      if (m.frostField > 0) tags.push(`🧊冻×${m.frostField}`);
      if (m.overkillSplash > 0) tags.push('💀溅');
      if (m.shieldNova > 0) tags.push('🔰反');
      if (m.greedMark > 0) tags.push(`💰贪×${m.greedMark}`);
      if (m.giantSlayer > 0) tags.push('🏔️巨');
      if (m.eliteHunter > 0) tags.push('🎖️赏');
      if (m.vampiricFrenzy > 0) tags.push('😈狂');
      if (m.hexMark > 0) tags.push(`🔷印×${m.hexMark}`);
      if (m.moltenTrail > 0) tags.push('🌋迹');
      if (m.soulHarvest > 0) tags.push(`👻魂×${m.soulHarvest}`);
      if (m.staticCharge > 0) tags.push(`🔋电×${m.staticCharge}`);
      if (m.timeWarp > 0) tags.push('⏳缓');
      if (m.phoenixCore > 0) tags.push('🪶凤');
      if (m.ricochet > 0) tags.push(`🪃弹×${m.ricochet}`);
      if (m.dotAmp > 0) tags.push(`☣️咒×${m.dotAmp}`);
      if (m.pickupSpark > 0) tags.push('✨拾');
      if (m.counterStrike > 0) tags.push('🥊反');
      if (m.whirlwind > 0) tags.push(`🌀斩×${m.whirlwind}`);
      if (m.anchorShot > 0) tags.push('🎯锚');
      if (m.markDetonate > 0) tags.push('💠爆印');
      if (tags.length) {
        html += `<div class="weapon-badge mechanic-badge">${tags.join(' ')}</div>`;
      }
    }
    this.weaponsDisplay.innerHTML = html;
  }

  _getUpgradeTypeMeta(upgrade) {
    if (upgrade.isNew && upgrade.type === 'summon' && upgrade.isUltimate) {
      return { label: '终极召唤', typeClass: 'ultimate', accent: '#ff6348' };
    }
    if (upgrade.isNew && upgrade.type === 'summon') {
      return { label: '新召唤', typeClass: 'summon', accent: '#a29bfe' };
    }
    if (upgrade.type === 'summonLevel' && upgrade.id === 'dragon') {
      return { label: '火龙升级', typeClass: 'ultimate', accent: '#ff6348' };
    }
    if (upgrade.type === 'summonLevel') {
      return { label: '召唤升级', typeClass: 'summon', accent: '#a29bfe' };
    }
    if (upgrade.type === 'classAttack') {
      return { label: '职业技能', typeClass: 'class', accent: '#ffa502' };
    }
    if (upgrade.isNew && upgrade.isClass) {
      return { label: '职业武器', typeClass: 'class', accent: '#ffa502' };
    }
    if (upgrade.isNew) {
      return { label: '新武器', typeClass: 'new', accent: '#6bcb77' };
    }
    if (upgrade.type === 'weaponLevel') {
      return {
        label: upgrade.isClass ? '职业升级' : '武器升级',
        typeClass: upgrade.isClass ? 'class' : 'level',
        accent: upgrade.isClass ? '#ffa502' : '#70a1ff',
      };
    }
    if (upgrade.type === 'attack') {
      return { label: '攻击强化', typeClass: 'attack', accent: '#fd79a8' };
    }
    if (upgrade.type === 'mechanic') {
      return { label: '机制能力', typeClass: 'mechanic', accent: '#55efc4' };
    }
    if (upgrade.type === 'stat') {
      return { label: '属性强化', typeClass: 'stat', accent: '#6bcb77' };
    }
    return { label: '强化', typeClass: 'level', accent: '#70a1ff' };
  }

  _getModifierTypeMeta(mod) {
    if (mod.type === 'mixed') {
      return { label: '混合词缀', typeClass: 'mixed', accent: '#ff7675' };
    }
    return { label: '祝福词缀', typeClass: 'blessing', accent: '#fdcb6e' };
  }

  _buildPickCard({ icon, name, desc, label, typeClass, accent, extraClass = '' }, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `upgrade-btn upgrade-card upgrade-card--${typeClass} ${extraClass}`.trim();
    btn.style.setProperty('--upgrade-accent', accent);
    btn.innerHTML = `
      <div class="upgrade-card-shine"></div>
      <div class="upgrade-card-accent"></div>
      <div class="upgrade-card-body">
        <div class="upgrade-card-top">
          <div class="upgrade-icon">${icon || '✨'}</div>
          <span class="upgrade-type-pill type-${typeClass}">${label}</span>
        </div>
        <div class="upgrade-name">${name}</div>
        <div class="upgrade-desc">${desc}</div>
      </div>
    `;
    btn.addEventListener('click', onClick);
    return btn;
  }

  showLevelUp(upgrades, playerLevel, onSelect) {
    if (typeof playerLevel === 'function') {
      onSelect = playerLevel;
      playerLevel = null;
    }
    this.levelupScreen.classList.remove('hidden');
    this.upgradeOptions.innerHTML = '';
    if (this.levelupSubtitle) {
      this.levelupSubtitle.textContent = playerLevel
        ? `Lv.${playerLevel} · 从 ${upgrades.length} 项强化中选择 1 项`
        : `从 ${upgrades.length} 项强化中选择 1 项`;
    }

    upgrades.forEach((upgrade, index) => {
      const meta = this._getUpgradeTypeMeta(upgrade);
      const btn = this._buildPickCard({
        icon: upgrade.icon,
        name: upgrade.name,
        desc: upgrade.desc,
        label: meta.label,
        typeClass: meta.typeClass,
        accent: meta.accent,
      }, () => {
        Audio.play('upgrade');
        onSelect(upgrade);
      });
      btn.style.animationDelay = `${index * 0.07}s`;
      this.upgradeOptions.appendChild(btn);
    });
  }

  hideLevelUp() {
    this.levelupScreen.classList.add('hidden');
  }

  showModifierPick(offers, slot, total, difficulty, onSelect) {
    this.modifierPickScreen.classList.remove('hidden');
    this.modifierPickSubtitle.textContent = `第 ${slot} / ${total} 个词缀 · 三选一`;
    if (this.modifierPickHint) {
      this.modifierPickHint.textContent = slot >= total
        ? '选好后立即开始战斗'
        : difficulty.level >= 5
          ? '下一轮可能出现混合词缀（高收益 · 小代价）'
          : '下一轮继续从祝福词缀中选择';
    }
    this.modifierOptions.innerHTML = '';

    offers.forEach((mod, index) => {
      const meta = this._getModifierTypeMeta(mod);
      const btn = this._buildPickCard({
        icon: mod.icon,
        name: mod.name,
        desc: mod.desc,
        label: meta.label,
        typeClass: meta.typeClass,
        accent: meta.accent,
        extraClass: 'modifier-btn',
      }, () => {
        Audio.play('select');
        onSelect(mod);
      });
      btn.style.animationDelay = `${index * 0.07}s`;
      this.modifierOptions.appendChild(btn);
    });
  }

  hideModifierPick() {
    this.modifierPickScreen.classList.add('hidden');
  }

  showShop(player, wave, offers, difficulty, onBuy, onContinue) {
    this.shopScreen.classList.remove('hidden');
    this.shopWaveText.textContent =
      `第 ${wave} 波完成 · 难度 ${difficulty.level} · 商店 ${offers.length} 栏`;
    this._shopBuyHandler = onBuy;
    this.shopItems.className = `shop-grid slots-${offers.length}`;
    this._renderShopGrid(player, offers);

    const continueBtn = document.getElementById('continue-btn');
    continueBtn.onclick = () => {
      Audio.play('select');
      onContinue();
    };
  }

  _renderShopGrid(player, offers) {
    this.goldText.textContent = player.gold;
    this.shopItems.innerHTML = '';

    offers.forEach((item, index) => {
      const card = document.createElement('button');
      const canAfford = player.gold >= item.cost;
      const sold = item.sold;
      card.type = 'button';
      card.className = 'shop-card';
      if (sold) card.classList.add('sold');
      else if (!canAfford) card.classList.add('disabled');
      card.disabled = sold;

      card.innerHTML = `
        <div class="shop-card-icon">${item.icon || '📦'}</div>
        <div class="shop-card-name">${item.name}</div>
        <div class="shop-card-desc">${item.desc}</div>
        <div class="shop-card-cost">${sold ? '已售出' : `${item.cost} 金币`}</div>
      `;

      if (!sold) {
        card.addEventListener('click', () => {
          if (this._shopBuyHandler && this._shopBuyHandler(index)) {
            this._renderShopGrid(player, offers);
          }
        });
      }

      this.shopItems.appendChild(card);
    });
  }

  updateShopGold(gold, player, offers) {
    this.goldText.textContent = gold;
    if (player && offers) this._renderShopGrid(player, offers);
  }

  hideShop() {
    this.shopScreen.classList.add('hidden');
  }

  showGameOver(victory, time, kills, level, waves, difficulty) {
    this.hideHud();
    this.gameoverScreen.classList.remove('hidden');
    const title = victory ? '你已胜利' : '你已死亡';
    const titleEl = this.gameoverTitle || document.getElementById('gameover-title');
    if (titleEl) {
      titleEl.textContent = title;
      titleEl.className = victory ? 'victory' : 'defeat';
    }

    document.getElementById('final-time').textContent = formatTime(time);
    document.getElementById('final-kills').textContent = kills;
    document.getElementById('final-level').textContent = level;
    document.getElementById('final-waves').textContent = waves;
    const diffEl = document.getElementById('final-difficulty');
    if (diffEl) {
      diffEl.textContent = difficulty
        ? `${difficulty.name} · ${difficulty.label}`
        : '-';
    }
  }

  showPause() {
    this.pauseScreen.classList.remove('hidden');
  }

  hidePause() {
    this.pauseScreen.classList.add('hidden');
  }
}
