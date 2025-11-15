document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document
      .getElementById("confirmarSenha")
      .value.trim();
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      alert("⚠️ Preencha todos os campos!");
      return;
    }
    if (senha !== confirmarSenha) {
      alert("❌ As senhas não conferem!");
      return;
    }
    const apiURL = "http://localhost:5287/api/cadastro";
    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          senha,
          logado: "false",
          acesso: "Usuário",
          fotoPerfil: "avatar-padrao.png",
        }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        alert("✅ Cadastro realizado com sucesso!");
        console.log("Resposta da API:", data);
        window.location.href = "index.html";
      } else if (response.status === 409) {
        alert("⚠️ E-mail já cadastrado!");
      } else {
        console.error("Erro ao cadastrar:", data);
        alert("❌ Erro ao cadastrar. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error("❌ Erro ao conectar à API:", error);
      alert(
        "⚠️ Não foi possível conectar ao servidor. Verifique se o backend está online (porta 5287)."
      );
    }
  });
});
