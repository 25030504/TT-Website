/* ================================================
   FORUM.JS — The Kinetic Court
   ================================================ */

const API = "http://127.0.0.1:8000/api";

/* ─────────────────────────────────────────
   AUTH GUARD
───────────────────────────────────────── */
(function authGuard() {
  if (!localStorage.getItem("tkc_token")) {
    sessionStorage.setItem("tkc_redirect", window.location.href);
    window.location.replace("./login.html");
  }
})();

/* ─────────────────────────────────────────
   VARIABLES
───────────────────────────────────────── */
let allPosts     = [];
let activeFilter = "";
let editingId    = null;   // post que se está editando
let deletingId   = null;   // post que se va a eliminar

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  setupUI();
  setupCharCounter();
  getPosts();
});

/* ─────────────────────────────────────────
   USER UI
───────────────────────────────────────── */
function setupUI() {
  const user = JSON.parse(localStorage.getItem("tkc_user"));
  if (!user) { logout(); return; }

  const name    = user.name  || "Player";
  const email   = user.email || "";
  const initial = name.charAt(0).toUpperCase();

  // Navbar
  const navArea = document.getElementById("nav-auth-area");
  if (navArea) {
    navArea.innerHTML = `
      <span class="nav-user-chip">
        <span class="nav-user-avatar">${initial}</span>
        <span class="nav-user-name d-none d-md-inline">${escapeHTML(name)}</span>
      </span>
      <button class="btn btn-outline-light btn-sm" onclick="logout()">Sign Out</button>`;
  }

  // Hero
  const hero = document.getElementById("hero-user-card");
  if (hero) {
    hero.innerHTML = `
      <div class="hero-user-avatar">${initial}</div>
      <div class="hero-user-info">
        <div class="hero-user-name">${escapeHTML(name)}</div>
        <div class="hero-user-role">🟢 Member</div>
      </div>`;
  }

  // Compose + sidebar
  setEl("compose-avatar",  initial);
  setEl("sidebar-avatar",  initial);
  setEl("sidebar-name",    name);
  setEl("sidebar-email",   email);
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ─────────────────────────────────────────
   AUTH HEADERS
───────────────────────────────────────── */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("tkc_token")}`,
  };
}

/* ─────────────────────────────────────────
   GET POSTS
───────────────────────────────────────── */
async function getPosts() {
  try {
    const res = await fetch(`${API}/posts`, { headers: authHeaders() });

    if (res.status === 401) { logout(); return; }

    allPosts = await res.json();
    renderPosts(allPosts);
    updatePostCount(allPosts);
  } catch (err) {
    console.error(err);
    document.getElementById("posts").innerHTML = `
      <div class="forum-empty">
        <div class="forum-empty-icon">⚠️</div>
        <p>Could not load posts. Check your connection.</p>
      </div>`;
  }
}

/* ─────────────────────────────────────────
   RENDER POSTS
───────────────────────────────────────── */
const TAG_LABELS = {
  general:    "💬 General",
  technique:  "🔄 Technique",
  tournament: "🏆 Tournament",
  gear:       "🛒 Gear",
};

function renderPosts(posts) {
  const container   = document.getElementById("posts");
  const currentUser = JSON.parse(localStorage.getItem("tkc_user"));

  const filtered = activeFilter
    ? posts.filter(p => (p.tag || "general") === activeFilter)
    : posts;

  if (!filtered.length) {
    container.innerHTML = `
      <div class="forum-empty">
        <div class="forum-empty-icon">🏓</div>
        <p>No posts yet${activeFilter ? " in this category" : ""}. Be the first!</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(post => {
    const isOwner = Number(currentUser?.id) === Number(post.user_id);
    const initial = post.user?.name?.charAt(0).toUpperCase() || "?";
    const tag     = post.tag || "general";
    const tagLabel = TAG_LABELS[tag] || tag;

    return `
      <div class="forum-post" id="post-${post.id}">
        <div class="forum-avatar">${initial}</div>
        <div class="post-body">
          <div class="post-meta">
            <span class="post-author">${escapeHTML(post.user?.name || "Unknown")}</span>
            <span class="post-tag-badge tag-${tag}">${tagLabel}</span>
          </div>
          <div class="post-content" id="post-content-${post.id}">${escapeHTML(post.content)}</div>
        </div>
        ${isOwner ? `
        <div class="post-actions">
          <button class="post-action-btn post-edit-btn"  onclick="openEditModal(${post.id})"   title="Edit">✏️</button>
          <button class="post-action-btn post-delete-btn-icon" onclick="openDeleteModal(${post.id})" title="Delete">🗑️</button>
        </div>` : ""}
      </div>`;
  }).join("");
}

