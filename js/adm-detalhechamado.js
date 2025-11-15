const apiBaseUrl = "http://localhost:5287/api";

let emailDoCliente = ""; // será preenchido quando carregar o chamado

// =====================================================
// 🚀 CARREGAR O CHAMADO
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const idChamado =
    params.get("id") ||
    params.get("chamadoId") ||
    window.location.search.replace("?id=", "").trim();

  console.log("ID capturado da URL =", idChamado);

  if (!idChamado || idChamado === "undefined" || isNaN(idChamado)) {
    alert("Chamado inválido.");
    return;
  }

  carregarChamado(idChamado);
});

async function carregarChamado(id) {
  const box = document.getElementById("detalhesChamado");
  box.innerHTML = "<p>Carregando informações...</p>";

  try {
    const res = await fetch(`${apiBaseUrl}/Chamados/${id}`);

    if (!res.ok) {
      const text = await res.text();
      box.innerHTML = `<p style="color:red;">Erro ao carregar dados:<br>${escapeHtml(
        text
      )}</p>`;
      return;
    }

    const c = await res.json();
    console.log("Chamado carregado:", c);

    const chamado = {
      id: c.IdChamado ?? c.idChamado ?? c.id ?? null,
      numero: c.NumeroChamado ?? c.numeroChamado ?? "",
      status: c.Status ?? c.status ?? "",
      prioridade: c.Prioridade ?? c.prioridade ?? "",
      tipo: c.TipoProblema ?? c.tipoProblema ?? "",
      descricao: c.Descricao ?? c.descricao ?? "",
      nome: c.NomeSolicitante ?? c.nomeSolicitante ?? "",
      email: c.EmailSolicitante ?? c.emailSolicitante ?? "",
      telefone:
        c.TelefoneSolicitante ?? c.telefoneSolicitante ?? "Não informado",
      tecnico: c.TecnicoResponsavel ?? c.tecnicoResponsavel ?? "-",
      abertura: c.DataAbertura,
      fechamento: c.DataFechamento,
      solucao: c.SolucaoAplicada ?? "",
      obs: c.Observacoes ?? "",
    };

    // SALVAR EMAIL DO CLIENTE
    emailDoCliente = chamado.email;
    console.log("Email do cliente carregado:", emailDoCliente);

    // EXIBIR NA TELA
    box.innerHTML = `
      <h3>Informações Gerais</h3>
      <p><strong>Número:</strong> ${escapeHtml(chamado.numero)}</p>
      <p><strong>Status:</strong> ${escapeHtml(chamado.status)}</p>
      <p><strong>Prioridade:</strong> ${escapeHtml(chamado.prioridade)}</p>
      <p><strong>Tipo:</strong> ${escapeHtml(chamado.tipo)}</p>
      <p><strong>Descrição:</strong> ${escapeHtml(chamado.descricao)}</p>

      <hr>

      <h3>Solicitante</h3>
      <p><strong>Nome:</strong> ${escapeHtml(chamado.nome)}</p>
      <p><strong>Email:</strong> ${escapeHtml(chamado.email)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(chamado.telefone)}</p>

      <hr>

      <h3>Atendimento</h3>
      <p><strong>Técnico:</strong> ${escapeHtml(chamado.tecnico)}</p>
      <p><strong>Abertura:</strong> ${formatarData(chamado.abertura)}</p>
      <p><strong>Fechamento:</strong> ${
        chamado.fechamento
          ? formatarData(chamado.fechamento)
          : "Ainda em aberto"
      }</p>
    `;

    // Preencher os inputs
    document.getElementById("inputStatus").value = chamado.status;
    document.getElementById("inputPrioridade").value = chamado.prioridade;
    document.getElementById("inputSolucao").value = chamado.solucao;
    document.getElementById("inputObs").value = chamado.obs;
  } catch (err) {
    console.error("Erro carregar chamado:", err);
    box.innerHTML = `<p style="color:red;">Erro ao carregar dados.</p>`;
  }
}

// =====================================================
// 🚀 SALVAR ALTERAÇÕES NO CHAMADO
// =====================================================
async function salvarAlteracoes() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("chamadoId") || params.get("id");

  if (!id) {
    alert("Chamado inválido.");
    return;
  }

  const payload = {
    Status: document.getElementById("inputStatus").value,
    Prioridade: document.getElementById("inputPrioridade").value,
    SolucaoAplicada: document.getElementById("inputSolucao").value,
    Observacoes: document.getElementById("inputObs").value,
  };

  try {
    const res = await fetch(`${apiBaseUrl}/Chamados/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const respostaTexto = await res.text();

    if (res.ok) {
      // SE TEM EMAIL, ENVIA NOTIFICAÇÃO
      if (emailDoCliente && emailDoCliente.trim() !== "") {
        await enviarNotificacaoAoCliente(
          emailDoCliente,
          payload.SolucaoAplicada,
          payload.Observacoes
        );
      } else {
        console.warn(
          "⚠️ Nenhum emailDoCliente definido — notificação não enviada."
        );
      }

      alert("Alterações salvas com sucesso!");
      location.reload();
    } else {
      alert("❌ Erro ao salvar:\n" + respostaTexto);
    }
  } catch (err) {
    console.error("Erro salvar:", err);
    alert("Erro inesperado.");
  }
}

// =====================================================
// 🚀 ENVIAR NOTIFICAÇÃO AO CLIENTE
// =====================================================
async function enviarNotificacaoAoCliente(emailCliente, solucao, obs) {
  try {
    if (!emailCliente) {
      console.warn(
        "❌ Nenhum emailDoCliente definido — notificação não enviada."
      );
      return;
    }

    const dadosNotificacao = {
      EmailDestino: emailCliente,
      Titulo: "Atualização no chamado",
      Mensagem:
        `O técnico atualizou seu chamado:\n\n` +
        (solucao ? `📌 Solução aplicada: ${solucao}\n` : "") +
        (obs ? `📝 Observações: ${obs}` : ""),
    };

    const res = await fetch(`${apiBaseUrl}/Notificacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosNotificacao),
    });

    if (!res.ok) {
      console.error("❌ Erro ao enviar notificação:", await res.text());
    } else {
      console.log("✔ Notificação enviada!");
    }
  } catch (err) {
    console.error("Erro enviar notificação:", err);
  }
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================
function escapeHtml(txt) {
  return String(txt || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatarData(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("pt-BR");
}
