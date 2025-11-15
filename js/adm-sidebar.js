// ===============================
// 🔒 Função de Logout Global (ADM)
// ===============================
function sairSistema() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("fotoPerfil");
  window.location.href = "index.html";
}

// ===============================
// 👤 Atualiza dados do usuário logado na sidebar
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const sidebarFoto = document.getElementById("sidebarFoto");
  const sidebarName = document.getElementById("sidebarName");
  const sidebarRole = document.getElementById("sidebarRole");

  // Se não houver usuário logado, mostrar padrão
  if (!usuario) {
    if (sidebarName) sidebarName.textContent = "Administrador";
    if (sidebarRole) sidebarRole.textContent = "Offline";
    if (sidebarFoto) sidebarFoto.src = "img/avatar-padrao.png";
    return;
  }

  // === Atualiza nome e tipo ===
  if (sidebarName)
    sidebarName.textContent = usuario.Nome || usuario.nome || "Usuário";
  if (sidebarRole)
    sidebarRole.textContent =
      usuario.TipoUsuario || usuario.Acesso || "Usuário";

  // === Atualiza foto ===
  const fotoSalva = localStorage.getItem("fotoPerfil");
  if (sidebarFoto) {
    if (fotoSalva) {
      sidebarFoto.src = fotoSalva;
    } else if (usuario.FotoPerfil) {
      sidebarFoto.src = usuario.FotoPerfil;
    } else {
      sidebarFoto.src = "img/avatar-padrao.png";
    }
  }
});
