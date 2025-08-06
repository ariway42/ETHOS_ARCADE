function bonkPost(postId) {
    const post = document.getElementById(postId);

    // ✅ Tambahan validasi: kalau sudah diberi kode, jangan bonk
    if (post.classList.contains('give-code')) return;

    post.classList.add('fade-out');
    setTimeout(() => {
        post.style.display = 'none';
    }, 500);
}

function giveCode(postId) {
    const post = document.getElementById(postId);
    post.classList.add('give-code');
}

function shufflePosts() {
    const container = document.getElementById('post-container');
    const posts = Array.from(container.children);

    for (let i = posts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        container.appendChild(posts[j]);
        posts.splice(j, 1);
    }
}

// Jalanin saat halaman selesai dimuat
window.onload = shufflePosts;