/* ─────────────────────────────────────────
   CREATE POST
───────────────────────────────────────── */
async function createPost() {
  const textarea = document.getElementById("content");
  const content  = textarea.value.trim();
  const tag      = document.getElementById("current-tag").value || "general";
  if (!content) return;

  const btn = document.querySelector(".btn-forum-post");
  btn.disabled    = true;
  btn.textContent = "Posting...";

  try {
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content, tag }),
    });

    if (!res.ok) throw new Error();

    textarea.value = "";
    document.getElementById("char-count").textContent = "500";
    document.getElementById("char-count").classList.remove("danger");

    // Reset tag selector
    document.querySelectorAll(".forum-tag").forEach(b => b.classList.remove("active"));
    document.querySelector(".forum-tag").classList.add("active");
    document.getElementById("current-tag").value = "general";

    await getPosts();
    showToast("Post published!", "success");
  } catch {
    showToast("Could not create post. Try again.", "error");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Post";
  }
}

/* ─────────────────────────────────────────
   EDIT — abrir modal
───────────────────────────────────────── */
function openEditModal(id) {
  editingId = id;

  const post    = allPosts.find(p => p.id === id);
  const content = post?.content || "";

  const ta  = document.getElementById("edit-content");
  const cnt = document.getElementById("edit-char-count");
  ta.value        = content;
  cnt.textContent = 500 - content.length;
  cnt.style.color = "";

  ta.oninput = () => {
    const rem = 500 - ta.value.length;
    cnt.textContent = rem;
    cnt.style.color = rem < 30 ? "#dc3545" : "#6c757d";
  };

  new bootstrap.Modal(document.getElementById("editModal")).show();
  // Focus al textarea cuando abra el modal
  document.getElementById("editModal").addEventListener(
    "shown.bs.modal", () => ta.focus(), { once: true }
  );
}

/* ─────────────────────────────────────────
   EDIT — guardar   PUT /api/posts/:id
───────────────────────────────────────── */
async function saveEdit() {
  const content = document.getElementById("edit-content").value.trim();
  const btn     = document.getElementById("edit-save-btn");
  if (!content || !editingId) return;

  btn.disabled    = true;
  btn.textContent = "Saving...";

  try {
    const res = await fetch(`${API}/posts/${editingId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });

    if (res.status === 401) { logout(); return; }
    if (res.status === 403) { showToast("You can't edit this post.", "error"); return; }
    if (!res.ok) throw new Error();

    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    editingId = null;
    await getPosts();
    showToast("Post updated!", "success");
  } catch {
    showToast("Could not save changes.", "error");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Save changes";
  }
}

/* ─────────────────────────────────────────
   DELETE — abrir modal de confirmación
───────────────────────────────────────── */
function openDeleteModal(id) {
  deletingId = id;
  new bootstrap.Modal(document.getElementById("deleteModal")).show();
}

/* ─────────────────────────────────────────
   DELETE — confirmar   DELETE /api/posts/:id
───────────────────────────────────────── */
async function confirmDelete() {
  if (!deletingId) return;

  const btn = document.getElementById("delete-confirm-btn");
  btn.disabled    = true;
  btn.textContent = "Deleting...";

  try {
    const res = await fetch(`${API}/posts/${deletingId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.status === 401) { logout(); return; }
    if (res.status === 403) { showToast("You can't delete this post.", "error"); return; }
    if (!res.ok) throw new Error();

    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
    deletingId = null;
    await getPosts();
    showToast("Post deleted.", "success");
  } catch {
    showToast("Could not delete post.", "error");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Delete";
  }
}

/* ─────────────────────────────────────────
   TAGS & FILTROS
───────────────────────────────────────── */
function setTag(btn, tag) {
  document.querySelectorAll(".forum-tag").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("current-tag").value = tag;
}

function filterPosts(btn, tag) {
  document.querySelectorAll(".forum-filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeFilter = tag;
  renderPosts(allPosts);
}

/* ─────────────────────────────────────────
   CHAR COUNTER
───────────────────────────────────────── */
function setupCharCounter() {
  const ta  = document.getElementById("content");
  const cnt = document.getElementById("char-count");
  if (!ta || !cnt) return;
  ta.addEventListener("input", () => {
    const rem = 500 - ta.value.length;
    cnt.textContent = rem;
    cnt.classList.toggle("danger", rem < 30);
  });
}

/* ─────────────────────────────────────────
   STATS SIDEBAR
───────────────────────────────────────── */
function updatePostCount(posts) {
  const user = JSON.parse(localStorage.getItem("tkc_user"));
  if (!user) return;
  const count = posts.filter(p => Number(p.user_id) === Number(user.id)).length;
  setEl("stat-posts", count);
}

/* ─────────────────────────────────────────
   LOGOUT
───────────────────────────────────────── */
function logout() {
  localStorage.clear();
  window.location.href = "./login.html";
}

/* ─────────────────────────────────────────
   TOAST — reemplaza alert()
───────────────────────────────────────── */
function showToast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText =
      "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `forum-toast forum-toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}