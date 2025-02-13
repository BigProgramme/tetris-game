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
