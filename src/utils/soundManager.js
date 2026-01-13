/**
 * Sound Manager for Gallery Experience
 * 
 * Uses Web Audio API to generate subtle, gallery-style sounds.
 * All sounds are off by default and can be toggled by the user.
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = false;
        this.ambientOscillator = null;
        this.ambientGain = null;
        this.masterGain = null;
        this.isAmbientPlaying = false;
    }

    // Initialize AudioContext (must be called after user interaction)
    init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.audioContext.destination);
    }

    // Toggle sound on/off
    toggle() {
        this.init();
        this.isEnabled = !this.isEnabled;

        if (this.isEnabled) {
            this.masterGain.gain.setTargetAtTime(1, this.audioContext.currentTime, 0.3);
            this.startAmbient();
        } else {
            this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.3);
            this.stopAmbient();
        }

        return this.isEnabled;
    }

    // Get current state
    getEnabled() {
        return this.isEnabled;
    }

    // === AMBIENT SOUND ===
    // Uses audio file for ambient piano/keyboard
    startAmbient() {
        if (this.isAmbientPlaying || !this.audioContext) return;

        // Try to use audio file first
        this.ambientAudio = new Audio('/sounds/ambient.webm');
        this.ambientAudio.loop = true;
        this.ambientAudio.volume = 0;

        // Create media element source for integration with Web Audio
        this.ambientSource = this.audioContext.createMediaElementSource(this.ambientAudio);
        this.ambientGain = this.audioContext.createGain();
        this.ambientGain.gain.value = 0;

        this.ambientSource.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGain);

        // Fade in
        this.ambientAudio.play().then(() => {
            this.ambientAudio.volume = 1;
            this.ambientGain.gain.setTargetAtTime(0.04, this.audioContext.currentTime, 1);
        }).catch(() => {
            // Fallback: Generate soft piano-like tones if file not found
            console.log('Ambient audio file not found, using generated tones');
            this.startGeneratedAmbient();
        });

        this.isAmbientPlaying = true;
    }

    // Fallback generated ambient (soft piano-like chords)
    startGeneratedAmbient() {
        const playChord = () => {
            if (!this.isEnabled || !this.audioContext) return;

            // Soft piano-like chord notes (C major 7)
            const notes = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4

            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                // Triangle wave sounds more piano-like
                osc.type = 'triangle';
                osc.frequency.value = freq;

                // Soft attack, long decay
                const now = this.audioContext.currentTime;
                gain.gain.value = 0;
                gain.gain.setTargetAtTime(0.015, now + (i * 0.1), 0.3);
                gain.gain.setTargetAtTime(0.008, now + 2, 2);
                gain.gain.setTargetAtTime(0, now + 6, 2);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + (i * 0.1));
                osc.stop(now + 10);
            });
        };

        // Play initial chord
        playChord();

        // Schedule repeating chords with variation
        this.ambientInterval = setInterval(() => {
            if (this.isEnabled) playChord();
        }, 8000);
    }

    stopAmbient() {
        if (!this.isAmbientPlaying) return;

        // Stop audio file
        if (this.ambientAudio) {
            this.ambientGain?.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
            setTimeout(() => {
                this.ambientAudio?.pause();
                this.ambientAudio = null;
            }, 600);
        }

        // Stop generated ambient interval
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }

        this.isAmbientPlaying = false;
    }

    // === CONTEXTUAL IMAGE SOUNDS ===

    playImageSound(src) {
        console.log("Playing image sound:", src);

        // Ensure AudioContext is ready regardless of global enabled state
        if (!this.audioContext) this.init();
        if (this.audioContext.state === 'suspended') this.audioContext.resume();

        if (!src) return;

        // Decrease ambient volume to 0 (mute)
        if (this.ambientGain) {
            this.ambientGain.gain.cancelScheduledValues(this.audioContext.currentTime);
            this.ambientGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
        }

        // Stop current image sound if playing
        if (this.currentImageAudio) {
            this.stopImageSound();
        }

        // Play new sound
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0;

        const source = this.audioContext.createMediaElementSource(audio);
        const gain = this.audioContext.createGain();
        gain.gain.value = 0;

        source.connect(gain);
        gain.connect(this.masterGain);

        // Force master gain to 1 (audible) for this specific sound
        this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
        this.masterGain.gain.setTargetAtTime(1, this.audioContext.currentTime, 0.1);

        audio.play().then(() => {
            console.log("Image sound started");
            // Fade in aggressively
            gain.gain.setTargetAtTime(0.8, this.audioContext.currentTime, 0.5);
            audio.volume = 1;
        }).catch(e => console.error("Audio play failed:", e));

        this.currentImageAudio = audio;
        this.currentImageGain = gain;
    }

    stopImageSound() {
        if (!this.currentImageAudio) return;
        console.log("Stopping image sound");

        // Fade out
        if (this.currentImageGain) {
            this.currentImageGain.gain.cancelScheduledValues(this.audioContext.currentTime);
            this.currentImageGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
        }

        const audioToStop = this.currentImageAudio;
        setTimeout(() => {
            audioToStop.pause();
        }, 600);

        this.currentImageAudio = null;
        this.currentImageGain = null;

        // Restore appropriate state based on global preference
        if (this.isEnabled) {
            // Restore ambient volume if globally enabled
            if (this.ambientGain) {
                this.ambientGain.gain.cancelScheduledValues(this.audioContext.currentTime);
                this.ambientGain.gain.setTargetAtTime(0.04, this.audioContext.currentTime, 1);
            }
        } else {
            // Re-mute master if globally disabled
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
            }
        }
    }

    // === INTERACTION SOUNDS ===

    // Gentle tonal swell when image becomes primary focus
    playFocusSound() {
        if (!this.isEnabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 440; // A4

        gain.gain.value = 0;
        gain.gain.setTargetAtTime(0.03, this.audioContext.currentTime, 0.1);
        gain.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.3, 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 1);
    }

    // Soft air shift for navigation
    playNavigateSound() {
        if (!this.isEnabled || !this.audioContext) return;

        // Short burst of filtered noise
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            // Fade in/out envelope
            const envelope = Math.sin((i / bufferSize) * Math.PI);
            data[i] = (Math.random() * 2 - 1) * 0.02 * envelope;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0.05;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    // Modal open sound - ascending tone
    playModalOpenSound() {
        if (!this.isEnabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 330;
        osc.frequency.setTargetAtTime(440, this.audioContext.currentTime, 0.15);

        gain.gain.value = 0;
        gain.gain.setTargetAtTime(0.04, this.audioContext.currentTime, 0.05);
        gain.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.2, 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.6);
    }

    // Modal close sound - descending tone
    playModalCloseSound() {
        if (!this.isEnabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 440;
        osc.frequency.setTargetAtTime(330, this.audioContext.currentTime, 0.15);

        gain.gain.value = 0;
        gain.gain.setTargetAtTime(0.04, this.audioContext.currentTime, 0.05);
        gain.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.2, 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.6);
    }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;
