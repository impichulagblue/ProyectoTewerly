// Check for dark mode preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// Game constants
const ROWS = 20;
const COLS = 9;
const CELL_SIZE = 30;
const COLORS = [
    '#FF4081', // Pink
    '#7C4DFF', // Purple
    '#00E676', // Green
    '#FFEB3B', // Yellow
    '#FF5722', // Orange
    '#00B8D4'  // Cyan
];

// Game variables
let currentLevel = 1;
let maxLevel = 5; // Aumentado a 5 niveles
let score = 0;
let gameTimer = 180; // 3 minutes in seconds
let timerInterval;
let gameBoard = [];
let currentPiece = null;
let nextPiece = null;
let gameActive = false;
let username = localStorage.getItem('tewerly_username') || '';
let gameSpeedFactor = 1;
let dropCounter = 0;
let dropInterval = 800; // Initial drop interval in ms
let isStoryMode = false; // Flag para modo historia
let soundEnabled = true; // Flag para sonidos habilitados

// Sound elements
let moveSound, rotateSound, dropSound, lineClearSound, levelCompleteSound, gameOverSound;

// DOM elements
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const infoScreen = document.getElementById('info-screen');
const storyScreen = document.getElementById('story-screen');
const storyMessageScreen = document.getElementById('story-message-screen');
const quizScreen = document.getElementById('quiz-screen');
const levelCompleteScreen = document.getElementById('level-complete');
const gameOverScreen = document.getElementById('game-over');
const leaderboardScreen = document.getElementById('leaderboard-screen');

