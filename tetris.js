// Définition de toutes les pièces du jeu avec leur forme et leur couleur
//definition of the shapes of Tetris blocks (tetrominos) and their colors.
    // Each shape is represented by a 2D array where 1 represents a block and 0 represents an empty space.
    // Tétrimino I: Quatre carrés alignés.
    // Tétrimino J: Trois carrés en ligne et un carré sous le côté droit.
    // Tétrimino O: Méta-carré de 2x2.
    // Tétrimino T: Trois carrés en ligne et un carré sous le centre.
    // Tétrimino L	« L » , « lambda »	Trois carrés en ligne et un carré sous le côté gauche.
    // Tétrimino Z	« Biais »	Méta-carré de 2x2, dont la rangée supérieure est glissée d'un pas vers la gauche.
    // Tétrimino S	« Biais inversé »	Méta-carré de 2x2, dont la rangée supérieure est glissée d'un pas vers la droite.
// Chaque chiffre 1 représente un bloc de la pièce, les 0 sont des espaces vides
const tetrominos = {
    I: { shape: [[1, 1, 1, 1]], color: 'cyan' },       // pièce I (ligne droite)
    J: { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' }, // pièce J (forme de L inversé)
    L: { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' },// Pièce L
    O: { shape: [[1, 1], [1, 1]], color: 'brown' },     // pièce O (carré)
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },// pièce T (en T)
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // pièce S (forme de S)
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }   // pièce Z (forme de Z)
};

// préparation du Canvas où le jeu va se dessiner
const canvas = document.getElementById('tetris'); // on récupère l'élément HTML
const ctx = canvas.getContext('2d'); // contexte de dessin 2D

// paramètres de base du jeu
const BLOCK_SIZE = 30;   // taille d'un bloc en pixels (30x30)
const BOARD_WIDTH = 10;  // targeur du plateau : 10 blocsa
const BOARD_HEIGHT = 20; // hauteur du plateau : 20 blocs

// état actuel du jeu
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)); // grille vide au départ
let currentPiece = null;  // la pièce qui tombe actuellement
let nextPiece = null;     // la prochaine pièce qui va tomber
let score = 0;            // score du joueur
let level = 1;            // niveau de difficulté
let gameLoop = null;      // stocke la boucle de jeu
let isPaused = false;     // si le jeu est en pause

// position de départ des pièces (au milieu en haut)
const START_X = Math.floor(BOARD_WIDTH / 2) - 1; // -1 pour centrer correctement
const START_Y = 0; // tout en haut

// on écoute le clic sur le bouton "Start" et les touches du clavier
document.getElementById('start-button').addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyPress);

// fonction pour créer une nouvelle pièce aléatoire
function createPiece(type) {
    return {
        shape: tetrominos[type].shape, // forme de la pièce
        color: tetrominos[type].color, // sa couleur
        x: START_X, // position horizontale de départ
        y: START_Y  // position verticale de départ
    };
}

