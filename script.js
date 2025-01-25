class DrumMachine {
    constructor() {
        this.steps = 16;
        this.playing = false;
        this.currentStep = 0;
        this.bpm = 120;
        this.selectedTrack = 'kick';
        this.patterns = {
            kick: Array(32).fill(false),
            snare: Array(32).fill(false),
            hihat: Array(32).fill(false),
            clap: Array(32).fill(false),
            tom: Array(32).fill(false),
            rim: Array(32).fill(false),
            cymbal: Array(32).fill(false)
        };
        this.muted = Object.keys(this.patterns).reduce((acc, key) => ({...acc, [key]: false}), {});
        
        this.initAudio();
        this.initEffects();
        this.initVisualizer();
        this.setupEventListeners();
        this.startAnimationLoop();
        this.updateGrid();
        this.visualizerType = 'waveform';
        this.spectrum = new Tone.FFT(2048);
        Tone.Master.connect(this.spectrum);
        this.frequencyData = new Float32Array(this.spectrum.size);
         this.lastClickTime = 0;
        this.clickDebounceDelay = 100;
    }

    initAudio() {
        // Kick - deep and punchy
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 6,
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0,
                release: 0.4
            }
        }).toDestination();

        // Snare - sharp and snappy
        this.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0,
                release: 0.1
            }
        }).connect(new Tone.Filter(3000, "highpass")).toDestination();

        // Hi-hat - metallic and short
        this.hihat = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.001,
                decay: 0.05,
                sustain: 0,
                release: 0.05
            }
        }).connect(new Tone.Filter(8000, "highpass")).toDestination();
        this.hihat.volume.value = -10;

        // Clap - noise burst
        this.clap = new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0,
                release: 0.1
            }
        }).connect(new Tone.Filter(1000, "bandpass")).toDestination();
        this.clap.volume.value = -5;

        // Tom - medium pitched drum
        this.tom = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0,
                release: 0.2
            }
        }).toDestination();

        // Rim - short click
        this.rim = new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: {
                attack: 0.001,
                decay: 0.03,
                sustain: 0,
                release: 0.02
            }
        }).connect(new Tone.Filter(5000, "bandpass")).toDestination();
        this.rim.volume.value = -15;

        // Cymbal - white noise with long decay
        this.cymbal = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0.1,
                release: 0.3
            }
        }).connect(new Tone.Filter(8000, "highpass")).toDestination();
        this.cymbal.volume.value = -20;
    }

    initEffects() {
        this.reverb = new Tone.Reverb({
            decay: 1.5,
            wet: 0.3
        }).toDestination();

        this.delay = new Tone.FeedbackDelay({
            delayTime: "8n",
            feedback: 0.3,
            wet: 0.2
        }).toDestination();

        this.distortion = new Tone.Distortion({
            distortion: 0.8,
            wet: 0
        }).toDestination();

        [this.kick, this.snare, this.hihat, this.clap, this.tom, this.rim, this.cymbal].forEach(inst => {
            inst.disconnect();
            inst.chain(this.distortion, this.reverb, this.delay, Tone.Destination);
        });

        document.getElementById('reverbMix').addEventListener('input', e =>
            this.reverb.wet.value = parseFloat(e.target.value));
        document.getElementById('delayMix').addEventListener('input', e =>
            this.delay.wet.value = parseFloat(e.target.value));
        document.getElementById('distortionMix').addEventListener('input', e =>
            this.distortion.wet.value = parseFloat(e.target.value));
    }

     initVisualizer() {
        this.analyser = new Tone.Analyser('waveform', 512);
        this.spectrum = new Tone.FFT(2048);
        this.meter = new Tone.Meter();
        Tone.Master.connect(this.analyser);
         Tone.Master.connect(this.spectrum);
          Tone.Master.connect(this.meter);

        this.canvas = document.getElementById('visualizer');
        this.bgCanvas = document.getElementById('bgVisualizer');
        this.ctx = this.canvas.getContext('2d');
          this.bgCtx = this.bgCanvas.getContext('2d');

        this.visualizerType = 'waveform';
        this.particles = [];
        this.hue = 0;
        this.frequencyData = new Float32Array(this.spectrum.size);


        // Initialize particles
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 0.5
            });
        }
    }

    drawVisualizer() {
        if (!this.canvas || !this.ctx) return;

        const width = this.canvas.width = this.canvas.offsetWidth;
        const height = this.canvas.height = this.canvas.offsetHeight;
        this.bgCanvas.width = width;
        this.bgCanvas.height = height;

        // Clear main canvas
        this.ctx.clearRect(0, 0, width, height);
        this.bgCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.bgCtx.fillRect(0, 0, width, height);


        // Update hue
        this.hue = (this.hue + 0.5) % 360;
        if (this.visualizerType === 'spectrum' || this.visualizerType === 'bars') {
            this.spectrum.getFloatFrequencyData(this.frequencyData);
        }

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

        // Draw beat indicators
        if (this.playing) {
            this.drawBeatIndicators(width, height);
        }
        document.getElementById('peak-meter').textContent = `Peak: ${this.meter.getLevel().toFixed(1)}dB`;
         document.getElementById('visualizer-type').textContent = this.visualizerType;
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

    drawParticles(width, height) {
        const data = this.analyser.getValue();
        const volume = this.meter.getValue() + 100;
        const intensity = Math.min(1, Math.max(0, volume / 50));

        this.particles.forEach((particle, i) => {
            // Update particle position
            particle.y -= particle.speed * intensity;
            if (particle.y < 0) {
                particle.y = 1;
                particle.x = Math.random();
            }

            // Draw particle
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
          if (!this.frequencyData || this.frequencyData.length === 0) return;
        const data = this.frequencyData;
        const barCount = 64;
        const barWidth = width / barCount;
        const dataStep = Math.floor(data.length / barCount);


        for (let i = 0; i < barCount; i++) {
             let sum = 0;
             for (let j = i * dataStep; j < (i + 1) * dataStep; j++) {
               sum += data[j] + 140
            }
            const avg = sum / dataStep;
            const barHeight = Math.max(0, Math.min(height, (avg / 15) * 2.2));
            const hue = (this.hue + i * 2) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;


             // Mirror bars
            this.ctx.fillRect(
                i * barWidth,
                height / 2 - barHeight / 2,
                barWidth * 0.8,
                barHeight
            );
        }
    }

     drawSpectrum(width, height) {
        if (!this.frequencyData || this.frequencyData.length === 0) return;
         const data = this.frequencyData;
        const barWidth = width / data.length;
        this.ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, 0.7)`;


        for (let i = 0; i < data.length; i++) {
            const barHeight = Math.max(0, Math.min(height, data[i] * 1.2));
              const hue = (this.hue + i * 2) % 360;
              this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
            this.ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        }
    }

  drawScope(width, height) {
        const data = this.analyser.getValue();
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

    drawWaveform(width, height) {
        const data = this.analyser.getValue();

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

    drawCircular(width, height) {
        const data = this.analyser.getValue();
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        const angleIncrement = (Math.PI * 2) / data.length;


        for (let i = 0; i < data.length; i++) {
            const angle = i * angleIncrement;
            const dataValue = (data[i] + 1) * (radius / 2);
            const x = centerX + Math.cos(angle) * (dataValue);
            const y = centerY + Math.sin(angle) * (dataValue);


            const hue = (this.hue + i * 5) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawMatrix(width, height) {
        const data = this.analyser.getValue();
        const gridSize = 32;
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const dataIndex = Math.floor((x / gridSize) * data.length);
                const dataValue = Math.abs(data[dataIndex])
                const hue = (this.hue + x * 5 + y * 5) % 360;
                this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.5 + dataValue * 0.5})`;
                this.ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }
   setupEventListeners() {
        document.getElementById('playButton').onclick = () => this.togglePlay();

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
            if (e.target.closest('.track')) {
                const trackElement = e.target.closest('.track');
                const trackName = trackElement.querySelector('.track-name').textContent
                    .trim().toLowerCase().split(' ')[1];
                this.selectedTrack = trackName;
                document.querySelectorAll('.track').forEach(t => t.classList.remove('selected'));
                trackElement.classList.add('selected');
            }
        });
        // Visualizer button clicks
        document.querySelectorAll('.visualization-controls button').forEach(button => {
            button.addEventListener('click', () => {
                const visualizerType = button.textContent.toLowerCase();
                 this.setVisualizerType(visualizerType);
            });
        });
    }
    startAnimationLoop() {
        const draw = () => {
            requestAnimationFrame(draw);
             this.drawVisualizer();
        };
        draw();
    }
  setVisualizerType(type) {
         this.visualizerType = type;
    }
    nextVisualizer() {
        const visualizers = ['waveform', 'spectrum', 'circular', 'matrix', 'particles', 'bars', 'scope'];
        const currentIndex = visualizers.indexOf(this.visualizerType);
        this.visualizerType = visualizers[(currentIndex + 1) % visualizers.length];
    }
    updateGrid() {
        const sequencer = document.getElementById('sequencer');
        sequencer.innerHTML = '';

        Object.entries(this.patterns).forEach(([instrument, pattern]) => {
            const track = document.createElement('div');
            track.className = `track${this.muted[instrument] ? ' muted' : ''}${instrument === this.selectedTrack ? ' selected' : ''}`;

            const trackHeader = document.createElement('div');
            trackHeader.className = 'track-name';
            trackHeader.innerHTML = `
                > ${instrument.toUpperCase()}
                <div class="track-controls">
                    <button onclick="drumMachine.toggleMute('${instrument}')">
                        ${this.muted[instrument] ? 'UNMUTE' : 'MUTE'}
                    </button>
                    <button onclick="drumMachine.clearTrack('${instrument}')">CLEAR</button>
                </div>
            `;

            const grid = document.createElement('div');
            grid.className = 'grid';
            grid.style.gridTemplateColumns = `repeat(${this.steps}, 1fr)`;

            pattern.slice(0, this.steps).forEach((active, step) => {
                const cell = document.createElement('div');
                cell.className = `cell${active ? ' active' : ''}${step === this.currentStep ? ' current' : ''}`;
                cell.onclick = (e) => this.toggleCell(instrument, step, e);
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
            this.sequence.stop();
            this.playing = false;
            document.getElementById('playButton').textContent = 'START';
            document.getElementById('status').textContent = 'Stopped';
        } else {
            Tone.start();
            this.setupSequence();
            Tone.Transport.start();
            this.playing = true;
            document.getElementById('playButton').textContent = 'STOP';
              document.getElementById('status').textContent = 'Playing';
        }
    }

    setupSequence() {
        if (this.sequence) this.sequence.dispose();

        this.sequence = new Tone.Sequence((time, step) => {
            this.currentStep = step;
            Object.entries(this.patterns).forEach(([instrument, pattern]) => {
                if (pattern[step] && !this.muted[instrument]) {
                    this.triggerInstrument(instrument, time);
                }
            });
            Tone.Draw.schedule(() => this.updateGrid(), time);
        }, [...Array(this.steps).keys()], '16n');

        Tone.Transport.bpm.value = this.bpm;
        this.sequence.start(0);
    }

    triggerInstrument(instrument, time, velocity = 1) {
        switch (instrument) {
            case 'kick':
                this.kick.triggerAttackRelease('C1', '8n', time, velocity);
                break;
            case 'snare':
                this.snare.triggerAttackRelease('8n', time, velocity * 0.7);
                break;
            case 'hihat':
                this.hihat.triggerAttackRelease('32n', time, velocity * 0.5);
                break;
            case 'clap':
                this.clap.triggerAttackRelease('8n', time, velocity * 0.8);
                break;
            case 'tom':
                this.tom.triggerAttackRelease('G2', '8n', time, velocity * 0.9);
                break;
            case 'rim':
                this.rim.triggerAttackRelease('32n', time, velocity * 0.5);
                break;
            case 'cymbal':
                this.cymbal.triggerAttackRelease('4n', time, velocity * 0.4);
                break;
        }
    }
     toggleCell(instrument, step, e) {
        const currentTime = Date.now();
        if (currentTime - this.lastClickTime < this.clickDebounceDelay) {
            return;
        }
        this.lastClickTime = currentTime;
         this.patterns[instrument][step] = !this.patterns[instrument][step];
        Tone.Draw.schedule(() => this.updateGrid(), Tone.now());
    }


    toggleMute(instrument) {
        this.muted[instrument] = !this.muted[instrument];
        this.updateGrid();
    }

    clearTrack(instrument) {
        this.patterns[instrument].fill(false);
        this.updateGrid();
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
        this.updateGrid();
    }

    setSwing(amount) {
        Tone.Transport.swing = amount;
        Tone.Transport.swingSubdivision = '16n';
    }

    loadPreset(name) {
        const presets = {
            'basic': {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                clap: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
                rim: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                cymbal: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            },
            'breakbeat': {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
                hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
                clap: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                tom: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
                rim: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                cymbal: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]
            }
        };

        if (presets[name]) {
            Object.entries(presets[name]).forEach(([instrument, pattern]) => {
                this.patterns[instrument] = pattern.map(v => Boolean(v)).concat(Array(32 - 16).fill(false));
            });
            this.updateGrid();
        }
    }

    randomizeTrack(instrument, density = 0.25) {
        this.patterns[instrument] = Array(32).fill(false)
            .map(() => Math.random() < density);
        this.updateGrid();
    }

    shiftTrack(instrument, steps) {
        const pattern = this.patterns[instrument];
        const shift = ((steps % pattern.length) + pattern.length) % pattern.length;
        this.patterns[instrument] = [
            ...pattern.slice(-shift),
            ...pattern.slice(0, -shift)
        ];
        this.updateGrid();
    }

    invertTrack(instrument) {
        this.patterns[instrument] = this.patterns[instrument].map(step => !step);
        this.updateGrid();
    }
}

// Initialize the drum machine
const drumMachine = new DrumMachine();

// Prevent spacebar from scrolling
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (drumMachine.canvas) {
        drumMachine.canvas.width = drumMachine.canvas.offsetWidth;
        drumMachine.canvas.height = drumMachine.canvas.offsetHeight;
          drumMachine.bgCanvas.width = drumMachine.bgCanvas.offsetWidth;
        drumMachine.bgCanvas.height = drumMachine.bgCanvas.offsetHeight;
    }
});

// Handle window focus
document.addEventListener('visibilitychange', () => {
    if (document.hidden && drumMachine.playing) {
        drumMachine.togglePlay();
    }
});