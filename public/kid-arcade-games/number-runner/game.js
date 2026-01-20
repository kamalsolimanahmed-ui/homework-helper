/**
 * Number Runner
 * Endless runner with 3 lanes.
 */

// Config
const defaultConfig = {
    subject: "math",
    operation: "addition",
    level: 1
};
let config = window.GAME_CONFIG || defaultConfig;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let width, height;
// State
let score = 0;
let lanes = 3;
let currentLane = 1; // 0, 1, 2
let obstacles = []; // { z: float, lane: int, val: string, isCorrect: bool, color: string }
let speed = 0;
let trackOffset = 0;
let currentQuestion = null;
let gameActive = true;
let nextSpawnZ = 2000; // spawn distance

// Config Helpers
// Difficulty Helpers
function getRange(digits) {
    if (digits === 1) return { min: 1, max: 9 };
    if (digits === 2) return { min: 10, max: 99 };
    if (digits === 3) return { min: 100, max: 999 };
    return { min: 1, max: 9 };
}

// Config Helpers
// Level now strictly speed/density, digit size controlled by config.digits
const getBaseSpeed = () => 10 + (config.level * 3);
const getSpawnDist = () => Math.max(300, 500 - (config.level * 30));

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// --- Input ---
function moveLane(dir) {
    if (!gameActive) return;
    currentLane += dir;
    if (currentLane < 0) currentLane = 0;
    if (currentLane > 2) currentLane = 2;
}

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') moveLane(-1);
    if (e.key === 'ArrowRight') moveLane(1);
});

let touchStartX = 0;
window.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
});
window.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 30) {
        if (dx > 0) moveLane(1);
        else moveLane(-1);
    }
});

// --- Logic ---
function generateQuestion() {
    const digits = config.digits || 1;
    const topic = config.operation || config.topic || 'addition';
    const { min, max } = getRange(digits);

    let a, b, ans, op;

    if (topic === 'division') {
        // Division: a / b = ans
        // STRICT: a in range, b in range (if possible), integer result.
        // Safe Generator
        let valid = false;
        for (let i = 0; i < 50; i++) {
            b = Math.floor(Math.random() * (max - min + 1)) + min;
            let maxMul = Math.floor(max / b);
            if (maxMul < 1) continue;
            let ansCandidate = Math.floor(Math.random() * maxMul) + 1;
            a = b * ansCandidate;
            if (a >= min && a <= max) {
                ans = ansCandidate;
                valid = true;
                break;
            }
        }
        if (!valid) {
            a = min * 2; b = min; ans = 2;
            if (a > max) { a = max; b = 1; ans = max; }
        }
        op = '/';
    } else if (topic === 'multiplication') {
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        ans = a * b;
        op = 'x';
    } else if (topic === 'subtraction') {
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        if (b > a) [a, b] = [b, a];
        ans = a - b;
        op = '-';
    } else {
        // Addition
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        ans = a + b;
        op = '+';
    }

    const displayOp = op === '/' ? '÷' : op;

    currentQuestion = {
        text: `${a} ${displayOp} ${b}`,
        answer: ans
    };
    document.getElementById('question-text').textContent = `${a} ${displayOp} ${b}`;
}

function spawnObstacleRow() {
    if (!currentQuestion) generateQuestion(); // Fallback

    const corrLane = Math.floor(Math.random() * 3);
    const correctVal = currentQuestion.answer;

    // Create 3 gates
    for (let l = 0; l < 3; l++) {
        let val, isCor, col;
        if (l === corrLane) {
            val = correctVal;
            isCor = true;
            col = '#4cc9f0'; // Blue for good
        } else {
            // Decoy
            val = correctVal + Math.floor(Math.random() * 10) - 5;
            if (val === correctVal) val++;
            isCor = false;
            col = '#f72585'; // Pink/Red for bad
        }

        obstacles.push({
            z: nextSpawnZ,
            lane: l,
            val: val,
            isCorrect: isCor,
            color: col,
            passed: false
        });
    }

    nextSpawnZ += getSpawnDist();
}

function resetGame() {
    score = 0;
    obstacles = [];
    speed = getBaseSpeed();
    currentLane = 1;
    nextSpawnZ = 500;
    generateQuestion();
}