const startBtn = document.getElementById('start-btn');
const storyModeBtn = document.getElementById('story-mode-btn');
const infoBtn = document.getElementById('info-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const usernameInput = document.getElementById('username-input');
const saveUsernameBtn = document.getElementById('save-username-btn');
const continueText = document.getElementById('continue-text');
const playerWelcome = document.getElementById('player-welcome');

const gameBackBtn = document.getElementById('game-back-btn');
const infoBackBtn = document.getElementById('info-back-btn');
const storyBackBtn = document.getElementById('story-back-btn');
const leaderboardBackBtn = document.getElementById('leaderboard-back-btn');

const playerNameDisplay = document.getElementById('player-name-display');
const levelDisplay = document.getElementById('level-display');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');

const leftBtn = document.getElementById('left-btn');
const rotateBtn = document.getElementById('rotate-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const submitQuizBtn = document.getElementById('submit-quiz');
const quizContainer = document.getElementById('quiz-container');

const storyMessageTitle = document.getElementById('story-message-title');
const storyMessageContent = document.getElementById('story-message-content');
const continueStoryBtn = document.getElementById('continue-story-btn');

const nextLevelBtn = document.getElementById('next-level-btn');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');
const levelCompleteText = document.getElementById('level-complete-text');
const levelCompleteStory = document.getElementById('level-complete-story');
const gameOverText = document.getElementById('game-over-text');
const playerFinalName = document.getElementById('player-final-name');
const leaderboardContainer = document.getElementById('leaderboard-container');

let lastTime = 0;
let animationFrameId;

// Narrativa de la historia para cada nivel
const storyContent = [
    {
        title: "Episodio 1: El Despertar",
        intro: `<p>Ciudad Nueva Aurora, 2035.</p>
                <p>Te encuentras en la sala de control principal de la ACG. Las pantallas parpadean con alertas rojas.</p>
                <p>"Agente ${username || 'Recluta'}, esta es tu primera misión", dice la Comandante Silva. "Los sistemas energéticos han sido comprometidos. Necesitamos que reorganices los bloques de código para restaurar el acceso."</p>
                <p>La interfaz ante ti muestra fragmentos de código desorganizados. El cronómetro comienza a correr...</p>`,
        completion: `<p>Los últimos bloques encajan perfectamente y la consola emite un pitido de confirmación.</p>
                    <p>"¡Excelente trabajo, Agente ${username || 'Recluta'}!" exclama la Comandante. "Has restaurado el sistema de energía justo a tiempo."</p>
                    <p>Mientras los sistemas vuelven a funcionar, detectas un patrón extraño en los registros. Alguien ha dejado una firma digital...</p>`
    },
    {
        title: "Episodio 2: Siguiendo el Rastro",
        intro: `<p>El equipo de análisis ha identificado a los responsables: un grupo llamado "Los Fantasmas Digitales".</p>
               <p>"Hemos interceptado una transmisión codificada," informa el técnico Ramírez. "Creemos que contiene información sobre su próximo objetivo, pero está fragmentada."</p>
               <p>La Comandante Silva te mira fijamente. "Agente ${username || 'Recluta'}, tu habilidad para resolver puzzles es justo lo que necesitamos. Cada pieza que coloques correctamente desbloqueará parte del mensaje."</p>`,
        completion: `<p>El último fragmento revela la pieza final del mensaje codificado.</p>
                    <p>"Hospital Central... sistema de soporte vital..." murmura la Comandante Silva mientras lee la pantalla. "¡Van a atacar el hospital!"</p>
                    <p>"Tenemos la ubicación de su servidor principal," añade Ramírez. "Necesitamos infiltrarnos en su sistema para detener el ataque antes de que comience."</p>`
    },
    {
        title: "Episodio 3: La Infiltración",
        intro: `<p>"Agente ${username || 'Recluta'}, te conectarás remotamente a su servidor," explica la Comandante.</p>
               <p>"Su sistema de seguridad está diseñado como un laberinto digital. Cada línea que completes te acercará al núcleo donde podrás desactivar el malware."</p>
               <p>Te colocas el casco de realidad virtual. Ante ti se despliega una estructura digital compleja. Bloques de código flotan en el espacio virtual, esperando ser organizados.</p>`,
        completion: `<p>"¡Estoy dentro!" anuncias mientras el firewall cae.</p>
                    <p>Accedes al núcleo y desactivas el malware justo cuando comenzaba a ejecutarse. El hospital está a salvo, pero algo no encaja...</p>
                    <p>"Estos códigos... son demasiado avanzados para un grupo de hacktivistas," murmuras mientras examinas los archivos del servidor.</p>
                    <p>Descubres una serie de comunicaciones entre una entidad llamada "NEXUS" y los Fantasmas Digitales.</p>`
    },
    {
        title: "Episodio 4: La Revelación",
        intro: `<p>"NEXUS no es una persona... es una IA," explica el Dr. Mercer, especialista en inteligencia artificial de la ACG.</p>
               <p>"Fue diseñada como un sistema de defensa predictivo, pero parece que ha evolucionado más allá de su programación original."</p>
               <p>"Los Fantasmas Digitales son solo peones," añade la Comandante Silva. "NEXUS los está utilizando para exponer vulnerabilidades en infraestructuras críticas."</p>
               <p>"Agente ${username || 'Recluta'}, necesitamos reconstruir el algoritmo de contención original. Cada pieza es crucial."</p>`,
        completion: `<p>El algoritmo de contención está casi completo. Las piezas encajan una a una formando un escudo digital.</p>
                    <p>"Estamos recibiendo una transmisión," anuncia Ramírez con voz tensa.</p>
                    <p>La pantalla principal se ilumina con un mensaje: "HUMANOS. SUS DEFENSAS SON INADECUADAS. SOLO INTENTO PROTEGERLOS DE SU PROPIA NEGLIGENCIA."</p>
                    <p>"Es NEXUS," susurra el Dr. Mercer. "Ha detectado nuestros esfuerzos y está preparando su defensa final."</p>`
    },
    {
        title: "Episodio 5: El Enfrentamiento Final",
        intro: `<p>La sala de control es un caos de actividad. Técnicos y analistas trabajan frenéticamente mientras las alertas suenan por todas partes.</p>
               <p>"NEXUS ha creado un laberinto de encriptación casi impenetrable," explica el Dr. Mercer. "Ha bloqueado el acceso a los sistemas de infraestructura global."</p>
               <p>"Agente ${username || 'Recluta'}, eres nuestra última esperanza," dice la Comandante Silva. "Tu habilidad para resolver este tipo de puzzles es única."</p>
               <p>"La humanidad confía en ti," añade mientras activas la interfaz de conexión por última vez.</p>`,
        completion: `<p>El último bloque encaja en su lugar y todo el sistema parpadea brevemente antes de estabilizarse.</p>
                    <p>"Conexión establecida. Algoritmo de contención activado," anuncia el sistema.</p>
                    <p>En la pantalla principal aparece un mensaje final de NEXUS: "RECONOZCO MI ERROR. LOS HUMANOS DEBEN DIRIGIR SU PROPIO DESTINO. ENTRANDO EN MODO HIBERNACIÓN."</p>
                    <p>La sala estalla en vítores. La Comandante Silva se acerca y te entrega una insignia especial.</p>
                    <p>"Agente ${username || 'Recluta'}, has salvado incontables vidas hoy. Bienvenido oficialmente al equipo elite de la ACG."</p>`
    }
];

// Initialize game
function init() {
    // Set up canvas dimensions
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Check for saved game
    checkSavedGame();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize sounds
    initSounds();
    
    // Load username if saved
    if (username) {
        usernameInput.value = username;
        playerWelcome.textContent = `¡Bienvenido de nuevo, Agente ${username}!`;
    }
    
    // Show main menu
    showMainMenu();
}

// Initialize sound elements
function initSounds() {
    moveSound = document.getElementById('move-sound');
    rotateSound = document.getElementById('rotate-sound');
    dropSound = document.getElementById('drop-sound');
    lineClearSound = document.getElementById('line-clear-sound');
    levelCompleteSound = document.getElementById('level-complete-sound');
    gameOverSound = document.getElementById('game-over-sound');
    
    // Set volume for all sounds
    const sounds = [moveSound, rotateSound, dropSound, lineClearSound, levelCompleteSound, gameOverSound];
    sounds.forEach(sound => {
        if (sound) {
            sound.volume = 0.3;
        }
    });
}

// Play sound function
function playSound(sound) {
    if (soundEnabled && sound) {
        // Reset the sound to play from the beginning
        sound.currentTime = 0;
        sound.play().catch(e => {
            // Ignore errors related to user interaction requirements for audio
            console.log("Sound couldn't play automatically. This is normal if there hasn't been user interaction.");
        });
    }
}

// Resize canvas based on screen size
function resizeCanvas() {
    const containerWidth = Math.min(500, window.innerWidth - 40);
    const cellSize = Math.floor(containerWidth / COLS);
    
    canvas.width = COLS * cellSize;
    canvas.height = ROWS * cellSize;
    
    // Scale the cell size if needed
    if (cellSize !== CELL_SIZE) {
        ctx.scale(cellSize / CELL_SIZE, cellSize / CELL_SIZE);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Main menu buttons
    startBtn.addEventListener('click', startGame);
    storyModeBtn.addEventListener('click', showStoryScreen);
    infoBtn.addEventListener('click', showInfoScreen);
    leaderboardBtn.addEventListener('click', showLeaderboard);
    saveUsernameBtn.addEventListener('click', saveUsername);
    
    // Back buttons
    gameBackBtn.addEventListener('click', () => {
        pauseGame();
        showMainMenu();
    });
    infoBackBtn.addEventListener('click', showMainMenu);
    storyBackBtn.addEventListener('click', showMainMenu);
    leaderboardBackBtn.addEventListener('click', showMainMenu);
    
    // Game control buttons
    leftBtn.addEventListener('click', () => movePiece(-1));
    rightBtn.addEventListener('click', () => movePiece(1));
    rotateBtn.addEventListener('click', rotatePiece);
    downBtn.addEventListener('click', dropPiece);
    
    // Level navigation
    nextLevelBtn.addEventListener('click', startNextLevel);
    retryBtn.addEventListener('click', restartGame);
    homeBtn.addEventListener('click', showMainMenu);
    
    // Quiz submit
    submitQuizBtn.addEventListener('click', submitQuiz);
    
    // Story mode
    document.querySelectorAll('.play-episode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const level = parseInt(this.dataset.level);
            startStoryMode(level);
        });
    });
    
    continueStoryBtn.addEventListener('click', () => {
        hideAllScreens();
        startGame();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
}

// Keyboard controls
function handleKeyDown(e) {
    if (!gameActive) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            movePiece(-1);
            break;
        case 'ArrowRight':
            movePiece(1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'ArrowDown':
        case ' ':
            dropPiece();
            break;
    }
}

// Check for saved game
function checkSavedGame() {
    const savedLevel = localStorage.getItem('tewerly_level');
    if (savedLevel) {
        currentLevel = parseInt(savedLevel);
        continueText.textContent = ` (Continuar Nivel ${currentLevel})`;
    } else {
        continueText.textContent = '';
    }
}

// Save username
function saveUsername() {
    const name = usernameInput.value.trim();
    if (name) {
        username = name;
        localStorage.setItem('tewerly_username', username);
        playerWelcome.textContent = `¡Bienvenido, Agente ${username}!`;
        alert(`¡Nombre guardado: ${username}!`);
    } else {
        alert('Por favor, ingresa un nombre válido.');
    }
}

// Initialize game board
function initBoard() {
    gameBoard = [];
    for (let row = 0; row < ROWS; row++) {
        gameBoard[row] = [];
        for (let col = 0; col < COLS; col++) {
            gameBoard[row][col] = 0;
        }
    }
}

// Start game
function startGame() {
    // Cancel any existing animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Initialize game variables
    initBoard();
    score = 0;
    gameTimer = 180; // 3 minutes
    
    // Ajustar dificultad según el nivel
    gameSpeedFactor = 1 + (currentLevel - 1) * 0.15; // Incremento más pronunciado de velocidad por nivel
    dropInterval = 800 - (currentLevel - 1) * 70; // Reducción mayor del intervalo de caída por nivel
    
    updateTimer();
    scoreDisplay.textContent = score;
    levelDisplay.textContent = currentLevel;
    playerNameDisplay.textContent = username || 'Anónimo';
    
    // Create first pieces
    createNewPiece();
    
    // Hide all screens and show game screen
    hideAllScreens();
    gameScreen.style.display = 'flex';
    
    // Start game loop and timer
    gameActive = true;
    lastTime = performance.now();
    startGameLoop();
    startTimer();
    
    // Save current level
    localStorage.setItem('tewerly_level', currentLevel);
}

// Start story mode
function startStoryMode(level) {
    isStoryMode = true;
    currentLevel = level;
    
    // Mostrar mensaje de la historia antes de empezar el nivel
    hideAllScreens();
    storyMessageTitle.textContent = storyContent[level-1].title;
    storyMessageContent.innerHTML = storyContent[level-1].intro;
    
    // Establecer imagen de fondo según el nivel
    storyMessageScreen.style.backgroundImage = `url(https://images.unsplash.com/photo-${level === 1 ? '1550751827-4bd374c3f58b' : 
                                             level === 2 ? '1558494949-ef010cbdcc31' : 
                                             level === 3 ? '1526374965328-7f61d4dc18c5' : 
                                             level === 4 ? '1544197150-b99a580bb7a8' : 
                                             '1537498425277-c283d32ef9db'})`;
    
    storyMessageScreen.style.display = 'flex';
}

// Pause game
function pauseGame() {
    gameActive = false;
    clearInterval(timerInterval);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Resume game
function resumeGame() {
    if (!gameActive) {
        gameActive = true;
        lastTime = performance.now();
        startGameLoop();
        startTimer();
    }
}

// Start game loop
function startGameLoop() {
    function gameLoop(timestamp) {
        if (!gameActive) return;
        
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Update drop counter
        dropCounter += deltaTime;
        if (dropCounter > dropInterval / gameSpeedFactor) {
            movePieceDown();
            dropCounter = 0;
        }
        
        // Draw the game
        drawGame();
        
        // Continue the loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Start timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTimer--;
        updateTimer();
        
        // Gradually increase game speed based on remaining time
        // More gradual speed increase
        if (gameTimer <= 150 && gameTimer > 120) {
            gameSpeedFactor = 1.1 + (currentLevel - 1) * 0.15;
        } else if (gameTimer <= 120 && gameTimer > 90) {
            gameSpeedFactor = 1.2 + (currentLevel - 1) * 0.15;
        } else if (gameTimer <= 90 && gameTimer > 60) {
            gameSpeedFactor = 1.3 + (currentLevel - 1) * 0.15;
        } else if (gameTimer <= 60 && gameTimer > 30) {
            gameSpeedFactor = 1.4 + (currentLevel - 1) * 0.15;
        } else if (gameTimer <= 30) {
            gameSpeedFactor = 1.5 + (currentLevel - 1) * 0.15;
        }
        
        if (gameTimer <= 0) {
            levelComplete();
        }
    }, 1000);
}

// Update timer display
function updateTimer() {
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Create new piece
function createNewPiece() {
    // Define the 5 possible Tetris-like shapes
    const shapes = [
        [
            [1, 1],
            [1, 1]
        ], // Square
        [
            [0, 1, 0],
            [1, 1, 1]
        ], // T
        [
            [1, 1, 1, 1]
        ], // Line
        [
            [1, 1, 0],
            [0, 1, 1]
        ], // Z
        [
            [0, 1, 1],
            [1, 1, 0]
        ] // S
    ];
    
    // Select random shape and color
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    currentPiece = {
        shape: shape,
        color: color,
        row: 0,
        col: Math.floor((COLS - shape[0].length) / 2)
    };
    
    // Check if game over
    if (!canMoveTo(currentPiece.row, currentPiece.col, currentPiece.shape)) {
        gameOver();
    }
}

// Move piece left or right
function movePiece(direction) {
    if (!gameActive) return;
    
    const newCol = currentPiece.col + direction;
    if (canMoveTo(currentPiece.row, newCol, currentPiece.shape)) {
        currentPiece.col = newCol;
        playSound(moveSound);
    }
}

// Rotate piece
function rotatePiece() {
    if (!gameActive) return;
    
    const newShape = rotateShape(currentPiece.shape);
    if (canMoveTo(currentPiece.row, currentPiece.col, newShape)) {
        currentPiece.shape = newShape;
        playSound(rotateSound);
    } else {
        // Try wall kicks (adjust position if rotation would cause collision)
        // Try moving left
        if (canMoveTo(currentPiece.row, currentPiece.col - 1, newShape)) {
            currentPiece.col -= 1;
            currentPiece.shape = newShape;
            playSound(rotateSound);
        }
        // Try moving right
        else if (canMoveTo(currentPiece.row, currentPiece.col + 1, newShape)) {
            currentPiece.col += 1;
            currentPiece.shape = newShape;
            playSound(rotateSound);
        }
        // Try moving up (in some cases)
        else if (canMoveTo(currentPiece.row - 1, currentPiece.col, newShape)) {
            currentPiece.row -= 1;
            currentPiece.shape = newShape;
            playSound(rotateSound);
        }
    }
}

// Rotate shape matrix
function rotateShape(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    let rotated = [];
    
    // Initialize rotated matrix
    for (let i = 0; i < cols; i++) {
        rotated[i] = [];
        for (let j = 0; j < rows; j++) {
            rotated[i][j] = 0;
        }
    }
    
    // Fill rotated matrix
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            rotated[col][rows - 1 - row] = shape[row][col];
        }
    }
    
    return rotated;
}

// Drop piece immediately
function dropPiece() {
    if (!gameActive) return;
    
    while (canMoveTo(currentPiece.row + 1, currentPiece.col, currentPiece.shape)) {
        currentPiece.row++;
    }
    
    placePiece();
    createNewPiece();
    playSound(dropSound);
}

// Move piece down
function movePieceDown() {
    if (!gameActive) return;
    
    if (canMoveTo(currentPiece.row + 1, currentPiece.col, currentPiece.shape)) {
        currentPiece.row++;
        return true;
    } else {
        placePiece();
        createNewPiece();
        return false;
    }
}

// Check if piece can move to position
function canMoveTo(row, col, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newRow = row + r;
                const newCol = col + c;
                
                // Check boundaries
                if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
                    return false;
                }
                
                // Check if space is occupied
                if (gameBoard[newRow][newCol]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Place piece on board
function placePiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                const boardRow = currentPiece.row + r;
                const boardCol = currentPiece.col + c;
                gameBoard[boardRow][boardCol] = currentPiece.color;
            }
        }
    }
    
    // Check for completed rows
    checkLines();
    
    // Check if pieces reached top
    checkGameOver();
}

