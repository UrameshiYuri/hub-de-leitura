const { remote } = require("webdriverio");
const assert = require("node:assert/strict");
const config = require("../config");
const { LoginPage } = require("../pages/LoginPage");

describe("Login no Android", function () {
    this.timeout(180000);

    let driver;
    let login;

    before(async function () {
        driver = await remote(config);
        login = new LoginPage(driver);
    });

    after(async function () {
        if (driver) {
            await driver.deleteSession();
        }
    });
    afterEach(async function () {
        if (!driver || this.currentTest.state !== "failed") return;

        const fs = require("node:fs");
        const pasta = "relatorios/mobile";
        const nome = `falha-${Date.now()}`;

        fs.mkdirSync(pasta, { recursive: true });

        try {
            const diagnostico = await driver.execute(() => {
                const email = document.getElementById("email");
                const senha = document.getElementById("password");
                const botao = document.getElementById("login-btn");
                const alerta = document.getElementById("alert-container");

                return {
                    url: window.location.href,
                    paginaCarregada: document.readyState,
                    scriptLoginInicializado:
                        typeof window.fillLogin === "function",
                    email: email ? email.value : null,
                    emailMarcadoInvalido:
                        email ? email.classList.contains("is-invalid") : null,
                    tamanhoSenha: senha ? senha.value.length : null,
                    botaoDesabilitado: botao ? botao.disabled : null,
                    textoBotao: botao ? botao.textContent.trim() : null,
                    alerta: alerta ? alerta.textContent.trim() : null
                };
            });

            console.log("DIAGNÓSTICO MOBILE:", diagnostico);

            fs.writeFileSync(
                `${pasta}/${nome}.json`,
                JSON.stringify(diagnostico, null, 2)
            );
        } catch (erro) {
            console.error("Erro ao coletar diagnóstico:", erro.message);
        }

        try {
            await driver.saveScreenshot(`${pasta}/${nome}.png`);
        } catch (erro) {
            console.error("Erro ao capturar tela:", erro.message);
        }
    });

    it("Deve permitir login de usuário ativo pelo Chrome Android", async function () {
        await login.abrir();
        await login.entrar("teste@teste.com", "teste@123");
        await login.aguardarDashboard();

        const usuario = await driver.execute(() => ({
            nome: localStorage.getItem("userName"),
            token: localStorage.getItem("authToken")
        }));

        assert.equal(usuario.nome, "teste");
        assert.ok(usuario.token, "O login deve salvar o token de autenticação.");
    });
    it("Deve rejeitar credenciais inválidas pelo Chrome Android", async function () {
        await login.abrir();

        // Limpar a sessão deixada pelo teste anterior.
        await driver.execute(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        await login.abrir();

        await login.entrar(
            `inexistente-${Date.now()}@teste.com`,
            "SenhaIncorreta123!"
        );

        await driver.waitUntil(
            async () => {
                const mensagem = await login.alerta.getText();
                return mensagem.includes("Email ou senha incorretos.");
            },
            {
                timeout: 10000,
                timeoutMsg: "A mensagem de credenciais inválidas não apareceu."
            }
        );

        const url = new URL(await driver.getUrl());
        assert.equal(url.pathname, "/login.html");

        const token = await driver.execute(() =>
            localStorage.getItem("authToken")
        );

        assert.equal(token, null, "Um login inválido não deve gerar sessão.");
    });
});