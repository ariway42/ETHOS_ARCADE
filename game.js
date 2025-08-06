﻿const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over");
const finalScoreText = document.getElementById("final-score");
const newGameBtn = document.getElementById("new-game-btn");
const homeBtn = document.getElementById("home-btn");

// Buat tombol Start Game (hanya muncul di awal)
const startGameBtn = document.getElementById("start-game-btn");
/*startGameBtn.id = "start-game-btn";*/
//startGameBtn.textContent = "Start Game";
//startGameBtn.style.position = "fixed";
//startGameBtn.style.top = "50%";
//startGameBtn.style.left = "50%";
//startGameBtn.style.transform = "translate(-50%, -50%)";
//startGameBtn.style.padding = "1rem 2rem";
//startGameBtn.style.fontSize = "1.5rem";
//startGameBtn.style.cursor = "pointer";
/*document.body.appendChild(startGameBtn);*/

const bgMusic = new Audio("img/backsound.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

let score = 0;
let spawnInterval;
let isGameOver = false;

const laneCount = 7;
let playerPositionX = 2;
let playerPositionY = 0;

let activeEnemies = [];
let activeDecorations = [];

// FLAG untuk mencegah double move saat tekan dan tahan key
let keyPressed = false;

function getLaneLeftPercent(laneIndex) {
    return `calc(${(100 / laneCount) * laneIndex}% + 3%)`;
}

function getLaneBottomPercent(laneIndex) {
    const baseBottomPx = 5;
    const stepPercent = 5;
    return `${baseBottomPx + playerPositionY * stepPercent}%`;
}

document.addEventListener("keydown", (e) => {
    if (isGameOver || keyPressed) return;

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        keyPressed = true;

        switch (e.key) {
            case "ArrowLeft":
                if (playerPositionX > 0) playerPositionX--;
                break;
            case "ArrowRight":
                if (playerPositionX < laneCount - 1) playerPositionX++;
                break;
            case "ArrowUp":
                if (playerPositionY < laneCount - 1) playerPositionY++;
                break;
            case "ArrowDown":
                if (playerPositionY > 0) playerPositionY--;
                break;
        }

        player.style.left = getLaneLeftPercent(playerPositionX);
        player.style.bottom = getLaneBottomPercent(playerPositionY);
    }
});

// Reset flag saat tombol dilepas supaya bisa deteksi tekan berikutnya
document.addEventListener("keyup", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        keyPressed = false;
    }
});

document.querySelectorAll("#controller .arrow").forEach(btn => {
    btn.addEventListener("touchstart", () => handleControl(btn.dataset.dir));
    btn.addEventListener("mousedown", () => handleControl(btn.dataset.dir));
});

function handleControl(direction) {
    if (isGameOver) return;

    switch (direction) {
        case "left":
            if (playerPositionX > 0) playerPositionX--;
            break;
        case "right":
            if (playerPositionX < laneCount - 1) playerPositionX++;
            break;
        case "up":
            if (playerPositionY < laneCount - 1) playerPositionY++;
            break;
        case "down":
            if (playerPositionY > 0) playerPositionY--;
            break;
    }

    player.style.left = getLaneLeftPercent(playerPositionX);
    player.style.bottom = getLaneBottomPercent(playerPositionY);
}

function checkCollision(enemy) {
    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    const isOverlap =
        playerRect.left < enemyRect.right &&
        playerRect.right > enemyRect.left &&
        playerRect.top < enemyRect.bottom &&
        playerRect.bottom > enemyRect.top;

    if (!isOverlap) return false;

    const overlapWidth = Math.min(playerRect.right, enemyRect.right) - Math.max(playerRect.left, enemyRect.left);
    const overlapHeight = Math.min(playerRect.bottom, enemyRect.bottom) - Math.max(playerRect.top, enemyRect.top);
    const overlapArea = overlapWidth * overlapHeight;

    const playerArea = playerRect.width * playerRect.height;

    return overlapArea >= playerArea * 0.1;
}

