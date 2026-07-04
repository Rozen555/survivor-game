const Audio = {
  ctx: null,
  master: null,
  enabled: true,
  volume: 0.38,
  lastPlay: {},

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (_) {
      this.enabled = false;
    }
  },

  _throttle(name, ms) {
    const now = Date.now();
    if (now - (this.lastPlay[name] || 0) < ms) return false;
    this.lastPlay[name] = now;
    return true;
  },

  _out(node) {
    node.connect(this.master || this.ctx.destination);
  },

  _gain(time, peak, duration, attack = 0.012) {
    const g = this.ctx.createGain();
    const p = Math.max(0.001, peak * this.volume);
    g.gain.setValueAtTime(0.001, time);
    g.gain.exponentialRampToValueAtTime(p, time + attack);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    this._out(g);
    return g;
  },

  _tone(freq, time, duration, type, peak, slideTo) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    const f0 = Math.max(20, freq);
    osc.frequency.setValueAtTime(f0, time);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), time + duration * 0.85);
    }
    osc.connect(this._gain(time, peak, duration));
    osc.start(time);
    osc.stop(time + duration + 0.05);
  },

  _chord(freqs, time, step, duration, type, peak) {
    freqs.forEach((f, i) => {
      this._tone(f, time + i * step, duration, type, peak * (0.85 + i * 0.04));
    });
  },

  _noise(time, duration, peak, filterFreq = 1200, filterType = 'lowpass') {
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    src.connect(filter);
    filter.connect(this._gain(time, peak, duration, 0.008));
    src.start(time);
  },

  play(name) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const r = () => Math.random();

    switch (name) {
      case 'hit':
        if (!this._throttle('hit', 32)) return;
        this._noise(t, 0.04, 0.14, 1800, 'bandpass');
        this._tone(140 + r() * 40, t, 0.05, 'square', 0.07);
        break;

      case 'hitHeavy':
        if (!this._throttle('hitHeavy', 70)) return;
        this._noise(t, 0.07, 0.2, 900, 'lowpass');
        this._tone(90 + r() * 20, t, 0.1, 'sawtooth', 0.1);
        this._tone(55, t + 0.03, 0.12, 'square', 0.08);
        break;

      case 'kill':
        if (!this._throttle('kill', 45)) return;
        this._noise(t, 0.07, 0.18, 1400);
        this._tone(200 + r() * 50, t, 0.08, 'square', 0.1, 80);
        break;

      case 'eliteKill':
        if (!this._throttle('eliteKill', 120)) return;
        this._noise(t, 0.1, 0.22, 1000);
        this._chord([220, 277, 330], t, 0.04, 0.12, 'square', 0.11);
        this._tone(110, t + 0.12, 0.18, 'sawtooth', 0.09, 55);
        break;

      case 'hurt':
        if (!this._throttle('hurt', 180)) return;
        this._tone(280, t, 0.12, 'sawtooth', 0.16, 140);
        this._tone(110, t + 0.04, 0.16, 'sawtooth', 0.12);
        this._noise(t, 0.06, 0.1, 600, 'lowpass');
        break;

      case 'lowHp':
        if (!this._throttle('lowHp', 900)) return;
        this._tone(880, t, 0.06, 'sine', 0.06);
        this._tone(660, t + 0.08, 0.08, 'sine', 0.05);
        break;

      case 'xp':
        if (!this._throttle('xp', 50)) return;
        this._tone(740 + r() * 40, t, 0.05, 'sine', 0.07);
        this._tone(980, t + 0.04, 0.06, 'sine', 0.06);
        break;

      case 'soul':
        if (!this._throttle('soul', 80)) return;
        this._tone(620, t, 0.08, 'triangle', 0.08);
        this._tone(880, t + 0.06, 0.1, 'sine', 0.07);
        this._tone(1100, t + 0.12, 0.12, 'sine', 0.05);
        break;

      case 'gold':
        if (!this._throttle('gold', 70)) return;
        this._tone(1100 + r() * 80, t, 0.04, 'sine', 0.09);
        this._tone(1500, t + 0.05, 0.07, 'sine', 0.08);
        break;

      case 'coinBag':
        if (!this._throttle('coinBag', 140)) return;
        this._chord([880, 1100, 1320, 1760], t, 0.035, 0.08, 'sine', 0.09);
        this._noise(t, 0.05, 0.08, 2400, 'highpass');
        break;

      case 'treasure':
        if (!this._throttle('treasure', 200)) return;
        this._chord([523, 659, 784, 988, 1175], t, 0.055, 0.14, 'square', 0.1);
        this._noise(t, 0.08, 0.12, 2000);
        break;

      case 'heal':
        this._tone(392, t, 0.1, 'sine', 0.1);
        this._tone(523, t + 0.07, 0.12, 'sine', 0.09);
        this._tone(659, t + 0.14, 0.14, 'sine', 0.08);
        break;

      case 'levelUp':
        this._chord([523, 659, 784, 988], t, 0.07, 0.16, 'square', 0.12);
        this._noise(t, 0.06, 0.1, 3000, 'highpass');
        break;

      case 'upgrade':
        this._chord([440, 554, 659], t, 0.05, 0.1, 'triangle', 0.1);
        this._tone(880, t + 0.12, 0.1, 'sine', 0.08);
        break;

      case 'select':
        this._tone(520 + r() * 40, t, 0.05, 'sine', 0.1);
        this._tone(780, t + 0.03, 0.04, 'sine', 0.06);
        break;

      case 'shop':
        this._chord([392, 494, 587], t, 0.09, 0.18, 'triangle', 0.11);
        this._tone(784, t + 0.22, 0.12, 'sine', 0.07);
        break;

      case 'buy':
        this._chord([880, 1100, 1320], t, 0.04, 0.09, 'square', 0.09);
        this._noise(t, 0.04, 0.06, 2600, 'highpass');
        break;

      case 'wave':
        this._tone(330, t, 0.1, 'triangle', 0.11);
        this._tone(440, t + 0.1, 0.12, 'triangle', 0.1);
        this._tone(554, t + 0.2, 0.16, 'triangle', 0.09);
        break;

      case 'announce':
        if (!this._throttle('announce', 300)) return;
        this._chord([330, 415, 494], t, 0.06, 0.14, 'square', 0.11);
        this._tone(660, t + 0.2, 0.2, 'sawtooth', 0.08, 440);
        break;

      case 'pause':
        this._tone(440, t, 0.1, 'triangle', 0.1, 330);
        break;

      case 'resume':
        this._tone(330, t, 0.08, 'triangle', 0.1, 440);
        break;

      case 'gameOver':
        [220, 185, 147, 110].forEach((f, i) => {
          this._tone(f, t + i * 0.14, 0.28, 'sawtooth', 0.14);
        });
        this._noise(t + 0.2, 0.35, 0.12, 400, 'lowpass');
        break;

      case 'victory':
        this._chord([523, 659, 784, 988, 1175, 1319], t, 0.09, 0.18, 'square', 0.11);
        this._noise(t + 0.4, 0.15, 0.1, 2800, 'highpass');
        break;

      case 'start':
        this._chord([440, 554, 659, 880], t, 0.06, 0.1, 'square', 0.1);
        break;

      case 'melee':
        if (!this._throttle('melee', 55)) return;
        this._noise(t, 0.05, 0.16, 2200, 'highpass');
        this._tone(120 + r() * 30, t + 0.02, 0.07, 'square', 0.09, 60);
        break;

      case 'shoot':
        if (!this._throttle('shoot', 40)) return;
        this._tone(520 + r() * 60, t, 0.05, 'square', 0.07, 180);
        this._noise(t, 0.03, 0.06, 3000, 'highpass');
        break;

      case 'magic':
        if (!this._throttle('magic', 45)) return;
        this._tone(660 + r() * 40, t, 0.07, 'sine', 0.08, 990);
        this._tone(990, t + 0.04, 0.08, 'triangle', 0.06);
        break;

      case 'lightning':
        if (!this._throttle('lightning', 90)) return;
        this._noise(t, 0.05, 0.22, 4000, 'highpass');
        this._chord([880, 1100, 1320], t, 0.015, 0.06, 'square', 0.09);
        this._tone(220, t + 0.04, 0.1, 'sawtooth', 0.08, 80);
        break;

      case 'boomerang':
        if (!this._throttle('boomerang', 100)) return;
        this._tone(300, t, 0.12, 'sawtooth', 0.08, 600);
        this._noise(t, 0.08, 0.1, 1600);
        break;

      case 'rain':
        if (!this._throttle('rain', 120)) return;
        for (let i = 0; i < 4; i++) {
          this._tone(900 + i * 80 + r() * 40, t + i * 0.05, 0.06, 'sine', 0.06);
        }
        this._noise(t, 0.06, 0.08, 3500, 'highpass');
        break;

      case 'cross':
        if (!this._throttle('cross', 80)) return;
        this._chord([440, 554, 659, 880], t, 0.02, 0.07, 'square', 0.07);
        break;

      case 'nova':
        this._noise(t, 0.14, 0.22, 800);
        this._tone(440, t, 0.18, 'sine', 0.14, 880);
        this._tone(220, t + 0.05, 0.22, 'triangle', 0.1, 110);
        break;

      case 'enemyShoot':
        if (!this._throttle('enemyShoot', 90)) return;
        this._tone(180 + r() * 30, t, 0.08, 'sawtooth', 0.08, 90);
        this._noise(t, 0.04, 0.07, 700, 'lowpass');
        break;

      case 'explode':
        if (!this._throttle('explode', 150)) return;
        this._noise(t, 0.18, 0.28, 500, 'lowpass');
        this._tone(80, t, 0.25, 'sawtooth', 0.16, 30);
        this._tone(160, t + 0.05, 0.2, 'square', 0.1, 40);
        break;

      case 'split':
        if (!this._throttle('split', 100)) return;
        this._chord([440, 554, 659], t, 0.03, 0.08, 'sine', 0.08);
        this._noise(t, 0.05, 0.1, 2000);
        break;

      case 'charge':
        if (!this._throttle('charge', 200)) return;
        this._tone(220, t, 0.2, 'sawtooth', 0.09, 440);
        this._noise(t, 0.15, 0.08, 1000);
        break;

      case 'dash':
        if (!this._throttle('dash', 120)) return;
        this._noise(t, 0.06, 0.14, 2500, 'highpass');
        this._tone(660, t, 0.08, 'sine', 0.07, 220);
        break;

      case 'summon':
        if (!this._throttle('summon', 150)) return;
        this._chord([330, 415, 494, 659], t, 0.07, 0.14, 'triangle', 0.1);
        this._noise(t, 0.1, 0.08, 1800);
        break;

      case 'elite':
        this._chord([440, 554, 659], t, 0.08, 0.12, 'square', 0.12);
        this._tone(880, t + 0.25, 0.2, 'sawtooth', 0.09, 660);
        break;

      case 'boss':
        [110, 87, 73, 55].forEach((f, i) => {
          this._tone(f, t + i * 0.1, 0.32, 'sawtooth', 0.17);
        });
        this._noise(t + 0.15, 0.4, 0.18, 350, 'lowpass');
        this._tone(220, t + 0.45, 0.45, 'square', 0.12, 55);
        break;
    }
  },
};

['click', 'keydown', 'touchstart'].forEach((ev) => {
  window.addEventListener(ev, () => Audio.init(), { once: true });
});
