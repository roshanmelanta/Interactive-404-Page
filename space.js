//board
let tileSize = 32;
let rows = 12;  // Increased board height
let columns = 32;  // Increased board width

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

//aliens
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize * 4;  // Starting position adjusted
let alienY = tileSize * 2;  // Starting position adjusted
let alienImg;
let alienCount = 0;
let alienVelocityX = 1;

//bullets
let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

// Define the 404 pattern
const pattern404 = [
    "  ███     ████      ███  ", // First row
    " ██ █    ██  ██    ██ █  ",
    "██  █    ██  ██   ██  █  ",
    "██████   ██  ██   ██████ ",
    "    █    ██  ██       █  ",
    "    █    ██  ██       █  ",
    "    █    ██  ██       █  ",
    "    █     ████        █  "
];

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Get the restart button and add event listener
    const restartButton = document.getElementById("restart");
    restartButton.addEventListener("click", function() {
        window.location.reload();  // Reload the page to restart the game
    });

    shipImg = new Image();
    shipImg.src = "./images/ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./images/alien.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        context.clearRect(0, 0, board.width, board.height);

        if (alienCount === 0) {
            // Player wins
            context.fillStyle = "green";
            context.font = "30px 'Press Start 2P'";
            context.textAlign = "center";
            context.fillText("YOU WON!", board.width / 2, board.height / 2 - 20);

            context.fillStyle = "white";
            context.font = "20px 'Press Start 2P'";
            context.fillText(`Score: ${score}`, board.width / 2, board.height / 2 + 20);
        } else {
            // Player loses
            context.fillStyle = "red";
            context.font = "30px 'Press Start 2P'";
            context.textAlign = "center";
            context.fillText("YOU LOST", board.width / 2, board.height / 2 - 20);

            context.fillStyle = "white";
            context.font = "20px 'Press Start 2P'";
            context.fillText(`Score: ${score}`, board.width / 2, board.height / 2 + 20);
        }

        return; // Stop further updates
    }

    context.clearRect(0, 0, board.width, board.height);

    // Draw ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Update and draw aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight / 2;
                }
            }

            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Update and draw bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Clear used or out-of-bounds bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    // Check win condition
    if (alienCount === 0) {
        gameOver = true;
    }

    // Display score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}



function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let row = 0; row < pattern404.length; row++) {
        for (let col = 0; col < pattern404[row].length; col++) {
            if (pattern404[row][col] === '█') {
                let alien = {
                    img: alienImg,
                    x: alienX + col * (alienWidth/2),
                    y: alienY + row * (alienHeight/2),
                    width: alienWidth/2,
                    height: alienHeight/2,
                    alive: true
                }
                alienArray.push(alien);
            }
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}