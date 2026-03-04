// ─── Constants ────────────────────────────────────────────────────────────────
const GRID_SIZE   = 20;   // cells
const CELL_SIZE   = 25;   // px per cell
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 500px

const DIRECTIONS = {
    ArrowUp:    { x: 0,  y: -1 },
    ArrowDown:  { x: 0,  y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x: 1,  y:  0 },
    w: { x: 0,  y: -1 },
    s: { x: 0,  y:  1 },
    a: { x: -1, y:  0 },
    d: { x: 1,  y:  0 },
};

const POWER_UP_TYPES = {
    SPEED:     { color: '#ff6b6b', symbol: '⚡', duration: 5000,  effect: 'speed' },
    SLOW:      { color: '#4ecdc4', symbol: '🐢', duration: 5000,  effect: 'slow' },
    INVINCIBLE:{ color: '#ffe66d', symbol: '🛡️', duration: 4000,  effect: 'invincible' },
    DOUBLE:    { color: '#ff9ff3', symbol: '✨', duration: 8000,  effect: 'double' },
};

const SPEED_LEVELS = [
    { threshold: 0,  interval: 160, label: 'Easy'   },
    { threshold: 5,  interval: 130, label: 'Normal'  },
    { threshold: 10, interval: 100, label: 'Fast'    },
    { threshold: 20, interval: 75,  label: 'Faster'  },
    { threshold: 35, interval: 55,  label: 'Insane'  },
    { threshold: 50, interval: 40,  label: 'Godlike' },
];

const COLORS = {
    snakeHead:   '#00ff80',
    snakeBody:   '#00cc66',
    snakeGlow:   'rgba(0, 255, 128, 0.4)',
    food:        '#ff4466',
    foodGlow:    'rgba(255, 68, 102, 0.6)',
    bonus:       '#ffd700',
    bonusGlow:   'rgba(255, 215, 0, 0.6)',
    obstacle:    '#ff4757',
    obstacleGlow:'rgba(255, 71, 87, 0.5)',
    grid:        'rgba(255, 255, 255, 0.03)',
    bg:          '#0d1117',
};

// ─── Sound System ───────────────────────────────────────────────────────────
const SoundSystem = {
    audioContext: null,
    enabled: true,
    
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silently fail if audio context not ready
        }
    },
    
    playEat() {
        this.playTone(600, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(800, 0.1, 'sine', 0.2), 50);
    },
    
    playBonus() {
        this.playTone(400, 0.1, 'sine', 0.25);
        setTimeout(() => this.playTone(600, 0.1, 'sine', 0.25), 80);
        setTimeout(() => this.playTone(800, 0.15, 'sine', 0.25), 160);
    },
    
    playPowerUp() {
        this.playTone(300, 0.15, 'sine', 0.3);
        setTimeout(() => this.playTone(500, 0.15, 'sine', 0.3), 100);
        setTimeout(() => this.playTone(700, 0.2, 'sine', 0.3), 200);
    },
    
    playGameOver() {
        this.playTone(400, 0.3, 'sine', 0.4);
        setTimeout(() => this.playTone(300, 0.3, 'sine', 0.4), 200);
        setTimeout(() => this.playTone(200, 0.5, 'sine', 0.4), 400);
    },
    
    playPause() {
        this.playTone(500, 0.1, 'sine', 0.2);
    },
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

// ─── Game Statistics ───────────────────────────────────────────────────────
const GameStats = {
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    averageScore: 0,
    
    init() {
        const saved = localStorage.getItem('snakeGameStats');
        if (saved) {
            const stats = JSON.parse(saved);
            this.gamesPlayed = stats.gamesPlayed || 0;
            this.totalScore = stats.totalScore || 0;
            this.bestScore = stats.bestScore || 0;
            this.averageScore = stats.averageScore || 0;
        }
    },
    
    update(score) {
        this.gamesPlayed++;
        this.totalScore += score;
        if (score > this.bestScore) {
            this.bestScore = score;
        }
        this.averageScore = Math.round(this.totalScore / this.gamesPlayed);
        this.save();
    },
    
    save() {
        localStorage.setItem('snakeGameStats', JSON.stringify({
            gamesPlayed: this.gamesPlayed,
            totalScore: this.totalScore,
            bestScore: this.bestScore,
            averageScore: this.averageScore
        }));
    },
    
    getDisplayHTML() {
        return `
            <div class="stats-row">
                <span class="stat-label">Games Played</span>
                <span class="stat-value">${this.gamesPlayed}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Total Score</span>
                <span class="stat-value">${this.totalScore}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Average Score</span>
                <span class="stat-value">${this.averageScore}</span>
            </div>
            <div class="stats-row">
                <span class="stat-label">Best Score</span>
                <span class="stat-value">${this.bestScore}</span>
            </div>
        `;
    }
};