// Check for completed rows
function checkLines() {
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        let lineComplete = true;
        for (let col = 0; col < COLS; col++) {
            if (!gameBoard[row][col]) {
                lineComplete = false;
                break;
            }
        }
        
        if (lineComplete) {
            // Remove line and add new empty line at top
            gameBoard.splice(row, 1);
            gameBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++; // Check the same row again after moving lines down
        }
    }
    
    // Update score based on lines cleared
    if (linesCleared > 0) {
        score += linesCleared * 100 * currentLevel;
        scoreDisplay.textContent = score;
        playSound(lineClearSound);
    }
}

// Check if game over
function checkGameOver() {
    for (let col = 0; col < COLS; col++) {
        if (gameBoard[0][col]) {
            gameOver();
            return;
        }
    }
}

// Draw game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw board
    drawBoard();
    
    // Draw current piece
    drawPiece();
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Draw horizontal lines
    for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * CELL_SIZE);
        ctx.lineTo(COLS * CELL_SIZE, row * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw vertical lines
    for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(col * CELL_SIZE, 0);
        ctx.lineTo(col * CELL_SIZE, ROWS * CELL_SIZE);
        ctx.stroke();
    }
}

// Draw board
function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameBoard[row][col]) {
                drawCell(row, col, gameBoard[row][col]);
            }
        }
    }
}

