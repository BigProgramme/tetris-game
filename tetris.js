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
