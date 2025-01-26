// Declare drumMachine in global scope
let drumMachine;

class DrumMachine {
    constructor() {
        // Core properties
        this.steps = 16;
        this.playing = false;
        this.currentStep = 0;
        this.bpm = 120;
        this.selectedTrack = 'kick';
        
        // Performance optimization properties
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        // Initialize patterns
        this.patterns = {
            kick: Array(32).fill(false),
            snare: Array(32).fill(false),
            hihat: Array(32).fill(false),
            clap: Array(32).fill(false),
            tom: Array(32).fill(false),
            rim: Array(32).fill(false),
            cymbal: Array(32).fill(false)
        };

        // Track mute states
        this.muted = Object.keys(this.patterns).reduce((acc, key) => ({...acc, [key]: false}), {});

        // Initialize systems
        this.initAudio();
        this.initEffects();
        this.initVisualizer();
        this.setupEventListeners();
        this.startAnimationLoop();
        this.updateGrid();

        // Setup analyzers
        this.analyzers = {
            waveform: new Tone.Analyser('waveform', 512),
            spectrum: new Tone.Analyser('fft', 2048),
            meter: new Tone.Meter()
        };

        // Connect analyzers to master output
        Object.values(this.analyzers).forEach(analyzer => {
            Tone.Master.connect(analyzer);
        });

        // Error handling setup
        this.setupErrorHandling();

        // Initialize swing control
        document.getElementById('swingAmount').addEventListener('input', (e) => {
            this.setSwing(e.target.value);
        });
    }
        
        initAudio() {
        this.initInstruments();
    }

