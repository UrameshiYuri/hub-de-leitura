const { expect } = require("@playwright/test");

class CarrinhoPage {
    constructor(page) {
        this.page = page;
        this.itens = page.locator("#cart-list .book-item");
        this.resumo = page.locator("#cart-summary");
        this.botaoLimpar = page.locator("#clear-cart-btn");
        this.cestaVazia = page.locator("#empty-cart");
    }

    async abrir() {
        await this.page.goto("/basket.html");
        await expect(this.page.locator("#loading")).toBeHidden();
    }

    valorDoResumo(rotulo) {
        return this.resumo
            .locator("div")
            .filter({ hasText: rotulo })
            .locator("strong");
    }

    async limpar() {
        this.page.once("dialog", dialog => dialog.accept());
        await this.botaoLimpar.click();
        await expect(this.cestaVazia).toBeVisible();
    }
}

module.exports = { CarrinhoPage };