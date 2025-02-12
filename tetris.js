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
    
    // On prépare le canvas où le jeu va se dessiner
    const canvas = document.getElementById('tetris'); // On récupère l'élément HTML
    const ctx = canvas.getContext('2d'); // Contexte de dessin 2D
    
    // Paramètres de base du jeu
    const BLOCK_SIZE = 30;   // Taille d'un bloc en pixels (30x30)
    const BOARD_WIDTH = 10;  // Largeur du plateau : 10 blocs
    const BOARD_HEIGHT = 20; // Hauteur du plateau : 20 blocs
    
    // État actuel du jeu
    let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)); // Grille vide au départ
    let currentPiece = null;  // La pièce qui tombe actuellement
    let nextPiece = null;     // La prochaine pièce qui va tomber
    let score = 0;            // Score du joueur
    let level = 1;            // Niveau de difficulté
    let gameLoop = null;      // Stocke la boucle de jeu
    let isPaused = false;     // Si le jeu est en pause
    
    // Position de départ des pièces (au milieu en haut)
    const START_X = Math.floor(BOARD_WIDTH / 2) - 1; // -1 pour centrer correctement
    const START_Y = 0; // Tout en haut
    
    // On écoute le clic sur le bouton "Start" et les touches du clavier
    document.getElementById('start-button').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Fonction pour créer une nouvelle pièce aléatoire
    function createPiece(type) {
        return {
            shape: tetrominos[type].shape, // Forme de la pièce
            color: tetrominos[type].color, // Sa couleur
            x: START_X, // Position horizontale de départ
            y: START_Y  // Position verticale de départ
        };
    }
    
    // Dessine un seul bloc à une position donnée
    function drawBlock(x, y, color) {
        ctx.fillStyle = color; // On choisit la couleur
        // On dessine un rectangle (x, y, largeur, hauteur)
        // Les -1 servent à laisser un petit espace entre les blocs
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    }
    
    // Redessine tout le plateau de jeu
    function drawBoard() {
        // Efface tout le canvas avant de redessiner
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dessine tous les blocs déjà fixés dans la grille
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                // Si la case n'est pas vide, on dessine le bloc
                if (board[y][x]) {
                    drawBlock(x, y, board[y][x]);
                }
            }
        }
        
        // Dessine la pièce qui est en train de tomber
        if (currentPiece) {
            // On parcourt chaque ligne de la pièce
            currentPiece.shape.forEach((row, y) => {
                // On parcourt chaque colonne de la ligne
                row.forEach((value, x) => {
                    // Si c'est un 1, on dessine le bloc
                    if (value) {
                        // On calcule la position réelle dans la grille
                        drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                    }
                });
            });
        }
    }