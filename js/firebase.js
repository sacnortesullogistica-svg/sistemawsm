import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Configuração REAL do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAql11qZHk9Mhc8rfNVwaNlOEC1ivLpxi8",
  authDomain: "agendamentowsm.firebaseapp.com",
  projectId: "agendamentowsm",
  storageBucket: "agendamentowsm.firebasestorage.app",
  messagingSenderId: "793290884766",
  appId: "1:793290884766:web:4ef455c16f65af2f29dd8f"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
