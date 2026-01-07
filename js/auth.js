import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { auth } from "./firebase.js";

const botao = document.getElementById("btnLogin");

botao.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erro");

    erro.innerText = "";

    if (!email || !senha) {
        erro.innerText = "Preencha email e senha";
        return;
    }

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch((e) => {
            console.error(e);
            erro.innerText = "Email ou senha inválidos";
        });
});
