/**
 * Word Pop
 * Spelling / Bubble pop game.
 */

const defaultConfig = {
    subject: "language",
    topic: "spelling",
    level: 1
};

function getConfigFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    subject: params.get('subject') || 'language',
    operation: params.get('operation') || 'spelling',
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

const bubbleContainer = document.getElementById('bubble-container');
const tray = document.getElementById('word-tray');
const targetEl = document.getElementById('target-word');
const scoreEl = document.getElementById('score');

// State
let score = 0;
let currentWord = "";
let foundLetters = [];
let bubbles = []; // references to DOM elements
let spawnInterval;
let gameActive = true;

// Level Words
// Level Words
const words = {
    en: {
        1: ["CAT", "DOG", "SUN", "HAT", "CUP", "BAT"],
        2: ["FISH", "BIRD", "FROG", "LION", "DUCK"],
        3: ["APPLE", "TRAIN", "HOUSE", "SMILE", "CLOUD"],
        4: ["BANANA", "ORANGE", "MONKEY", "PENCIL"],
        5: ["ELEPHANT", "BUTTERFLY", "RAINBOW", "ADVENTURE"]
    },
    fr: {
        1: ["CHAT", "CHIEN", "SOLEIL", "EAU", "LAIT"],
        2: ["POISSON", "OISEAU", "POMME", "LION"],
        3: ["MAISON", "TRAIN", "PLUIE", "FLEUR"],
        4: ["BANANE", "ORANGE", "SINGE", "CRAYON"],
        5: ["ELEPHANT", "PAPILLON", "AVENTURE"]
    }
};

// Select word pool
function getWords() {
    const lang = config.language || 'en';
    const level = config.level || 1;
    const langPool = words[lang] || words['en'];
    return langPool[level] || langPool[1];
}

function startGame() {
    score = 0;
    nextWord();
    spawnLoop();
}

function nextWord() {
    foundLetters = [];
    const pool = getWords();
    currentWord = pool[Math.floor(Math.random() * pool.length)];

    // Setup display
    targetEl.textContent = currentWord;
    // If we want to HIDE the word for "spelling test" mode, we could.
    // But prompt says "Pop in correct order to form word or sentence".
    // So we show the target, they find letters.

    renderTray();
}

function renderTray() {
    tray.innerHTML = '';
    // Show slots for each letter
    // Fill in found ones
    for (let i = 0; i < currentWord.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'tray-slot';
        if (i < foundLetters.length) {
            slot.textContent = foundLetters[i];
            slot.style.background = '#bde0fe';
        } else {
            slot.textContent = '_';
        }
        tray.appendChild(slot);
    }
}

function createBubble() {
    if (!gameActive) return;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // Determine content
    // Must include NEXT needed letter often
    const neededIndex = foundLetters.length;
    const neededChar = currentWord[neededIndex];

    // 40% chance of needed letter, 60% random
    let char;
    if (Math.random() < 0.4 && neededChar) {
        char = neededChar;
    } else {
        // Random letter A-Z
        char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    bubble.textContent = char;

    // Random Position & Size
    const size = 60 + Math.random() * 40;
    const left = Math.random() * (window.innerWidth - size);

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}px`;
    bubble.style.top = `${window.innerHeight}px`; // Start below

    // Color tint (random)
    const hue = Math.random() * 360;
    bubble.style.borderColor = `hsla(${hue}, 80%, 70%, 0.5)`;
    bubble.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue}, 80%, 95%, 0.9), hsla(${hue}, 80%, 70%, 0.4) 20%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0))`;

    // Animation duration based on level (speed)
    const dur = 5 + Math.random() * 5 - (config.level * 0.5); // Faster at high levels
    bubble.style.transition = `top ${dur}s linear`;

    // Click handler
    bubble.addEventListener('pointerdown', (e) => {
        handleBubbleClick(bubble, char);
        e.stopPropagation();
    });

    bubbleContainer.appendChild(bubble);

    // Start animation loop
    requestAnimationFrame(() => {
        bubble.style.top = `-${size + 50}px`;
    });

    // Cleanup
    setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
    }, dur * 1000);
}

function handleBubbleClick(bubble, char) {
    if (bubble.classList.contains('popped')) return;

    const neededIndex = foundLetters.length;
    const neededChar = currentWord[neededIndex];

    if (char === neededChar) {
        // Correct!
        bubble.classList.add('popped');
        foundLetters.push(char);
        renderTray();

        // Check win
        if (foundLetters.length === currentWord.length) {
            score += 50;
            updateScore();
            // Celebration?
            setTimeout(nextWord, 1000);
        } else {
            score += 10;
            updateScore();
        }
    } else {
        // Wrong
        // Shake or error sound
        bubble.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        bubble.classList.add('popped'); // Pop anyway but no points
        // gentle penalty?
        score = Math.max(0, score - 5);
        updateScore();
    }
}

function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
}

function spawnLoop() {
    // Spawn rate
    const rate = Math.max(500, 2000 - (config.level * 300));
    createBubble();
    setTimeout(spawnLoop, rate);
}

// Game Start Logic
function initGame() {
    console.log("[Word Pop] started", config);
    startGame();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}