// ─── Game State ─────────────────────────────────────────────────────────────
let snake, direction, nextDirection, food, bonusFood;
let score, highScore, level, levelLabel;
let gameLoop, gameRunning, gamePaused;
let bonusTimer, bonusActive;
let particles = [];
let frameCount = 0;
let obstacles = [];
let powerUp = null;
let powerUpTimer = null;
let activePowerUp = null;
let screenShake = 0;
let comboCount = 0;
let comboTimer = null;
let lastDirectionUpdate = 0; // Prevent rapid direction changes

// ─── DOM Elements ───────────────────────────────────────────────────────────
const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const scoreEl       = document.getElementById('score');
const highScoreEl   = document.getElementById('highScore');
const levelEl       = document.getElementById('levelLabel');
const startOverlay  = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreEl  = document.getElementById('finalScore');
const finalBestEl   = document.getElementById('finalBest');
const powerupIndicator = document.getElementById('powerupIndicator');
const pauseOverlay  = document.getElementById('pauseOverlay');
const gameStatsEl   = document.getElementById('gameStats');
const soundToggle   = document.getElementById('soundToggle');

canvas.width  = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// ─── Initialization ─────────────────────────────────────────────────────────
function initGame() {
    SoundSystem.init();
    GameStats.init();
    
    snake = [
        { x: 10, y: 10 },
        { x: 9,  y: 10 },
        { x: 8,  y: 10 },
    ];
    direction     = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score         = 0;
    level         = 0;
    levelLabel    = SPEED_LEVELS[0].label;
    bonusActive   = false;
    bonusFood     = null;
    particles     = [];
    frameCount    = 0;
    obstacles     = [];
    powerUp       = null;
    activePowerUp = null;
    screenShake   = 0;
    comboCount    = 0;
    lastDirectionUpdate = 0;

    clearTimeout(powerUpTimer);
    clearTimeout(comboTimer);

    highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');

    updateScoreDisplay();
    spawnFood();
    spawnObstacles();
}

// ─── Food Spawning ─────────────────────────────────────────────────────────
function spawnFood() {
    food = randomEmptyCell();
}

function spawnBonusFood() {
    if (bonusActive) return;
    bonusActive = true;
    bonusFood   = randomEmptyCell();

    // Bonus disappears after 7 seconds
    clearTimeout(bonusTimer);
    bonusTimer = setTimeout(() => {
        bonusActive = false;
        bonusFood   = null;
    }, 7000);
}