// dessine un seul bloc à une position donnée
function drawBlock(x, y, color) {
    ctx.fillStyle = color; // on choisit la couleur
    // on dessine un rectangle (x, y, largeur, hauteur)
    // les -1 servent à laisser un petit espace entre les blocs
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

// redessine tout le plateau de jeu ou grille 
function drawBoard() {
    // efface tout le canvas avant de redessiner
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // dessine tous les blocs déjà fixés dans la grille
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            // Si la case n'est pas vide, on dessine le bloc
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    
    // dessine la pièce qui est en train de tomber
    if (currentPiece) {
        // on parcourt chaque ligne de la pièce
        currentPiece.shape.forEach((row, y) => {
            // on parcourt chaque colonne de la ligne
            row.forEach((value, x) => {
                // si c'est un 1, on dessine le bloc
                if (value) {
                    // on calcule la position réelle dans la grille
                    drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            });
        });
    }
}


//===== partie oussama
// Vérifie si la pièce peut bouger à une nouvelle position
function canMove(piece, newX, newY) {
    // On vérifie chaque bloc de la pièce
    return piece.shape.every((row, dy) => {
        return row.every((value, dx) => {
            // Position hypothétique du bloc
            const x = newX + dx;
            const y = newY + dy;
            
            // Le bloc peut bouger si :
            // - C'est une partie vide de la pièce (0) OU
            // - La position est dans la grille ET la case est vide
            return value === 0 || 
                   (x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT && !board[y][x]);
        });
    });
}

// Fixation la pièce actuelle dans la grille quand elle ne peut plus bouger
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                // n met la couleur de la pièce dans la grille
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

// cette fonction va permettre de faire tourner la pièce de 90 degrés
function rotatePiece() {
    // Crée une nouvelle forme en faisant pivoter la matrice
    const newShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    // On garde l'ancienne forme au cas où la rotation est impossible
    const oldShape = currentPiece.shape;
    currentPiece.shape = newShape;
    
    // Si la rotation provoque une collision, on annule
    if (!canMove(currentPiece, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = oldShape;
    }
}

// fonction qui Vérifie et supprime les lignes complètes
function checkLines() {
    let linesCleared = 0; // Compte les lignes supprimées
    
    // On vérifie chaque ligne depuis le bas
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        // Si tous les blocs de la ligne sont remplis
        if (board[y].every(cell => cell !== 0)) {
            // supprime la ligne et ajoute une nouvelle ligne vide en haut
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // on revérifie la même position car les lignes ont descendu
        }
    }
    
    // mise à jour du score et niveau
    if (linesCleared > 0) {
        score += linesCleared * 100 * level; // Plus de points aux niveaux supérieurs
        document.getElementById('score').textContent = score;
        
        // Tous les 1000 points, le niveau augmente
        if (score >= level * 1000) {
            level++;
            document.querySelector('.level').textContent += level; // on met à jour le niveau 
        }
    }
}


// ====== 3 eme partie de saint
//Je vais gérer les fonctionalités de fin de partie pour compléter à vos codes Oussama et Achraf
// Gestion de la fin de partie
function gameOver() {
    clearInterval(gameLoop); // stop  le jeu
    alert(Game Over! Score: ${score}); // on affiche le score final
}

// il faut mettre à jour le jeu à chaque frame
function update() {
    // on vérifie si la pièce peut descendre ?
    if (canMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++; // on la fait descendre
    } else {
        // sinon, on la fixe dans la grille
        mergePiece();
        checkLines(); // toujours vérifire les lignes complètes
        
        // on prend la prochaine pièce et on en crée une nouvelle
        currentPiece = nextPiece;
        nextPiece = createPiece(Object.keys(tetrominos)[Math.floor(Math.random() * 7)]);
        
        // si la nouvelle pièce ne peut pas entrer, game over
        if (!canMove(currentPiece, currentPiece.x, currentPiece.y)) {
            gameOver();
            return;
        }
    }
    
    // redessinons donc la grid et la prochaine pièce
    drawBoard();
    drawNextPiece();
}

// GESTION DES APPUIS SUR LES TOUCHES
function handleKeyPress(e) {
    // JE VAIS EmpêcheR la barre d'espace de faire défiler la page
    if (e.key === ' ' && document.activeElement !== document.getElementById('start-button')) {
        e.preventDefault();
    }
    
    // ON Vérifie si le jeu est en pause ou non démarré, puis on ne fait rien
    if (!currentPiece || (isPaused && e.key !== ' ')) return;
    
    // 
    switch(e.key) {
        case 'ArrowLeft': // <--
            if (canMove(currentPiece, currentPiece.x - 1, currentPiece.y)) {
                currentPiece.x--; // déplacement à gauche
                drawBoard(); // 
            }
            break;
        case 'ArrowRight': // -->
            if (canMove(currentPiece, currentPiece.x + 1, currentPiece.y)) {
                currentPiece.x++; // déplacement à droite
                drawBoard();
            }
            break;
        case 'ArrowDown': // 
            if (canMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++; // 
                drawBoard();
            }
            break;
        case 'ArrowUp': // 
            rotatePiece(); // appelle de la fonction de la rotation de la pièce
            drawBoard();
            break;
        case ' ': // baarre d'espace
            isPaused = !isPaused; // inverse l'état de pause
            if (isPaused) {
                clearInterval(gameLoop); // arrête le jeu
            } else {
                // repise du jeu avec  avec la vitesse actuelle
                gameLoop = setInterval(update, 1000 / level);
            }
            break;
    }
}

// affichage de la prochaine pièce dans le petit canvas
//on va manipuler le petit canvas pour visualiser la prochiane pièce
function drawNextPiece() {
    const preview = document.getElementById('next-piece'); // 
    const pCtx = preview.getContext('2d');
    const blockSize = 10; // on réduit ici la taille des tetriminos à 10
    
    // on vide le canvas au début
    pCtx.clearRect(0, 0, preview.width, preview.height);
    // 
    pCtx.fillStyle = '#fff';
    pCtx.fillRect(0, 0, preview.width, preview.height); // on trace un rectange représentatif de notre bloc
    
    // calcule le décalage pour centrer la pièce
    const offsetX = (preview.width - (nextPiece.shape[0].length * blockSize)) / 2;
    const offsetY = (preview.height - (nextPiece.shape.length * blockSize)) / 2;
    
    // et là on dessine chaque bloc de la prochaine pièce
    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                pCtx.fillStyle = nextPiece.color;
                pCtx.fillRect(
                    x * blockSize + offsetX, //  Pos X ajustée
                    y * blockSize + offsetY, // Pos Y ajustée
                    blockSize - 1, 
                    blockSize - 1
                );
            }
        });
    });
}

// fonction qui va nous permettre de start le jeu 
function startGame() {
    const nextPieceCanvas = document.getElementById('next-piece');
    nextPieceCanvas.style.background = 'rgb(16, 16, 25)'; // 
    
    // réinitialisation es paramètres du jeu
    canvas.width = BLOCK_SIZE * BOARD_WIDTH; // canvas taille
    canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)); // une grille  vide avec des zéros comme valeur
    score = 0;
    level = 1;
    isPaused = false;
    document.getElementById('score').textContent = '0'; // on met le score à zéro au début du jeu et le niveau à 1
    document.querySelector('.level').textContent = '1';
    
    // création des premières pièces
    currentPiece = createPiece(Object.keys(tetrominos)[Math.floor(Math.random() * 7)]);
    nextPiece = createPiece(Object.keys(tetrominos)[Math.floor(Math.random() * 7)]);
    
    // démarrage de la boucle de jeu (la vitesse dépend du niveau)
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / level);
    
    // initail state:
    drawBoard();
    drawNextPiece();
}

