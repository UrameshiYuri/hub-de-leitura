const { test, expect } = require("@playwright/test");
const { randomUUID } = require("node:crypto");
const { CatalogoPage } = require("../pages/CatalogoPage");

test("Deve encontrar um livro pelo título", async ({ page }) => {
    const catalogo = new CatalogoPage(page);

    await catalogo.abrir();
    await catalogo.pesquisar("O Pequeno Príncipe");

    await expect(catalogo.livros).toHaveCount(1);
    await expect(catalogo.titulos).toHaveText([
        "O Pequeno Príncipe"
    ]);
});

test("Deve informar quando a busca não encontra livros", async ({ page }) => {
    const catalogo = new CatalogoPage(page);

    await catalogo.abrir();
    await catalogo.pesquisar(`livro-inexistente-${randomUUID()}`);

    await expect(catalogo.resultados).toContainText(
        "Nenhum livro encontrado"
    );

    await expect(catalogo.livros).toHaveCount(0);
});