function randomEmptyCell() {
    let cell;
    do {
        cell = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (
        snake.some(s => s.x === cell.x && s.y === cell.y) ||
        (food && food.x === cell.x && food.y === cell.y) ||
        (bonusFood && bonusFood.x === cell.x && bonusFood.y === cell.y) ||
        (powerUp && powerUp.x === cell.x && powerUp.y === cell.y) ||
        obstacles.some(o => o.x === cell.x && o.y === cell.y)
    );
    return cell;
}

function spawnObstacles() {
    obstacles = [];
    const obstacleCount = Math.min(Math.floor(score / 100) + 2, 8);
    
    for (let i = 0; i < obstacleCount; i++) {
        let obstacle;
        do {
            obstacle = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (
            snake.some(s => s.x === obstacle.x && s.y === obstacle.y) ||
            (obstacle.x >= 8 && obstacle.x <= 12 && obstacle.y >= 8 && obstacle.y <= 12) ||
            obstacles.some(o => o.x === obstacle.x && o.y === obstacle.y)
        );
        obstacles.push(obstacle);
    }
}

function spawnPowerUp() {
    if (powerUp || Math.random() > 0.3) return;
    
    const types = Object.keys(POWER_UP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUp = {
        ...randomEmptyCell(),
        type: type,
        ...POWER_UP_TYPES[type]
    };
    
    // Power-up disappears after 8 seconds
    clearTimeout(powerUpTimer);
    powerUpTimer = setTimeout(() => {
        powerUp = null;
    }, 8000);
}

function activatePowerUp(type) {
    clearTimeout(powerUpTimer);
    activePowerUp = type;
    
    const powerUpData = POWER_UP_TYPES[type];
    SoundSystem.playPowerUp();
    
    // Show power-up indicator
    const indicator = document.getElementById('powerupIndicator');
    const icon = document.getElementById('powerupIcon');
    const name = document.getElementById('powerupName');
    
    indicator.classList.remove('hidden');
    icon.textContent = powerUpData.symbol;
    name.textContent = powerUpData.effect.charAt(0).toUpperCase() + powerUpData.effect.slice(1);
    
    // Apply effect
    switch(powerUpData.effect) {
        case 'speed':
            scheduleLoop();
            break;
        case 'slow':
            scheduleLoop();
            break;
        case 'invincible':
            // Invincibility handled in collision detection
            break;
        case 'double':
            // Double points handled in score calculation
            break;
    }
    
    // Deactivate after duration
    setTimeout(() => {
        activePowerUp = null;
        indicator.classList.add('hidden');
        scheduleLoop(); // Reset speed
    }, powerUpData.duration);
}

// ─── Game Loop ─────────────────────────────────────────────────────────────
function startGame() {
    initGame();
    hideOverlays();
    gameRunning = true;
    gamePaused  = false;
    scheduleLoop();
}

function scheduleLoop() {
    clearInterval(gameLoop);
    let speed = SPEED_LEVELS.filter(l => score >= l.threshold).pop();
    
    // Apply power-up speed modifiers
    if (activePowerUp === 'SPEED') {
        speed = { ...speed, interval: Math.max(speed.interval * 0.6, 30) };
    } else if (activePowerUp === 'SLOW') {
        speed = { ...speed, interval: Math.min(speed.interval * 1.5, 200) };
    }
    
    level      = SPEED_LEVELS.indexOf(SPEED_LEVELS.filter(l => score >= l.threshold).pop());
    levelLabel = SPEED_LEVELS[level].label;
    levelEl.textContent = levelLabel;
    gameLoop = setInterval(tick, speed.interval);
}

function tick() {
    if (!gameRunning || gamePaused) return;
    frameCount++;

    direction = { ...nextDirection };

    // Move snake
    const head = {
        x: (snake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (snake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
    };

    // Collision with self (unless invincible)
    if (activePowerUp !== 'INVINCIBLE' && snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }

    // Collision with obstacles (unless invincible)
    if (activePowerUp !== 'INVINCIBLE' && obstacles.some(o => o.x === head.x && o.y === head.y)) {
        screenShake = 10;
        endGame();
        return;
    }

    snake.unshift(head);

    // Check food
    let ate = false;
    if (head.x === food.x && head.y === food.y) {
        let points = 10;
        if (activePowerUp === 'DOUBLE') points *= 2;
        
        score += points;
        ate = true;
        spawnFood();
        SoundSystem.playEat();
        popScore();
        spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2,
                       head.y * CELL_SIZE + CELL_SIZE / 2,
                       COLORS.food, 12);

        // Combo system
        comboCount++;
        clearTimeout(comboTimer);
        comboTimer = setTimeout(() => { comboCount = 0; }, 3000);

        // Spawn bonus every 5 foods
        if (score % 50 === 0) spawnBonusFood();

        // Spawn power-up occasionally
        if (Math.random() < 0.25) spawnPowerUp();

        // Re-schedule if speed changed
        const newSpeed = SPEED_LEVELS.filter(l => score >= l.threshold).pop();
        if (SPEED_LEVELS.indexOf(newSpeed) !== level) scheduleLoop();
        
        // Spawn more obstacles at higher scores
        if (score % 100 === 0) spawnObstacles();
    }

    // Check bonus food
    if (bonusActive && bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
        let points = 50;
        if (activePowerUp === 'DOUBLE') points *= 2;
        
        score += points;
        ate = true;
        bonusActive = false;
        bonusFood   = null;
        clearTimeout(bonusTimer);
        SoundSystem.playBonus();
        popScore();
        spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2,
                       head.y * CELL_SIZE + CELL_SIZE / 2,
                       COLORS.bonus, 20);
    }

    // Check power-up
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        activatePowerUp(powerUp.type);
        spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2,
                       head.y * CELL_SIZE + CELL_SIZE / 2,
                       powerUp.color, 15);
        powerUp = null;
    }

    if (!ate) snake.pop();

    updateScoreDisplay();
    draw();
}

// ─── Drawing ───────────────────────────────────────────────────────────────
function draw() {
    // Apply screen shake
    ctx.save();
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawGrid();
    updateParticles();
    drawObstacles();
    drawFood();
    if (bonusActive && bonusFood) drawBonusFood();
    if (powerUp) drawPowerUp();
    drawSnake();
    
    // Draw combo counter
    if (comboCount > 1) {
        drawCombo();
    }
    
    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((seg, i) => {
        const x = seg.x * CELL_SIZE;
        const y = seg.y * CELL_SIZE;
        const pad = i === 0 ? 1 : 2;
        const radius = i === 0 ? 8 : 6;

        // Glow for head
        if (i === 0) {
            ctx.shadowColor = activePowerUp === 'INVINCIBLE' ? COLORS.bonus : COLORS.snakeGlow;
            ctx.shadowBlur  = activePowerUp === 'INVINCIBLE' ? 25 : 15;
        } else {
            ctx.shadowBlur = 0;
        }

        // Gradient body color
        const t = i / snake.length;
        const r = Math.round(0   + t * 0);
        const g = Math.round(255 - t * 100);
        const b = Math.round(128 - t * 80);
        
        // Change color when invincible
        if (activePowerUp === 'INVINCIBLE') {
            const hue = (frameCount * 5) % 360;
            ctx.fillStyle = i === 0 ? `hsl(${hue}, 100%, 60%)` : `hsl(${hue}, 80%, 50%)`;
        } else {
            ctx.fillStyle = i === 0 ? COLORS.snakeHead : `rgb(${r},${g},${b})`;
        }

        roundRect(ctx, x + pad, y + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2, radius);
        ctx.fill();

        // Eyes on head
        if (i === 0) {
            ctx.shadowBlur = 0;
            drawEyes(seg);
        }
    });
    ctx.shadowBlur = 0;
}

function drawEyes(head) {
    const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = head.y * CELL_SIZE + CELL_SIZE / 2;
    const eyeOffset = 5;
    const eyeRadius = 2.5;

    let e1, e2;
    if (direction.x === 1)       { e1 = {x: cx+4, y: cy-eyeOffset}; e2 = {x: cx+4, y: cy+eyeOffset}; }
    else if (direction.x === -1) { e1 = {x: cx-4, y: cy-eyeOffset}; e2 = {x: cx-4, y: cy+eyeOffset}; }
    else if (direction.y === -1) { e1 = {x: cx-eyeOffset, y: cy-4}; e2 = {x: cx+eyeOffset, y: cy-4}; }
    else                          { e1 = {x: cx-eyeOffset, y: cy+4}; e2 = {x: cx+eyeOffset, y: cy+4}; }

    ctx.fillStyle = '#0a0a1a';
    [e1, e2].forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFood() {
    const pulse = 0.8 + 0.2 * Math.sin(frameCount * 0.15);
    const cx = food.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = food.y * CELL_SIZE + CELL_SIZE / 2;
    const r  = (CELL_SIZE / 2 - 3) * pulse;

    ctx.shadowColor = COLORS.foodGlow;
    ctx.shadowBlur  = 20;
    ctx.fillStyle   = COLORS.food;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawBonusFood() {
    const pulse = 0.85 + 0.15 * Math.sin(frameCount * 0.2);
    const cx = bonusFood.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = bonusFood.y * CELL_SIZE + CELL_SIZE / 2;
    const r  = (CELL_SIZE / 2 - 2) * pulse;

    // Outer ring
    ctx.shadowColor = COLORS.bonusGlow;
    ctx.shadowBlur  = 25;
    ctx.strokeStyle = COLORS.bonus;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = COLORS.bonus;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Star symbol
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = 'rgba(0,0,0,0.5)';
    ctx.font        = `bold ${Math.floor(r * 1.2)}px Arial`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy + 1);
}

function drawObstacles() {
    obstacles.forEach(obs => {
        const x = obs.x * CELL_SIZE;
        const y = obs.y * CELL_SIZE;
        const pad = 2;
        
        ctx.shadowColor = COLORS.obstacleGlow;
        ctx.shadowBlur  = 10;
        ctx.fillStyle   = COLORS.obstacle;
        
        // Draw X shape
        ctx.beginPath();
        ctx.moveTo(x + pad, y + pad);
        ctx.lineTo(x + CELL_SIZE - pad, y + CELL_SIZE - pad);
        ctx.moveTo(x + CELL_SIZE - pad, y + pad);
        ctx.lineTo(x + pad, y + CELL_SIZE - pad);
        ctx.strokeStyle = COLORS.obstacle;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    });
}

function drawPowerUp() {
    const pulse = 0.9 + 0.1 * Math.sin(frameCount * 0.15);
    const cx = powerUp.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = powerUp.y * CELL_SIZE + CELL_SIZE / 2;
    const r  = (CELL_SIZE / 2 - 2) * pulse;

    // Glow
    ctx.shadowColor = powerUp.color;
    ctx.shadowBlur  = 20;
    ctx.fillStyle   = powerUp.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Symbol
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = 'rgba(0,0,0,0.6)';
    ctx.font        = `bold ${Math.floor(r * 1.1)}px Arial`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerUp.symbol, cx, cy + 1);
}

function drawCombo() {
    const text = `${comboCount}x COMBO!`;
    ctx.font        = 'bold 20px Arial';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'top';
    
    // Glow effect
    ctx.shadowColor = COLORS.bonus;
    ctx.shadowBlur  = 15;
    ctx.fillStyle   = COLORS.bonus;
    ctx.fillText(text, CANVAS_SIZE / 2, 10);
    
    ctx.shadowBlur = 0;
}

// ─── Particles ─────────────────────────────────────────────────────────────
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.04 + Math.random() * 0.03,
            size: 2 + Math.random() * 3,
            color,
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x    += p.vx;
        p.y    += p.vy;
        p.vx   *= 0.92;
        p.vy   *= 0.92;
        p.life -= p.decay;

        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function updateScoreDisplay() {
    scoreEl.textContent     = score;
    highScoreEl.textContent = Math.max(score, highScore);
}

function popScore() {
    scoreEl.classList.remove('pop');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('pop');
    setTimeout(() => scoreEl.classList.remove('pop'), 150);
}

function hideOverlays() {
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
}

// ─── Game Over ─────────────────────────────────────────────────────────────
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearTimeout(bonusTimer);
    clearTimeout(powerUpTimer);
    clearTimeout(comboTimer);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    // Update game statistics
    GameStats.update(score);

    finalScoreEl.textContent = score;
    finalBestEl.textContent  = highScore;
    
    // Update statistics display
    if (gameStatsEl) {
        gameStatsEl.innerHTML = GameStats.getDisplayHTML();
    }
    
    // Hide power-up indicator
    powerupIndicator.classList.add('hidden');

    // Flash effect
    screenShake = 15;
    SoundSystem.playGameOver();
    spawnParticles(CANVAS_SIZE / 2, CANVAS_SIZE / 2, COLORS.food, 30);
    draw();

    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 400);
}

