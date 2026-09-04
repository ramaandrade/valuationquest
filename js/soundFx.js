// ValuationQuest - soundFx.js
// Síntese de áudio procedural via Web Audio API (zero dependências externas)

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Navegadores que bloqueiam áudio antes de interação
    }
  }

  click() {
    this.playTone(600, 'triangle', 0.05, 0.05);
  }

  success() {
    if (this.muted) return;
    this.init();
    setTimeout(() => this.playTone(523.25, 'sine', 0.1, 0.08), 0);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.08), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.1), 200);
  }

  error() {
    if (this.muted) return;
    this.init();
    setTimeout(() => this.playTone(300, 'sawtooth', 0.15, 0.08), 0);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.25, 0.08), 120);
  }

  levelUp() {
    if (this.muted) return;
    this.init();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.12), idx * 120);
    });
  }

  alert() {
    if (this.muted) return;
    this.init();
    this.playTone(880, 'square', 0.1, 0.08);
    setTimeout(() => this.playTone(659.25, 'square', 0.15, 0.08), 100);
  }

  cashRegister() {
    if (this.muted) return;
    this.init();
    this.playTone(987.77, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.3, 0.12), 90);
  }
}

const sounds = new SoundEffects();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SoundEffects, sounds };
}
