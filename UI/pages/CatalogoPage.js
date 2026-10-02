const { expect } = require("@playwright/test");

class CatalogoPage {
    constructor(page) {
        this.page = page;
        this.busca = page.locator("#search-input");
        this.livros = page.locator("#book-list .card");
        this.titulos = page.locator("#book-list .card-title");
        this.resultados = page.locator("#results-count");
        this.carregando = page.locator("#loading");
    }

    async abrir() {
        await this.page.goto("/catalog.html");

        await expect(this.resultados).not.toContainText(
            "Carregando livros..."
        );

        await expect(this.carregando).toBeHidden();
    }

    async pesquisar(termo) {
        const respostaDaBusca = this.page.waitForResponse(resposta => {
            const url = new URL(resposta.url());

            return (
                url.pathname === "/api/books" &&
                url.searchParams.get("search") === termo &&
                resposta.request().method() === "GET"
            );
        });

        await this.busca.fill(termo);

        const resposta = await respostaDaBusca;
        expect(resposta.status()).toBe(200);

        await expect(this.carregando).toBeHidden();
    }

    async adicionarLivro(bookId) {
        const botao = this.page.locator(
            `.add-to-cart[data-id="${bookId}"]`
        );

        const respostaDaAdicao = this.page.waitForResponse(resposta => {
            return (
                new URL(resposta.url()).pathname === "/api/basket" &&
                resposta.request().method() === "POST"
            );
        });

        await botao.click();

        const resposta = await respostaDaAdicao;
        await expect(botao).toBeEnabled();

        return resposta;
    }
}

module.exports = { CatalogoPage };