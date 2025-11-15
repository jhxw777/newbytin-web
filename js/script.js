document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    if (!email || !senha) {
      alert("⚠️ Preencha todos os campos!");
      return;
    }
    const apiURL = "http://localhost:5287/api/Login";
    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!response.ok) {
        alert("❌ E-mail ou senha incorretos!");
        return;
      }
      const data = await response.json();
      const usuario = data.usuario || data;
      const usuarioNormalizado = {
        id: usuario.id || usuario.Id,
        nome: usuario.nome || usuario.Nome,
        email: usuario.email || usuario.Email || usuario.emailUsuario,
        acesso: usuario.acesso || usuario.Acesso,
        fotoPerfil: usuario.fotoPerfil || usuario.FotoPerfil,
      };
      console.log("Usuário salvo:", usuarioNormalizado);
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioNormalizado));
      alert(`✅ Bem-vindo(a), ${usuarioNormalizado.nome}!`);
      if (usuarioNormalizado.acesso === "Administrador") {
        window.location.href = "adm-dashboard.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com o servidor:", error);
      alert("⚠️ Não foi possível conectar ao servidor.");
    }
  });
});
