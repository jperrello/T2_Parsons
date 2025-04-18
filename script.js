document.addEventListener('DOMContentLoaded', function() {
    let currentProblem = 1;
    let problemsSolved = 0;
    let timeLeft = 300;
    let fuelLeft = 3;
    let timerId;
    let gameStartTime;
    let isGameActive = false;
    let hasStarted = false;
    let selectorIndex = 0; 

    const checkButton = document.getElementById('check-button');
    const resetButton = document.getElementById('reset-button');
    const feedback = document.getElementById('feedback');
    const timerElement = document.getElementById('timer');
    const problemsSolvedElement = document.getElementById('problems-solved');
    const fuelCanisters = document.querySelectorAll('.fuel-canister');
    const rocket = document.getElementById('rocket');
    const gameOverModal = document.getElementById('game-over');
    const victoryModal = document.getElementById('victory');
    const finalScoreElement = document.getElementById('final-score');
    const victoryTimeElement = document.getElementById('victory-time');
    const victoryFuelElement = document.getElementById('victory-fuel');
    const restartButton = document.getElementById('restart-button');
    const victoryRestartButton = document.getElementById('victory-restart-button');

    const correctSolutions = {
        1: [
            "using System;",
            "class Program {",
            "static void Main(string[] args) {",
            "Console.WriteLine(\"Hello, Space!\");",
            "}",
            "}"
        ],
        2: [
            "using System;",
            "class Program {",
            "static void Main(string[] args) {",
            "const double milesToKm = 1.60934;",
            "double moonDistanceMiles = 238855;",
            "double moonDistanceKm = moonDistanceMiles * milesToKm;",
            "Console.WriteLine($\"Distance to the moon: {moonDistanceKm} km\");",
            "}",
            "}"
        ],
        3: [
            "using System;",
            "class Program {",
            "static void Main(string[] args) {",
            "double moonDistanceKm = 384400;",
            "double speedKmh = 1000;",
            "double hoursToMoon = moonDistanceKm / speedKmh;",
            "double daysToMoon = hoursToMoon / 24;",
            "Console.WriteLine($\"Days to reach the moon: {daysToMoon:F2}\");",
            "}",
            "}"
        ]
    };

    function initGame() {
        currentProblem = 1;
        problemsSolved = 0;
        timeLeft = 300;
        fuelLeft = 3;
        isGameActive = true;
        hasStarted = false;

        updateTimerDisplay();
        problemsSolvedElement.textContent = problemsSolved;
        updateFuelDisplay();

        rocket.style.left = '0';

        document.querySelectorAll('.problem-container').forEach(container => {
            container.classList.add('hidden');
        });
        document.getElementById(`problem-${currentProblem}`).classList.remove('hidden');

        resetAllProblems();
        clearInterval(timerId);

        setupAllDragAndDrop();
        setupKeyboardNavigation();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateFuelDisplay() {
        fuelCanisters.forEach((canister, index) => {
            if (index < fuelLeft) {
                canister.classList.remove('empty');
            } else {
                canister.classList.add('empty');
            }
        });
    }

    function startTimer() {
        if (hasStarted) return;

        hasStarted = true;
        gameStartTime = Date.now();

        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                endGame(false, "time");
            }
        }, 1000);
    }

    function endGame(victory, reason = "") {
        isGameActive = false;
        clearInterval(timerId);

        if (victory) {
            const minutesLeft = Math.floor(timeLeft / 60);
            const secondsLeft = timeLeft % 60;
            victoryTimeElement.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
            victoryFuelElement.textContent = fuelLeft;
            victoryModal.classList.remove('hidden');
        } else {
            finalScoreElement.textContent = problemsSolved;
            
            const gameOverMessage = document.querySelector('.game-over-message');
            if (reason === "time") {
                gameOverMessage.textContent = "You've run out of time!";
            } else {
                gameOverMessage.textContent = "You've run out of fuel!";
            }
            
            gameOverModal.classList.remove('hidden');
        }
    }

    function nextProblem() {
        problemsSolved++;
        problemsSolvedElement.textContent = problemsSolved;

        const progress = (problemsSolved / 3) * 100;
        rocket.style.left = `${progress}%`;

        if (fuelLeft < 3) {
            fuelLeft++;
            updateFuelDisplay();
        }

        if (problemsSolved >= 3) {
            endGame(true);
            return;
        }

        currentProblem++;
        document.querySelectorAll('.problem-container').forEach(container => {
            container.classList.add('hidden');
        });
        document.getElementById(`problem-${currentProblem}`).classList.remove('hidden');
        
        feedback.style.display = 'none';
    }

    function setupAllDragAndDrop() {
        for (let i = 1; i <= 3; i++) {
            setupDragAndDrop(
                document.getElementById(`source-blocks-${i}`),
                document.getElementById(`solution-blocks-${i}`),
                document.getElementById(`dummy-blocks-${i}`)
            );
        }
    }

    function setupDragAndDrop(sourceContainer, solutionContainer, dummyContainer) {
        const codeBlocks = sourceContainer.querySelectorAll('.code-block');
        
        codeBlocks.forEach(block => {
            block.addEventListener('dragstart', function(e) {
                if (!isGameActive) return;

                if (!hasStarted) {
                    startTimer();
                }

                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.innerHTML);
                setTimeout(() => {
                    this.style.display = 'none';
                }, 0);
            });
            
            block.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                this.style.display = 'block';
                this.classList.remove('correct', 'wrong-position', 'incorrect');
            });
        });

        setupContainerDragEvents(sourceContainer);
        setupContainerDragEvents(solutionContainer);
        setupContainerDragEvents(dummyContainer);
    }

    function setupContainerDragEvents(container) {
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(this, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (draggable) {
                if (afterElement === null) {
                    this.appendChild(draggable);
                } else {
                    this.insertBefore(draggable, afterElement);
                }
            }
        });

        container.addEventListener('drop', function(e) {
            e.preventDefault();
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.code-block:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function showFeedback(message, isSuccess) {
        feedback.textContent = message;
        feedback.className = 'feedback ' + (isSuccess ? 'success' : 'error');
        feedback.style.display = 'block';
    }

    function checkSolution() {
        const solutionContainer = document.getElementById(`solution-blocks-${currentProblem}`);
        const userSolution = Array.from(solutionContainer.querySelectorAll('.code-block'));
        const correctSolution = correctSolutions[currentProblem];

        if (userSolution.length !== correctSolution.length) {
            showFeedback('Use exactly ' + correctSolution.length + ' code blocks. Review your choices.', false);
            return;
        }

        userSolution.forEach(block => {
            block.classList.remove('correct', 'wrong-position', 'incorrect');
        });

        let allCorrect = true;
        let hasDummyBlocks = false;

        for (let i = 0; i < userSolution.length; i++) {
            const block = userSolution[i];
            const blockText = block.textContent;
            
            if (block.getAttribute('data-dummy') === 'true') {
                hasDummyBlocks = true;
                block.classList.add('incorrect');
                allCorrect = false;
                break;
            }

            if (blockText === correctSolution[i]) {
                block.classList.add('correct');
            } else if (correctSolution.includes(blockText)) {
                block.classList.add('wrong-position');
                allCorrect = false;
            } else {
                block.classList.add('incorrect');
                allCorrect = false;
            }
        }

        if (allCorrect) {
            showFeedback('Correct! Proceeding to the next task...', true);
            setTimeout(() => {
                nextProblem();
            }, 2000);
        } else {
            fuelLeft--;
            updateFuelDisplay();
            
            if (fuelLeft <= 0) {
                showFeedback('Incorrect arrangement. You have run out of fuel!', false);
                setTimeout(() => {
                    endGame(false, "fuel");
                }, 2000);
            } else {
                if (hasDummyBlocks) {
                    showFeedback(`Error: Unnecessary code blocks. Remaining fuel: ${fuelLeft}.`, false);
                } else {
                    showFeedback(`Error: Check the block order. Remaining fuel: ${fuelLeft}.`, false);
                }
            }
        }
    }

    function resetProblem(problemNumber) {
        const sourceContainer = document.getElementById(`source-blocks-${problemNumber}`);
        const solutionContainer = document.getElementById(`solution-blocks-${problemNumber}`);
        const dummyContainer = document.getElementById(`dummy-blocks-${problemNumber}`);

        while (solutionContainer.firstChild) {
            sourceContainer.appendChild(solutionContainer.firstChild);
        }
        
        while (dummyContainer.firstChild) {
            sourceContainer.appendChild(dummyContainer.firstChild);
        }

        sourceContainer.querySelectorAll('.code-block').forEach(block => {
            block.classList.remove('correct', 'wrong-position', 'incorrect');
        });
    }

    function resetAllProblems() {
        for (let i = 1; i <= 3; i++) {
            resetProblem(i);
        }
    }

    function setupKeyboardNavigation() {
        const containers = ['source-blocks-1', 'solution-blocks-1', 'dummy-blocks-1'];
        let currentContainer = document.querySelector('#source-blocks-1');

        document.body.addEventListener('keydown', function(e) {
            if (!isGameActive) return;

            if (e.key === 'ArrowDown' || e.key === 'Tab') {
                e.preventDefault();
                selectorIndex = (selectorIndex + 1) % currentContainer.children.length;
                currentContainer.children[selectorIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectorIndex = (selectorIndex - 1 + currentContainer.children.length) % currentContainer.children.length;
                currentContainer.children[selectorIndex].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedBlock = currentContainer.children[selectorIndex];
                if (selectedBlock) {
                    const targetContainer = (currentContainer === sourceContainer) ? solutionContainer : sourceContainer;
                    targetContainer.appendChild(selectedBlock);
                    focusNextAvailableBlock(currentContainer);
                }
            } else if (e.key === 'Space') {
                e.preventDefault();
                checkSolution();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                resetProblem(currentProblem);
            }
        });
    }

    function focusNextAvailableBlock(container) {
        for (let i = 0; i < container.children.length; i++) {
            if (container.children[i].style.display !== 'none') {
                container.children[i].focus();
                return;
            }
        }
    }

    checkButton.addEventListener('click', function() {
        checkSolution();
    });

    resetButton.addEventListener('click', function() {
        resetProblem(currentProblem);
    });

    restartButton.addEventListener('click', function() {
        gameOverModal.classList.add('hidden');
        initGame();
    });

    victoryRestartButton.addEventListener('click', function() {
        victoryModal.classList.add('hidden');
        initGame();
    });

    initGame();
});