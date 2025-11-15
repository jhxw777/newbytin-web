const apiBaseUrl = "http://localhost:5287/api";
const listaChamados = document.getElementById("tabelaChamados");
const filtroStatus = document.getElementById("filtroStatus");
const filtroPrioridade = document.getElementById("filtroPrioridade");
const btnFiltrar = document.getElementById("btnFiltrar");
document.addEventListener("DOMContentLoaded", async () => {
  await carregarChamados();
  if (btnFiltrar) btnFiltrar.addEventListener("click", carregarChamados);
});
async function carregarChamados() {
  if (!listaChamados) return;
  listaChamados.innerHTML = `<p style="text-align:center; color:#aaa;">🔄 Carregando chamados...</p>`;
  try {
    const response = await fetch(`${apiBaseUrl}/Chamados`);
    if (!response.ok)
      throw new Error(`Erro ao buscar chamados (${response.status})`);
    const chamados = await response.json();
    console.log("Chamados recebidos:", chamados);
    if (!Array.isArray(chamados) || chamados.length === 0) {
      listaChamados.innerHTML = `<p style="text-align:center; color:#888;">📭 Nenhum chamado encontrado.</p>`;
      return;
    }
    const normalizados = chamados.map((c) => ({
      id: c.idChamado ?? c.IdChamado ?? c.id ?? c.Id ?? null,
      numero:
        c.numeroChamado ??
        c.NumeroChamado ??
        c.numero ??
        c.Numero ??
        "Sem número",
      status: c.status ?? c.Status ?? "Aberto",
      prioridade: c.prioridade ?? c.Prioridade ?? "Média",
      tipo: c.tipoProblema ?? c.TipoProblema ?? "Não informado",
      descricao: c.descricao ?? c.Descricao ?? "Sem descrição",
      nomeSolicitante: c.nomeSolicitante ?? c.NomeSolicitante ?? "Desconhecido",
      emailSolicitante: c.emailSolicitante ?? c.EmailSolicitante ?? "",
      dataAbertura: c.dataAbertura ?? c.DataAbertura ?? null,
    }));
    renderizarChamados(normalizados);
  } catch (err) {
    console.error("❌ ERRO AO CARREGAR CHAMADOS:", err);
    listaChamados.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar chamados.</p>`;
  }
}
function renderizarChamados(chamados) {
  listaChamados.innerHTML = "";

  chamados.forEach((c) => {
    const data = parseDateFlexible(c.dataAbertura);
    const dataFormatada = data ? data.toLocaleString("pt-BR") : "-";

    const email = (c.emailSolicitante || "").replace(/'/g, "\\'");

    const div = document.createElement("div");
    div.className = "chamado-item";

    div.innerHTML = `
      <div class="chamado-header">
        <h3>📌 ${escapeHtml(c.numero)}</h3>
        <span class="status">${escapeHtml(c.status)}</span>
      </div>

      <div class="chamado-body">
        <p><strong>Tipo:</strong> ${escapeHtml(c.tipo)}</p>
        <p><strong>Descrição:</strong> ${escapeHtml(c.descricao)}</p>
        <p><strong>Aberto em:</strong> ${escapeHtml(dataFormatada)}</p>
        <p><strong>Prioridade:</strong> ${escapeHtml(c.prioridade)}</p>
        <p><strong>Solicitante:</strong> ${escapeHtml(c.nomeSolicitante)}</p>
      </div>

      <div class="botoes-acoes">
        <button class="btn-detalhes" onclick="abrirDetalhes(${c.id})">
          📄 Detalhes
        </button>

        <button class="btn-chat" onclick="abrirChat(${c.id}, '${email}')">
          💬 Chat
        </button>
      </div>
    `;

    listaChamados.appendChild(div);
  });
}
async function abrirChat(chamadoIdRaw, usuarioEmailRaw) {
  const chamadoId = Number(chamadoIdRaw);
  const usuarioEmail = (usuarioEmailRaw || "").trim();
  if (!Number.isFinite(chamadoId) || chamadoId <= 0) {
    alert("ID do chamado inválido.");
    return;
  }
  if (!usuarioEmail) {
    alert("Email do solicitante está vazio.");
    return;
  }
  try {
    const check = await fetch(
      `${apiBaseUrl}/Conversations/chamado/${chamadoId}`
    );
    const txt = await check.text();
    let conversa = {};
    if (txt.trim() !== "") {
      try {
        conversa = JSON.parse(txt);
      } catch {
        console.warn("⚠ Resposta inesperada:", txt);
      }
    }
    if (conversa && conversa.ConversationId) {
      window.location.href = `adm-chatcliente.html`;
      return;
    }
    const criar = await fetch(`${apiBaseUrl}/Conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ChamadoId: chamadoId,
        UsuarioEmail: usuarioEmail,
        AdmEmail: "admin@newbytin.com",
      }),
    });
    const criarTxt = await criar.text();
    let nova = {};
    try {
      nova = JSON.parse(criarTxt);
    } catch {
      console.error("❌ Erro ao criar conversa:", criarTxt);
      alert("Erro ao criar conversa.");
      return;
    }
    if (!nova.ConversationId) {
      alert("Erro ao criar conversa no servidor.");
      return;
    }
    window.location.href = `adm-chatcliente.html?chamadoId=${chamadoId}&email=${encodeURIComponent(
      usuarioEmail
    )}&convid=${nova.ConversationId}`;
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
    alert("Erro inesperado ao abrir chat.");
  }
}
function abrirDetalhes(idChamado) {
  window.location.href = `adm-detalhechamado.html?id=${idChamado}`;
}
function parseDateFlexible(value) {
  if (!value) return null;
  const iso = new Date(value);
  if (!isNaN(iso)) return iso;
  try {
    const [d, m, y] = value.split("/").map(Number);
    return new Date(y, m - 1, d);
  } catch {
    return null;
  }
}
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
