// === GLOBAL STATE ===
let gameData = null;       // The full JSON object
let currentProblem = 1;
let problemsSolved = 0;
let timeLeft = 300;         // 5 minutes
let fuelLeft = 3;
let timerId = null;
let isGameActive = false;
let hasStarted = false;
let selectedBlock = null;

// DOM elements
let timerElement, problemsSolvedElement, fuelCanisters, rocket;
let checkButton, resetButton, feedback;
let gameOverModal, victoryModal, finalScoreElement;
let victoryTimeElement, victoryFuelElement;
let restartButton, victoryRestartButton, rocketSvg, flames;

// === INITIAL SETUP ===
document.addEventListener('DOMContentLoaded', async function() {
    findDomElements();
    const specUrl = getSpecificationUrl();
    gameData = await loadSpecification(specUrl);
    if (!gameData) {
        alert('Failed to load problems.');
        return;
    }
    setupPage(gameData);
    setupGame(gameData);
});

// === FETCH JSON ===
function getSpecificationUrl() {
    const params = new URLSearchParams(window.location.search);
    let spec = params.get('specification');
    return spec || 'specifications/example42.json';
}

async function loadSpecification(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (err) {
        console.error('Error loading spec:', err);
        return null;
    }
}

// === SETUP DOM ===
function setupPage(data) {
    document.getElementById('page-title').textContent = data.title || 'Code to the Moon 🚀';

    const problemsArea = document.getElementById('problems-area');
    problemsArea.innerHTML = '';

    data.problems.forEach((problem, index) => {
        problemsArea.insertAdjacentHTML('beforeend', generateProblemHtml(problem, index + 1));
    });
}

function generateProblemHtml(problem, number) {
    return `
    <div class="problem-container ${number > 1 ? 'hidden' : ''}" id="problem-${number}">
        <p class="instructions">${problem.instructions}</p>
        <div class="problem-area">
            <div class="source-container">
                <h2>Available Code Blocks</h2>
                <ul id="source-blocks-${number}" class="blocks-list" tabindex="0">
                    ${problem.blocks.map(text => `<li class="code-block" draggable="true" tabindex="0">${escapeHtml(text)}</li>`).join('')}
                </ul>
            </div>
            <div class="solution-container">
                <h2>Your Solution</h2>
                <ul id="solution-blocks-${number}" class="blocks-list" tabindex="0"></ul>
            </div>
            <div class="dummy-container">
                <h2>Not Needed</h2>
                <ul id="dummy-blocks-${number}" class="blocks-list dummy-list" tabindex="0"></ul>
            </div>
        </div>
    </div>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// === SETUP GAME ===
function setupGame(data) {
    currentProblem = 1;
    problemsSolved = 0;
    timeLeft = 300;
    fuelLeft = 3;
    isGameActive = true;
    hasStarted = false;
    selectedBlock = null;

    updateTimerDisplay();
    updateFuelDisplay();
    rocket.style.left = '0%';

    setupAllDragAndDrop();
    setupKeyboardNavigation();

    checkButton.addEventListener('click', checkCurrentProblem);
    resetButton.addEventListener('click', () => resetProblem(currentProblem));

    restartButton.addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        setupGame(gameData);
    });
    victoryRestartButton.addEventListener('click', () => {
        victoryModal.classList.add('hidden');
        setupGame(gameData);
    });

    document.getElementById('download-certificate-button').addEventListener('click', generateCertificate);
}

// === FIND DOM ELEMENTS ===
function findDomElements() {
    timerElement = document.getElementById('timer');
    problemsSolvedElement = document.getElementById('problems-solved');
    fuelCanisters = document.querySelectorAll('.fuel-canister');
    rocket = document.getElementById('rocket');

    checkButton = document.getElementById('check-button');
    resetButton = document.getElementById('reset-button');
    feedback = document.getElementById('feedback');

    gameOverModal = document.getElementById('game-over');
    victoryModal = document.getElementById('victory');
    finalScoreElement = document.getElementById('final-score');
    victoryTimeElement = document.getElementById('victory-time');
    victoryFuelElement = document.getElementById('victory-fuel');

    restartButton = document.getElementById('restart-button');
    victoryRestartButton = document.getElementById('victory-restart-button');

    rocketSvg = document.querySelector('.rocket-svg');
    flames = document.querySelector('.flames');
}

// === TIMER ===
function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerElement.textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (hasStarted) return;
    hasStarted = true;
    timerId = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) endGame(false, "time");
    }, 1000);
}

// === FUEL ===
function updateFuelDisplay() {
    fuelCanisters.forEach((canister, i) => {
        if (i < fuelLeft) canister.classList.remove('empty');
        else canister.classList.add('empty');
    });
}

// === DRAG/DROP SETUP ===
function setupAllDragAndDrop() {
    const blockLists = document.querySelectorAll('.blocks-list');
    blockLists.forEach(list => {
        setupContainerDragEvents(list);
    });

    const blocks = document.querySelectorAll('.code-block');
    blocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    if (!isGameActive) return;
    if (!hasStarted) startTimer();
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.innerHTML);
    setTimeout(() => (this.style.display = 'none'), 0);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    this.style.display = 'block';
}

function setupContainerDragEvents(container) {
    container.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) container.appendChild(draggable);
        else container.insertBefore(draggable, afterElement);
    });
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.code-block:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        else return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// === CHECK SOLUTION ===
function checkCurrentProblem() {
    if (!isGameActive) return;
    animateRocketLaunch();

    const userSolution = [...document.querySelectorAll(`#solution-blocks-${currentProblem} .code-block`)]
        .map(block => block.textContent.trim());

    const correctSolution = gameData.problems[currentProblem - 1].solution;

    // Validate length
    if (userSolution.length !== correctSolution.length) {
        showFeedback(`Incorrect number of blocks. Expected ${correctSolution.length}.`, false);
        return;
    }

    // Validate content
    let allCorrect = true;
    document.querySelectorAll(`#solution-blocks-${currentProblem} .code-block`).forEach((block, i) => {
        block.classList.remove('correct', 'wrong-position', 'incorrect');
        if (block.textContent.trim() === correctSolution[i]) {
            block.classList.add('correct');
        } else if (correctSolution.includes(block.textContent.trim())) {
            block.classList.add('wrong-position');
            allCorrect = false;
        } else {
            block.classList.add('incorrect');
            allCorrect = false;
        }
    });

    if (allCorrect) {
        showFeedback('Correct! Moving to the next problem...', true);
        setTimeout(nextProblem, 1500);
    } else {
        fuelLeft--;
        updateFuelDisplay();
        if (fuelLeft <= 0) {
            endGame(false, "fuel");
        } else {
            showFeedback(`Incorrect. You have ${fuelLeft} fuel left!`, false);
        }
    }
}

