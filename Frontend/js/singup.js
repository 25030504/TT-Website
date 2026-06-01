/* ================================================
   SINGUP.JS — The Kinetic Court
   - Si ya hay sesión activa → redirige al foro
   - Llama a POST /api/register
   - Muestra indicador de fuerza de contraseña
   - Al registrarse con éxito → redirige al login
     con un parámetro ?registered=1 para mostrar
     un mensaje de bienvenida allí
   ================================================ */

const API = "http://127.0.0.1:8000/api";

/* ── Si ya está logueado, ir al foro ── */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("tkc_token")) {
    window.location.href = "./forum.html";
    return;
  }

  // Mostrar mensaje de éxito si viene desde login.html con ?registered=1
  // (esto lo gestiona login.js, aquí no aplica, pero lo dejamos por consistencia)

  // Activar indicador de fuerza al escribir
  document.getElementById("reg-password").addEventListener("input", updateStrength);
});

/* ────────────────────────────────────
   TOGGLE OJO CONTRASEÑA
──────────────────────────────────── */
function togglePassword(inputId, btn) {
  const input  = document.getElementById(inputId);
  const isHide = input.type === "password";
  input.type   = isHide ? "text" : "password";

  btn.innerHTML = isHide
    ? /* ojo tachado */
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238z"/>
        <path d="M13.646 14.354l-12-12 .708-.708 12 12z"/>
      </svg>`
    : /* ojo normal */
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
      </svg>`;
}

/* ────────────────────────────────────
   INDICADOR DE FUERZA DE CONTRASEÑA
──────────────────────────────────── */
function updateStrength() {
  const val   = document.getElementById("reg-password").value;
  const score = getStrengthScore(val);

  const bars  = [
    document.getElementById("bar1"),
    document.getElementById("bar2"),
    document.getElementById("bar3"),
    document.getElementById("bar4"),
  ];
  const label = document.getElementById("strength-label");

  // Limpiar
  bars.forEach(b => { b.className = "strength-bar"; });
  label.className = "strength-label";
  label.textContent = "—";

  if (!val) return;

  if (score <= 1) {
    bars[0].classList.add("weak");
    label.classList.add("weak");
    label.textContent = "Weak";
  } else if (score === 2) {
    bars[0].classList.add("medium");
    bars[1].classList.add("medium");
    label.classList.add("medium");
    label.textContent = "Fair";
  } else if (score === 3) {
    bars[0].classList.add("strong");
    bars[1].classList.add("strong");
    bars[2].classList.add("strong");
    label.classList.add("strong");
    label.textContent = "Good";
  } else {
    bars.forEach(b => b.classList.add("strong"));
    label.classList.add("strong");
    label.textContent = "Strong";
  }
}

function getStrengthScore(pwd) {
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (pwd.length >= 12)             score++;
  if (/[A-Z]/.test(pwd))            score++;
  if (/[0-9]/.test(pwd))            score++;
  if (/[^A-Za-z0-9]/.test(pwd))     score++;
  return Math.min(score, 4);
}

/* ────────────────────────────────────
   MENSAJES
──────────────────────────────────── */
function showMessage(text, type = "error") {
  const el = document.getElementById("auth-message");
  el.className = `auth-message ${type}`;
  el.textContent = text;
  el.classList.remove("d-none");
  if (type === "error") {
    setTimeout(() => el.classList.add("d-none"), 6000);
  }
}

/* ────────────────────────────────────
   LOADER EN BOTÓN
──────────────────────────────────── */
function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = `
      <span class="btn-auth-text">Creating account...</span>
      <div class="spinner-border spinner-border-sm" role="status"></div>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `
      <span class="btn-auth-text">Create my account</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
      </svg>`;
  }
}

/* ────────────────────────────────────
   SUBMIT: REGISTER
──────────────────────────────────── */
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name     = document.getElementById("reg-name").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const btn      = document.getElementById("signupBtn");

  /* Validaciones en el cliente */
  if (!name || !email || !password) {
    showMessage("Please fill in all fields.", "error");
    return;
  }
  if (name.length < 2) {
    showMessage("Name must be at least 2 characters.", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }
  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", "error");
    return;
  }

  setLoading(btn, true);

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // El backend puede devolver errores de validación en data.errors o data.message
      const errorMsg = data.message
        || (data.errors && Object.values(data.errors).flat().join(" "))
        || "Registration failed. Please try again.";
      throw new Error(errorMsg);
    }

    /* Éxito: mostrar mensaje y redirigir al login */
    showMessage("Account created successfully! Redirecting to login...", "success");

    setTimeout(() => {
      // Pasamos ?registered=1 para que login.js muestre un mensaje de bienvenida
      window.location.href = "./login.html?registered=1";
    }, 1200);

  } catch (err) {
    showMessage(err.message || "Something went wrong. Try again.", "error");
    setLoading(btn, false);
  }
});