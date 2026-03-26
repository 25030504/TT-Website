// SIGN UP
const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Account created!");
    window.location.href = "login.html";
  });
}

// LOGIN
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("No account found");
      return;
    }

    if (email === storedUser.email && password === storedUser.password) {
      alert(`Welcome ${storedUser.name}`);
      window.location.href = "../index.html";
    } else {
      alert("Invalid credentials");
    }
  });
}