// === ROCKET AND GAME STATE ===
function nextProblem() {
    problemsSolved++;
    problemsSolvedElement.textContent = problemsSolved;
    rocket.style.left = `${(problemsSolved / gameData.problems.length) * 100}%`;

    if (problemsSolved >= gameData.problems.length) {
        endGame(true);
    } else {
        document.querySelector(`#problem-${currentProblem}`).classList.add('hidden');
        currentProblem++;
        document.querySelector(`#problem-${currentProblem}`).classList.remove('hidden');
    }
}

function endGame(victory, reason = "") {
    isGameActive = false;
    clearInterval(timerId);

    if (victory) {
        victoryTimeElement.textContent = timerElement.textContent;
        victoryFuelElement.textContent = fuelLeft;
        victoryModal.classList.remove('hidden');
    } else {
        finalScoreElement.textContent = problemsSolved;
        document.querySelector('.game-over-message').textContent =
            (reason === "time" ? "You've run out of time!" : "You've run out of fuel!");
        gameOverModal.classList.remove('hidden');
    }
}

function animateRocketLaunch() {
    checkButton.classList.add('launching');
    flames.classList.remove('hidden');
    setTimeout(() => {
        checkButton.classList.remove('launching');
        flames.classList.add('hidden');
    }, 1000);
}

// === RESET ===
function resetProblem(problemNumber) {
    const source = document.getElementById(`source-blocks-${problemNumber}`);
    const solution = document.getElementById(`solution-blocks-${problemNumber}`);
    const dummy = document.getElementById(`dummy-blocks-${problemNumber}`);
    [...solution.children, ...dummy.children].forEach(child => source.appendChild(child));
    feedback.style.display = 'none';
}

// === FEEDBACK ===
function showFeedback(message, success) {
    feedback.textContent = message;
    feedback.className = 'feedback ' + (success ? 'success' : 'error');
    feedback.style.display = 'block';
}

// === CERTIFICATE ===
function generateCertificate() {
    const studentName = document.getElementById('student-name').value.trim() || "Student";
    const today = new Date();
    const certificateHtml = `
    <html><head><title>Certificate</title></head><body>
    <h1>Certificate of Completion</h1>
    <h2>${studentName}</h2>
    <p>Completed Code to the Moon!</p>
    <p>Fuel left: ${fuelLeft}</p>
    <p>Time left: ${timerElement.textContent}</p>
    <p>Date: ${today.toLocaleDateString()}</p>
    </body></html>`;
    const blob = new Blob([certificateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate.html';
    a.click();
    URL.revokeObjectURL(url);
}
