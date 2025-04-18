document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let currentProblem = 1;
    let problemsSolved = 0;
    let timeLeft = 300; // 5 minutes in seconds
    let fuelLeft = 3;
    let timerId;
    let gameStartTime;
    let isGameActive = false;
    let hasStarted = false;
    
    // DOM elements
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
    
    // Correct solutions for each problem
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
    
    // Initialize the game
    function initGame() {
        currentProblem = 1;
        problemsSolved = 0;
        timeLeft = 300;
        fuelLeft = 3;
        isGameActive = true;
        hasStarted = false;
        
        // Update UI
        updateTimerDisplay();
        problemsSolvedElement.textContent = problemsSolved;
        updateFuelDisplay();
        
        // Reset rocket position
        rocket.style.left = '0';
        
        // Show only the first problem
        document.querySelectorAll('.problem-container').forEach(container => {
            container.classList.add('hidden');
        });
        document.getElementById(`problem-${currentProblem}`).classList.remove('hidden');
        
        // Reset all solution blocks
        resetAllProblems();
        
        // Clear any existing timer
        clearInterval(timerId);
        
        // Setup drag and drop
        setupAllDragAndDrop();
    }
    
    // Update timer display in MM:SS format
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update fuel display
    function updateFuelDisplay() {
        fuelCanisters.forEach((canister, index) => {
            if (index < fuelLeft) {
                canister.classList.remove('empty');
            } else {
                canister.classList.add('empty');
            }
        });
    }
    
    // Start the timer
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
    
    // End the game
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
    
    // Move to the next problem
    function nextProblem() {
        problemsSolved++;
        problemsSolvedElement.textContent = problemsSolved;
        
        // Move the rocket
        const progress = (problemsSolved / 3) * 100;
        rocket.style.left = `${progress}%`;
        
        // Restore fuel if not at max
        if (fuelLeft < 3) {
            fuelLeft++;
            updateFuelDisplay();
        }
        
        if (problemsSolved >= 3) {
            // All problems solved
            endGame(true);
            return;
        }
        
        // Show next problem
        currentProblem++;
        document.querySelectorAll('.problem-container').forEach(container => {
            container.classList.add('hidden');
        });
        document.getElementById(`problem-${currentProblem}`).classList.remove('hidden');
        
        // Clear feedback
        feedback.style.display = 'none';
    }
    
    // Setup drag and drop for all problems
    function setupAllDragAndDrop() {
        for (let i = 1; i <= 3; i++) {
            setupDragAndDrop(
                document.getElementById(`source-blocks-${i}`),
                document.getElementById(`solution-blocks-${i}`),
                document.getElementById(`dummy-blocks-${i}`)
            );
        }
    }
    
    // Setup drag and drop for a specific problem
    function setupDragAndDrop(sourceContainer, solutionContainer, dummyContainer) {
        const codeBlocks = sourceContainer.querySelectorAll('.code-block');
        
        codeBlocks.forEach(block => {
            // Drag start
            block.addEventListener('dragstart', function(e) {
                if (!isGameActive) return;
                
                // Start timer on first block movement
                if (!hasStarted) {
                    startTimer();
                }
                
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.innerHTML);
                setTimeout(() => {
                    this.style.display = 'none';
                }, 0);
            });
            
            // Drag end
            block.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                this.style.display = 'block';
                
                // Remove any feedback classes
                this.classList.remove('correct', 'wrong-position', 'incorrect');
            });
        });
        
        // Setup container drag events
        setupContainerDragEvents(sourceContainer);
        setupContainerDragEvents(solutionContainer);
        setupContainerDragEvents(dummyContainer);
    }
    
    // Setup drag events for a container
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
    
    // Helper function to determine where to place the dragged element
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
    
    // Check the solution
    checkButton.addEventListener('click', function() {
        if (!isGameActive) return;
        
        const solutionContainer = document.getElementById(`solution-blocks-${currentProblem}`);
        const userSolution = Array.from(solutionContainer.querySelectorAll('.code-block'));
        
        const correctSolution = correctSolutions[currentProblem];
        
        // Check if all required blocks are used
        if (userSolution.length !== correctSolution.length) {
            showFeedback('Your solution needs exactly ' + correctSolution.length + ' code blocks. Check your arrangement!', false);
            return;
        }
        
        // Check if solution is correct
        let isCorrect = true;
        let hasDummyBlocks = false;
        
        for (let i = 0; i < userSolution.length; i++) {
            const block = userSolution[i];
            
            // Check if this is a dummy block
            if (block.getAttribute('data-dummy') === 'true') {
                hasDummyBlocks = true;
                isCorrect = false;
                break;
            }
            
            // Check if block is in correct position
            if (block.textContent !== correctSolution[i]) {
                isCorrect = false;
                break;
            }
        }
        
        if (isCorrect) {
            showFeedback('Great job! Your code is correct. Moving to the next task...', true);
            setTimeout(() => {
                nextProblem();
            }, 2000);
        } else {
            // Reduce fuel
            fuelLeft--;
            updateFuelDisplay();
            
            if (fuelLeft <= 0) {
                showFeedback('Your solution is incorrect. You\'ve run out of fuel!', false);
                setTimeout(() => {
                    endGame(false, "fuel");
                }, 2000);
            } else {
                if (hasDummyBlocks) {
                    showFeedback(`Your solution contains unnecessary code blocks. You have ${fuelLeft} fuel canisters left.`, false);
                } else {
                    showFeedback(`Your solution is incorrect. Check the order of your code blocks. You have ${fuelLeft} fuel canisters left.`, false);
                }
            }
        }
    });
    
    // Reset the current problem
    resetButton.addEventListener('click', function() {
        if (!isGameActive) return;
        
        resetProblem(currentProblem);
        feedback.style.display = 'none';
    });
    
    // Reset a specific problem
    function resetProblem(problemNumber) {
        const sourceContainer = document.getElementById(`source-blocks-${problemNumber}`);
        const solutionContainer = document.getElementById(`solution-blocks-${problemNumber}`);
        const dummyContainer = document.getElementById(`dummy-blocks-${problemNumber}`);
        
        // Move all blocks back to source
        while (solutionContainer.firstChild) {
            sourceContainer.appendChild(solutionContainer.firstChild);
        }
        
        while (dummyContainer.firstChild) {
            sourceContainer.appendChild(dummyContainer.firstChild);
        }
        
        // Remove any feedback classes
        sourceContainer.querySelectorAll('.code-block').forEach(block => {
            block.classList.remove('correct', 'wrong-position', 'incorrect');
        });
    }
    
    // Reset all problems
    function resetAllProblems() {
        for (let i = 1; i <= 3; i++) {
            resetProblem(i);
        }
    }
    
    // Show feedback message
    function showFeedback(message, isSuccess) {
        feedback.textContent = message;
        feedback.className = 'feedback ' + (isSuccess ? 'success' : 'error');
        feedback.style.display = 'block';
    }
    
    // Restart the game
    restartButton.addEventListener('click', function() {
        gameOverModal.classList.add('hidden');
        initGame();
    });
    
    victoryRestartButton.addEventListener('click', function() {
        victoryModal.classList.add('hidden');
        initGame();
    });
    
    // Initialize the game on page load
    initGame();
});