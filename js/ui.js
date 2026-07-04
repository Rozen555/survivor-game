class UI {
  constructor() {
    this.menuScreen = document.getElementById('menu-screen');
    this.hud = document.getElementById('hud');
    this.levelupScreen = document.getElementById('levelup-screen');
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

  updateHud(player, time, kills, difficulty) {
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
  }

  updateWeapons(weapons, summons) {
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
    this.weaponsDisplay.innerHTML = html;
  }

  showLevelUp(upgrades, onSelect) {
    this.levelupScreen.classList.remove('hidden');
    this.upgradeOptions.innerHTML = '';

    upgrades.forEach(upgrade => {
      const btn = document.createElement('button');
      btn.className = 'upgrade-btn';
      const typeLabel = upgrade.isNew && upgrade.type === 'summon' && upgrade.isUltimate
        ? '<span class="type-ultimate">终极召唤</span>'
        : upgrade.isNew && upgrade.type === 'summon'
          ? '<span class="type-summon">新召唤</span>'
          : upgrade.type === 'summonLevel' && upgrade.id === 'dragon'
            ? '<span class="type-ultimate">火龙升级</span>'
            : upgrade.type === 'summonLevel'
              ? '<span class="type-summon">召唤升级</span>'
              : upgrade.type === 'classAttack'
            ? '<span class="type-class">职业技能</span>'
            : upgrade.isNew && upgrade.isClass
              ? '<span class="type-class">职业武器</span>'
              : upgrade.isNew
                ? '<span class="type-new">新武器</span>'
                : upgrade.type === 'weaponLevel'
                  ? (upgrade.isClass
                    ? '<span class="type-class">职业升级</span>'
                    : '<span class="type-level">武器升级</span>')
                  : upgrade.type === 'attack'
                    ? '<span class="type-attack">攻击强化</span>'
                    : '<span class="type-level">属性</span>';

      btn.innerHTML = `
        ${typeLabel}
        <div class="name">${upgrade.icon || ''} ${upgrade.name}</div>
        <div class="desc">${upgrade.desc}</div>
      `;
      btn.addEventListener('click', () => {
        Audio.play('select');
        onSelect(upgrade);
      });
      this.upgradeOptions.appendChild(btn);
    });
  }

  hideLevelUp() {
    this.levelupScreen.classList.add('hidden');
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
    this.gameoverTitle.textContent = victory ? '胜利！' : '游戏结束';
    this.gameoverTitle.className = victory ? 'victory' : '';

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
