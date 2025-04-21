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
    let selectedBlock = null;
    let selectedContainer = null;
    
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
    const rocketSvg = document.querySelector('.rocket-svg');
    const flames = document.querySelector('.flames');
    
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
        selectedBlock = null;
        selectedContainer = null;
        
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
        
        // Setup keyboard navigation
        setupKeyboardNavigation();
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
    
    // Setup keyboard navigation
    function setupKeyboardNavigation() {
        // Get all focusable blocks and containers
        const blocks = document.querySelectorAll('.code-block');
        const containers = document.querySelectorAll('.blocks-list');
        
        blocks.forEach(block => {
            // Handle block selection
            block.addEventListener('keydown', function(e) {
                if (!isGameActive) return;
                
                // Start timer on first interaction
                if (!hasStarted && (e.key === 'Enter' || e.key === ' ')) {
                    startTimer();
                }
                
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    
                    if (this.classList.contains('selected')) {
                        // Deselect
                        this.classList.remove('selected');
                        selectedBlock = null;
                    } else {
                        // Select this block
                        document.querySelectorAll('.code-block.selected').forEach(b => {
                            b.classList.remove('selected');
                        });
                        this.classList.add('selected');
                        selectedBlock = this;
                        selectedContainer = this.parentNode;
                    }
                } else if (e.key === 'Escape') {
                    // Cancel selection
                    if (selectedBlock) {
                        selectedBlock.classList.remove('selected');
                        selectedBlock = null;
                    }
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    
                    if (selectedBlock) {
                        // Move the selected block
                        moveSelectedBlock(e.key);
                    }
                }
            });
        });
        
        containers.forEach(container => {
            container.addEventListener('keydown', function(e) {
                if (!isGameActive) return;
                
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectedContainer = this;
                    
                    // If a block is selected, move it to this container
                    if (selectedBlock && selectedBlock.parentNode !== this) {
                        this.appendChild(selectedBlock);
                        selectedBlock.focus();
                    }
                }
            });
        });
    }
    
    // Move the selected block based on arrow key
    function moveSelectedBlock(key) {
        if (!selectedBlock) return;
        
        const currentContainer = selectedBlock.parentNode;
        const problemNumber = currentProblem;
        
        let targetContainer;
        
        // Determine target container based on current container and key
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            if (currentContainer.id === `source-blocks-${problemNumber}`) {
                if (key === 'ArrowRight') {
                    targetContainer = document.getElementById(`solution-blocks-${problemNumber}`);
                }
            } else if (currentContainer.id === `solution-blocks-${problemNumber}`) {
                if (key === 'ArrowLeft') {
                    targetContainer = document.getElementById(`source-blocks-${problemNumber}`);
                } else if (key === 'ArrowRight') {
                    targetContainer = document.getElementById(`dummy-blocks-${problemNumber}`);
                }
            } else if (currentContainer.id === `dummy-blocks-${problemNumber}`) {
                if (key === 'ArrowLeft') {
                    targetContainer = document.getElementById(`solution-blocks-${problemNumber}`);
                }
            }
        } else if (key === 'ArrowUp' || key === 'ArrowDown') {
            // Move within the same container
            const blocks = Array.from(currentContainer.querySelectorAll('.code-block'));
            const currentIndex = blocks.indexOf(selectedBlock);
            
            if (key === 'ArrowUp' && currentIndex > 0) {
                currentContainer.insertBefore(selectedBlock, blocks[currentIndex - 1]);
                selectedBlock.focus();
                return;
            } else if (key === 'ArrowDown' && currentIndex < blocks.length - 1) {
                if (blocks[currentIndex + 1].nextSibling) {
                    currentContainer.insertBefore(selectedBlock, blocks[currentIndex + 1].nextSibling);
                } else {
                    currentContainer.appendChild(selectedBlock);
                }
                selectedBlock.focus();
                return;
            }
        }
        
        // Move to target container if determined
        if (targetContainer) {
            targetContainer.appendChild(selectedBlock);
            selectedBlock.focus();
        }
    }
    
    // Launch animation for the rocket button
    function animateRocketLaunch() {
        checkButton.classList.add('launching');
        flames.classList.remove('hidden');
        
        setTimeout(() => {
            checkButton.classList.remove('launching');
            flames.classList.add('hidden');
        }, 1000);
    }
    
    // Check the solution with Wordle-like feedback
    checkButton.addEventListener('click', function() {
        if (!isGameActive) return;
        
        // Animate rocket launch
        animateRocketLaunch();
        
        const solutionContainer = document.getElementById(`solution-blocks-${currentProblem}`);
        const userSolution = Array.from(solutionContainer.querySelectorAll('.code-block'));
        
        const correctSolution = correctSolutions[currentProblem];
        
        // Check if all required blocks are used
        if (userSolution.length !== correctSolution.length) {
            showFeedback('Your solution needs exactly ' + correctSolution.length + ' code blocks. Check your arrangement!', false);
            return;
        }
        
        // Clear previous feedback classes
        userSolution.forEach(block => {
            block.classList.remove('correct', 'wrong-position', 'incorrect');
        });
        
        // Check each block and provide visual feedback
        let allCorrect = true;
        
        for (let i = 0; i < userSolution.length; i++) {
            const block = userSolution[i];
            const blockText = block.textContent;
            
            if (blockText === correctSolution[i]) {
                // Correct position
                block.classList.add('correct');
            } else if (correctSolution.includes(blockText)) {
                // Correct block but wrong position
                block.classList.add('wrong-position');
                allCorrect = false;
            } else {
                // Incorrect block
                block.classList.add('incorrect');
                allCorrect = false;
            }
        }
        
        if (allCorrect) {
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
                showFeedback(`Your solution needs some adjustments. Green blocks are correct, yellow blocks are in the wrong position, and red blocks don't belong. You have ${fuelLeft} fuel canisters left.`, false);
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
            block.classList.remove('correct', 'wrong-position', 'incorrect', 'selected');
        });
        
        // Reset selection
        selectedBlock = null;
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
    // Certificate download functionality
    const downloadCertificateButton = document.getElementById('download-certificate');
    downloadCertificateButton.addEventListener('click', generateCertificate);

    function generateCertificate() {
        // Ask for student name
        const studentName = prompt("Enter your name as it should appear on the certificate:", "");
        if (!studentName || studentName.trim() === "") return;
        
        // Set certificate details
        document.getElementById('certificate-name').textContent = studentName;
        
        // Set current date
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('certificate-date').textContent = dateString;
        
        // Clone the certificate template
        const certificateTemplate = document.getElementById('certificate-template');
        const certificateClone = certificateTemplate.cloneNode(true);
        certificateClone.classList.remove('hidden');
        
        // Use html2canvas to convert the certificate to an image
        html2canvas(certificateClone.querySelector('.certificate')).then(canvas => {
            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.download = `CodeToTheMoon_Certificate_${studentName.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
    // Initialize the game on page load
    initGame();
});