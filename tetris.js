// Définition de toutes les pièces du jeu avec leur forme et leur couleur

// Each shape is represented by a 2D array where 1 represents a block and 0 represents an empty space.
    // Chaque chiffre 1 représente un bloc de la pièce, les 0 sont des espaces vides

    // Tétrimino I: Quatre carrés alignés.
    // Tétrimino J: Trois carrés en ligne et un carré sous le côté droit.
    // Tétrimino O: Méta-carré de 2x2.
    // Tétrimino T: Trois carrés en ligne et un carré sous le centre.
    // Tétrimino L	« L » , « lambda »	Trois carrés en ligne et un carré sous le côté gauche.
    // Tétrimino Z	« Biais »	Méta-carré de 2x2, dont la rangée supérieure est glissée d'un pas vers la gauche.
    // Tétrimino S	« Biais inversé »	Méta-carré de 2x2, dont la rangée supérieure est glissée d'un pas vers la droite.
    const tetrominos = {
        I: { shape: [[1, 1, 1, 1]], color: 'cyan' },       // Pièce I (ligne droite)
        J: { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' }, // Pièce J (forme de L inversé)
        L: { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' },// Pièce L
        O: { shape: [[1, 1], [1, 1]], color: 'brown' },     // Pièce O (carré)
        T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },// Pièce T (en T)
        S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // Pièce S (forme de S)
        Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }   // Pièce Z (forme de Z)
    };
    
// On récupère les éléments HTML du jeu
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

// **Paramètres du jeu**
const BLOCK_SIZE = 20; // Taille d'un bloc en pixels (réduit pour mieux afficher)
const BOARD_WIDTH = 10;  // Largeur du plateau en nombre de blocs
const BOARD_HEIGHT = 20; // Hauteur du plateau en nombre de blocs

// **État du jeu**
let board, currentPiece, nextPiece, gameLoop;
let score = 0, isPaused = false;
let level = 1; // Niveau initial du jeu
let speed = 500; // Vitesse initiale (500ms par déplacement)

// **Position de départ des pièces**
const START_X = Math.floor(BOARD_WIDTH / 2) - 1;
const START_Y = 0;

// **Ajuster dynamiquement la taille du canvas**
canvas.width = BOARD_WIDTH * BLOCK_SIZE;
canvas.height = BOARD_HEIGHT * BLOCK_SIZE;
nextCanvas.width = 4 * BLOCK_SIZE;
nextCanvas.height = 4 * BLOCK_SIZE;

// **Écouter les touches du clavier**
document.addEventListener('keydown', handleKeyPress);
document.getElementById('start-button').addEventListener('click', startGame);

// **Créer une nouvelle pièce**
function createPiece(type) {
    return {
        shape: tetrominos[type].shape,
        color: tetrominos[type].color,
        x: START_X,
        y: START_Y
    };
}

// **Sélectionner une pièce aléatoire**
function getRandomTetromino() {
    const types = Object.keys(tetrominos);
    return types[Math.floor(Math.random() * types.length)];
}

// **Dessiner un bloc sur le canvas**
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

// **Dessiner le plateau**
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner les blocs du plateau
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }

    // Dessiner la pièce qui tombe
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            });
        });
    }
}

// **Vérifier si une pièce peut bouger**
function isValidMove(piece, newX, newY) {
    return piece.shape.every((row, dy) =>
        row.every((value, dx) => {
            if (!value) return true;
            let x = newX + dx;
            let y = newY + dy;
            return x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT && !board[y][x];
        })
    );
}

// **Déplacer la pièce vers le bas**
function moveDown() {
    if (!currentPiece) return;

    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++;
    } else {
        placePiece();
        currentPiece = nextPiece;
        nextPiece = createPiece(getRandomTetromino());

        if (!isValidMove(currentPiece, currentPiece.x, currentPiece.y)) {
            gameOver();
        }
    }

    drawBoard();
}

// **Placer la pièce sur la grille**
function placePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                let boardY = currentPiece.y + y;
                let boardX = currentPiece.x + x;

                if (boardY < 0) {
                    gameOver();
                    return;
                }

                board[boardY][boardX] = currentPiece.color;
            }
        });
    });

    checkLines();
}

// **Vérifier et supprimer les lignes complètes**
function checkLines() {
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            score += 100;
            updateScore();
        }
    }
}
function updateLevel() {
    let newLevel = Math.floor(score / 1000) + 1; // Augmente le niveau chaque 1000 points

    if (newLevel > level) { // Vérifie si on atteint un nouveau niveau
        level = newLevel;
        speed = Math.max(100, 500 - (level - 1) * 50); // Réduit la vitesse avec un minimum de 100ms
        clearInterval(gameLoop); // Stoppe l'ancienne boucle
        gameLoop = setInterval(moveDown, speed); // Redémarre avec la nouvelle vitesse
        document.getElementById('level').textContent = level; // Met à jour l'affichage du niveau
    }
}

// **Mettre à jour le score**
function updateScore() {
    document.getElementById('score').textContent = score;
    updateLevel(); // Vérifie et met à jour le niveau si nécessaire

}

// **Gérer les touches du clavier**
function handleKeyPress(event) {
    if (!currentPiece || isPaused) return;

    if (event.key === "ArrowLeft" && isValidMove(currentPiece, currentPiece.x - 1, currentPiece.y)) {
        currentPiece.x--;
    } else if (event.key === "ArrowRight" && isValidMove(currentPiece, currentPiece.x + 1, currentPiece.y)) {
        currentPiece.x++;
    } else if (event.key === "ArrowDown") {
        moveDown();
    } else if (event.key === "ArrowUp") {
        rotatePiece();
    }

    drawBoard();
}

// **Rotation de la pièce**
function rotatePiece() {
    let rotatedShape = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );

    if (isValidMove({ ...currentPiece, shape: rotatedShape }, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = rotatedShape;
    }
}

// **Afficher la prochaine pièce**
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextPiece) return;

    const size = 20;
    const offsetX = (nextCanvas.width - nextPiece.shape[0].length * size) / 2;
    const offsetY = (nextCanvas.height - nextPiece.shape.length * size) / 2;

    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                nextCtx.fillStyle = nextPiece.color;
                nextCtx.fillRect(offsetX + x * size, offsetY + y * size, size - 1, size - 1);
            }
        });
    });
}

// **Fin du jeu avec option de redémarrage**
function gameOver() {
    clearInterval(gameLoop);
    
    // Demande si le joueur veut recommencer
    let restart = confirm(`Game Over! \nVotre score final est : ${score} \nVoulez-vous recommencer ?`);
    
    if (restart) {
        startGame(); // Redémarre automatiquement le jeu si l'utilisateur clique "OK"
    } else {
        document.getElementById('start-button').disabled = false; // Réactive le bouton Start
    }
}


// **Démarrer le jeu**
function startGame() {
    board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
    score = 0;
    updateScore();

    currentPiece = createPiece(getRandomTetromino());
    nextPiece = createPiece(getRandomTetromino());
    drawNextPiece();

    document.getElementById('start-button').disabled = true;

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(moveDown, 500);
}
