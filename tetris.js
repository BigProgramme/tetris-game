
//Je vais gérer les fonctionalités de fin de partie pour compléter à vos codes Oussama et Achraf
// Gestion de la fin de partie
function gameOver() {
    clearInterval(gameLoop); // stop  le jeu
    alert(`Game Over! Score: ${score}`); // on affiche le score final
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