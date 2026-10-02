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