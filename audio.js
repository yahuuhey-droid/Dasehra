/**
 * Festive Dussehra Sound Engine (Web Audio API)
 * Synthesizes Shankhnaad, Bow Twang, Flaming Arrow flight, Firecrackers,
 * Explosions, Evil Laugh, and Festive Temple Bells.
 * 100% self-contained, lightweight, zero-latency on mobile!
 */

class DussehraAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.hasUserInteracted = false;
        this.cachedNoiseBuffer = null;
        this.lastPopTime = 0;
    }

    // Initialize AudioContext upon first user gesture
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        this.hasUserInteracted = true;
        this.prepareNoiseBuffer();
    }

    prepareNoiseBuffer() {
        if (!this.ctx) return;
        if (!this.cachedNoiseBuffer || this.cachedNoiseBuffer.sampleRate !== this.ctx.sampleRate) {
            try {
                const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
                this.cachedNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const output = this.cachedNoiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
            } catch (e) {
                // Ignore fallback
            }
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.ctx && muted) {
            this.ctx.suspend().catch(() => {});
        } else if (this.ctx && !muted) {
            this.ctx.resume().catch(() => {});
        }
    }

    toggleMute() {
        this.init();
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }

    // 1. Shankh Naad (Divine Conch Shell Sound)
    playShankhNaad() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;
        const duration = 3.6;

        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.35, now + 0.8);
        masterGain.gain.setValueAtTime(0.35, now + duration - 1.0);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        // Conch fundamental & rich overtones
        const fundamental = 220; // A3
        const harmonics = [1, 2, 2.98, 4.02, 5.01];
        const harmonicGains = [0.5, 0.4, 0.25, 0.15, 0.08];

        harmonics.forEach((h, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = idx === 0 ? 'sine' : (idx === 1 ? 'triangle' : 'sawtooth');
            
            const baseFreq = fundamental * h;
            osc.frequency.setValueAtTime(baseFreq * 0.96, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.4);
            osc.frequency.setValueAtTime(baseFreq, now + duration - 0.5);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.94, now + duration);

            gain.gain.value = harmonicGains[idx];
            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + duration);

            osc.onended = () => {
                try {
                    osc.disconnect();
                    gain.disconnect();
                } catch (e) {}
            };
        });

        // Add conch breath turbulence with filtered noise
        this.createNoiseBuffer((noiseBuffer) => {
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, now);
            filter.Q.value = 3;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(masterGain);

            noise.start(now);
            noise.stop(now + duration);

            noise.onended = () => {
                try {
                    noise.disconnect();
                    filter.disconnect();
                    noiseGain.disconnect();
                    masterGain.disconnect();
                } catch (e) {}
            };
        });
    }

    // 2. Bow String Twang (धनुष टंकार)
    playBowTwang() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';

        // Deep resonant twang frequency drop
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);

        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch (e) {}
        };
    }

    // 3. Arrow Flying Whoosh & Flame Sizzle (बाण की उड़ान)
    // Synchronized to exact flight duration (default 0.85s)
    playArrowFlight(duration = 0.85) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        this.createNoiseBuffer((noiseBuffer) => {
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            // Swoop in pitch as arrow speeds towards target
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.exponentialRampToValueAtTime(2600, now + duration);
            filter.Q.value = 5;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.4, now + duration * 0.85);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
            noise.stop(now + duration);

            noise.onended = () => {
                try {
                    noise.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                } catch (e) {}
            };
        });

        // Whistling divine tone
        const whistle = ctx.createOscillator();
        const whistleGain = ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(800, now);
        whistle.frequency.exponentialRampToValueAtTime(1800, now + duration);

        whistleGain.gain.setValueAtTime(0.01, now);
        whistleGain.gain.linearRampToValueAtTime(0.18, now + duration * 0.85);
        whistleGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        whistle.connect(whistleGain);
        whistleGain.connect(ctx.destination);

        whistle.start(now);
        whistle.stop(now + duration);

        whistle.onended = () => {
            try {
                whistle.disconnect();
                whistleGain.disconnect();
            } catch (e) {}
        };
    }

    // 4. Massive Explosion when Arrow hits Ravan (रावण पर बाण प्रहार)
    playExplosion() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Sub bass thump
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(25, now + 0.6);

        subGain.gain.setValueAtTime(0.8, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.7);

        sub.onended = () => {
            try {
                sub.disconnect();
                subGain.disconnect();
            } catch (e) {}
        };

        // Explosive noise burst
        this.createNoiseBuffer((noiseBuffer) => {
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + 1.1);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
            noise.stop(now + 1.1);

            noise.onended = () => {
                try {
                    noise.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                } catch (e) {}
            };
        });
    }

    // 5. Firecracker Pop / Crackle (पटाखे का धमाका)
    playFirecrackerPop() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Throttle rapid successive pops to avoid audio queue delay
        if (this.lastPopTime && (now - this.lastPopTime) < 0.07) {
            return;
        }
        this.lastPopTime = now;

        // Crisp crackle pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320 + Math.random() * 450, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);

        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch (e) {}
        };
    }

    // 6. Ravana Evil Laugh / Grunt
    playEvilLaugh() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;
        const laughPitches = [160, 150, 140, 130, 120];

        laughPitches.forEach((pitch, i) => {
            const t = now + i * 0.16;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(pitch, t);
            osc.frequency.exponentialRampToValueAtTime(pitch * 0.8, t + 0.14);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.16);

            osc.onended = () => {
                try {
                    osc.disconnect();
                    gain.disconnect();
                } catch (e) {}
            };
        });
    }

    // 7. Ravana Defeat Gasp / Groan
    playRavanDefeat() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.3);

        osc.onended = () => {
            try {
                osc.disconnect();
                filter.disconnect();
                gain.disconnect();
            } catch (e) {}
        };
    }

    // 8. Temple Bell Toll (विजय घंटानाद)
    playTempleBell(freq = 520) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;
        const duration = 2.2;

        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.3, now);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        const partials = [1, 2.02, 3.01, 4.25, 5.43];
        const amps = [0.6, 0.4, 0.25, 0.15, 0.08];

        partials.forEach((p, idx) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * p, now);

            g.gain.value = amps[idx];
            osc.connect(g);
            g.connect(masterGain);

            osc.start(now);
            osc.stop(now + duration);

            osc.onended = () => {
                try {
                    osc.disconnect();
                    g.disconnect();
                } catch (e) {}
            };
        });
    }

    // Helper: Generate or reuse cached white noise buffer (Zero-allocation)
    createNoiseBuffer(callback) {
        if (!this.ctx) return;
        this.prepareNoiseBuffer();
        if (this.cachedNoiseBuffer) {
            callback(this.cachedNoiseBuffer);
        }
    }
}

// Global Audio Instance
window.soundEngine = new DussehraAudioEngine();