    initInstruments() {
        this.instruments = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 6,
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0,
                    release: 0.4,
                    attackCurve: 'exponential'
                }
            }).set({ volume: -2 }),

            snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0,
                    release: 0.2
                }
            }).chain(new Tone.Filter(3000, "highpass")).set({ volume: -6 }),

            hihat: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: {
                    attack: 0.001,
                    decay: 0.05,
                    sustain: 0,
                    release: 0.04
                }
            }).chain(new Tone.Filter({
                frequency: 10000,
                type: "highpass",
                rolloff: -48
            })).set({ volume: -10 }),

            clap: new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: {
                    attack: 0.001,
                    decay: 0.3,
                    sustain: 0,
                    release: 0.1
                }
            }).chain(new Tone.Filter(2500, "bandpass")).set({ volume: -8 }),

            tom: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 4,
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0,
                    release: 0.2
                }
            }).set({ volume: -6 }),

            rim: new Tone.Synth({
                oscillator: { type: 'square' },
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    sustain: 0,
                    release: 0.1
                }
            }).chain(new Tone.Filter(5000, "bandpass")).set({ volume: -15 }),

            cymbal: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: {
                    attack: 0.001,
                    decay: 0.3,
                    sustain: 0.1,
                    release: 0.3
                }
            }).chain(new Tone.Filter({
                frequency: 8000,
                type: "highpass",
                rolloff: -24
            })).chain(new Tone.Filter({
                frequency: 12000,
                type: "lowpass",
                rolloff: -24
            })).set({ volume: -15 })
        };

        // Connect all instruments to destination
        Object.values(this.instruments).forEach(inst => inst.toDestination());
    }

    initEffects() {
        // Initialize effects
        this.reverb = new Tone.Reverb({
            decay: 1.5,
            wet: 0.3,
            preDelay: 0.01
        }).toDestination();

        this.delay = new Tone.FeedbackDelay({
            delayTime: "8n",
            feedback: 0.3,
            wet: 0.2,
            maxDelay: 1
        }).toDestination();

        this.distortion = new Tone.Distortion({
            distortion: 0.8,
            wet: 0,
            oversample: '2x'
        }).toDestination();

        // Chain effects
        [this.instruments.kick, this.instruments.snare, this.instruments.hihat, this.instruments.clap, this.instruments.tom, this.instruments.rim, this.instruments.cymbal].forEach(inst => {
            inst.disconnect();
            inst.chain(this.distortion, this.reverb, this.delay, Tone.Destination);
        });

        // Add effect controls
        document.getElementById('reverbMix').addEventListener('input', e => 
            this.reverb.wet.value = parseFloat(e.target.value));
        document.getElementById('delayMix').addEventListener('input', e => 
            this.delay.wet.value = parseFloat(e.target.value));
        document.getElementById('distortionMix').addEventListener('input', e => 
            this.distortion.wet.value = parseFloat(e.target.value));
    }

    initVisualizer() {
        this.canvas = document.getElementById('visualizer');
        this.bgCanvas = document.getElementById('bgVisualizer');
        this.ctx = this.canvas.getContext('2d');
        this.bgCtx = this.bgCanvas.getContext('2d');

        // Initialize particles
        this.particles = Array(100).fill().map(() => ({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5
        }));

        this.visualizerType = 'waveform';
        this.hue = 0;
    }
        
        setupEventListeners() {
			document.getElementById('playButtonTop').addEventListener('click', () => this.togglePlay());
document.getElementById('playButtonBottom').addEventListener('click', () => this.togglePlay());
			// Add inside setupEventListeners()
const visualizerContainer = document.querySelector('.visualizer-container');
visualizerContainer.style.cursor = 'pointer'; // Make it look clickable

visualizerContainer.addEventListener('click', (e) => {
    // Prevent click if clicking on labels
    if (e.target.closest('.visualizer-labels')) return;
    
    this.nextVisualizer();
    
    // Optional: Add click feedback
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        pointer-events: none;
        animation: flash 0.3s ease-out forwards;
    `;
    
    visualizerContainer.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
});

// Add this to your CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
        // Play button
        document.getElementById('playButton').addEventListener('click', () => this.togglePlay());

        // Global button handler
        document.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            const value = button.dataset.value;
            const instrument = button.dataset.instrument;

            if (action) {
				
				e.preventDefault();
                switch (action) {
                    case 'adjustBPM':
                        this.adjustBPM(parseInt(value));
                        break;
                    case 'adjustSteps':
                        this.adjustSteps(parseInt(value));
                        break;
                    case 'clearPatterns':
                        this.clearPatterns();
                        break;
                    case 'loadPreset':
                        this.loadPreset(value);
                        break;
                    case 'setVisualizerType':
                        this.setVisualizerType(value);
                        break;
                    case 'randomizeTrack':
                        this.randomizeTrack(this.selectedTrack, parseFloat(value));
                        break;
                    case 'shiftTrack':
                        this.shiftTrack(this.selectedTrack, parseInt(value));
                        break;
                    case 'invertTrack':
                        this.invertTrack(this.selectedTrack);
                        break;
                    case 'toggleMute':
                        if (instrument) this.toggleMute(instrument);
                        break;
                    case 'clearTrack':
                        if (instrument) this.clearTrack(instrument);
                        break;
                }
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', e => {
            if (e.repeat) return;
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowRight':
                    this.adjustSteps(4);
                    break;
                case 'ArrowLeft':
                    this.adjustSteps(-4);
                    break;
                case 'ArrowUp':
                    this.adjustBPM(5);
                    break;
                case 'ArrowDown':
                    this.adjustBPM(-5);
                    break;
                case 'c':
                    this.clearPatterns();
                    break;
                case 'r':
                    this.randomizeTrack(this.selectedTrack, 0.25);
                    break;
                case 's':
                    this.shiftTrack(this.selectedTrack, 1);
                    break;
                case 'a':
                    this.shiftTrack(this.selectedTrack, -1);
                    break;
                case 'i':
                    this.invertTrack(this.selectedTrack);
                    break;
                case 'v':
                    this.nextVisualizer();
                    break;
            }
        });

        // Track selection
        document.addEventListener('click', e => {
            const trackElement = e.target.closest('.track');
            if (trackElement) {
                const trackName = trackElement.dataset.instrument;
                if (trackName) {
                    this.selectedTrack = trackName;
                    document.querySelectorAll('.track').forEach(t => 
                        t.classList.remove('selected'));
                    trackElement.classList.add('selected');
                }
            }
        });

        // Grid click handling with optimized cell updates
        document.addEventListener('mousedown', e => {
            const cell = e.target.closest('.cell');
            if (!cell) return;

            const track = cell.closest('.track');
            if (!track) return;

            const instrument = track.dataset.instrument;
            const step = parseInt(cell.dataset.step);

            if (instrument && !isNaN(step)) {
                this.toggleStep(instrument, step);
                
                // Enable drag functionality
                this.isDragging = true;
                this.dragInstrument = instrument;
                this.lastDragState = this.patterns[instrument][step];
            }
        });

        document.addEventListener('mousemove', e => {
            if (!this.isDragging) return;

            const cell = e.target.closest('.cell');
            if (!cell) return;

            const track = cell.closest('.track');
            if (!track || track.dataset.instrument !== this.dragInstrument) return;

            const step = parseInt(cell.dataset.step);
            if (!isNaN(step)) {
                // Set cell to the same state as the initial clicked cell
                if (this.patterns[this.dragInstrument][step] !== this.lastDragState) {
                    this.patterns[this.dragInstrument][step] = this.lastDragState;
                    this.updateCell(this.dragInstrument, step);
                    if (this.lastDragState) {
                        this.triggerInstrument(this.dragInstrument, Tone.now(), 0.7);
                    }
                }
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Handle touch events
        document.addEventListener('touchstart', e => {
            const cell = e.target.closest('.cell');
            if (!cell) return;

            const track = cell.closest('.track');
            if (!track) return;

            const instrument = track.dataset.instrument;
            const step = parseInt(cell.dataset.step);

            if (instrument && !isNaN(step)) {
                e.preventDefault();
                this.toggleStep(instrument, step);
            }
        }, { passive: false });
    }
	
	startAnimationLoop() {
    let lastTime = performance.now();
    const animate = (currentTime) => {
        this.animationFrameId = requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        if (deltaTime >= this.frameInterval) {
            this.drawVisualizer();
            lastTime = currentTime - (deltaTime % this.frameInterval);
        }
    };
    animate(performance.now());
}

toggleStep(instrument, step) {
    // Toggle the step in the pattern without triggering sound
    this.patterns[instrument][step] = !this.patterns[instrument][step];
    
    // Update the visual state of the cell
    const track = document.querySelector(`[data-instrument="${instrument}"]`);
    if (track) {
        const cell = track.querySelector(`[data-step="${step}"]`);
        if (cell) {
            cell.classList.toggle('active', this.patterns[instrument][step]);
        }
    }
}

updateCell(instrument, step) {
    const track = document.querySelector(`[data-instrument="${instrument}"]`);
    if (!track) return;

    const cell = track.querySelectorAll('.cell')[step];
    if (!cell) return;

    // Update just this cell's state
    cell.classList.toggle('active', this.patterns[instrument][step]);
    if (step === this.currentStep) {
        cell.classList.add('current');
    }
}

drawVisualizer() {
    if (!this.canvas || !this.ctx) return;

    const width = this.canvas.width = this.canvas.offsetWidth;
    const height = this.canvas.height = this.canvas.offsetHeight;
    this.bgCanvas.width = width;
    this.bgCanvas.height = height;

    // Clear canvases
    this.ctx.clearRect(0, 0, width, height);
    this.bgCtx.clearRect(0, 0, width, height);

    // Update hue
    this.hue = (this.hue + 0.5) % 360;

    try {
        switch (this.visualizerType) {
            case 'waveform':
                this.drawWaveform(width, height);
                break;
            case 'spectrum':
                this.drawSpectrum(width, height);
                break;
            case 'circular':
                this.drawCircular(width, height);
                break;
            case 'matrix':
                this.drawMatrix(width, height);
                break;
            case 'particles':
                this.drawParticles(width, height);
                break;
            case 'bars':
                this.drawBars(width, height);
                break;
            case 'scope':
                this.drawScope(width, height);
                break;
        }

        // Draw beat indicators if playing
        if (this.playing) {
            this.drawBeatIndicators(width, height);
        }

        // Update meters
        const level = this.analyzers.meter.getValue();
        document.getElementById('peak-meter').textContent = 
            `Peak: ${level.toFixed(1)}dB`;
        document.getElementById('visualizer-type').textContent = 
            this.visualizerType;

    } catch (error) {
        console.error('Visualizer error:', error);
    }
}

drawBeatIndicators(width, height) {
    const beatSize = 4;
    const spacing = width / this.steps;

    for (let i = 0; i < this.steps; i++) {
        const x = i * spacing + spacing / 2;
        this.ctx.beginPath();
        this.ctx.arc(x, height - 10, beatSize, 0, Math.PI * 2);
        this.ctx.fillStyle = i === this.currentStep ? '#0ff' : '#0f0';
        this.ctx.fill();
    }
}

drawWaveform(width, height) {
    const data = this.analyzers.waveform.getValue();
    
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#0f0';

    const sliceWidth = width / data.length;
    let x = 0;

    this.ctx.moveTo(0, height / 2);
    for (let i = 0; i < data.length; i++) {
        const y = (data[i] * height / 2) + height / 2;
        this.ctx.lineTo(x, y);
        x += sliceWidth;
    }

    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
}

drawSpectrum(width, height) {
    const data = this.analyzers.spectrum.getValue();
    const barWidth = width / data.length;
    
    for (let i = 0; i < data.length; i++) {
        const barHeight = Math.max(0, Math.min(height, 
            (data[i] + 140) * 2));
        const hue = (this.hue + i * 2) % 360;
        this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
        this.ctx.fillRect(
            i * barWidth,
            height - barHeight,
            barWidth * 0.8,
            barHeight
        );
    }
}

drawCircular(width, height) {
    const data = this.analyzers.waveform.getValue();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const angleIncrement = (Math.PI * 2) / data.length;

    for (let i = 0; i < data.length; i++) {
        const angle = i * angleIncrement;
        const dataValue = (data[i] + 1) * (radius / 2);
        const x = centerX + Math.cos(angle) * dataValue;
        const y = centerY + Math.sin(angle) * dataValue;

        const hue = (this.hue + i * 5) % 360;
        this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

drawMatrix(width, height) {
    const data = this.analyzers.waveform.getValue();
    const gridSize = 32;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const dataIndex = Math.floor((x / gridSize) * data.length);
            const dataValue = Math.abs(data[dataIndex]);
            const hue = (this.hue + x * 5 + y * 5) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.5 + dataValue * 0.5})`;
            this.ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }
}

drawParticles(width, height) {
    const data = this.analyzers.waveform.getValue();
    const volume = this.analyzers.meter.getValue() + 100;
    const intensity = Math.min(1, Math.max(0, volume / 50));

    this.particles.forEach((particle, i) => {
        particle.y -= particle.speed * intensity;
        if (particle.y < 0) {
            particle.y = 1;
            particle.x = Math.random();
        }

        const x = particle.x * width;
        const y = particle.y * height;
        const size = particle.size * (1 + intensity);
		const dataIndex = Math.floor(particle.x * data.length);
            const dataValue = Math.abs(data[dataIndex]);

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${this.hue + i % 60}, 100%, 50%, ${0.3 + dataValue})`;
            this.ctx.fill();
        });
    }

    drawBars(width, height) {
    const data = this.analyzers.spectrum.getValue();
    const barCount = 64;
    const barWidth = width / barCount;
    const dataStep = Math.floor(data.length / barCount);

    for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = i * dataStep; j < (i + 1) * dataStep; j++) {
            sum += data[j] + 140;
        }
        const avg = sum / dataStep;
        // Dramatically increased sensitivity
        const barHeight = Math.max(0, Math.min(height, (avg / 2) * 4)); // Much more pronounced movement
        const hue = (this.hue + i * 2) % 360;
        
        // Add some minimal height so bars are always visible
        const minHeight = height * 0.05; // 5% of height as minimum
        const finalHeight = Math.max(minHeight, barHeight);
        
        this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
        this.ctx.fillRect(
            i * barWidth,
            height / 2 - finalHeight / 2,
            barWidth * 0.8,
            finalHeight
        );
    }
}

    drawScope(width, height) {
        const data = this.analyzers.waveform.getValue();
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = height / 3;

        this.ctx.beginPath();
        this.ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.lineWidth = 2;

        for (let i = 0; i < data.length; i++) {
            const x = data[i] * Math.cos(i * Math.PI * 2 / data.length) * scale + centerX;
            const y = data[i] * Math.sin(i * Math.PI * 2 / data.length) * scale + centerY;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.closePath();
        this.ctx.stroke();

        // Add glow effect
        this.ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, 0.3)`;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    updateGrid() {
        const sequencer = document.getElementById('sequencer');
        if (!sequencer) return;
        
        sequencer.innerHTML = '';

        Object.entries(this.patterns).forEach(([instrument, pattern]) => {
            const track = document.createElement('div');
            track.className = `track${this.muted[instrument] ? ' muted' : ''}${instrument === this.selectedTrack ? ' selected' : ''}`;
            track.dataset.instrument = instrument;

            const trackHeader = document.createElement('div');
            trackHeader.className = 'track-name';
            trackHeader.innerHTML = `
                > ${instrument.toUpperCase()}
                <div class="track-controls">
                    <button data-action="toggleMute" data-instrument="${instrument}">
                        ${this.muted[instrument] ? 'UNMUTE' : 'MUTE'}
                    </button>
                    <button data-action="clearTrack" data-instrument="${instrument}">CLEAR</button>
                </div>
            `;

            const grid = document.createElement('div');
            grid.className = 'grid';
            grid.style.gridTemplateColumns = `repeat(${this.steps}, 1fr)`;

            pattern.slice(0, this.steps).forEach((active, step) => {
                const cell = document.createElement('div');
                cell.className = `cell${active ? ' active' : ''}${step === this.currentStep ? ' current' : ''}`;
                cell.dataset.step = step;
                grid.appendChild(cell);
            });

            track.appendChild(trackHeader);
            track.appendChild(grid);
            sequencer.appendChild(track);
        });

        document.getElementById('info').textContent =
            `> BPM: ${this.bpm} | Steps: ${this.steps} | Current Step: ${this.currentStep} | Selected: ${this.selectedTrack.toUpperCase()}`;
    }

    togglePlay() {
    if (this.playing) {
        Tone.Transport.stop();
        this.sequence?.stop();
        this.playing = false;
        document.getElementById('playButton').textContent = 'START';
        document.getElementById('playButtonTop').textContent = 'START';
        document.getElementById('playButtonBottom').textContent = 'START';
        document.getElementById('status').textContent = 'Stopped';
    } else {
        Tone.start();
        this.setupSequence();
        Tone.Transport.start();
        this.playing = true;
        document.getElementById('playButton').textContent = 'STOP';
        document.getElementById('playButtonTop').textContent = 'STOP';
        document.getElementById('playButtonBottom').textContent = 'STOP';
        document.getElementById('status').textContent = 'Playing';
    }
}

    setupSequence() {
        if (this.sequence) this.sequence.dispose();

        this.sequence = new Tone.Sequence((time, step) => {
            // Store previous step to remove 'current' class
            const prevStep = this.currentStep;
            this.currentStep = step;

            // Update only the current step indicators instead of full grid
            Object.keys(this.patterns).forEach(instrument => {
                const track = document.querySelector(`[data-instrument="${instrument}"]`);
                if (track) {
                    const cells = track.querySelectorAll('.cell');
                    if (prevStep >= 0 && prevStep < cells.length) {
                        cells[prevStep].classList.remove('current');
                    }
                    if (step < cells.length) {
                        cells[step].classList.add('current');
                    }
                }

                // Trigger sound if step is active
                if (this.patterns[instrument][step] && !this.muted[instrument]) {
                    this.triggerInstrument(instrument, time);
                }
            });

            // Update info display
            document.getElementById('info').textContent =
                `> BPM: ${this.bpm} | Steps: ${this.steps} | Current Step: ${this.currentStep} | Selected: ${this.selectedTrack.toUpperCase()}`;
        }, [...Array(this.steps).keys()], '16n');

        Tone.Transport.bpm.value = this.bpm;
        this.sequence.start(0);
    }

    triggerInstrument(instrument, time, velocity = 1) {
        switch (instrument) {
            case 'kick':
                this.instruments.kick.triggerAttackRelease('C1', '8n', time, velocity * 0.9);
                break;
            case 'snare':
                this.instruments.snare.triggerAttackRelease('16n', time, velocity * 0.7);
                break;
            case 'hihat':
                this.instruments.hihat.triggerAttackRelease('32n', time, velocity * 0.5);
                break;
            case 'clap':
                this.instruments.clap.triggerAttackRelease('16n', time, velocity * 0.6);
                break;
            case 'tom':
                this.instruments.tom.triggerAttackRelease('G2', '8n', time, velocity * 0.7);
                break;
            case 'rim':
                this.instruments.rim.triggerAttackRelease('C5', '32n', time, velocity * 0.5);
                break;
            case 'cymbal':
                this.instruments.cymbal.triggerAttackRelease('16n', time, velocity * 0.4);
                break;
        }
    }
	
	setVisualizerType(type) {
        this.visualizerType = type;
    }

    nextVisualizer() {
        const visualizers = ['waveform', 'spectrum', 'circular', 'matrix', 'particles', 'bars', 'scope'];
        const currentIndex = visualizers.indexOf(this.visualizerType);
        this.visualizerType = visualizers[(currentIndex + 1) % visualizers.length];
    }

    toggleMute(instrument) {
        this.muted[instrument] = !this.muted[instrument];
        const track = document.querySelector(`[data-instrument="${instrument}"]`);
        if (track) {
            track.classList.toggle('muted', this.muted[instrument]);
            track.querySelector('button[data-action="toggleMute"]').textContent = 
                this.muted[instrument] ? 'UNMUTE' : 'MUTE';
        }
    }

    clearTrack(instrument) {
        this.patterns[instrument].fill(false);
        const track = document.querySelector(`[data-instrument="${instrument}"]`);
        if (track) {
            track.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('active');
            });
        }
    }

    clearPatterns() {
        Object.keys(this.patterns).forEach(instrument => {
            this.patterns[instrument].fill(false);
        });
        this.updateGrid();
    }

    adjustSteps(change) {
        this.steps = Math.max(4, Math.min(32, this.steps + change));
        this.updateGrid();
        if (this.playing) {
            this.setupSequence();
        }
    }

    adjustBPM(change) {
        this.bpm = Math.max(60, Math.min(200, this.bpm + change));
        Tone.Transport.bpm.value = this.bpm;
        document.getElementById('info').textContent =
            `> BPM: ${this.bpm} | Steps: ${this.steps} | Current Step: ${this.currentStep} | Selected: ${this.selectedTrack.toUpperCase()}`;
    }

    setSwing(amount) {
        Tone.Transport.swing = amount;
        Tone.Transport.swingSubdivision = '16n';
    }

    loadPreset(name) {
        const presets = {
            'basic': {
                kick:   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                snare:  [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                hihat:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                clap:   [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                tom:    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
                rim:    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                cymbal: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
            },
            'breakbeat': {
                kick:   [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
                snare:  [0,0,1,0,0,0,1,0,0,0,1,0,0,1,1,0],
                hihat:  [1,1,0,1,1,1,0,1,1,1,0,1,1,0,1,1],
                clap:   [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                tom:    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0],
                rim:    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                cymbal: [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1]
            }
        };

        if (presets[name]) {
            Object.entries(presets[name]).forEach(([instrument, pattern]) => {
                for (let i = 0; i < this.patterns[instrument].length; i++) {
                    this.patterns[instrument][i] = i < pattern.length ? Boolean(pattern[i]) : false;
                }
            });
            this.updateGrid();
        }
    }

    randomizeTrack(instrument, density = 0.25) {
        for (let i = 0; i < this.patterns[instrument].length; i++) {
            this.patterns[instrument][i] = Math.random() < density;
        }
        this.updateGrid();
    }

    shiftTrack(instrument, steps) {
        const pattern = [...this.patterns[instrument]];
        const shift = ((steps % pattern.length) + pattern.length) % pattern.length;
        const shifted = [...pattern.slice(-shift), ...pattern.slice(0, -shift)];
        this.patterns[instrument] = shifted;
        this.updateGrid();
    }

    invertTrack(instrument) {
        this.patterns[instrument] = this.patterns[instrument].map(step => !step);
        this.updateGrid();
    }

    setupErrorHandling() {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            console.error('Global error:', error);
            if (this.playing) {
                this.togglePlay();
            }
            document.getElementById('status').textContent = 'Error occurred. Recovered.';
        };
    }
}

// Initialize with error handling
window.addEventListener('DOMContentLoaded', () => {
    try {
        drumMachine = new DrumMachine();
    } catch (error) {
        console.error('Failed to initialize drum machine:', error);
        document.getElementById('status').textContent = 'Failed to initialize. Please refresh.';
    }
});

// Prevent spacebar from scrolling
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});