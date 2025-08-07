const user = document.getElementById("user");
const bots = [];
for (let i = 1; i <= 17; i++) {
    bots.push(document.getElementById(`bot${i}`));
}
const bgms = document.getElementById("bgm");
const doll = document.getElementById("doll");
const message = document.getElementById("message");

let safe = true;
let gameOver = false;
let keys = {};
let finishPopupShown = false;

// Posisi awal
let userY = 10;
let userX = 320;

let userDead = false;


let botPositions = bots.map((bot, i) => {
    const y = 0;
    const x = (i % 6) * 90 + Math.random() * 20; // posisi menyebar tiap 90px

    return {
        y,
        x,
        moveCooldown: 0,
        shouldMove: false,
        isDead: false,
        speed: Math.random() * 1.2 + 0.3,
        decisionDelay: Math.floor(Math.random() * 60) + 10,
        recklessLevel: Math.random() * 0.05
    };
});




function startRandomDollLoop() {
    function toggle() {
        if (finishPopupShown) {
            // Paksa doll tetap menghadap depan saat game benar-benar selesai
            doll.src = "img/dollfront.png";
            doll.style.width = "100px";
            return;
        }

        safe = !safe;
        if (safe) {
            doll.src = "img/dollback.png";
            doll.style.width = "60px";
        } else {
            doll.src = "img/dollfront.png";
            doll.style.width = "100px";
        }

        const delay = Math.random() * 3000 + 2000;
        setTimeout(toggle, delay);
    }

    toggle();
}

startRandomDollLoop();


function updateUser() {
    if (userDead || gameOver) return;
    const userSpeed = 1; 
    let prevY = userY;

    if (keys["w"] || keys["ArrowUp"]) userY += userSpeed;
    if (keys["s"] || keys["ArrowDown"]) userY -= userSpeed;
    if (keys["a"] || keys["ArrowLeft"]) userX -= userSpeed;
    if (keys["d"] || keys["ArrowRight"]) userX += userSpeed;


    userY = Math.max(0, Math.min(760, userY));
    userX = Math.max(0, Math.min(560, userX));

    if (!safe && userY !== prevY) {
        message.textContent = "❌ You moving! GAME OVER";
        userDead = true;

        // Tambahan biar bot tetap jalan walau user mati
        user.style.opacity = 0.3;
        user.style.filter = "grayscale(100%)";
        return;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 8; i++) {
        randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    user.style.bottom = `${userY}px`;
    user.style.left = `${userX}px`;
    if (userY >= 590) {
        user.style.border = "2px solid gold";
    }
    if (userY > 660 && !gameOver) {
        message.textContent = `🏆 You Won! Here Your Code ${randomCode}`;
        gameOver = true;
    }


}

function updateBots() {
   
    botPositions.forEach((pos, i) => {
        if (pos.isDead) return;

        const prevY = pos.y;

        // Waktu ambil keputusan baru
        if (pos.decisionDelay <= 0) {
            const recklessChance = safe ? 0.95 : pos.recklessLevel;
            pos.shouldMove = Math.random() < recklessChance;
            pos.decisionDelay = Math.floor(Math.random() * 60) + 20;
        } else {
            pos.decisionDelay--;
        }

        // Kalau saat ini boleh jalan (lampu hijau atau nekat)
        //if (pos.shouldMove && (safe || Math.random() < pos.recklessLevel)) {
        //    const dy = pos.speed;
        //    const dx = (Math.random() - 0.5) * 0.5;

        //    pos.y += dy;
        //    pos.x += dx;
        //    pos.x = Math.max(0, Math.min(560, pos.x));
        //}

        if (pos.shouldMove && (safe || Math.random() < pos.recklessLevel)) {
            const dy = pos.speed * 0.5;
            pos.y += dy;

            // Hindari tumpukan
            for (let j = 0; j < botPositions.length; j++) {
                if (j === i || botPositions[j].isDead) continue;

                const other = botPositions[j];
                const dx = pos.x - other.x;
                const dy = pos.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 40) {
                    pos.x += dx * 0.1;
                    pos.y += dy * 0.1;
                }
            }

            pos.x = Math.max(0, Math.min(560, pos.x)); // biar ga keluar game
        }

        // ❌ Mati kalo nekat saat merah
        if (!safe) {
            const deltaY = pos.y - prevY;
            if (deltaY > 0.6 && Math.random() < 0.5) {
                pos.isDead = true;
                bots[i].style.opacity = 0.2;
                bots[i].style.filter = "grayscale(100%)";
                bots[i].style.border = "none";
                return;
            }
        }

        // Menang
        if (pos.y >= 660) {
            bots[i].style.border = "2px solid gold";
        }

        // Apply posisi
        bots[i].style.bottom = `${pos.y}px`;
        bots[i].style.left = `${pos.x}px`;
    });
}

function checkGameFinish() {
    if (finishPopupShown) return;

    const allBotsFinished = botPositions.every(bot => bot.isDead || bot.y > 660);
    const userMenang = userY > 660;

    if (allBotsFinished && (userMenang || userDead)) {
        finishPopupShown = true;

        // Paksa doll berhenti dan tampil depan
        doll.src = "img/dollfront.png";
        doll.style.width = "100px";

        // Tampilkan kotak finish
        document.getElementById("finishBox").style.display = "block";

        bgms.pause();
    }
}


function restartGame() {
    location.reload(); // reset game
}

function goHome() {
    window.location.href = "index.html"; // ganti ke halaman home kamu
}


function loop() {
    updateUser();
    updateBots();
    checkGameFinish(); 
    requestAnimationFrame(loop);
}
loop();

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
