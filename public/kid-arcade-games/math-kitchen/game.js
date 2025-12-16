/**
 * Math Kitchen
 * Drag and drop cooking game.
 */

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

const goalEl = document.getElementById('recipe-goal');
const pot = document.getElementById('pot');
const potLabel = document.getElementById('pot-label');
const scoreEl = document.getElementById('score');
const shelf = document.getElementById('ingredients-shelf');

let targetValue = 10;
let currentValue = 0;
let dishes = 0;
let startValue = 0;

// Config Helpers
function getRange(digits) {
    if (digits === 1) return { min: 1, max: 9 };
    if (digits === 2) return { min: 10, max: 99 };
    if (digits === 3) return { min: 100, max: 999 };
    return { min: 1, max: 9 };
}

function newOrder() {
    const op = config.operation || config.topic || 'addition';
    const digits = config.digits || 1;
    const { min, max } = getRange(digits);

    // Generate valid puzzle based on operation
    // We need 3-4 steps (ingredients) to enable gameplay.
    const steps = Math.floor(Math.random() * 2) + 2; // 2 or 3 ingredients
    let ingredients = [];

    // Generate ingredients first
    for (let i = 0; i < steps; i++) {
        let val = Math.floor(Math.random() * (max - min + 1)) + min;
        ingredients.push(val);
    }

    if (op === 'addition') {
        // Start 0, Target = Sum
        startValue = 0;
        targetValue = ingredients.reduce((a, b) => a + b, 0);
        currentValue = 0;
        goalEl.textContent = `Make ${targetValue}`;
    }
    else if (op === 'subtraction') {
        // Start High, Target = Small (randomly generated)
        const reduction = ingredients.reduce((a, b) => a + b, 0);
        targetValue = Math.floor(Math.random() * max) + 1; // Arbitrary small target
        startValue = targetValue + reduction;
        currentValue = startValue;
        goalEl.textContent = `Reduce to ${targetValue}`;
    }
    else if (op === 'multiplication') {
        // Start 1, Target = Product
        // Limit steps/size to avoid overflow? 
        // With digits=2, 99*99 = 9801. Manageable.
        // With digits=3, 999*999 = ~1M.
        startValue = 1;
        // Limit ingredients for high digits to avoid massive numbers
        if (digits > 1) {
            // For strict digits, we must use inputs in range.
            // But 3-step mult with 3-digits is insane.
            // We'll limit steps to 2 for mult if digits > 1
            if (steps > 2) ingredients.pop();
        }
        targetValue = ingredients.reduce((a, b) => a * b, 1);
        currentValue = 1;
        goalEl.textContent = `Make ${targetValue}`;
    }
    else if (op === 'division') {
        // Start High, Target = Small
        // Start = Target * Product(Ingredients)
        targetValue = Math.floor(Math.random() * 10) + 1; // Small target
        if (digits > 1 && steps > 2) ingredients.pop(); // Limit complexity

        const product = ingredients.reduce((a, b) => a * b, 1);
        startValue = targetValue * product;
        currentValue = startValue;
        goalEl.textContent = `Divide to ${targetValue}`;
    }

    updateDisplay();
    initShelf(ingredients);
}

function initShelf(requiredIngredients) {
    const digits = config.digits || 1;
    const { min, max } = getRange(digits);
    const op = config.operation || config.topic || 'addition';

    shelf.innerHTML = '';

    // Mix required with random decoys
    // If division/mult, decoys should be factors? 
    // Random is fine for arcade fun.

    let pool = [...requiredIngredients];
    while (pool.length < 6) {
        let val = Math.floor(Math.random() * (max - min + 1)) + min;
        pool.push(val);
    }

    // Shuffle
    pool.sort(() => Math.random() - 0.5);

    pool.forEach(num => {
        const el = document.createElement('div');
        el.className = 'ingredient';
        el.textContent = num;
        el.dataset.val = num;
        addDragLogic(el);
        shelf.appendChild(el);
    });
}

function updateDisplay() {
    potLabel.textContent = currentValue;
}

// Drag & Drop (Touch support)
let dragEl = null;

function addDragLogic(el) {
    const startDrag = (e) => {
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;

        // Create clone
        dragEl = el.cloneNode(true);
        dragEl.classList.add('dragging');
        document.body.appendChild(dragEl);

        moveDrag(e);
    };

    el.addEventListener('mousedown', startDrag);
    el.addEventListener('touchstart', startDrag, { passive: false });
}

function moveDrag(e) {
    if (!dragEl) return;
    const touch = e.touches ? e.touches[0] : e;

    dragEl.style.left = (touch.clientX - 35) + 'px';
    dragEl.style.top = (touch.clientY - 35) + 'px';
}

function endDrag(e) {
    if (!dragEl) return;

    // Check collision with pot
    const potRect = pot.getBoundingClientRect();
    const touch = e.changedTouches ? e.changedTouches[0] : e;

    if (
        touch.clientX > potRect.left &&
        touch.clientX < potRect.right &&
        touch.clientY > potRect.top &&
        touch.clientY < potRect.bottom
    ) {
        // Drop in pot
        const val = parseInt(dragEl.textContent);
        addToPot(val);
    }

    dragEl.remove();
    dragEl = null;
}

window.addEventListener('mousemove', moveDrag);
window.addEventListener('touchmove', moveDrag, { passive: false });
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function addToPot(val) {
    const op = config.operation || config.topic || 'addition';

    if (op === 'addition') currentValue += val;
    else if (op === 'subtraction') currentValue -= val;
    else if (op === 'multiplication') currentValue *= val;
    else if (op === 'division') {
        // Integer division check
        if (currentValue % val === 0) {
            currentValue /= val;
        } else {
            // Shake/Reject?
            pot.classList.add('shake'); // We don't have CSS for this, but visual feedback is key
            setTimeout(() => pot.classList.remove('shake'), 200);
            // Return early? Or allow decimal/fail?
            // Prompt says: "integer-only results"
            // If user drags incompatible number, maybe nothing happens or spill?
            // Let's spill if invalid
            fail();
            return;
        }
    }

    updateDisplay();

    // Animate
    pot.classList.add('boil');
    setTimeout(() => pot.classList.remove('boil'), 300);

    // Check Win/Fail
    if (currentValue === targetValue) {
        success();
    } else {
        // Overshoot conditions
        let failed = false;
        if (op === 'addition' && currentValue > targetValue) failed = true;
        if (op === 'subtraction' && currentValue < targetValue) failed = true;
        if (op === 'multiplication' && currentValue > targetValue) failed = true;
        if (op === 'division' && currentValue < targetValue) failed = true;

        if (failed) fail();
    }
}

function success() {
    potLabel.textContent = "Yum!";
    pot.style.backgroundColor = '#57cc99';
    dishes++;
    scoreEl.textContent = `Dishes: ${dishes}`;
    setTimeout(() => {
        pot.style.backgroundColor = '#e76f51';
        newOrder();
    }, 1000);
}

function fail() {
    potLabel.textContent = "Spill!";
    pot.style.backgroundColor = '#333';
    // Shake
    setTimeout(() => {
        // Reset to start value of CURRENT puzzle
        currentValue = startValue;
        pot.style.backgroundColor = '#e76f51';
        updateDisplay();
    }, 1000);
}

// Game Start Logic
function initGame() {
    console.log("[Math Kitchen] started", config);
    newOrder();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}