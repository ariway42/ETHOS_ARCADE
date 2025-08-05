const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
let gameOver = false;

let score = 0;
let bullets = [];
let asteroids = [];
let keys = {};
let bulletInterval = null;
let asteroidInterval = null;
const laneCount = 7;
let playerPositionX = 2;
let playerPositionY = 0;



const gameWidth = 500;
const gameHeight = 600;
const shipSpeed = 5;
const bulletSpeed = 8;
let asteroidSpeed = 2;
const fireRate = 500; // milliseconds


const phrases = [
    "Wen code sir",
    "No code no sleep",
    "Gimme now sir",
    "LFG SORR",
    "GM SORR",
    "Gimme $AIR",
    "Am Tweet like a Boss",
];

// Move player left/right
document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (e.key === ' ' && !bulletInterval) {
        bulletInterval = setInterval(shootBullet, fireRate);
    }
});
function getLaneLeftPercent(laneIndex) {
    const gameArea = document.getElementById("gameArea");
    const gameWidth = gameArea.clientWidth;
    const laneCount = 7; // Jumlah lane, sesuaikan
    const arrowWidth = 40; // Lebar elemen pesawat/panah, sesuaikan juga

    const laneWidth = gameWidth / laneCount;
    const laneCenter = (laneIndex * laneWidth) + (laneWidth / 2);
    const leftPosition = laneCenter - (arrowWidth / 2);

    // Hindari overflow kanan
    const maxLeft = gameWidth - arrowWidth;
    const safeLeft = Math.min(leftPosition, maxLeft);

    return `${safeLeft}px`;
}

function getLaneBottomPercent(laneIndex) {
    const baseBottomPx = 5;
    const stepPercent = 5;
    return `${baseBottomPx + playerPositionY * stepPercent}%`;
}

document.addEventListener('keyup', function (e) {
    keys[e.key] = false;
    if (e.key === ' ') {
        clearInterval(bulletInterval);
        bulletInterval = null;
    }
});

document.querySelectorAll("#controller .arrow").forEach(btn => {
    btn.addEventListener("touchstart", () => handleControl(btn.dataset.dir));
    btn.addEventListener("mousedown", () => handleControl(btn.dataset.dir));
});

function handleControl(direction) {
    if (gameOver) return;

    switch (direction) {
        case "left":
            if (playerPositionX > -1) playerPositionX--;
            break;
        case "right":
            if (playerPositionX < laneCount - 3) playerPositionX++;
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


function moveUp() {
    const top = parseInt(player.style.top || (gameArea.offsetHeight - player.offsetHeight - 10));
    player.style.top = Math.max(0, top - shipSpeed) + 'px';
}

function moveDown() {
    const top = parseInt(player.style.top || (gameArea.offsetHeight - player.offsetHeight - 10));
    player.style.top = Math.min(gameArea.offsetHeight - player.offsetHeight, top + shipSpeed) + 'px';
}

function holdUp() {
    clearInterval(moveInterval);
    moveInterval = setInterval(moveUp, 50);
}

function holdDown() {
    clearInterval(moveInterval);
    moveInterval = setInterval(moveDown, 50);
}


// Ship movement loop
function movePlayer() {
    let left = parseInt(player.style.left) || 0;
    let bottom = parseInt(player.style.bottom) || 0;

    if (keys['ArrowLeft'] && left > - 50) {
        player.style.left = `${left - shipSpeed}px`;
    }
    if (keys['ArrowRight'] && left < gameWidth - 120) {
        player.style.left = `${left + shipSpeed}px`;
    }
    if (keys['ArrowUp'] && bottom < gameHeight - player.offsetHeight) {
        player.style.bottom = `${bottom + shipSpeed}px`;
    }
    if (keys['ArrowDown'] && bottom > 0) {
        player.style.bottom = `${bottom - shipSpeed}px`;
    }
}

function showPhrase(x, y) {
    const phrase = document.createElement('div');
    phrase.classList.add('phrase');
    phrase.innerText = phrases[Math.floor(Math.random() * phrases.length)];
    phrase.style.left = `${x}px`;
    phrase.style.top = `${y}px`;
    gameArea.appendChild(phrase);

    setTimeout(() => {
        phrase.remove();
    }, 1000); // Hapus setelah 1 detik
}


// Create a bullet
function shootBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    gameArea.appendChild(bullet);

    const playerLeft = parseInt(player.style.left) || 0;
    const playerBottom = parseInt(player.style.bottom) || 0;

    bullet.style.left = `${playerLeft + player.offsetWidth / 2 - 5}px`; // -5 biar peluru di tengah (asumsi peluru 10px)
    bullet.style.bottom = `${playerBottom + player.offsetHeight}px`; // muncul di atas pesawat

    bullets.push(bullet);
}



// Update bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        let bottom = parseInt(bullet.style.bottom);
        if (bottom > gameHeight) {
            bullet.remove();
            bullets.splice(index, 1);
        } else {
            bullet.style.bottom = `${bottom + bulletSpeed}px`;
        }
    });
}