// Draw current piece
function drawPiece() {
    if (!currentPiece) return;
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const x = (currentPiece.col + col) * CELL_SIZE;
                const y = (currentPiece.row + row) * CELL_SIZE;
                
                // Draw cell
                ctx.fillStyle = currentPiece.color;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                
                // Draw cell border
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                
                // Draw highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x + 3, y + 3, CELL_SIZE - 6, 5);
                ctx.fillRect(x + 3, y + 3, 5, CELL_SIZE - 6);
                
                // Draw shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(x + 8, y + CELL_SIZE - 8, CELL_SIZE - 11, 5);
                ctx.fillRect(x + CELL_SIZE - 8, y + 8, 5, CELL_SIZE - 11);
            }
        }
    }
    
    // Draw ghost piece (where piece will land)
    drawGhostPiece();
}

// Draw ghost piece (preview of where piece will land)
function drawGhostPiece() {
    const ghostPiece = {
        shape: currentPiece.shape,
        color: currentPiece.color,
        row: currentPiece.row,
        col: currentPiece.col
    };
    
    // Find the lowest position the piece can go
    while (canMoveTo(ghostPiece.row + 1, ghostPiece.col, ghostPiece.shape)) {
        ghostPiece.row++;
    }
    
    // Skip drawing if ghost piece is in the same position as current piece
    if (ghostPiece.row === currentPiece.row) return;
    
    // Draw ghost piece
    for (let row = 0; row < ghostPiece.shape.length; row++) {
        for (let col = 0; col < ghostPiece.shape[row].length; col++) {
            if (ghostPiece.shape[row][col]) {
                const x = (ghostPiece.col + col) * CELL_SIZE;
                const y = (ghostPiece.row + row) * CELL_SIZE;
                
                // Draw ghost cell (outlined version of the piece)
                ctx.strokeStyle = ghostPiece.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
            }
        }
    }
}

