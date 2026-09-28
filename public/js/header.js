document.addEventListener("DOMContentLoaded", function () {
  fetch("/header.html")
    .then((response) => response.text())
    .then((data) => {
      console.log("Header HTML carregado");
      // Inserir HTML do header
      document.getElementById("header").innerHTML = data;

      // Aguardar um pouco para garantir que o DOM foi processado
      setTimeout(() => {
        // Adaptar conteúdo para biblioteca
        adaptHeaderForLibrary();

        // Verificar login e atualizar interface
        checkLoginStatus();

        // SEMPRE atualizar contador da cesta (independente de login)
        setTimeout(() => {
          updateCartCount();
        }, 200);
      }, 100);
    })
    .catch((error) => {
      console.error("Erro ao carregar header:", error);
    });

  function adaptHeaderForLibrary() {
    console.log("Adaptando header para biblioteca...");

    const links = document.querySelectorAll(
      'a[href="/basket.html"], a[href="/dashboard.html"]'
    );

    links.forEach((link) => {
      if (
        link.textContent.includes("CARRINHO") ||
        link.textContent.includes("MINHAS RESERVAS")
      ) {
        link.href = "/basket.html";
        const innerHTML = link.innerHTML;
        link.innerHTML = innerHTML
          .replace("CARRINHO", "CESTA DE LIVROS")
          .replace("MINHAS RESERVAS", "CESTA DE LIVROS");
        console.log("Link atualizado:", link.href, link.textContent);
      }
    });

    // Garantir que o ID seja cart-count
    const reservationCount = document.getElementById("reservation-count");
    if (reservationCount) {
      reservationCount.id = "cart-count";
      console.log("ID alterado de reservation-count para cart-count");
    }
  }

  function checkLoginStatus() {
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName");
    const isAdmin =
      localStorage.getItem("isAdmin") === "true" ||
      localStorage.getItem("isAdmin") === "1";
    const accountLink = document.getElementById("account-link");

    if (token && userName && accountLink) {
      console.log("Usuário logado:", userName);

      // Criar estrutura com nome + botão logout
      const parentLi = accountLink.parentNode;

      // Limpar classes de dropdown se existirem
      parentLi.classList.remove("dropdown");
      parentLi.className = "nav-item ms-2 d-flex align-items-center";

      // Substituir o conteúdo por: ícone + nome clicável + botões
      parentLi.innerHTML = `
                    <!-- Nome do usuário (clicável para dashboard) -->
                    <a href="${isAdmin ? '/admin-dashboard.html' : '/dashboard.html'}" class="user-info d-flex align-items-center text-dark text-decoration-none me-2" 
                       title="${isAdmin ? 'Painel Admin' : 'Meu Dashboard'}">
                        <i class="fas fa-user-circle me-2" style="font-size: 1.2rem;"></i>
                        <span class="fw-bold">${userName}</span>
                        ${isAdmin
          ? '<i class="fas fa-crown text-warning ms-1" title="Administrador"></i>'
          : ""
        }
                    </a>
                    
                    <!-- Botões de ação -->
                    <div class="user-actions d-flex align-items-center">
                        ${!isAdmin
          ? `
                            <a href="/dashboard.html" class="btn btn-outline-primary btn-sm me-1" title="Minhas Reservas">
                                <i class="fas fa-bookmark"></i>
                            </a>
                        `
          : ""
        }
                        ${isAdmin
          ? `
                            <a href="/admin-dashboard.html" class="btn btn-outline-secondary btn-sm me-1" title="Painel Admin">
                                <i class="fas fa-cog"></i>
                            </a>
                        `
          : ""
        }
                        <button class="btn btn-outline-danger btn-sm" onclick="performLogout()" title="Sair">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                `;

      console.log("Interface de usuário logado criada");
    } else {
      // Usuário não logado
      const accountLink = document.getElementById("account-link");
      if (accountLink) {
        const parentLi = accountLink.parentNode;

        // Restaurar estrutura original
        parentLi.className = "nav-item ms-2";
        parentLi.innerHTML = `
                    <a class="account-btn" href="/login.html" id="account-link">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>ENTRAR</span>
                    </a>
                `;
      }
    }
  }

  // Função de logout
  function performLogout() {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("isAdmin");

      window.location.href = "/login.html";
    }
  }

  // Recarregar o header quando o estado de login muda
  window.refreshHeader = function () {
    const headerElement = document.getElementById("header");

    if (!headerElement) return;

    return fetch("/header.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Não foi possível carregar o cabeçalho.");
        }

        return response.text();
      })
      .then((data) => {
        headerElement.innerHTML = data;
        adaptHeaderForLibrary();
        checkLoginStatus();

        return updateCartCount();
      })
      .catch((erro) => {
        console.error("Erro ao atualizar o cabeçalho:", erro);
      });
  };

  window.performLogout = performLogout;
}); // Fecha o DOMContentLoaded

// Atualizar o contador com a quantidade de unidades da API
async function updateCartCount() {
  const countElement =
    document.getElementById("cart-count") ||
    document.querySelector(".cart-badge");

  if (!countElement) return;

  const token = localStorage.getItem("authToken");
  const userId = Number(localStorage.getItem("userId"));

  if (!token || !Number.isSafeInteger(userId) || userId <= 0) {
    countElement.textContent = "0";
    countElement.title = "Quantidade de unidades na cesta";
    return;
  }

  try {
    const resposta = await fetch(`/api/basket/${userId}`, {
      headers: {
        Authorization: token
      }
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar o contador da cesta.");
    }

    const dados = await resposta.json();
    const quantidade = dados.summary.totalUnits;

    if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
      throw new Error("Quantidade inválida na resposta da API.");
    }

    countElement.textContent = quantidade;
    countElement.title = "Quantidade de unidades na cesta";
  } catch (erro) {
    countElement.textContent = "—";
    countElement.title = "Não foi possível atualizar o contador";
    console.error(erro.message);
  }
}

window.updateCartCount = updateCartCount;