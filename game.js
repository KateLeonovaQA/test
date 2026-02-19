// ===== CONFIGURATION =====
const CONFIG = {
    gridSize: 20,
    cols: 25,
    rows: 25,
    initialSpeed: 130,
    speedIncrement: 2,
    minSpeed: 50,
    initialLength: 3,
};

const CANVAS_SIZE = CONFIG.cols * CONFIG.gridSize;

// ===== COLORS =====
const COLORS = {
    background: '#0d0d30',
    grid: 'rgba(255, 255, 255, 0.02)',
    snakeHead: '#00ff88',
    snakeBody: '#00cc66',
    snakeGlow: 'rgba(0, 255, 136, 0.4)',
    food: '#ff4466',
    foodGlow: 'rgba(255, 68, 102, 0.6)',
    foodInner: '#ff6688',
    goldenFood: '#ffcc00',
    goldenFoodGlow: 'rgba(255, 204, 0, 0.6)',
    goldenFoodInner: '#ffdd44',
    eyes: '#0a0a2e',
};

// ===== GAME STATE =====
let canvas, ctx;
let snake = [];
let food = { x: 0, y: 0, type: 'normal' };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let gameSpeed = CONFIG.initialSpeed;
let gameLoop = null;
let isRunning = false;
let isPaused = false;
let particles = [];
let frameId = null;
let lastTime = 0;
let accumulator = 0;

// ===== DOM ELEMENTS =====
let scoreEl, highScoreEl;
let startOverlay, gameOverOverlay, gameOverScore;

// ===== INITIALIZATION =====
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    scoreEl = document.getElementById('score');
    highScoreEl = document.getElementById('highScore');
    startOverlay = document.getElementById('startOverlay');
    gameOverOverlay = document.getElementById('gameOverOverlay');
    gameOverScore = document.getElementById('gameOverScore');

    highScoreEl.textContent = highScore;

    setupControls();
    drawBackground();
    renderLoop(0);
}

// ===== GAME CONTROL =====
function startGame() {
    snake = [];
    const startX = Math.floor(CONFIG.cols / 2);
    const startY = Math.floor(CONFIG.rows / 2);
    for (let i = 0; i < CONFIG.initialLength; i++) {
        snake.push({ x: startX - i, y: startY });
    }

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameSpeed = CONFIG.initialSpeed;
    particles = [];
    scoreEl.textContent = '0';

    spawnFood();

    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    isRunning = true;
    isPaused = false;
    accumulator = 0;
    lastTime = performance.now();
}

function gameOver() {
    isRunning = false;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }

    gameOverScore.textContent = `Score: ${score}`;
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 300);
}

function togglePause() {
    if (!isRunning) return;
    isPaused = !isPaused;
    if (!isPaused) {
        lastTime = performance.now();
        accumulator = 0;
    }
}

// ===== GAME LOGIC =====
function update() {
    direction = { ...nextDirection };

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
    };

    // Wall collision
    if (head.x < 0 || head.x >= CONFIG.cols || head.y < 0 || head.y >= CONFIG.rows) {
        gameOver();
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        const points = food.type === 'golden' ? 5 : 1;
        score += points;
        scoreEl.textContent = score;

        // Spawn particles
        spawnParticles(food.x, food.y, food.type === 'golden' ? COLORS.goldenFood : COLORS.food);

        // Speed up
        gameSpeed = Math.max(CONFIG.minSpeed, gameSpeed - CONFIG.speedIncrement);

        spawnFood();
    } else {
        snake.pop();
    }
}

function spawnFood() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 1000) {
        food.x = Math.floor(Math.random() * CONFIG.cols);
        food.y = Math.floor(Math.random() * CONFIG.rows);
        valid = true;
        for (const segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                valid = false;
                break;
            }
        }
        attempts++;
    }
    // 15% chance for golden food
    food.type = Math.random() < 0.15 ? 'golden' : 'normal';
}

// ===== PARTICLES =====
function spawnParticles(gridX, gridY, color) {
    const cx = gridX * CONFIG.gridSize + CONFIG.gridSize / 2;
    const cy = gridY * CONFIG.gridSize + CONFIG.gridSize / 2;
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2 + Math.random() * 3,
            color: color,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03,
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= p.decay;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ===== RENDERING =====
function renderLoop(timestamp) {
    frameId = requestAnimationFrame(renderLoop);

    if (isRunning && !isPaused) {
        const delta = timestamp - lastTime;
        lastTime = timestamp;
        accumulator += delta;

        while (accumulator >= gameSpeed) {
            update();
            if (!isRunning) break;
            accumulator -= gameSpeed;
        }
    }

    draw();
}

function draw() {
    drawBackground();

    if (!isRunning && !gameOverOverlay.classList.contains('hidden')) {
        drawSnake();
        return;
    }

    if (snake.length === 0) return;

    drawFood();
    drawSnake();
    updateParticles();
    drawParticles();

    if (isPaused) {
        drawPauseOverlay();
    }
}

function drawBackground() {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw subtle grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CONFIG.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CONFIG.gridSize, 0);
        ctx.lineTo(x * CONFIG.gridSize, CANVAS_SIZE);
        ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CONFIG.gridSize);
        ctx.lineTo(CANVAS_SIZE, y * CONFIG.gridSize);
        ctx.stroke();
    }
}

