import { db, auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  /* ===================== DASHBOARD ===================== */
  const totalAgendamentosEl = document.getElementById("totalAgendamentos");
  const totalGalpaoEl = document.getElementById("totalGalpao");
  const totalRotaEl = document.getElementById("totalRota");
  const totalEntregueEl = document.getElementById("totalEntregue");
  const graficoSituacaoEl = document.getElementById("graficoSituacao").getContext("2d");
  const graficoStatusEl = document.getElementById("graficoStatus").getContext("2d");

  let graficoSituacao, graficoStatus;

  function atualizarDashboard(snapshot) {
    let total = 0, noGalpao = 0, emRota = 0, entregues = 0;

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      total++;
      if (d.situacao === "No Galpão") noGalpao++;
      if (d.situacao === "Em Rota") emRota++;
      if (d.status === "Entregue") entregues++;
    });

    totalAgendamentosEl.innerText = total;
    totalGalpaoEl.innerText = noGalpao;
    totalRotaEl.innerText = emRota;
    totalEntregueEl.innerText = entregues;

    // Atualizar gráficos
    const situacoes = [noGalpao, emRota, total - (noGalpao + emRota)];
    const status = [entregues, total - entregues];

    if (graficoSituacao) graficoSituacao.destroy();
    if (graficoStatus) graficoStatus.destroy();

    graficoSituacao = new Chart(graficoSituacaoEl, {
      type: 'doughnut',
      data: {
        labels: ['No Galpão', 'Em Rota', 'Outros'],
        datasets: [{
          data: situacoes,
          backgroundColor: ['#2563eb', '#f59e0b', '#9ca3af']
        }]
      }
    });

    graficoStatus = new Chart(graficoStatusEl, {
      type: 'doughnut',
      data: {
        labels: ['Entregues', 'Pendentes'],
        datasets: [{
          data: status,
          backgroundColor: ['#16a34a', '#ef4444']
        }]
      }
    });
  }

  /* ===================== TOAST + LOADING ===================== */
  const toast = document.getElementById("toast");
  const loading = document.getElementById("loading");

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function showLoading() { loading.classList.add("show"); }
  function hideLoading() { loading.classList.remove("show"); }

  /* ===================== LOGOUT ===================== */
  document.getElementById("btnLogout")?.addEventListener("click", async () => {
    if (!confirm("Deseja sair do sistema?")) return;
    await signOut(auth);
    window.location.href = "index.html";
  });

  /* ===================== ABAS ===================== */
  document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".aba").forEach(a => a.classList.remove("ativa"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.aba).classList.add("ativa");
    });
  });

  /* ===================== AGENDAMENTOS ===================== */
  const tabelaAg = document.getElementById("tabelaAgendamentos");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const situacaoSelect = document.getElementById("situacao");
  const motoristaSelect = document.getElementById("motorista");
  let idEditandoAg = null;

  function controlarMotorista() {
    motoristaSelect.disabled = situacaoSelect.value === "No Galpão";
    if (motoristaSelect.disabled) motoristaSelect.value = "";
  }
  situacaoSelect.addEventListener("change", controlarMotorista);
  controlarMotorista();

  const agQuery = query(collection(db, "agendamentos"), orderBy("data", "asc"));

  // Botão cancelar edição agendamento
  const btnCancelarAg = document.createElement("button");
  btnCancelarAg.innerText = "Cancelar Alteração";
  btnCancelarAg.className = "btn-cancelar";
  btnCancelarAg.style.display = "none";
  btnAdicionar.parentNode.appendChild(btnCancelarAg);
  btnCancelarAg.onclick = () => {
    idEditandoAg = null;
    btnAdicionar.innerText = "Adicionar";
    btnCancelarAg.style.display = "none";
    limparFormularioAg();
  };

  btnAdicionar.addEventListener("click", async () => {
    const dados = {
      nota: Number(document.getElementById("nota").value),
      remetente: document.getElementById("remetente").value.trim(),
      destinatario: document.getElementById("destinatario").value.trim(),
      data: document.getElementById("dataEntrega").value,
      volumes: Number(document.getElementById("volumes").value),
      situacao: situacaoSelect.value,
      motorista: motoristaSelect.value || "",
      status: document.getElementById("status").value
    };

    if (!dados.nota || !dados.data || !dados.volumes || !dados.remetente || !dados.destinatario) {
      showToast("Preencha todos os campos obrigatórios");
      return;
    }
    if (dados.situacao === "Em Rota" && !dados.motorista) {
      showToast("Informe o motorista");
      return;
    }

    showLoading();
    try {
      if (idEditandoAg) {
        await updateDoc(doc(db, "agendamentos", idEditandoAg), dados);
        idEditandoAg = null;
        btnAdicionar.innerText = "Adicionar";
        btnCancelarAg.style.display = "none";
        showToast("Agendamento atualizado");
      } else {
        await addDoc(collection(db, "agendamentos"), {...dados, criadoEm: serverTimestamp()});
        showToast("Agendamento cadastrado");
      }
      limparFormularioAg();
    } catch {
      showToast("Erro ao salvar");
    } finally { hideLoading(); }
  });

  onSnapshot(agQuery, snap => {
    tabelaAg.innerHTML = "";
    snap.forEach(d => {
      const ag = d.data();
      tabelaAg.innerHTML += `
        <tr>
          <td>${ag.nota}</td>
          <td>${ag.remetente}</td>
          <td>${ag.destinatario}</td>
          <td>${formatarData(ag.data)}</td>
          <td>${diaSemana(ag.data)}</td>
          <td>${ag.volumes}</td>
          <td><span class="badge">${ag.situacao}</span></td>
          <td>${ag.motorista || "-"}</td>
          <td>${ag.status}</td>
          <td>
            <button class="acao-btn editar" data-id="${d.id}">Editar</button>
            <button class="acao-btn excluir" data-id="${d.id}">Excluir</button>
          </td>
        </tr>`;
    });
    ativarEditarAg(snap);
    ativarExcluirAg();
    atualizarDashboard(snap); // atualizar dashboard
  });

  function ativarEditarAg(snap) {
    document.querySelectorAll(".editar").forEach(btn => {
      btn.onclick = () => {
        const ag = snap.docs.find(x => x.id === btn.dataset.id).data();
        idEditandoAg = btn.dataset.id;
        document.getElementById("nota").value = ag.nota;
        document.getElementById("remetente").value = ag.remetente;
        document.getElementById("destinatario").value = ag.destinatario;
        document.getElementById("dataEntrega").value = ag.data;
        document.getElementById("volumes").value = ag.volumes;
        situacaoSelect.value = ag.situacao;
        motoristaSelect.value = ag.motorista;
        document.getElementById("status").value = ag.status;
        controlarMotorista();
        btnAdicionar.innerText = "Salvar Alteração";
        btnCancelarAg.style.display = "inline-block";
      };
    });
  }

  function ativarExcluirAg() {
    document.querySelectorAll(".excluir").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Excluir este agendamento?")) return;
        showLoading();
        await deleteDoc(doc(db,"agendamentos",btn.dataset.id));
        hideLoading();
        showToast("Agendamento excluído");
        if (idEditandoAg === btn.dataset.id) btnCancelarAg.click();
      };
    });
  }

  function limparFormularioAg() {
    ["nota","remetente","destinatario","dataEntrega","volumes"].forEach(id => document.getElementById(id).value = "");
    situacaoSelect.value = "No Galpão";
    motoristaSelect.value = "";
    motoristaSelect.disabled = true;
    document.getElementById("status").value = "Agendado";
  }

  function diaSemana(d) {
    return ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][new Date(d + "T00:00").getDay()];
  }

  function formatarData(d) {
    const [a,m,di] = d.split("-");
    return `${di}/${m}/${a}`;
  }

  /* ===================== CONTATOS ===================== */
  const contatoLocal = document.getElementById("contatoLocal");
  const contatoResponsavel = document.getElementById("contatoResponsavel");
  const contatoTelefone = document.getElementById("contatoTelefone");
  const contatoEmail = document.getElementById("contatoEmail");
  const contatoObs = document.getElementById("contatoObs");
  const tabelaContatos = document.getElementById("tabelaContatos");
  const pesquisaContato = document.getElementById("pesquisaContato");
  const btnSalvarContato = document.getElementById("btnSalvarContato");
  const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

  let contatosCache = [];
  let idContatoEditando = null;

  // Formatação de telefone
  contatoTelefone.addEventListener("input", () => {
    let v = contatoTelefone.value.replace(/\D/g, "").slice(0, 11);
    contatoTelefone.value =
      v.length > 10 ? v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") :
      v.length > 6 ? v.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3") :
      v.length > 2 ? v.replace(/(\d{2})(\d+)/, "($1) $2") : v;
  });

  onSnapshot(query(collection(db,"contatos"),orderBy("criadoEm","desc")), snap => {
    contatosCache = snap.docs.map(d => ({id:d.id,...d.data()}));
    renderizarContatos(contatosCache);
  });

  function renderizarContatos(lista) {
    // Ordena pelo campo "local" em ordem alfabética
    const listaOrdenada = [...lista].sort((a,b) => a.local.localeCompare(b.local));

    tabelaContatos.innerHTML = listaOrdenada.length
      ? listaOrdenada.map(c => `
        <tr>
          <td>${c.local}</td>
          <td>${c.responsavel || "-"}</td>
          <td>${c.telefone}</td>
          <td>${c.email || "-"}</td>
          <td>
            <button class="acao-btn editar" data-id="${c.id}">Editar</button>
            <button class="acao-btn excluir" data-id="${c.id}">Excluir</button>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="5">Nenhum contato</td></tr>`;
    ativarEditarContato();
    ativarExcluirContato();
  }

  btnSalvarContato.onclick = async () => {
    if (!contatoLocal.value || !contatoTelefone.value) {
      showToast("Local e telefone são obrigatórios");
      return;
    }
    showLoading();
    const dados = {
      local: contatoLocal.value.trim(),
      responsavel: contatoResponsavel.value.trim(),
      telefone: contatoTelefone.value.trim(),
      email: contatoEmail.value.trim(),
      observacoes: contatoObs.value.trim()
    };
    try {
      if (idContatoEditando) {
        await updateDoc(doc(db,"contatos",idContatoEditando), dados);
        showToast("Contato atualizado");
      } else {
        await addDoc(collection(db,"contatos"), {...dados, criadoEm:serverTimestamp()});
        showToast("Contato salvo");
      }
    } catch {
      showToast("Erro ao salvar contato");
    } finally {
      hideLoading();
      sairModoEdicaoContato();
    }
  };

  btnCancelarEdicao.onclick = () => sairModoEdicaoContato();

  function sairModoEdicaoContato() {
    idContatoEditando = null;
    btnSalvarContato.innerText = "Salvar Contato";
    btnCancelarEdicao.style.display = "none";
    limparContato();
  }

  function ativarEditarContato() {
    document.querySelectorAll("#tabelaContatos .editar").forEach(btn => {
      btn.onclick = () => {
        const c = contatosCache.find(x => x.id === btn.dataset.id);
        idContatoEditando = c.id;
        contatoLocal.value = c.local;
        contatoResponsavel.value = c.responsavel || "";
        contatoTelefone.value = c.telefone;
        contatoEmail.value = c.email || "";
        contatoObs.value = c.observacoes || "";
        btnSalvarContato.innerText = "Salvar Alteração";
        btnCancelarEdicao.style.display = "inline-block";
      };
    });
  }

  function ativarExcluirContato() {
    document.querySelectorAll("#tabelaContatos .excluir").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Excluir contato?")) return;
        showLoading();
        await deleteDoc(doc(db,"contatos",btn.dataset.id));
        hideLoading();
        showToast("Contato excluído");
        if (idContatoEditando === btn.dataset.id) sairModoEdicaoContato();
      };
    });
  }

  pesquisaContato.oninput = () => {
    const t = pesquisaContato.value.toLowerCase();
    renderizarContatos(contatosCache.filter(c =>
      c.local.toLowerCase().includes(t) ||
      c.telefone.includes(t) ||
      (c.responsavel||"").toLowerCase().includes(t)
    ));
  };

  function limparContato() {
    [contatoLocal,contatoResponsavel,contatoTelefone,contatoEmail,contatoObs].forEach(i=>i.value="");
    btnCancelarEdicao.style.display = "none";
  }

});