// Spawn asteroid
function spawnAsteroid() {
    const asteroid = document.createElement('div');
    asteroid.classList.add('asteroid');
    const x = Math.floor(Math.random() * (gameWidth - 40));
    asteroid.style.left = `${x}px`;
    asteroid.style.top = `0px`;

    // Tambahkan properti kecepatan awal (1) dan target (global)
    asteroid.dataset.speed = 1; // mulai dari pelan
    asteroid.dataset.targetSpeed = asteroidSpeed;

    gameArea.appendChild(asteroid);
    asteroids.push(asteroid);
}


// Update asteroids
function updateAsteroids() {
    asteroids.forEach((asteroid, index) => {
        let top = parseFloat(asteroid.style.top);
        let speed = parseFloat(asteroid.dataset.speed);
        const targetSpeed = parseFloat(asteroid.dataset.targetSpeed);

        // Naikkan kecepatan pelan-pelan menuju targetSpeed
        if (speed < targetSpeed) {
            speed += 0.1;
            asteroid.dataset.speed = speed;
        }

        if (top > gameHeight) {
            asteroid.remove();
            asteroids.splice(index, 1);
        } else {
            asteroid.style.top = `${top + speed}px`;
        }
    });
}

// Collision detection
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        const bRect = bullet.getBoundingClientRect();
        asteroids.forEach((asteroid, aIndex) => {
            const aRect = asteroid.getBoundingClientRect();
            if (
                bRect.left < aRect.right &&
                bRect.right > aRect.left &&
                bRect.top < aRect.bottom &&
                bRect.bottom > aRect.top
            ) {
                const x = parseInt(asteroid.style.left);
                const y = parseInt(asteroid.style.top);
                showPhrase(x, y); // 👈 Tambahkan ini buat munculin kata-kata

                bullet.remove();
                asteroid.remove();
                bullets.splice(bIndex, 1);
                asteroids.splice(aIndex, 1);
                score += 10;
                scoreDisplay.innerText = `Score: ${score}`;
            }
        });
    });
}

function checkPlayerCollision() {
    const playerRect = player.getBoundingClientRect();

    asteroids.forEach((asteroid) => {
        const asteroidRect = asteroid.getBoundingClientRect();

        // Padding toleransi agar tidak terlalu sensitif
        const padding = 50;

        if (
            playerRect.left < asteroidRect.right - padding &&
            playerRect.right > asteroidRect.left + padding &&
            playerRect.top < asteroidRect.bottom - padding &&
            playerRect.bottom > asteroidRect.top + padding
        ) {
            endGame(); // ✅ Tabrakan valid, end game
        }
    });
}


function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}


// Game loop
function gameLoop() {
    if (!gameOver) {
        movePlayer();
        updateBullets();
        updateAsteroids();
        checkCollisions();
        checkPlayerCollision(); // 🆕 Tambahin ini
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameOver = true;
    clearInterval(asteroidInterval);
    clearInterval(bulletInterval);
    music.pause();
    music.currentTime = 0;
    // Hide player and remaining asteroids/bullets
    player.style.display = 'none';
    asteroids.forEach(a => a.remove());
    bullets.forEach(b => b.remove());

    // Reset array
    asteroids = [];
    bullets = [];

    if (score > 130) {
        document.getElementById('codeReveal').style.display = 'block';
        const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        document.getElementById('secretCode').innerText = `Code: ${randomCode}`;
    } else {
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('finalScore').innerText = `Your score: ${score}`;
    }
}

function restartGame() {
    location.reload(); // reload page aja biar gampang
}
function goHome() {
 window.location.href = 'index.html'; // contoh redirect
}

const music = document.getElementById("bgMusic");

function startGame() {
    player.style.left = '225px'; // Initial position
    setInterval(shootBullet, fireRate);
    asteroidInterval = setInterval(spawnAsteroid, 1000);
    gameLoop();

    // Play music
    music.play().catch(err => {
        console.warn("Audio play blocked until user interacts:", err);
    });

    // Sembunyikan tombol setelah game mulai
    document.getElementById("startBtn").style.display = "none";
}


setInterval(() => {
    if (!gameOver) {
        asteroidSpeed += 1; // tambah kecepatannya
        console.log("Asteroid speed increased to", asteroidSpeed);
    }
}, 20000); // setiap 20 detik

let asteroidSpawnRate = 1000;

function increaseAsteroidSpawn() {
    if (asteroidInterval) clearInterval(asteroidInterval);
    asteroidSpawnRate = Math.max(200, asteroidSpawnRate - 100); // jangan lebih cepat dari 200ms
    asteroidInterval = setInterval(spawnAsteroid, asteroidSpawnRate);
}

setInterval(() => {
    if (!gameOver) {
        asteroidSpeed += 1;
        increaseAsteroidSpawn();
    }
}, 20000);

document.getElementById("startBtn").addEventListener("click", startGame);
