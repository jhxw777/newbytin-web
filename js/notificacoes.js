const apiBaseUrl = "http://localhost:5287/api";
function getUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    return null;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }
  const email = usuario.Email || usuario.email;
  const listaBox = document.getElementById("listaNotificacoes");
  const detalhesBox = document.getElementById("textoDetalhe");
  if (!listaBox) {
    console.error("❌ ERRO: Elemento #listaNotificacoes não existe no HTML!");
    return;
  }
  if (!detalhesBox) {
    console.error("❌ ERRO: Elemento #textoDetalhe não existe no HTML!");
    return;
  }
  carregarNotificacoes(email);
  async function carregarNotificacoes(email) {
    try {
      listaBox.innerHTML = `<p style="padding:10px;">🔄 Carregando notificações...</p>`;
      const res = await fetch(
        `${apiBaseUrl}/Notificacoes/${encodeURIComponent(email)}`
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(
          `Erro ao buscar notificações: ${res.status} ${txt || ""}`
        );
      }
      const lista = await res.json();
      console.log("📩 Notificações recebidas:", lista);
      if (!Array.isArray(lista) || lista.length === 0) {
        listaBox.innerHTML = `<p style="padding:10px;">📭 Nenhuma notificação encontrada.</p>`;
        return;
      }
      listaBox.innerHTML = "";
      lista.forEach((n, idx) => {
        const titulo =
          (n && (n.Titulo ?? n.titulo)) || `Notificação ${idx + 1}`;
        const mensagem = String(n?.Mensagem ?? n?.mensagem ?? "");
        const resumo =
          mensagem.length > 60 ? mensagem.slice(0, 60) + "..." : mensagem;
        const data =
          n?.DataEnvio || n?.dataEnvio
            ? new Date(n.DataEnvio ?? n.dataEnvio).toLocaleString("pt-BR")
            : "Sem data";
        const card = document.createElement("div");
        card.className = "notificacao-item";
        card.innerHTML = `
          <h4>${escapeHtml(titulo)}</h4>
          <p>${escapeHtml(resumo)}</p>
          <span class="data">📅 ${escapeHtml(data)}</span>
        `;
        card.addEventListener("click", () => {
          detalhesBox.innerHTML = `
            <h2>${escapeHtml(titulo)}</h2>
            <p>${escapeHtml(mensagem)}</p>
            <br>
            <small>📅 ${escapeHtml(data)}</small>
          `;
        });
        listaBox.appendChild(card);
      });
    } catch (err) {
      console.error("❌ Erro ao carregar notificações:", err);
      listaBox.innerHTML = `<p style="padding:10px; color:red;">⚠️ Erro ao carregar notificações.</p>`;
    }
  }
  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
