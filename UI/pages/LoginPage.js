class LoginPage {
    constructor(page) {
        this.page = page;
        this.email = page.locator("#email");
        this.senha = page.locator("#password");
        this.botaoEntrar = page.locator("#login-btn");
        this.alerta = page.locator("#alert-container");
    }

    async abrir() {
        await this.page.goto("/login.html");
    }

    async entrar(email, senha) {
        await this.email.fill(email);
        await this.senha.fill(senha);
        await this.botaoEntrar.click();
    }
}

module.exports = { LoginPage };