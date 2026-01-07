import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const msg = document.getElementById("msgLogin");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", () => {
  senha.type = senha.type === "password" ? "text" : "password";
});

btnLogin.addEventListener("click", async () => {
  if (!email.value || !senha.value) {
    msg.textContent = "Informe e-mail e senha.";
    msg.className = "login-msg erro";
    return;
  }

  btnLogin.classList.add("loading");
  btnLogin.disabled = true;
  msg.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email.value, senha.value);
    msg.textContent = "Login realizado com sucesso!";
    msg.className = "login-msg sucesso";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);

  } catch (err) {
    msg.textContent = "E-mail ou senha inválidos.";
    msg.className = "login-msg erro";
  }

  btnLogin.classList.remove("loading");
  btnLogin.disabled = false;
});
