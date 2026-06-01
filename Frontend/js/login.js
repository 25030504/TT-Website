/* ================================================
   LOGIN.JS — The Kinetic Court
   - Maneja login y register contra la API
   - Si ya hay sesión activa, redirige al foro
   ================================================ */

const API = "http://127.0.0.1:8000/api";

/* ── Al cargar la página ──
   - Si ya hay token válido → ir directo al foro
   - Si viene de ?registered=1 → mostrar mensaje de bienvenida */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("tkc_token")) {
    window.location.href = "./forum.html";
    return;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "1") {
    showMessage("🎉 Account created! Sign in to enter the forum.", "success");
  }
});

/* ── Toggle visibilidad contraseña ── */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.innerHTML = isHidden
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238z"/>
        <path d="M13.646 14.354l-12-12 .708-.708 12 12z"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
      </svg>`;
}

/* ── Mostrar mensajes ── */
function showMessage(text, type = "error") {
  const el = document.getElementById("auth-message");
  el.className = `auth-message ${type}`;
  el.textContent = text;
  el.classList.remove("d-none");
  setTimeout(() => el.classList.add("d-none"), 5000);
}

/* ── Loader en botón ── */
function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-auth-text">Loading...</span>
      <div class="spinner-border spinner-border-sm" role="status"></div>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-auth-text">Enter the Court</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
      </svg>`;
  }
}

/* ── LOGIN ── */
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn      = document.getElementById("loginBtn");

  if (!email || !password) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  setLoading(btn, true);

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // El backend puede devolver mensaje en data.message o data.error
      throw new Error(data.message || data.error || "Invalid credentials.");
    }

    // Guardar token y datos del usuario
    localStorage.setItem("tkc_token", data.token);
    if (data.user) {
      localStorage.setItem("tkc_user", JSON.stringify(data.user));
    }

    showMessage("Welcome back! Redirecting...", "success");

    // Redirigir al foro tras un breve instante
    setTimeout(() => {
      window.location.href = "./forum.html";
    }, 800);

  } catch (err) {
    showMessage(err.message || "Something went wrong. Try again.", "error");
    setLoading(btn, false);
  }
});