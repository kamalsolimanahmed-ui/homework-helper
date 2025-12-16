/**
 * Math Blaster
 * A simple arcade shooter where targets are numbers.
 */

// Default Config (fallback)
const defaultConfig = {
    subject: "math",
    operation: "addition",
    level: 1
};

function getConfigFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    subject: params.get('subject') || 'math',
    operation: params.get('operation') || 'addition',
    digits: parseInt(params.get('digits')) || 1,
    level: parseInt(params.get('level')) || 1,
    language: params.get('language') || 'en'
  };
}

let config = {
  ...defaultConfig,
  ...getConfigFromURL(),
  ...(window.GAME_CONFIG || {})
};

// FORCE digits from URL (override everything - bulletproof)
const urlParams = new URLSearchParams(window.location.search);
const urlDigits = parseInt(urlParams.get('digits'));
if (!isNaN(urlDigits)) {
  config.digits = urlDigits;
  console.log("✅ Forced digits from URL:", config.digits);
}

// setup canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// State
let score = 0;
let currentQuestion = null;
let targets = []; // Falling bubbles
let bullets = [];
let particles = [];
let lastTime = 0;
let spawnTimer = 0;
let gameActive = true;
let combo = 0;

// Config-derived difficulty
const getSpeed = () => 100 + (config.level * 20); // pixels per second (approx)
const getSpawnRate = () => Math.max(800, 2000 - (config.level * 300));

// Resize handling
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// --- Input Handling ---
const player = {
    x: width / 2,
    y: height - 80,
    w: 40,
    h: 40,
    targetX: width / 2
};

function onInput(x, y) {
    player.targetX = x;
    // If tap/click, also shoot
    if (gameActive) shoot();
    // Hide tutorial on first input
    const tut = document.getElementById('tutorial');
    if (tut) tut.style.display = 'none';
}

window.addEventListener('mousemove', e => player.targetX = e.clientX);
window.addEventListener('mousedown', () => { if (gameActive) shoot(); });
window.addEventListener('touchmove', e => {
    e.preventDefault();
    player.targetX = e.touches[0].clientX;
}, { passive: false });
window.addEventListener('touchstart', e => {
    e.preventDefault();
    player.targetX = e.touches[0].clientX;
    if (gameActive) shoot();
}, { passive: false });


// --- Logic ---

// Difficulty Helpers
function getRange(digits) {
    if (digits === 1) return { min: 1, max: 9 };
    if (digits === 2) return { min: 10, max: 99 };
    if (digits === 3) return { min: 100, max: 999 };
    return { min: 1, max: 9 };
}

function generateQuestion() {
    const digits = config.digits || 1; // 1, 2, 3
    const topic = config.operation || config.topic || 'addition'; // Support both for safety
    const { min, max } = getRange(digits);

    let a, b, op, ans;

    if (topic === 'division') {
        // Division: a / b = ans
        // Generate valid a, b such that a is in range, b is in range (or reasonable), and result is integer.
        // Arcade style: picking 'b' and 'ans' to form 'a' is safer.
        // 'a' (Dividend) must normally be in range.

        let valid = false;
        for (let i = 0; i < 50; i++) {
            b = Math.floor(Math.random() * (max - min + 1)) + min;
            // Limit b to be reasonable if digits is high? 
            // Strict Mode: b must be in [min, max].

            // Find 'a' such that a = b * ans
            // and a <= max.
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

        // Fallback if strict constraints fail
        if (!valid) {
            // Force a valid simple problem within range if possible, or fallback to min
            a = min * 2; b = min; ans = 2; // Trivial
            if (a > max) { a = max; b = 1; ans = max; }
        }

        op = '/';
    }
    else if (topic === 'multiplication') {
        // a * b = ans
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        ans = a * b;
        op = 'x';
    }
    else if (topic === 'subtraction') {
        // a - b = ans
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        if (b > a) [a, b] = [b, a];
        ans = a - b;
        op = '-';
    }
    else {
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

    const el = document.getElementById('question-display');
    el.textContent = `${a} ${displayOp} ${b} = ?`;
    el.style.transform = "translateX(-50%) scale(1.2)";
    setTimeout(() => el.style.transform = "translateX(-50%) scale(1)", 100);
}

function spawnTarget() {
    if (!currentQuestion) return;

    const isCorrect = Math.random() > 0.6 || targets.length > 2 && !targets.some(t => t.val === currentQuestion.answer);
    // Force correct answer if we haven't seen one in a while

    let val;
    if (isCorrect) {
        val = currentQuestion.answer;
    } else {
        // Decoy: close to answer
        val = currentQuestion.answer + Math.floor(Math.random() * 10) - 5;
        if (val === currentQuestion.answer) val++;
    }

    targets.push({
        x: Math.random() * (width - 60) + 30,
        y: -50,
        r: 25 + (Math.random() * 10),
        val: val,
        color: isCorrect ? '#ff6b6b' : '#4ecdc4', // Actually don't color code correct, that defeats the purpose!
        // Randomize colors for fun
        displayColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        speed: (getSpeed() / 60) * (Math.random() * 0.5 + 0.8)
    });
}

function shoot() {
    bullets.push({
        x: player.x,
        y: player.y - 20,
        vy: -15
    });
    // Simple "pew" sound effect would go here
}

function createExplosion(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: `hsl(${Math.random() * 60 + 40}, 100%, 50%)`
        });
    }
}

function update(dt) {
    // Move Player
    player.x += (player.targetX - player.x) * 0.2;

    // Spawn
    spawnTimer += dt;
    if (spawnTimer > getSpawnRate()) {
        spawnTarget();
        spawnTimer = 0;
    }

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.y += b.vy;
        if (b.y < -20) bullets.splice(i, 1);
    }

    // Targets
    for (let i = targets.length - 1; i >= 0; i--) {
        let t = targets[i];
        t.y += t.speed;

        // Collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            let b = bullets[j];
            let dx = b.x - t.x;
            let dy = b.y - t.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < t.r + 10) { // Hit
                bullets.splice(j, 1);

                if (t.val === currentQuestion.answer) {
                    // Correct!
                    createExplosion(t.x, t.y, 20);
                    score += 10 + combo;
                    combo++;
                    document.getElementById('score').textContent = score;
                    targets.splice(i, 1); // Remove target

                    // Clear screens of other targets for "Clean" feel? Or just keep going?
                    // Let's clear matchings to avoid confusion? No, chaos is fun.
                    // BUT we need a NEW question now.
                    generateQuestion();

                } else {
                    // Wrong
                    // Gentle bounce / shake
                    t.y -= 20; // Bump up
                    t.speed *= 0.5; // Slow down
                    combo = 0;
                    createExplosion(t.x, t.y, 5); // Small poof
                }
                break; // Bullet used
            }
        }

        if (t.y > height + 50) {
            targets.splice(i, 1);
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Background stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 20; i++) {
        // pseudo stars
        ctx.fillRect((Date.now() / 50 * (i + 1) + i * 100) % width, (i * 50) % height, 2, 2);
    }

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = '#4cc9f0';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(15, 15);
    ctx.lineTo(0, 5); // Engine notch
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Targets
    targets.forEach(t => {
        ctx.fillStyle = t.displayColor;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(t.x - t.r * 0.3, t.y - t.r * 0.3, t.r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.val, t.x, t.y);
    });

    // Bullets
    ctx.fillStyle = '#f72585';
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function loop(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

// Game Start Logic
function initGame() {
    console.log("[Math Blaster] started", config);
    resize();
    generateQuestion();
    lastTime = performance.now();
    requestAnimationFrame(loop);
}

// Ensure DOM is ready before starting
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}