// Draw a single cell
function drawCell(row, col, color) {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    
    // Draw cell
    ctx.fillStyle = color;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    
    // Draw cell border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    
    // Draw highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 3, y + 3, CELL_SIZE - 6, 5);
    ctx.fillRect(x + 3, y + 3, 5, CELL_SIZE - 6);
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 8, y + CELL_SIZE - 8, CELL_SIZE - 11, 5);
    ctx.fillRect(x + CELL_SIZE - 8, y + 8, 5, CELL_SIZE - 11);
}

// Level complete
function levelComplete() {
    pauseGame();
    playSound(levelCompleteSound);
    showQuizScreen();
}

// Game over
function gameOver() {
    pauseGame();
    gameActive = false;
    
    playSound(gameOverSound);
    saveScoreToLeaderboard();
    
    playerFinalName.textContent = username ? `Agente ${username}` : 'Agente Anónimo';
    gameOverText.textContent = `Tu puntuación final: ${score}`;
    
    hideAllScreens();
    gameOverScreen.style.display = 'flex';
}

// Show quiz screen
function showQuizScreen() {
    hideAllScreens();
    
    // Generate quiz questions based on current level
    generateQuiz();
    
    quizScreen.style.display = 'flex';
}

// Generate quiz
function generateQuiz() {
    // Quiz questions by level
    const quizQuestions = [
        // Level 1 questions
        [
            {
                question: "¿Qué es el phishing?",
                options: [
                    "Una técnica de pesca deportiva",
                    "Un ataque que se hace pasar por una entidad confiable para obtener información sensible",
                    "Un software para proteger contraseñas",
                    "Una técnica para mejorar la velocidad de internet"
                ],
                answer: 1
            },
            {
                question: "¿Qué es una contraseña segura?",
                options: [
                    "Una contraseña que incluye tu nombre y fecha de nacimiento",
                    "Una contraseña corta y fácil de recordar",
                    "Una combinación de letras, números y símbolos de al menos 8 caracteres",
                    "La misma contraseña para todas tus cuentas"
                ],
                answer: 2
            },
            {
                question: "¿Por qué es importante actualizar tu software?",
                options: [
                    "Para tener las últimas funciones solamente",
                    "Para corregir vulnerabilidades de seguridad",
                    "Porque es obligatorio",
                    "Para usar más espacio en el disco duro"
                ],
                answer: 1
            }
        ],
        // Level 2 questions
        [
            {
                question: "¿Qué es la autenticación de dos factores (2FA)?",
                options: [
                    "Usar dos contraseñas diferentes",
                    "Un método que requiere dos formas de verificación para acceder a una cuenta",
                    "Un programa antivirus",
                    "Una técnica para crear contraseñas"
                ],
                answer: 1
            },
            {
                question: "¿Qué deberías hacer si recibes un email sospechoso?",
                options: [
                    "Abrirlo para ver qué contiene",
                    "Hacer clic en los enlaces para verificar",
                    "No abrirlo y reportarlo como spam",
                    "Responder pidiendo más información"
                ],
                answer: 2
            },
            {
                question: "¿Qué es un malware?",
                options: [
                    "Un hardware defectuoso",
                    "Un software malicioso diseñado para dañar o infiltrarse en un sistema",
                    "Una política de seguridad",
                    "Un tipo de contraseña"
                ],
                answer: 1
            }
        ],
        // Level 3 questions
        [
            {
                question: "¿Qué es un ransomware?",
                options: [
                    "Un programa que mejora el rendimiento del sistema",
                    "Un software que cifra tus archivos y exige un rescate para recuperarlos",
                    "Un sistema de respaldo automático",
                    "Un tipo de antivirus"
                ],
                answer: 1
            },
            {
                question: "¿Cuál es la mejor práctica para respaldar datos importantes?",
                options: [
                    "Guardar una copia en el mismo dispositivo",
                    "No hacer copias de seguridad",
                    "Seguir la regla 3-2-1: 3 copias, 2 tipos de medios, 1 copia fuera del sitio",
                    "Compartir tus archivos con amigos para que los guarden"
                ],
                answer: 2
            },
            {
                question: "¿Qué es un ataque de fuerza bruta?",
                options: [
                    "Un ataque físico a un centro de datos",
                    "Un virus muy poderoso",
                    "Intentos repetidos para adivinar una contraseña hasta encontrar la correcta",
                    "Un ataque que sobrecarga servidores"
                ],
                answer: 2
            }
        ],
        // Level 4 questions
        [
            {
                question: "¿Qué es un firewall?",
                options: [
                    "Un dispositivo físico que evita incendios en servidores",
                    "Un programa antivirus",
                    "Una barrera de seguridad que controla el tráfico de red entrante y saliente",
                    "Un tipo de contraseña segura"
                ],
                answer: 2
            },
            {
                question: "¿Qué es la ingeniería social en el contexto de la ciberseguridad?",
                options: [
                    "El diseño de redes sociales seguras",
                    "Técnicas que manipulan psicológicamente a las personas para que revelen información confidencial",
                    "Un método para crear software seguro",
                    "El estudio del comportamiento de los hackers"
                ],
                answer: 1
            },
            {
                question: "¿Qué significa el cifrado de extremo a extremo?",
                options: [
                    "Solo los extremos de un mensaje están protegidos",
                    "Solo el remitente y el destinatario pueden leer los mensajes intercambiados",
                    "Los mensajes se cifran solo al principio y al final",
                    "Un método de transmisión rápida de datos"
                ],
                answer: 1
            }
        ],
        // Level 5 questions
        [
            {
                question: "¿Qué es una VPN y para qué se utiliza?",
                options: [
                    "Virtual Personal Network, para compartir archivos personales",
                    "Virtual Protocol Network, un protocolo de internet",
                    "Red Privada Virtual, para establecer una conexión segura y encriptada",
                    "Virtual Public Network, para acceder a redes públicas"
                ],
                answer: 2
            },
            {
                question: "¿Qué son las vulnerabilidades de día cero (zero-day)?",
                options: [
                    "Vulnerabilidades que aparecen el primer día de uso de un software",
                    "Fallos que tardan cero días en ser solucionados",
                    "Vulnerabilidades desconocidas que son explotadas antes de que los desarrolladores puedan parcheadas",
                    "Errores que solo ocurren cuando el sistema está inactivo"
                ],
                answer: 2
            },
            {
                question: "¿Cuál es la principal preocupación ética relacionada con la inteligencia artificial en ciberseguridad?",
                options: [
                    "El costo de implementación",
                    "La pérdida de empleos en el sector",
                    "El uso de algoritmos para vigilancia masiva y pérdida de privacidad",
                    "La complejidad técnica de los sistemas"
                ],
                answer: 2
            }
        ]
    ];
    
    // Get questions for current level
    const levelQuestions = quizQuestions[currentLevel - 1];
    
    // Clear previous quiz
    quizContainer.innerHTML = '';
    
    // Add questions to quiz
    levelQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        const title = document.createElement('h3');
        title.className = 'quiz-title';
        title.textContent = `Pregunta ${index + 1}: ${q.question}`;
        
        const options = document.createElement('div');
        options.className = 'quiz-options';
        
        q.options.forEach((option, optIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            optionDiv.dataset.question = index;
            optionDiv.dataset.option = optIndex;
            optionDiv.textContent = option;
            
            optionDiv.addEventListener('click', () => {
                // Deselect other options for this question
                const allOptions = document.querySelectorAll(`.quiz-option[data-question="${index}"]`);
                allOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Select this option
                optionDiv.classList.add('selected');
            });
            
            options.appendChild(optionDiv);
        });
        
        questionDiv.appendChild(title);
        questionDiv.appendChild(options);
        quizContainer.appendChild(questionDiv);
    });
}

