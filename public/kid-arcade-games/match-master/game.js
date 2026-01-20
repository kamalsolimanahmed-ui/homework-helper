/**
 * Match Master
 * Memory card game.
 */

const defaultConfig = {
    subject: "math",
    operation: "addition",
    level: 1,
    digits: 1
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

const board = document.getElementById('game-board');
const movesEl = document.getElementById('moves');
const winScreen = document.getElementById('win-screen');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let totalPairs = 0;
let isLocked = false;

// Difficulty Helpers
function getRange(digits) {
    if (digits === 1) return { min: 1, max: 9 };
    if (digits === 2) return { min: 10, max: 99 };
    if (digits === 3) return { min: 100, max: 999 };
    return { min: 1, max: 9 };
}

// Logic Generation
function getGridSize() {
    // Lvl 1: 2x2 (4 cards) - Minimal
    // Lvl 2: 4x3 (12 cards)
    // Lvl 3: 4x4 (16 cards)
    // Lvl 4: 5x4 (20 cards)
    // Lvl 5: 6x5 (30 cards)

    if (config.level === 1) return { rows: 2, cols: 2 };
    if (config.level === 2) return { rows: 3, cols: 4 };
    if (config.level === 3) return { rows: 4, cols: 4 };
    if (config.level === 4) return { rows: 4, cols: 5 };
    return { rows: 5, cols: 6 };
}

function generateContent(pairCount) {
    const content = [];
    const digits = config.digits || 1;
    const { min, max } = getRange(digits);
    const topic = config.operation || config.topic || 'addition';

    for (let i = 0; i < pairCount; i++) {
        let itemA, itemB;

        if (config.subject === 'math') {
            let a, b, ans, op;

            if (topic === 'division') {
                // Division
                let valid = false;
                // Try a few times to get valid range
                for (let k = 0; k < 20; k++) {
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
                if (!valid) { a = min * 2; b = min; ans = 2; if (a > max) { a = max; b = 1; ans = max; } }
                op = '÷';
            }
            else if (topic === 'multiplication') {
                a = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * (max - min + 1)) + min;
                ans = a * b;
                op = 'x';
            }
            else if (topic === 'subtraction') {
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

            itemA = `${a} ${op} ${b}`;
            itemB = `${ans}`;
        } else {
            // Language - simple doubles or Word pair
            // For standalone demo, use Emojis
            const fruits = ['🍎', '🌌', '🇬', '🍓', '🍒', '🍍', '🥝', '🥥', '🌽', '🥕', '🥦', '🍄', '🥜', '🥥', '🍋'];
            const words = ['Apple', 'Banana', 'Grape', 'Berry', 'Cherry', 'Pine', 'Kiwi', 'Avo', 'Corn', 'Carrot', 'Broc', 'Mush', 'Nut', 'Coco', 'Lemon'];

            let idx = i % fruits.length;
            if (Math.random() > 0.5) {
                // Icon <-> Word
                itemA = fruits[idx];
                itemB = words[idx];
            } else {
                // Icon <-> Icon (simple)
                itemA = fruits[idx];
                itemB = fruits[idx];
            }
        }
        content.push({ id: i, val: itemA });
        content.push({ id: i, val: itemB });
    }

    return content;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    board.innerHTML = '';
    winScreen.classList.add('hidden');
    moves = 0;
    movesEl.textContent = moves;
    matchedPairs = 0;
    flippedCards = [];
    isLocked = false;

    const size = getGridSize();
    totalPairs = (size.rows * size.cols) / 2;

    // Set grid CSS
    board.style.gridTemplateColumns = `repeat(${size.cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size.rows}, 1fr)`;

    const deck = shuffle(generateContent(totalPairs));

    deck.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = item.id;

        card.innerHTML = `
      <div class="card-face card-front"></div>
      <div class="card-face card-back">${item.val}</div>
    `;

        card.addEventListener('click', () => flipCard(card));
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (isLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesEl.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    const [c1, c2] = flippedCards;
    const match = c1.dataset.id === c2.dataset.id;

    if (match) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards.forEach(card => card.classList.add('matched'));
    flippedCards = [];
    matchedPairs++;

    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            // WIN
            winScreen.classList.remove('hidden');
        }, 500);
    }
}

function unflipCards() {
    isLocked = true;
    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        flippedCards = [];
        isLocked = false;
    }, 1000);
}

// Start
// Game Start Logic
function initGame() {
    console.log("[Match Master] started", config);
    startGame();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}