// ─── Input Handling ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    // Prevent page scroll
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
    }

    // Pause
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        return;
    }

    const dir = DIRECTIONS[e.key];
    if (!dir) return;

    // Prevent reversing - with timing check
    const now = Date.now();
    if (now - lastDirectionUpdate < 50) return; // Prevent rapid changes
    
    if (dir.x === -direction.x && dir.y === -direction.y) return;
    nextDirection = dir;
    lastDirectionUpdate = now;
});

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    SoundSystem.playPause();
    
    if (gamePaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
        draw();
    }
}

// Touch / swipe support
let touchStartX = 0, touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        setDir(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else {
        setDir(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
}, { passive: true });

function setDir(key) {
    const dir = DIRECTIONS[key];
    if (!dir) return;
    
    const now = Date.now();
    if (now - lastDirectionUpdate < 50) return;
    
    if (dir.x === -direction.x && dir.y === -direction.y) return;
    nextDirection = dir;
    lastDirectionUpdate = now;
}

// On-screen touch buttons
document.querySelectorAll('.touch-btn').forEach(btn => {
    btn.addEventListener('touchstart', e => {
        e.preventDefault();
        setDir(btn.dataset.dir);
    }, { passive: false });
    btn.addEventListener('click', () => setDir(btn.dataset.dir));
});

// Sound toggle
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        const enabled = SoundSystem.toggle();
        soundToggle.textContent = enabled ? '🔊' : '🔇';
    });
}

// ─── Boot ─────────────────────────────────────────────────────────────────
highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
highScoreEl.textContent = highScore;

// Draw static frame on load
initGame();
draw();