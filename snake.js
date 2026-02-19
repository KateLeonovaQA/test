// ─── Constants ───────────────────────────────────────────────────────────────
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
    grid:        'rgba(255, 255, 255, 0.03)',
    bg:          '#0d1117',
};

// ─── Game State ───────────────────────────────────────────────────────────────
let snake, direction, nextDirection, food, bonusFood;
let score, highScore, level, levelLabel;
let gameLoop, gameRunning, gamePaused;
let bonusTimer, bonusActive;
let particles = [];
let frameCount = 0;

// ─── DOM Elements ─────────────────────────────────────────────────────────────
const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const scoreEl       = document.getElementById('score');
const highScoreEl   = document.getElementById('highScore');
const levelEl       = document.getElementById('levelLabel');
const startOverlay  = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreEl  = document.getElementById('finalScore');
const finalBestEl   = document.getElementById('finalBest');

canvas.width  = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// ─── Initialization ───────────────────────────────────────────────────────────
function initGame() {
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

    highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');

    updateScoreDisplay();
    spawnFood();
}

// ─── Food Spawning ────────────────────────────────────────────────────────────
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
        (food && food.x === cell.x && food.y === cell.y)
    );
    return cell;
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function startGame() {
    initGame();
    hideOverlays();
    gameRunning = true;
    gamePaused  = false;
    scheduleLoop();
}

function scheduleLoop() {
    clearInterval(gameLoop);
    const speed = SPEED_LEVELS.filter(l => score >= l.threshold).pop();
    level      = SPEED_LEVELS.indexOf(speed);
    levelLabel = speed.label;
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

    // Collision with self
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Check food
    let ate = false;
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        ate = true;
        spawnFood();
        popScore();
        spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2,
                       head.y * CELL_SIZE + CELL_SIZE / 2,
                       COLORS.food, 12);

        // Spawn bonus every 5 foods
        if (score % 50 === 0) spawnBonusFood();

        // Re-schedule if speed changed
        const newSpeed = SPEED_LEVELS.filter(l => score >= l.threshold).pop();
        if (SPEED_LEVELS.indexOf(newSpeed) !== level) scheduleLoop();
    }

    // Check bonus food
    if (bonusActive && bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
        score += 50;
        ate = true;
        bonusActive = false;
        bonusFood   = null;
        clearTimeout(bonusTimer);
        popScore();
        spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2,
                       head.y * CELL_SIZE + CELL_SIZE / 2,
                       COLORS.bonus, 20);
    }

    if (!ate) snake.pop();

    updateScoreDisplay();
    draw();
}

// ─── Drawing ──────────────────────────────────────────────────────────────────
function draw() {
    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawGrid();
    updateParticles();
    drawFood();
    if (bonusActive && bonusFood) drawBonusFood();
    drawSnake();
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
            ctx.shadowColor = COLORS.snakeGlow;
            ctx.shadowBlur  = 15;
        } else {
            ctx.shadowBlur = 0;
        }

        // Gradient body color
        const t = i / snake.length;
        const r = Math.round(0   + t * 0);
        const g = Math.round(255 - t * 100);
        const b = Math.round(128 - t * 80);
        ctx.fillStyle = i === 0 ? COLORS.snakeHead : `rgb(${r},${g},${b})`;

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

// ─── Particles ────────────────────────────────────────────────────────────────
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

// ─── Utilities ────────────────────────────────────────────────────────────────
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
}

// ─── Game Over ────────────────────────────────────────────────────────────────
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearTimeout(bonusTimer);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    finalScoreEl.textContent = score;
    finalBestEl.textContent  = highScore;

    // Flash effect
    spawnParticles(CANVAS_SIZE / 2, CANVAS_SIZE / 2, COLORS.food, 30);
    draw();

    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 400);
}

// ─── Input Handling ───────────────────────────────────────────────────────────
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

    // Prevent reversing
    if (dir.x === -direction.x && dir.y === -direction.y) return;
    nextDirection = dir;
});

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    if (!gamePaused) draw();
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
    if (dir.x === -direction.x && dir.y === -direction.y) return;
    nextDirection = dir;
}

// On-screen touch buttons
document.querySelectorAll('.touch-btn').forEach(btn => {
    btn.addEventListener('touchstart', e => {
        e.preventDefault();
        setDir(btn.dataset.dir);
    }, { passive: false });
    btn.addEventListener('click', () => setDir(btn.dataset.dir));
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
highScoreEl.textContent = highScore;

// Draw static frame on load
initGame();
draw();