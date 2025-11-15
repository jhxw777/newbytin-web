const apiBaseUrl = "http://localhost:5287/api";
function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}
document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }
  const lista = document.getElementById("listaChamados");
  const textoDetalhe = document.getElementById("textoDetalhe");
  async function carregarChamados() {
    try {
      lista.innerHTML = "<p>🔄 Carregando chamados...</p>";
      const response = await fetch(`${apiBaseUrl}/Chamados`);
      if (!response.ok) throw new Error("Erro ao buscar chamados.");
      const dados = await response.json();
      console.log("📦 Chamados retornados:", dados);
      const emailUsuario =
        usuario.Email?.toLowerCase() || usuario.email?.toLowerCase();
      const chamadosUsuario = dados.filter(
        (c) => (c.emailSolicitante || "").toLowerCase() === emailUsuario
      );
      console.log("🎯 Chamados do usuário:", chamadosUsuario);
      if (!chamadosUsuario.length) {
        lista.innerHTML =
          "<p>📭 Nenhum chamado encontrado para este usuário.</p>";
        return;
      }
      lista.innerHTML = "";
      chamadosUsuario.forEach((c) => {
        const item = document.createElement("div");
        item.classList.add("chamado-item");
        const statusClass =
          String(c.status || "").toLowerCase() === "concluído"
            ? "status-concluido"
            : "status-aberto";
        item.innerHTML = `
          <h3>📌 ${c.numeroChamado || "Sem número"}</h3>
          <p><strong>Tipo:</strong> ${c.tipoProblema || "Não informado"}</p>
          <p><strong>Descrição:</strong> ${c.descricao || "—"}</p>
          <p><strong>Aberto em:</strong> ${c.dataAbertura || "—"}</p>
          <p><strong>Status:</strong> <span class="${statusClass}">
            ${c.status || "—"}
          </span></p>
        `;
        item.addEventListener("click", () => {
          textoDetalhe.innerHTML = `
            <h3>${c.numeroChamado}</h3>
            <p><b>Tipo:</b> ${c.tipoProblema}</p>
            <p><b>Descrição:</b> ${c.descricao}</p>
            <p><b>Status:</b> ${c.status}</p>
            <p><b>Prioridade:</b> ${c.prioridade || "Média"}</p>
            <p><b>Solicitante:</b> ${c.nomeSolicitante}</p>
            <p><b>Email:</b> ${c.emailSolicitante}</p>
          `;
        });
        lista.appendChild(item);
      });
    } catch (err) {
      console.error("❌ Erro ao carregar chamados:", err);
      lista.innerHTML =
        "<p>⚠️ Não foi possível carregar os chamados. Verifique o servidor.</p>";
    }
  }
  carregarChamados();
});
