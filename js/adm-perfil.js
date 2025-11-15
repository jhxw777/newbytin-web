const apiBase = "http://localhost:5287/api";
async function obterUsuarioDaSessao() {
  try {
    const res = await fetch(`${apiBase}/Login/sessao`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Erro ao obter sessão:", err);
    return null;
  }
}
async function carregarPerfilAdmin() {
  const usuarioSessao = await obterUsuarioDaSessao();
  if (!usuarioSessao) {
    window.location.href = "index.html";
    return;
  }
  try {
    const res = await fetch(`${apiBase}/Login/usuario/${usuarioSessao.email}`);
    if (!res.ok) throw new Error("Erro ao buscar usuário");
    const usuarioDB = await res.json();
    document.getElementById("perfilNome").textContent = usuarioDB.nome;
    document.querySelector(".perfil-dados p").textContent =
      usuarioDB.dataCadastro
        ? `Cliente desde ${usuarioDB.dataCadastro.substring(0, 10)}`
        : "Cliente";
    document.getElementById("sidebarName").textContent = usuarioDB.nome;
    document.getElementById("sidebarRole").textContent =
      usuarioDB.acesso || "Administrador";
    const foto = usuarioDB.fotoPerfil || "img/avatar-padrao.png";
    document.getElementById("sidebarFoto").src = foto;
    document.getElementById("fotoPerfil").src = foto;
    document.getElementById("campoNome").value = usuarioDB.nome;
    document.getElementById("campoEmail").value = usuarioDB.email;
    document
      .getElementById("uploadFoto")
      .addEventListener("change", async (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target.result;
          document.getElementById("fotoPerfil").src = base64;
          document.getElementById("sidebarFoto").src = base64;
          const update = await fetch(`${apiBase}/Usuarios/${usuarioDB.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...usuarioDB, fotoPerfil: base64 }),
          });

          if (!update.ok) return alert("Erro ao salvar foto.");
          alert("📸 Foto atualizada!");
        };
        reader.readAsDataURL(file);
      });
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}
document.addEventListener("DOMContentLoaded", carregarPerfilAdmin);