// Game Start Logic
function initGame() {
    // 1. Safe Config Bootstrap
    config = window.GAME_CONFIG || defaultConfig;

    // 2. Console Debugging
    console.log("[Number Runner] started", config);

    // 3. Start
    resize();
    resetGame();
    requestAnimationFrame(loop);
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function update() {
    if (!gameActive) return;

    speed = getBaseSpeed() + (score * 0.1); // Accelerate slightly

    // Move everything closer (decrease Z)
    // We actually keep player at Z=0, and move world Z towards 0?
    // Easier: Camera at Z=0, look at Z+. Objects move Z -> 0.

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.z -= speed;

        // Collision detection
        // Player is effectively at Z=100 (camera offset). 
        // If obstacle Z crosses player Z plane and lane matches.
        if (!o.passed && o.z < 100 && o.z > 0) {
            // Check lane
            if (o.lane === currentLane) {
                o.passed = true;
                if (o.isCorrect) {
                    score += 10;
                    document.getElementById('score').textContent = score;
                    // Trigger new question for NEXT wave? 
                    // Actually, runner logic: usually gates dictate question. 
                    // If we pass a gate, we solved it. Next row should be new question.
                    generateQuestion();
                } else {
                    // Hit wall
                    // Gentle bounce: slow down, maybe shake screen
                    speed *= 0.1;
                    score = Math.max(0, score - 5);
                    document.getElementById('score').textContent = score;
                }
            }
        }

        if (o.z < -100) {
            obstacles.splice(i, 1);
        }
    }

    // Spawn loop
    // Ensure we always have obstacles ahead
    // The last obstacle in list is furthest away
    const furthest = obstacles.length > 0 ? obstacles[obstacles.length - 1].z : 0;
    if (furthest < 3000) {
        spawnObstacleRow();
    }
}

// Projection helper
function project(x, y, z) {
    // Perspective projection
    const scale = 500 / (500 + z);
    const px = (x * scale) + (width / 2);
    const py = (y * scale) + (height / 2);
    return { x: px, y: py, scale: scale };
}

function draw() {
    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(0, 0, width, height);

    // Draw Tracks (Floor)
    // 3 Lanes
    const laneWidth = 400; // World units
    const horizonY = height / 2;

    ctx.strokeStyle = '#8d99ae';
    ctx.lineWidth = 2;

    // Draw lane dividers
    for (let i = -1.5; i <= 1.5; i++) {
        // x = i * laneWidth
        // z goes from 0 to 3000
        // project points
        let p1 = project(i * laneWidth, 200, 0); // near
        let p2 = project(i * laneWidth, 200, 3000); // far

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // Draw Objects (Back to Front painter's algo)
    // Sort obstacles by Z (descending)
    obstacles.sort((a, b) => b.z - a.z);

    obstacles.forEach(o => {
        // Gate world pos
        // Lane 0 = -1 * laneWidth, Lane 1 = 0, Lane 2 = 1 * laneWidth
        // Note: lanes are 0,1,2. Center is 1. => (lane - 1)*laneWidth
        const wx = (o.lane - 1) * laneWidth;
        const wy = 200; // floor height
        const wz = o.z;

        const p = project(wx, wy, wz);
        const s = p.scale;
        const size = laneWidth * s * 0.8; // visible size

        // Draw Gate
        ctx.fillStyle = o.color;
        ctx.globalAlpha = Math.min(1, Math.max(0, (3000 - o.z) / 500)); // Fade in at distance

        // Rect centered at projected point
        const h = 300 * s;
        const w = size;
        const x = p.x - w / 2;
        const y = p.y - h;

        ctx.fillRect(x, y, w, h);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(100 * s)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(o.val, p.x, p.y - h / 2);

        ctx.globalAlpha = 1;
    });

    // Draw Player
    // Always at a fixed screen Y really, just swiping X
    // But let's use projection for X to match lanes
    // Player z = 100 fixed? Or 0? Let's say 50.
    const pxWorld = (currentLane - 1) * laneWidth;
    // Lerp visual position
    // We need player state for smooth animation... skip for simplicity now, just snap
    const pPlayer = project(pxWorld, 200, 50); // z=50

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(pPlayer.x, pPlayer.y - (50 * pPlayer.scale), 50 * pPlayer.scale, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(pPlayer.x, pPlayer.y, 50 * pPlayer.scale, 10 * pPlayer.scale, 0, 0, Math.PI * 2);
    ctx.fill();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
