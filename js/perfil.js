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
async function carregarPerfil() {
  const usuarioSessao = await obterUsuarioDaSessao();
  if (!usuarioSessao) {
    window.location.href = "index.html";
    return;
  }
  try {
    const res = await fetch(`${apiBase}/Login/usuario/${usuarioSessao.email}`);
    if (!res.ok) throw new Error("Erro ao buscar usuário");
    const usuarioDB = await res.json();
    document.querySelector(".perfil-dados h3").textContent = usuarioDB.nome;
    document.querySelector(".perfil-dados p").textContent =
      usuarioDB.dataCadastro
        ? `Cliente desde ${usuarioDB.dataCadastro.substring(0, 10)}`
        : "Cliente";
    const nomeSidebar = document.querySelector(".name");
    if (nomeSidebar) nomeSidebar.textContent = usuarioDB.nome;
    const foto = usuarioDB.fotoPerfil || "img/avatar-padrao.png";
    document.getElementById("fotoPerfil").src = foto;
    document.getElementById("sidebarFoto").src = foto;
    document
      .getElementById("uploadFoto")
      .addEventListener("change", async (event) => {
        const file = event.target.files[0];
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
document.addEventListener("DOMContentLoaded", carregarPerfil);
