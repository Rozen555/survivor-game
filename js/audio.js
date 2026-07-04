const Audio = {
  ctx: null,
  enabled: true,
  volume: 0.35,
  lastPlay: {},

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
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

  _gain(time, peak, duration) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, time);
    g.gain.exponentialRampToValueAtTime(peak * this.volume, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    g.connect(this.ctx.destination);
    return g;
  },

  _tone(freq, time, duration, type, peak) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(this._gain(time, peak, duration));
    osc.start(time);
    osc.stop(time + duration + 0.05);
  },

  _noise(time, duration, peak) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    src.connect(filter);
    filter.connect(this._gain(time, peak, duration));
    src.start(time);
  },

  play(name) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    switch (name) {
      case 'kill':
        if (!this._throttle('kill', 40)) return;
        this._noise(t, 0.08, 0.25);
        this._tone(180 + Math.random() * 60, t, 0.1, 'square', 0.12);
        break;

      case 'hurt':
        if (!this._throttle('hurt', 200)) return;
        this._tone(220, t, 0.15, 'sawtooth', 0.2);
        this._tone(90, t + 0.05, 0.2, 'sawtooth', 0.15);
        break;

      case 'xp':
        if (!this._throttle('xp', 60)) return;
        this._tone(880, t, 0.06, 'sine', 0.08);
        break;

      case 'gold':
        if (!this._throttle('gold', 80)) return;
        this._tone(1200, t, 0.05, 'sine', 0.1);
        this._tone(1600, t + 0.05, 0.08, 'sine', 0.1);
        break;

      case 'heal':
        this._tone(440, t, 0.1, 'sine', 0.12);
        this._tone(660, t + 0.08, 0.12, 'sine', 0.1);
        break;

      case 'levelUp':
        [523, 659, 784, 1047].forEach((f, i) => {
          this._tone(f, t + i * 0.08, 0.15, 'square', 0.14);
        });
        break;

      case 'select':
        this._tone(640, t, 0.06, 'sine', 0.12);
        break;

      case 'shop':
        this._tone(392, t, 0.12, 'triangle', 0.15);
        this._tone(523, t + 0.1, 0.15, 'triangle', 0.12);
        break;

      case 'buy':
        this._tone(880, t, 0.08, 'square', 0.1);
        this._tone(1100, t + 0.06, 0.1, 'square', 0.1);
        break;

      case 'wave':
        this._tone(330, t, 0.1, 'triangle', 0.12);
        this._tone(440, t + 0.12, 0.15, 'triangle', 0.12);
        break;

      case 'gameOver':
        [220, 185, 147].forEach((f, i) => {
          this._tone(f, t + i * 0.15, 0.25, 'sawtooth', 0.15);
        });
        break;

      case 'victory':
        [523, 659, 784, 988, 1175].forEach((f, i) => {
          this._tone(f, t + i * 0.1, 0.2, 'square', 0.13);
        });
        break;

      case 'start':
        this._tone(440, t, 0.08, 'square', 0.12);
        this._tone(554, t + 0.08, 0.12, 'square', 0.12);
        break;

      case 'nova':
        this._noise(t, 0.12, 0.2);
        this._tone(660, t, 0.2, 'sine', 0.15);
        break;

      case 'elite':
        this._tone(440, t, 0.1, 'square', 0.14);
        this._tone(554, t + 0.1, 0.12, 'square', 0.14);
        this._tone(659, t + 0.2, 0.18, 'square', 0.12);
        break;

      case 'boss':
        [110, 87, 73, 55].forEach((f, i) => {
          this._tone(f, t + i * 0.12, 0.35, 'sawtooth', 0.18);
        });
        this._tone(220, t + 0.5, 0.4, 'square', 0.15);
        break;
    }
  },
};

['click', 'keydown'].forEach((ev) => {
  window.addEventListener(ev, () => Audio.init(), { once: true });
});
