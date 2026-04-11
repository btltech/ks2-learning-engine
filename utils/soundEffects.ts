// Simple synthesized sound effects using Web Audio API
// This avoids the need for external audio files

class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize context on first user interaction to comply with browser policies
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.initContext(), { once: true });
      window.addEventListener('keydown', () => this.initContext(), { once: true });
    }
  }

  private initContext() {
    if (!this.context && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioContextClass();
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public playCorrect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.context.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, this.context.currentTime + 0.1); // C6

    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }

  public playWrong() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);

    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }

  public playWin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.context) return;

    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    
    notes.forEach((freq, i) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      osc.connect(gain);
      gain.connect(this.context!.destination);
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = now + (i * 0.1);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.frequency.setValueAtTime(800, this.context.currentTime);
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }
}

export const soundEffects = new SoundManager();
