// Round Game - Miami Vice Audio System
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.masterVolume = 0.5;
        this.sfxVolume = 0.75;
        this.musicVolume = 0.6;
        this.isMuted = false;
        
        this.init();
    }
    
    init() {
        this.createAudioContext();
        this.loadSounds();
        this.loadMusic();
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    loadSounds() {
        // Generate procedural sound effects using Web Audio API
        this.sounds = {
            shoot: this.createShootSound(),
            reload: this.createReloadSound(),
            hit: this.createHitSound(),
            explosion: this.createExplosionSound(),
            pickup: this.createPickupSound(),
            enemyShoot: this.createEnemyShootSound(),
            uiClick: this.createUIClickSound(),
            missionComplete: this.createMissionCompleteSound(),
            gameOver: this.createGameOverSound()
        };
    }
    
    loadMusic() {
        // Generate synthwave background music
        this.music = {
            mainTheme: this.createMainTheme(),
            combat: this.createCombatMusic(),
            menu: this.createMenuMusic()
        };
    }
    
    // Sound generation methods
    createShootSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createReloadSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createHitSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createExplosionSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.5);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.5 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createPickupSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createEnemyShootSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.08);
            
            gainNode.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.08);
        };
    }
    
    createUIClickSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createMissionCompleteSound() {
        return () => {
            if (!this.audioContext) return;
            
            // Play a triumphant chord
            const frequencies = [261.63, 329.63, 392.00]; // C major chord
            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(freq * 2, this.audioContext.currentTime + index * 0.1 + 0.5);
                
                gainNode.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime + index * 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.1 + 0.5);
                
                oscillator.start(this.audioContext.currentTime + index * 0.1);
                oscillator.stop(this.audioContext.currentTime + index * 0.1 + 0.5);
            });
        };
    }
    
    createGameOverSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1);
        };
    }
    
    // Music generation methods
    createMainTheme() {
        return () => {
            if (!this.audioContext) return;
            
            // Create a synthwave-style bass line
            const bassOscillator = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();
            const bassFilter = this.audioContext.createBiquadFilter();
            
            bassOscillator.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(this.audioContext.destination);
            
            bassOscillator.type = 'sawtooth';
            bassFilter.type = 'lowpass';
            bassFilter.frequency.value = 200;
            
            // Simple bass pattern
            const bassPattern = [55, 55, 61.74, 55, 73.42, 61.74, 55, 55]; // A minor scale
            let time = this.audioContext.currentTime;
            
            bassPattern.forEach((freq, index) => {
                bassOscillator.frequency.setValueAtTime(freq, time);
                bassGain.gain.setValueAtTime(0.1 * this.musicVolume * this.masterVolume, time);
                bassGain.gain.setValueAtTime(0, time + 0.5);
                time += 0.5;
            });
            
            bassOscillator.start(this.audioContext.currentTime);
            bassOscillator.stop(this.audioContext.currentTime + 4);
        };
    }
    
    createCombatMusic() {
        return () => {
            if (!this.audioContext) return;
            
            // More intense, faster tempo
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'square';
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            // Fast arpeggio
            const notes = [220, 246.94, 261.63, 293.66, 329.63, 293.66, 261.63, 246.94];
            let time = this.audioContext.currentTime;
            
            notes.forEach((freq, index) => {
                oscillator.frequency.setValueAtTime(freq, time);
                gainNode.gain.setValueAtTime(0.15 * this.musicVolume * this.masterVolume, time);
                gainNode.gain.setValueAtTime(0, time + 0.25);
                time += 0.25;
            });
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 2);
        };
    }
    
    createMenuMusic() {
        return () => {
            if (!this.audioContext) return;
            
            // Ambient, atmospheric
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
            filter.type = 'lowpass';
            filter.frequency.value = 300;
            
            gainNode.gain.setValueAtTime(0.05 * this.musicVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 3);
        };
    }
    
    // Public methods
    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        try {
            this.sounds[soundName]();
        } catch (e) {
            console.warn('Could not play sound:', soundName);
        }
    }
    
    playMusic(musicName) {
        if (this.isMuted || !this.music[musicName]) return;
        
        try {
            this.music[musicName]();
        } catch (e) {
            console.warn('Could not play music:', musicName);
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
    }
    
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Global audio manager instance
let audioManager;

// Initialize audio when user interacts with the page
document.addEventListener('click', () => {
    if (!audioManager) {
        audioManager = new AudioManager();
    }
    audioManager.resumeAudioContext();
}, { once: true });

// Export for use in main game
window.audioManager = audioManager;