function drawSnake() {
    const g = CONFIG.gridSize;
    const padding = 1;

    for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];
        const x = segment.x * g + padding;
        const y = segment.y * g + padding;
        const size = g - padding * 2;

        // Gradient color from head to tail
        const t = i / Math.max(snake.length - 1, 1);
        const r = Math.round(0 + t * 0);
        const green = Math.round(255 - t * 100);
        const b = Math.round(136 - t * 80);
        const alpha = 1 - t * 0.3;
        const color = `rgba(${r}, ${green}, ${b}, ${alpha})`;

        // Glow for head
        if (i === 0) {
            ctx.save();
            ctx.shadowColor = COLORS.snakeGlow;
            ctx.shadowBlur = 15;
            ctx.fillStyle = COLORS.snakeHead;
            roundRect(ctx, x, y, size, size, 5);
            ctx.fill();
            ctx.restore();

            // Eyes
            drawEyes(segment, direction, x, y, size);
        } else {
            ctx.fillStyle = color;
            const radius = i === snake.length - 1 ? 6 : 4;
            roundRect(ctx, x, y, size, size, radius);
            ctx.fill();
        }
    }
}

function drawEyes(segment, dir, x, y, size) {
    const eyeSize = 3.5;
    const pupilSize = 2;
    const offsetMain = size * 0.28;
    const offsetSide = size * 0.2;

    let eye1, eye2;

    if (dir.x === 1) {
        eye1 = { x: x + size - offsetMain, y: y + offsetSide };
        eye2 = { x: x + size - offsetMain, y: y + size - offsetSide };
    } else if (dir.x === -1) {
        eye1 = { x: x + offsetMain, y: y + offsetSide };
        eye2 = { x: x + offsetMain, y: y + size - offsetSide };
    } else if (dir.y === -1) {
        eye1 = { x: x + offsetSide, y: y + offsetMain };
        eye2 = { x: x + size - offsetSide, y: y + offsetMain };
    } else {
        eye1 = { x: x + offsetSide, y: y + size - offsetMain };
        eye2 = { x: x + size - offsetSide, y: y + size - offsetMain };
    }

    // White of eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    const pupilOffX = dir.x * 1;
    const pupilOffY = dir.y * 1;
    ctx.fillStyle = COLORS.eyes;
    ctx.beginPath();
    ctx.arc(eye1.x + pupilOffX, eye1.y + pupilOffY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2.x + pupilOffX, eye2.y + pupilOffY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
}

function drawFood() {
    const g = CONFIG.gridSize;
    const cx = food.x * g + g / 2;
    const cy = food.y * g + g / 2;
    const isGolden = food.type === 'golden';

    const pulse = Math.sin(performance.now() / 200) * 2;
    const baseRadius = g / 2 - 3 + pulse;

    // Outer glow
    ctx.save();
    ctx.shadowColor = isGolden ? COLORS.goldenFoodGlow : COLORS.foodGlow;
    ctx.shadowBlur = 20 + pulse * 2;

    // Main circle
    const gradient = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, baseRadius);
    if (isGolden) {
        gradient.addColorStop(0, COLORS.goldenFoodInner);
        gradient.addColorStop(1, COLORS.goldenFood);
    } else {
        gradient.addColorStop(0, COLORS.foodInner);
        gradient.addColorStop(1, COLORS.food);
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - baseRadius * 0.25, cy - baseRadius * 0.25, baseRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Star indicator for golden food
    if (isGolden) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', cx, cy);
    }
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(5, 5, 25, 0.7)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 15);

    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Press Space to Resume', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
}

// ===== UTILITY =====
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

// ===== CONTROLS =====
function setupControls() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
                break;
            case ' ':
                e.preventDefault();
                togglePause();
                break;
        }
    });

    // Mobile buttons
    document.getElementById('btnUp')?.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
    });
    document.getElementById('btnDown')?.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
    });
    document.getElementById('btnLeft')?.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
    });
    document.getElementById('btnRight')?.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
    });

    // Swipe support
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) < 20) return; // Too small

        if (absDx > absDy) {
            if (dx > 0 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
            else if (dx < 0 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
        } else {
            if (dy > 0 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
            else if (dy < 0 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
        }
    }, { passive: true });

    // Buttons
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
}

// ===== RESPONSIVE CANVAS =====
function resizeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const container = document.querySelector('.game-container');
    const maxWidth = Math.min(window.innerWidth - 40, 520);
    const maxHeight = window.innerHeight - 280;
    const size = Math.min(maxWidth, maxHeight, CANVAS_SIZE);

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
}

window.addEventListener('resize', resizeCanvas);

// ===== START =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    resizeCanvas();
});