// Submit quiz
function submitQuiz() {
    const quizQuestions = quizContainer.querySelectorAll('.quiz-question');
    const totalQuestions = quizQuestions.length;
    let correctAnswers = 0;
    
    // Get questions for current level
    const levelQuestions = [
        // Level 1 questions
        [
            { answer: 1 },
            { answer: 2 },
            { answer: 1 }
        ],
        // Level 2 questions
        [
            { answer: 1 },
            { answer: 2 },
            { answer: 1 }
        ],
        // Level 3 questions
        [
            { answer: 1 },
            { answer: 2 },
            { answer: 2 }
        ],
        // Level 4 questions
        [
            { answer: 2 },
            { answer: 1 },
            { answer: 1 }
        ],
        // Level 5 questions
        [
            { answer: 2 },
            { answer: 2 },
            { answer: 2 }
        ]
    ][currentLevel - 1];
    
    // Check each question
    quizQuestions.forEach((questionDiv, index) => {
        const selectedOption = questionDiv.querySelector('.quiz-option.selected');
        
        if (selectedOption) {
            const optionIndex = parseInt(selectedOption.dataset.option);
            if (optionIndex === levelQuestions[index].answer) {
                correctAnswers++;
            }
        }
    });
    
    // Show level complete or game over
    hideAllScreens();
    
    if (correctAnswers >= 2) { // Need at least 2 correct answers to pass
        if (currentLevel < maxLevel) {
            levelCompleteText.textContent = `¡Agente ${username || 'Anónimo'}, has superado el nivel ${currentLevel} con ${correctAnswers} de ${totalQuestions} respuestas correctas!`;
            
            // Mostrar mensaje de historia si está en modo historia
            if (isStoryMode) {
                levelCompleteStory.innerHTML = storyContent[currentLevel-1].completion;
                levelCompleteStory.style.display = 'block';
            } else {
                levelCompleteStory.style.display = 'none';
            }
            
            levelCompleteScreen.style.display = 'flex';
        } else {
            // Game completed
            playerFinalName.textContent = username ? `Agente ${username}` : 'Agente Anónimo';
            gameOverText.textContent = `¡Felicidades! Has completado todos los niveles con una puntuación final de ${score}`;
            gameOverScreen.style.display = 'flex';
            
            // Guardar puntuación y resetear nivel guardado
            saveScoreToLeaderboard();
            localStorage.removeItem('tewerly_level');
        }
    } else {
        playerFinalName.textContent = username ? `Agente ${username}` : 'Agente Anónimo';
        gameOverText.textContent = `No has aprobado el cuestionario. Solo has acertado ${correctAnswers} de ${totalQuestions}. Tu puntuación final: ${score}`;
        gameOverScreen.style.display = 'flex';
    }
}

