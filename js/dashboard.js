function getUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    return null;
  }
}
const apiBaseUrl = "http://localhost:5287/api";
document.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }
  const chat = document.getElementById("chat-messages");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  let etapa = 1;
  let opcaoSelecionada = "";
  let problema = "";
  sendBtn.addEventListener("click", enviarMensagem);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensagem();
  });
  function adicionarMensagem(tipo, texto, salvar = false) {
    const msgContainer = document.createElement("div");
    msgContainer.classList.add("msg-container", tipo);

    const msg = document.createElement("div");
    msg.classList.add("msg", tipo);
    msg.innerHTML = texto;
    if (tipo === "bot") {
      const img = document.createElement("img");
      img.src = "img/foto.png";
      img.alt = "Bot";
      img.classList.add("bot-avatar");
      msgContainer.appendChild(img);
    }
    msgContainer.appendChild(msg);
    chat.appendChild(msgContainer);
    chat.scrollTop = chat.scrollHeight;
    if (salvar) {
      salvarMensagemNoBanco(tipo, texto).catch((err) =>
        console.warn("Erro ao salvar mensagem:", err)
      );
    }
  }
  async function salvarMensagemNoBanco(remetenteTipo, conteudo) {
    const remetente =
      remetenteTipo === "bot"
        ? "chatbot@newbytin.com"
        : usuario.Email || usuario.email || "usuario@local";

    const body = {
      ConversationId: 1,
      Remetente: remetente,
      Conteudo: conteudo,
    };

    const res = await fetch(`${apiBaseUrl}/Chat/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      throw new Error(`Erro API mensagens: ${res.status} ${text || ""}`);
    }

    return res.json().catch(() => null);
  }
  adicionarMensagem(
    "bot",
    "👋 Olá! Bem-vindo ao suporte técnico.<br>Escolha uma opção (1 a 10):<br><br>" +
      "1️⃣ Suporte Técnico, Servidor e Banco de Dados<br>" +
      "2️⃣ Problemas com Computador ou Sistema<br>" +
      "3️⃣ Erro no E-mail ou Outlook<br>" +
      "4️⃣ Solicitação de Acesso ou Permissões<br>" +
      "5️⃣ Problemas com Impressora<br>" +
      "6️⃣ Internet ou Conectividade<br>" +
      "7️⃣ Solicitação de Equipamento<br>" +
      "8️⃣ Infraestrutura e Manutenção<br>" +
      "9️⃣ Solicitação de Materiais<br>" +
      "🔟 Outro problema (descreva a situação).",
    true
  );
  const respostasEtapa1 = {
    oi: "👋 Olá! Digite um número (1-10) representando seu problema.",
    olá: "😊 Olá! Digite um número (1-10).",
    "bom dia": "☀️ Bom dia! Qual o tipo de problema? (1-10)",
    "boa tarde": "🌇 Boa tarde! Informe o número (1-10).",
    "boa noite": "🌙 Boa noite! Informe o número (1-10).",
  };
  const respostasEtapa2 = {
    1: "⚙️ Informe se o problema está relacionado a:<br>1️⃣ Servidor<br>2️⃣ Banco de Dados",
    2: "💻 Informe se o problema é no:<br>1️⃣ Sistema Operacional<br>2️⃣ Software específico",
    3: "📧 O erro ocorre ao:<br>1️⃣ Enviar e-mail<br>2️⃣ Receber e-mail",
    4: "🔐 Deseja:<br>1️⃣ Criar novo acesso<br>2️⃣ Alterar permissões",
    5: "🖨️ O problema é:<br>1️⃣ Ao imprimir<br>2️⃣ Ao digitalizar",
    6: "🌐 Está usando:<br>1️⃣ Wi-Fi<br>2️⃣ Cabo de rede<br>3️⃣ Afeta todos os dispositivos?",
    7: "🛠️ Informe tipo de equipamento, quantidade e motivo.",
    8: "🏢 Descreva o local e tipo de manutenção necessária.",
    9: "📦 Informe quais materiais, quantidade e motivo.",
    10: "❓ Descreva seu problema detalhadamente.",
  };
  const respostasEtapa3 = {
    servidor:
      "🔧 Verifique se o sistema está online e conectado.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    "banco de dados":
      "🧩 Verifique se o banco está acessível e sem erros.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    "sistema operacional":
      "💻 Reinicie o computador e verifique atualizações.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    software:
      "💻 Reinicie o software e verifique atualizações.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    "enviar e-mail":
      "📧 Verifique configurações SMTP e credenciais.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    "receber e-mail":
      "📩 Verifique espaço da caixa e conexão.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    impressora:
      "🖨️ Verifique papel, conexão e mensagens da impressora.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    internet:
      "🌐 Reinicie modem/roteador; teste outro dispositivo.<br>1️⃣ Não tive sucesso, descrever ocorrência.",
    outro: "🔎 Descreva o problema com detalhes; responderei em seguida.",
  };
  function enviarMensagem() {
    const textoOriginal = input.value.trim();
    if (!textoOriginal) return;
    adicionarMensagem("user", textoOriginal, true);
    input.value = "";
    processarMensagem(textoOriginal.toLowerCase());
  }
  function processarMensagem(msg) {
    if (etapa === 1) {
      for (const k in respostasEtapa1) {
        if (msg.includes(k)) {
          adicionarMensagem("bot", respostasEtapa1[k], true);
          return;
        }
      }
      if (/^[1-9]$|^10$/.test(msg)) {
        opcaoSelecionada = msg;
        etapa = 2;
        adicionarMensagem("bot", respostasEtapa2[msg], true);
        return;
      }
      adicionarMensagem("bot", "🤔 Escolha um número válido (1 a 10).", true);
      return;
    }
    if (etapa === 2) {
      switch (opcaoSelecionada) {
        case "1":
          problema = msg === "1" ? "servidor" : "banco de dados";
          break;
        case "2":
          problema = msg === "1" ? "sistema operacional" : "software";
          break;
        case "3":
          problema = msg === "1" ? "enviar e-mail" : "receber e-mail";
          break;
        case "4":
          problema = msg === "1" ? "novo acesso" : "alterar permissões";
          break;
        case "5":
          problema = msg === "1" ? "impressora" : "impressora";
          break;
        case "6":
          problema =
            msg === "1"
              ? "Wi-Fi"
              : msg === "2"
              ? "cabo de rede"
              : "todos os dispositivos";
          break;
        case "7":
          problema = "equipamento";
          break;
        case "8":
          problema = "infraestrutura";
          break;
        case "9":
          problema = "materiais";
          break;
        case "10":
          problema = "outro";
          break;
        default:
          problema = "outro";
      }
      const resposta = respostasEtapa3[problema] || respostasEtapa3["outro"];
      etapa = 3;
      adicionarMensagem("bot", resposta, true);
      return;
    }
    if (etapa === 3) {
      const frasesDeFalha = [
        "não tive sucesso",
        "nao tive sucesso",
        "não consegui",
        "nao consegui",
        "não foi",
        "nao foi",
        "não deu certo",
        "nao deu certo",
        "continua o problema",
        "não resolveu",
        "nao resolveu",
        "persistiu o erro",
        "não funcionou",
        "nao funcionou",
        "meu problema",
        "meu servidor",
        "ainda",
      ];
      if (frasesDeFalha.some((f) => msg.includes(f))) {
        adicionarMensagem(
          "bot",
          "🚨 Entendido! Vou abrir um chamado para o suporte técnico analisar melhor.",
          true
        );
        abrirChamado(problema).catch((err) =>
          console.error("Erro ao abrir chamado:", err)
        );
        etapa = 1;
        return;
      }
      if (
        msg.includes("obrigado") ||
        msg.includes("valeu") ||
        msg.includes("deu certo") ||
        msg.includes("resolveu")
      ) {
        adicionarMensagem(
          "bot",
          "😄 Que bom! Se precisar, estarei aqui. Obrigado por usar o suporte.",
          true
        );
        etapa = 1;
        return;
      }
      if (msg.length > 10) {
        adicionarMensagem(
          "bot",
          "🔍 Recebi a descrição. Vou abrir um chamado com essas informações.",
          true
        );
        abrirChamado(msg).catch((err) =>
          console.error("Erro abrir chamado:", err)
        );
        etapa = 1;
        return;
      }
      adicionarMensagem(
        "bot",
        "🤔 Não ficou claro. O problema foi resolvido? Se não, descreva com mais detalhes.",
        true
      );
      return;
    }
  }
  async function abrirChamado(descricao) {
    try {
      const usuarioLogado = usuario;
      if (!usuarioLogado || !(usuarioLogado.Email || usuarioLogado.email)) {
        adicionarMensagem(
          "bot",
          "⚠️ Usuário não autenticado. Faça login novamente.",
          true
        );
        return;
      }
      const chamado = {
        NumeroChamado: `CH-${new Date().getFullYear()}-${Date.now()
          .toString()
          .slice(-4)}`,
        Status: "Aberto",
        Prioridade: "Média",
        TipoProblema: descricao || "Outro",
        Descricao: descricao || "Sem descrição detalhada.",
        SetorSolicitante: "Cliente",
        NomeSolicitante: usuarioLogado.Nome || usuarioLogado.nome || "Usuário",
        EmailSolicitante: usuarioLogado.Email || usuarioLogado.email,
        TelefoneSolicitante:
          usuarioLogado.Telefone || usuarioLogado.telefone || "",
        Observacoes: "Chamado criado automaticamente pelo chatbot",
      };
      console.log("Enviando chamado:", chamado);
      const response = await fetch(`${apiBaseUrl}/Chamados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chamado),
      });
      const resultadoText = await response.text().catch(() => null);
      let resultado;
      try {
        resultado = resultadoText ? JSON.parse(resultadoText) : null;
      } catch {
        resultado = { raw: resultadoText };
      }
      console.log("Resposta do servidor:", response.status, resultado);
      if (!response.ok) {
        const detalhe =
          resultado?.detalhe ||
          resultado?.message ||
          resultado?.raw ||
          "Erro desconhecido";
        throw new Error(detalhe);
      }
      adicionarMensagem(
        "bot",
        "✅ Chamado criado com sucesso! Você pode acompanhar na aba Chamados.",
        true
      );
      setTimeout(() => {
        window.location.assign("chamados.html");
      }, 2000);
    } catch (error) {
      console.error("Erro ao abrir chamado:", error);
      adicionarMensagem(
        "bot",
        `⚠️ Ocorreu um erro ao abrir o chamado: <b>${error.message}</b>`,
        true
      );
    }
  }
});
