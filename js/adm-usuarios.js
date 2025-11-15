document.addEventListener("DOMContentLoaded", async () => {
  const apiURL = "http://localhost:5287/api/Usuarios";
  const listaUsuarios = document.getElementById("listaUsuarios");
  const busca = document.getElementById("buscaUsuario");
  let usuarios = [];
  async function carregarUsuarios() {
    listaUsuarios.innerHTML = "<p>Carregando usuários...</p>";
    try {
      const res = await fetch(apiURL);
      if (!res.ok) throw new Error("Erro ao buscar usuários.");
      usuarios = await res.json();
      renderUsuarios(usuarios);
    } catch (error) {
      console.error(error);
      listaUsuarios.innerHTML =
        "<p>❌ Não foi possível carregar os usuários.</p>";
    }
  }
  function renderUsuarios(data) {
    listaUsuarios.innerHTML = "";
    if (!data || data.length === 0) {
      listaUsuarios.innerHTML = "<p>Nenhum usuário encontrado.</p>";
      return;
    }
    data.forEach((u) => {
      const item = document.createElement("div");
      item.classList.add("usuario-item");

      item.innerHTML = `
        <div class="info">
          <img src="img/${u.fotoPerfil || "avatar-padrao.png"}" alt="foto" />
          <div>
            <div class="nome">${u.nome}</div>
            <div class="email">${u.email}</div>
            <div class="cargo">${u.tipoUsuario}</div>
          </div>
        </div>
        <div class="acoes">
          <button class="btn-editar" data-id="${u.id}">✏️</button>
          <button class="btn-promover" data-id="${u.id}" data-tipo="${
        u.tipoUsuario
      }">
            ${u.tipoUsuario === "Administrador" ? "⬇️ Rebaixar" : "⬆️ Promover"}
          </button>
          <button class="btn-excluir" data-id="${u.id}">🗑️</button>
        </div>
      `;
      listaUsuarios.appendChild(item);
    });
    document
      .querySelectorAll(".btn-editar")
      .forEach((btn) =>
        btn.addEventListener("click", (e) => editarUsuario(e.target.dataset.id))
      );
    document
      .querySelectorAll(".btn-promover")
      .forEach((btn) =>
        btn.addEventListener("click", (e) =>
          alterarAcesso(e.target.dataset.id, e.target.dataset.tipo)
        )
      );
    document
      .querySelectorAll(".btn-excluir")
      .forEach((btn) =>
        btn.addEventListener("click", (e) =>
          excluirUsuario(e.target.dataset.id)
        )
      );
  }
  busca.addEventListener("input", () => {
    const termo = busca.value.toLowerCase();
    const filtrados = usuarios.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
    renderUsuarios(filtrados);
  });
  async function editarUsuario(id) {
    const usuario = usuarios.find((u) => u.id == id);
    if (!usuario) return alert("Usuário não encontrado.");
    const novoNome = prompt("Digite o novo nome:", usuario.nome);
    const novoTelefone = prompt(
      "Digite o novo telefone:",
      usuario.telefone || ""
    );
    if (!novoNome) return alert("Nome é obrigatório.");
    const dadosAtualizados = {
      Nome: novoNome,
      Telefone: novoTelefone,
      TipoUsuario: usuario.tipoUsuario,
    };
    try {
      const res = await fetch(`${apiURL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados),
      });
      if (res.ok) {
        alert("✅ Usuário atualizado com sucesso!");
        carregarUsuarios();
      } else {
        alert("❌ Erro ao atualizar usuário.");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Erro ao conectar ao servidor.");
    }
  }
  async function alterarAcesso(id, tipoAtual) {
    const novoTipo =
      tipoAtual === "Administrador" ? "Usuario" : "Administrador";
    if (!confirm(`Tem certeza que deseja alterar o acesso para ${novoTipo}?`))
      return;
    try {
      const res = await fetch(`${apiURL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TipoUsuario: novoTipo }),
      });
      if (res.ok) {
        alert(`✅ Acesso alterado para ${novoTipo}!`);
        carregarUsuarios();
      } else {
        alert("❌ Erro ao alterar acesso.");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Erro ao conectar ao servidor.");
    }
  }
  async function excluirUsuario(id) {
    if (!confirm("⚠️ Deseja realmente excluir este usuário?")) return;
    try {
      const res = await fetch(`${apiURL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("🗑️ Usuário excluído com sucesso!");
        carregarUsuarios();
      } else {
        alert("❌ Erro ao excluir usuário.");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Erro ao conectar ao servidor.");
    }
  }
  carregarUsuarios();
});
function sairSistema() {
  localStorage.clear();
  window.location.href = "index.html";
}