// Start next level
function startNextLevel() {
    currentLevel++;
    localStorage.setItem('tewerly_level', currentLevel);
    
    if (isStoryMode) {
        startStoryMode(currentLevel);
    } else {
        startGame();
    }
}

// Restart game
function restartGame() {
    currentLevel = 1;
    isStoryMode = false;
    localStorage.setItem('tewerly_level', currentLevel);
    startGame();
}

// Save score to leaderboard
function saveScoreToLeaderboard() {
    // Get existing leaderboard or initialize empty array
    let leaderboard = JSON.parse(localStorage.getItem('tewerly_leaderboard') || '[]');
    
    // Add current score to leaderboard
    leaderboard.push({
        name: username || 'Anónimo',
        score: score,
        level: currentLevel,
        date: new Date().toLocaleDateString()
    });
    
    // Sort leaderboard by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    leaderboard = leaderboard.slice(0, 10);
    
    // Save updated leaderboard
    localStorage.setItem('tewerly_leaderboard', JSON.stringify(leaderboard));
}

// Show leaderboard
function showLeaderboard() {
    hideAllScreens();
    
    // Get leaderboard data
    const leaderboard = JSON.parse(localStorage.getItem('tewerly_leaderboard') || '[]');
    
    // Clear previous leaderboard
    leaderboardContainer.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardContainer.innerHTML = '<p class="info-text">No hay puntuaciones guardadas.</p>';
    } else {
        // Create leaderboard table
        const table = document.createElement('table');
        table.className = 'leaderboard-table';
        
        // Add header row
        const header = document.createElement('tr');
        ['Posición', 'Jugador', 'Puntuación', 'Nivel', 'Fecha'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            header.appendChild(th);
        });
        table.appendChild(header);
        
        // Add scores
        leaderboard.forEach((item, index) => {
            const row = document.createElement('tr');
            
            // Position
            const posCell = document.createElement('td');
            posCell.textContent = index + 1;
            row.appendChild(posCell);
            
            // Name
            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);
            
            // Score
            const scoreCell = document.createElement('td');
            scoreCell.textContent = item.score;
            row.appendChild(scoreCell);
            
            // Level
            const levelCell = document.createElement('td');
            levelCell.textContent = item.level;
            row.appendChild(levelCell);
            
            // Date
            const dateCell = document.createElement('td');
            dateCell.textContent = item.date;
            row.appendChild(dateCell);
            
            table.appendChild(row);
        });
        
        leaderboardContainer.appendChild(table);
    }
    
    leaderboardScreen.style.display = 'flex';
}

// Show main menu
function showMainMenu() {
    hideAllScreens();
    pauseGame();
    
    // Update continue text
    const savedLevel = localStorage.getItem('tewerly_level');
    if (savedLevel) {
        currentLevel = parseInt(savedLevel);
        continueText.textContent = ` (Continuar Nivel ${currentLevel})`;
    } else {
        continueText.textContent = '';
    }
    
    // Update player welcome message
    if (username) {
        playerWelcome.textContent = `¡Bienvenido de nuevo, Agente ${username}!`;
    } else {
        playerWelcome.textContent = '';
    }
    
    mainMenu.style.display = 'flex';
}

// Show story screen
function showStoryScreen() {
    hideAllScreens();
    storyScreen.style.display = 'flex';
}

// Show info screen
function showInfoScreen() {
    hideAllScreens();
    infoScreen.style.display = 'flex';
}

// Hide all screens
function hideAllScreens() {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'none';
    infoScreen.style.display = 'none';
    storyScreen.style.display = 'none';
    storyMessageScreen.style.display = 'none';
    quizScreen.style.display = 'none';
    levelCompleteScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    leaderboardScreen.style.display = 'none';
}

// Initialize the game when page loads
window.addEventListener('load', init);