function spawnEnemy() {
    if (activeEnemies.length >= 3) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");

    // Array gambar enemy
    const enemyImages = [
        "img/ENEMY.png",
        "img/car2.png",
         "img/car3.png",
          "img/car4.png"
    ];

    // Pilih acak
    const randomImg = enemyImages[Math.floor(Math.random() * enemyImages.length)];
    enemy.style.backgroundImage = `url('${randomImg}')`;

    let lane;
    let retry = 0;
    do {
        lane = Math.floor(Math.random() * laneCount);
        retry++;
    } while (activeEnemies.some(e => parseInt(e.dataset.lane) === lane) && retry < 10);

    enemy.style.left = getLaneLeftPercent(lane);
    enemy.dataset.lane = lane;
    enemy.style.transform = "translateY(-100px)";

    game.appendChild(enemy);
    activeEnemies.push(enemy);

    let posY = -100;
    const elapsedTime = (Date.now() - startTime) / 1000; // detik
    const fallSpeed = Math.min(3 + Math.floor(elapsedTime / 20), 15);


    function move() {
        if (isGameOver) {
            enemy.remove();
            activeEnemies = activeEnemies.filter(e => e !== enemy);
            return;
        }

        posY += fallSpeed;
        enemy.style.transform = `translateY(${posY}px)`;

        if (checkCollision(enemy)) {
            endGame();
            return;
        }

        if (posY > game.offsetHeight) {
            enemy.remove();
            activeEnemies = activeEnemies.filter(e => e !== enemy);
            score++;
            scoreDisplay.innerText = "Score: " + score;
            return;
        }

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}


function spawnEthosDecoration() {
    if (activeDecorations.length >= 3) return;

    const ethos = document.createElement("div");
    ethos.classList.add("decoration", "ethos-img");
    ethos.style.backgroundImage = "url('img/ethos.png')";

    const lane = Math.floor(Math.random() * laneCount);
    ethos.style.left = getLaneLeftPercent(lane);
    ethos.dataset.lane = lane;
    ethos.style.transform = "translateY(-100px)";

    game.appendChild(ethos);
    activeDecorations.push(ethos);

    let posY = -100;
    const fallSpeed = 2;

    function move() {
        if (isGameOver) {
            ethos.remove();
            activeDecorations = activeDecorations.filter(e => e !== ethos);
            return;
        }

        posY += fallSpeed;
        ethos.style.transform = `translateY(${posY}px)`;

        const playerRect = player.getBoundingClientRect();
        const ethosRect = ethos.getBoundingClientRect();

        const isOverlap =
            playerRect.left < ethosRect.right &&
            playerRect.right > ethosRect.left &&
            playerRect.top < ethosRect.bottom &&
            playerRect.bottom > ethosRect.top;

        if (isOverlap) {
            ethos.remove();
            activeDecorations = activeDecorations.filter(e => e !== ethos);

            score += 5;
            scoreDisplay.innerText = "Score: " + score;
            return;
        }

        if (posY > game.offsetHeight) {
            ethos.remove();
            activeDecorations = activeDecorations.filter(e => e !== ethos);
            return;
        }

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}

function startGame() {
    score = 0;
    isGameOver = false;
    playerPositionX = 2;
    playerPositionY = 0;
    startTime = Date.now();
    scoreDisplay.innerText = "Score: 0";
    player.style.left = getLaneLeftPercent(playerPositionX);
    player.style.bottom = getLaneBottomPercent(playerPositionY);
    gameOverScreen.classList.add("hidden");
    document.querySelectorAll(".enemy").forEach(e => e.remove());
    document.querySelectorAll(".decoration").forEach(e => e.remove());
    activeEnemies = [];
    activeDecorations = [];

    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {
        console.warn("Audio autoplay mungkin diblokir oleh browser.");
    });

    const enemiesPerWave = Math.min(1 + Math.floor(score / 10), 3);
    for (let i = 0; i < enemiesPerWave; i++) {
        setTimeout(spawnEnemy, i * 250);
    }
    setTimeout(spawnEthosDecoration, Math.floor(Math.random() * 1200));

    spawnInterval = setInterval(() => {
        const enemiesPerWave = Math.min(1 + Math.floor(score / 10), 3);
        for (let i = 0; i < enemiesPerWave; i++) {
            setTimeout(spawnEnemy, i * 250);
        }
        setTimeout(spawnEthosDecoration, Math.floor(Math.random() * 1200));
    }, 1200);
}

function endGame() {
    isGameOver = true;
    clearInterval(spawnInterval);

    const gameOverTitle = document.querySelector("#game-over-content h2");
    const finalScoreText = document.getElementById("final-score");
    const congratsMessage = document.getElementById("congrats-message");

    if (score >= 100) {
        // Hide "Game Over"
        if (gameOverTitle) gameOverTitle.style.display = "none";

        // Show congratulations
        if (congratsMessage) congratsMessage.style.display = "block";

        // Generate kode acak 8 karakter (huruf & angka)
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomCode = '';
        for (let i = 0; i < 8; i++) {
            randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        finalScoreText.innerText = `YOU GET SCORE: ${score} \nHERE YOUR CODE TO GET SOME $AIR \n ${randomCode}`;

    } else {
        // Show regular Game Over
        if (gameOverTitle) gameOverTitle.style.display = "block";
        if (congratsMessage) congratsMessage.style.display = "none";

        finalScoreText.innerText = `Final Score: ${score}`;
    }

    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("new-game-btn").classList.remove("hidden");
    document.getElementById("home-btn").classList.remove("hidden");
    document.getElementById("start-game-btn").style.display = "none";

    bgMusic.pause();
}



// Event tombol Start Game (hanya muncul di awal)
startGameBtn.addEventListener("click", () => {
    startGameBtn.style.display = "none";
    newGameBtn.classList.add("hidden");
    homeBtn.classList.add("hidden");
    startGame();
});

// Event tombol New Game (muncul saat game over)
newGameBtn.addEventListener("click", () => {
    newGameBtn.classList.add("hidden");
    startGame();
});

homeBtn.addEventListener("click", () => {
    game.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    document.getElementById("intro-section").style.display = "flex";
    document.getElementById("start-game-btn").style.display = "block";
    document.getElementById("gamelabel").style.display = "block";
    document.getElementById("myx").style.display = "block";
    document.getElementById("xlabel").style.display = "block";
    document.getElementById("asteroidlabel").style.display = "block";
    document.getElementById("asteroid-game").style.display = "block";
    document.getElementById("smtlabel").style.display = "block";
    document.getElementById("adm-smt").style.display = "block";
    bgMusic.pause();
});
// Jangan panggil startGame otomatis saat page load
// window.onload = startGame;

// Backsound mulai setelah interaksi user
//window.addEventListener("click", () => {
//    if (!isGameOver && bgMusic.paused) {
//        bgMusic.play().catch(() => {
//            console.warn("Audio tidak bisa diputar otomatis.");
//        });
//    }
//}, { once: true });

//window.addEventListener("keydown", () => {
//    if (!isGameOver && bgMusic.paused) {
//        bgMusic.play().catch(() => {
//            console.warn("Audio tidak bisa diputar otomatis.");
//        });
//    }
//}, { once: true });
