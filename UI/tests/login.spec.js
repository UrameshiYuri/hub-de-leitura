const { test, expect } = require("@playwright/test");
const { LoginPage } = require("../pages/LoginPage");

test("Deve permitir login pela interface", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.abrir();
    await loginPage.entrar("teste@teste.com", "teste@123");

    await expect(page).toHaveURL(
        /\/dashboard\.html$/,
        { timeout: 10000 }
    );

    await expect(
        page.locator("#header .user-info")
    ).toContainText("teste");
});
test("Deve exibir erro para credenciais inválidas", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.abrir();

    await loginPage.entrar(
        `inexistente-${Date.now()}@teste.com`,
        "SenhaIncorreta123!"
    );

    await expect(loginPage.alerta).toBeVisible();

    await expect(loginPage.alerta).toContainText(
        "Email ou senha incorretos."
    );

    await expect(page).toHaveURL(/\/login\.html$/);

    const token = await page.evaluate(() =>
        localStorage.getItem("authToken")
    );

    expect(token).toBeNull();
});