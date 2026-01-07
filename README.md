# Sistema de Agendamentos WSM

📦 Projeto de sistema web para gerenciamento de **agendamentos e contatos**, com dashboard, gráficos e integração com **Firebase**.

---

## 🖥️ Funcionalidades

### Dashboard
- Mostra o total de agendamentos, status e situação dos pedidos.
- Gráficos de situação (No Galpão, Em Rota) e status (Agendado, Entregue).

### Agendamentos
- Cadastro de agendamentos com campos:
  - Nota fiscal
  - Remetente / Destinatário
  - Data de entrega
  - Volumes
  - Situação (No Galpão / Em Rota)
  - Motorista
  - Status (Agendado / Entregue)
- Edição e exclusão de agendamentos.
- Validações de campos obrigatórios.

### Contatos
- Cadastro de contatos com campos:
  - Local
  - Responsável
  - Telefone
  - E-mail
  - Observações
- Pesquisa rápida por local, telefone ou responsável.
- Edição e exclusão de contatos.

### Geral
- Logout do usuário
- Toast notifications e loading overlay
- Responsivo (desktop e mobile)

---

## ⚡ Tecnologias Utilizadas

- HTML5 / CSS3 / JavaScript (ES6 Modules)
- [Firebase](https://firebase.google.com/) (Firestore + Auth)
- [Chart.js](https://www.chartjs.org/) para gráficos
- GitHub Pages para hospedagem
