const art = document.getElementById("asciiArt");
let clickCount = 0;
let hasReceivedCode = false;
const tapSound = new Audio("img/tap.mp3");

// Fungsi buat generate kode acak 8 karakter
function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Fungsi buat munculin modal
function showModal(code) {
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = 0;
    modalOverlay.style.left = 0;
    modalOverlay.style.width = "100vw";
    modalOverlay.style.height = "100vh";
    modalOverlay.style.background = "rgba(0, 0, 0, 0.8)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.zIndex = 9999;

    const modalBox = document.createElement("div");
    modalBox.style.background = "white";
    modalBox.style.padding = "30px";
    modalBox.style.borderRadius = "10px";
    modalBox.style.boxShadow = "0 0 20px rgba(255,255,255,0.5)";
    modalBox.style.textAlign = "center";
    modalBox.style.maxWidth = "90%";

    const message = document.createElement("div");
    message.style.fontSize = "22px";
    message.style.fontWeight = "bold";
    message.style.marginBottom = "20px";
    message.style.color = "BLACK"; // warna teks jadi putih
    message.innerText = code;

    const button = document.createElement("button");
    button.innerText = "OKAY";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.background = "black";
    button.style.color = "white";
    button.style.cursor = "pointer";

    button.onclick = () => {
        modalOverlay.remove();
    };

    modalBox.appendChild(message);
    modalBox.appendChild(button);
    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);
}

art.addEventListener("click", (e) => {

    tapSound.currentTime = 0;
    tapSound.play().catch(() => { });

    art.classList.add("glitch");

    setTimeout(() => {
        art.classList.remove("glitch");
    }, 50);

    // Tambahkan +1 efek
    const plusOne = document.createElement("div");
    plusOne.textContent = "+1";
    plusOne.style.position = "fixed";
    plusOne.style.left = `${e.clientX}px`;
    plusOne.style.top = `${e.clientY}px`;
    plusOne.style.fontSize = "50px";
    plusOne.style.fontWeight = "bold";
    plusOne.style.color = "white";
    plusOne.style.textShadow = "0 0 5px #000";
    plusOne.style.pointerEvents = "none";
    plusOne.style.animation = "floatUp 0.5s ease-out forwards";
    plusOne.style.filter = "drop-shadow(0 0 4px white)";
    document.body.appendChild(plusOne);

    setTimeout(() => {
        plusOne.remove();
    }, 500);

    // Tambah counter klik
    clickCount++;

    if (clickCount % 40 === 0) {
        let message = "";

        if (clickCount === 40 && !hasReceivedCode) {
            const code = generateRandomCode();
            message = `YOU WON $AIR!\nHERE YOUR CODE:\n${code}`;
            hasReceivedCode = true; // ← Tambahkan ini agar code hanya muncul sekali
        } else if (hasReceivedCode) {
            const funnyMessages = [
                "BRO YOU CLICK TOO MUCH 💀",
                "THIS ISN'T A COOKIE CLICKER 🫠",
                "STILL TAPS? YOU'RE DEDICATED 🤓",
                "404: MERCY NOT FOUND 🧠",
                "I'M JUST ASCII... LET ME REST 😩",
                "STOP IT...",
                "NOTHING LEFT TO WIN AGAIN 😵",
                "AIR IS GONE BRO, GONE 🫥",
                "IS YOUR FINGER OK? 🖐️",
                "STOP TAP ME YOU ALREADY GET $AIR 🤨"
            ];
            message = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        } else {
            return; // ← Jika belum sampai klik ke-20 dan belum dapat code, jangan lakukan apa-apa
        }

        showModal(message);
    }

});

function spawnBinary() {
    const binary = document.createElement("div");
    binary.classList.add("binary");
    binary.textContent = Math.random() > 0.5 ? "1" : "0";

    binary.style.left = `${Math.random() * 100}vw`;
    binary.style.animationDuration = `${2 + Math.random() * 3}s`;
    binary.style.fontSize = `${12 + Math.random() * 18}px`;

    document.getElementById("binary-container").appendChild(binary);

    setTimeout(() => {
        binary.remove();
    }, 5000);
}

// Looping terus menerus
setInterval(spawnBinary, 80);
