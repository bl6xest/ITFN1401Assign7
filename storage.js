const LS_USER_KEY = "quez_user";
const LS_COMMENTS_KEY = "quez_comments";
const LS_SONGS_KEY = "quez_sharedSongs";

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(LS_USER_KEY));
    } catch {
        return null;
    }
}
function setUser(userObj) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userObj));
}
function clearUser() {
    localStorage.removeItem(LS_USER_KEY);
}

function getComments() {
    try {
        return JSON.parse(localStorage.getItem(LS_COMMENTS_KEY)) || [];
    } catch {
        return [];
    }
}
function setComments(list) {
    localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(list));
}

function getSharedSongs() {
    try {
        return JSON.parse(localStorage.getItem(LS_SONGS_KEY)) || [];
    } catch {
        return [];
    }
}
function setSharedSongs(list) {
    localStorage.setItem(LS_SONGS_KEY, JSON.stringify(list));
}

function timeNow() {
    return new Date().toLocaleString();
}

// --- Render header user badge if present (call on each page) ---
function renderUserBadge(targetSelector) {
    const container = document.querySelector(targetSelector);
    if (!container) return;
    const user = getUser();
    container.innerHTML = "";
    if (user && user.username) {
        const div = document.createElement("div");
        div.className = "user-badge";
        const img = document.createElement("img");
        img.src = user.avatar || "https://i.imgur.com/8Km9tLL.png";
        img.alt = "avatar";
        img.style.width = "28px";
        img.style.height = "28px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        const name = document.createElement("span");
        name.textContent = user.username;
        const logout = document.createElement("button");
        logout.textContent = "Log out";
        logout.style.marginLeft = "8px";
        logout.style.padding = "6px 8px";
        logout.style.borderRadius = "12px";
        logout.style.border = "none";
        logout.style.cursor = "pointer";
        logout.onclick = () => {
            clearUser();
            // refresh page to update UI \\
            location.reload();
        };
        div.appendChild(img);
        div.appendChild(name);
        div.appendChild(logout);
        container.appendChild(div);
    } else {
        // show link to create account \\
        const a = document.createElement("a");
        a.href = "create-account.html";
        a.textContent = "Create account";
        a.style.color = "#f5a380";
        a.style.textDecoration = "none";
        container.appendChild(a);
    }
}

// --- Create Account page --- \\
function initCreateAccountPage() {
    const form = document.getElementById("createAccountForm");
    const msg = document.getElementById("create-msg");
    renderUserBadge("#userPlace");
    if (!form) return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const avatar = document.getElementById("avatar").value.trim();
        if (!username) {
            msg.textContent = "Pick a username.";
            return;
        }
        const userObj = { username, email, avatar };
        setUser(userObj);
        msg.textContent = "Account created — you are now logged in!";
        msg.style.color = "#bfffd6";
        renderUserBadge("#userPlace");
        form.reset();
    });
}

// --- Comments page -- \\
function initCommentsPage() {
    renderUserBadge("#userPlace");
    const form = document.getElementById("commentForm");
    const list = document.getElementById("commentsList");
    const user = getUser();
    // load existing
    function renderComments() {
        const comments = getComments();
        list.innerHTML = "";
        if (!comments.length) {
            list.innerHTML = "<p>No comments yet. Be the first!</p>";
            return;
        }
        comments
            .slice()
            .reverse()
            .forEach((c) => {
                const div = document.createElement("div");
                div.className = "comment";
                div.innerHTML = `<strong>${escapeHtml(c.user)}</strong> <span style="opacity:0.7;font-size:0.85rem">· ${escapeHtml(c.time)}</span>
                <p style="margin-top:6px">${escapeHtml(c.text)}</p>`;
                list.appendChild(div);
            });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = document.getElementById("commentText").value.trim();
            const curUser = getUser();
            if (!curUser) {
                alert("Please create an account first on the Create Account page.");
                return;
            }
            if (!text) return;
            const comments = getComments();
            comments.push({ user: curUser.username, text, time: timeNow() });
            setComments(comments);
            document.getElementById("commentText").value = "";
            renderComments();
        });
    }
    renderComments();
}

// --- Share music page --- \\
function initShareMusicPage() {
    renderUserBadge("#userPlace");
    const form = document.getElementById("shareForm");
    const list = document.getElementById("sharedList");

    function renderShared() {
        const songs = getSharedSongs();
        list.innerHTML = "";
        if (!songs.length) {
            list.innerHTML = "<p>No shared songs yet. Share yours!</p>";
            return;
        }
        songs
            .slice()
            .reverse()
            .forEach((s) => {
                const div = document.createElement("div");
                div.className = "shared-song";
                const img = document.createElement("img");
                img.src = s.cover || "https://i.imgur.com/8Km9tLL.png";
                img.alt = "cover";
                img.style.width = "64px";
                img.style.height = "64px";
                img.style.borderRadius = "10px";
                img.style.objectFit = "cover";
                const inner = document.createElement("div");
                inner.innerHTML = `<strong>${escapeHtml(s.title)}</strong><br>
                               ${escapeHtml(s.artist)}<br>
                               <small style="opacity:0.8">${escapeHtml(s.user)} · ${escapeHtml(s.time)}</small>`;
                const link = document.createElement("a");
                link.href = s.link || "#";
                link.target = "_blank";
                link.textContent = "Open";
                link.style.marginLeft = "auto";
                link.style.color = "#f5a380";
                div.appendChild(img);
                div.appendChild(inner);
                div.appendChild(link);
                list.appendChild(div);
            });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("songTitle").value.trim();
            const artist = document.getElementById("songArtist").value.trim();
            const link = document.getElementById("songLink").value.trim();
            const cover = document.getElementById("songCover").value.trim();
            const curUser = getUser();
            if (!curUser) {
                alert("Please create an account first on the Create Account page.");
                return;
            }
            if (!title || !artist) return;
            const songs = getSharedSongs();
            songs.push({ title, artist, link, cover, user: curUser.username, time: timeNow() });
            setSharedSongs(songs);
            form.reset();
            renderShared();
        });
    }
    renderShared();
}

// --- small escape helper ---
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// --- auto-init: detect which page and init appropriate functions ---
document.addEventListener("DOMContentLoaded", () => {
    // render user badge placeholder if present
    const userPlace = document.querySelector("#userPlace");
    if (userPlace) renderUserBadge("#userPlace");

    // create-account page
    if (document.getElementById("createAccountForm")) {
        initCreateAccountPage();
    }

    // comments page
    if (document.getElementById("commentForm")) {
        initCommentsPage();
    }

    // share music page
    if (document.getElementById("shareForm")) {
        initShareMusicPage();
    }
});
