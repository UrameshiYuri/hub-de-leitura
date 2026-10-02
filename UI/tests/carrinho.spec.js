const { test, expect } = require("@playwright/test");
const { LoginPage } = require("../pages/LoginPage");
const { CatalogoPage } = require("../pages/CatalogoPage");
const { CarrinhoPage } = require("../pages/CarrinhoPage");

test("Deve adicionar duas unidades e exibir desconto de 10%", async ({ page }) => {
    const login = new LoginPage(page);
    const catalogo = new CatalogoPage(page);
    const carrinho = new CarrinhoPage(page);

    await login.abrir();
    await login.entrar("teste@teste.com", "teste@123");
    await expect(page).toHaveURL(/\/dashboard\.html$/);

    const sessao = await page.evaluate(() => ({
        userId: localStorage.getItem("userId"),
        token: localStorage.getItem("authToken")
    }));

    async function limparPelaApi() {
        const resposta = await page.request.delete(
            `/api/basket/${sessao.userId}`,
            {
                headers: {
                    Authorization: sessao.token
                }
            }
        );

        expect(resposta.status()).toBe(200);
    }

    try {
        // Preparação: iniciar com o carrinho vazio.
        await limparPelaApi();

        await catalogo.abrir();
        await catalogo.pesquisar("O Pequeno Príncipe");

        const primeiraAdicao = await catalogo.adicionarLivro(3);
        expect(primeiraAdicao.status()).toBe(201);

        const segundaAdicao = await catalogo.adicionarLivro(3);
        expect(segundaAdicao.status()).toBe(200);

        await carrinho.abrir();

        await expect(carrinho.itens).toHaveCount(1);
        await expect(carrinho.itens).toContainText("Quantidade: 2");

        await expect(
            carrinho.valorDoResumo("Quantidade de unidades:")
        ).toHaveText("2");

        await expect(
            carrinho.valorDoResumo("Subtotal:")
        ).toHaveText(/R\$\s*200,00/);

        await expect(
            carrinho.valorDoResumo("Desconto automático (10%):")
        ).toHaveText(/R\$\s*20,00/);

        await expect(
            carrinho.valorDoResumo("Total final:")
        ).toHaveText(/R\$\s*180,00/);
    } finally {
        // Limpeza, inclusive quando alguma verificação falhar.
        await limparPelaApi();
    }
});
test("Deve rejeitar adição acima de R$ 990 pela interface", async ({ page }) => {
    const login = new LoginPage(page);
    const catalogo = new CatalogoPage(page);
    const carrinho = new CarrinhoPage(page);

    await login.abrir();
    await login.entrar("teste@teste.com", "teste@123");
    await expect(page).toHaveURL(/\/dashboard\.html$/);

    const sessao = await page.evaluate(() => ({
        userId: localStorage.getItem("userId"),
        token: localStorage.getItem("authToken")
    }));

    async function limparPelaApi() {
        const resposta = await page.request.delete(
            `/api/basket/${sessao.userId}`,
            { headers: { Authorization: sessao.token } }
        );

        expect(resposta.status()).toBe(200);
    }

    try {
        await limparPelaApi();

        // Preparação: nove unidades de R$ 100 = R$ 900.
        const preparacao = await page.request.post("/api/basket", {
            headers: { Authorization: sessao.token },
            data: {
                userId: Number(sessao.userId),
                bookId: 3,
                quantity: 9
            }
        });

        expect(preparacao.status()).toBe(201);

        await carrinho.abrir();

        await expect(carrinho.itens).toContainText("Quantidade: 9");

        await expect(
            carrinho.valorDoResumo("Subtotal:")
        ).toHaveText(/R\$\s*900,00/);

        // A décima unidade elevaria o total para R$ 1.000.
        await catalogo.abrir();
        await catalogo.pesquisar("O Pequeno Príncipe");

        const resposta = await catalogo.adicionarLivro(3);
        expect(resposta.status()).toBe(409);

        await expect(page.locator("#alert-container")).toBeVisible();

        await expect(page.locator("#alert-container")).toContainText(
            "Adição não permitida."
        );

        // Conferir que a tentativa rejeitada não alterou a cesta.
        await carrinho.abrir();

        await expect(carrinho.itens).toHaveCount(1);
        await expect(carrinho.itens).toContainText("Quantidade: 9");

        await expect(
            carrinho.valorDoResumo("Quantidade de unidades:")
        ).toHaveText("9");

        await expect(
            carrinho.valorDoResumo("Subtotal:")
        ).toHaveText(/R\$\s*900,00/);

        await expect(
            carrinho.valorDoResumo("Desconto automático (15%):")
        ).toHaveText(/R\$\s*135,00/);

        await expect(
            carrinho.valorDoResumo("Total final:")
        ).toHaveText(/R\$\s*765,00/);
    } finally {
        await limparPelaApi();
    }
});