class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl =
            process.env.MOBILE_BASE_URL || "http://10.0.2.2:3000";
    }

    get email() {
        return this.driver.$("#email");
    }

    get senha() {
        return this.driver.$("#password");
    }

    get botaoEntrar() {
        return this.driver.$("#login-btn");
    }

    get alerta() {
        return this.driver.$("#alert-container");
    }

    async abrir() {
        await this.driver.url(`${this.baseUrl}/login.html`);

        await this.email.waitForDisplayed({
            timeout: 15000
        });
    }

    async entrar(email, senha) {
        await this.email.setValue(email);
        await this.senha.setValue(senha);
        await this.botaoEntrar.scrollIntoView();
        await this.botaoEntrar.click();
    }

    async aguardarDashboard() {
        await this.driver.waitUntil(
            async () => {
                const url = await this.driver.getUrl();
                return new URL(url).pathname === "/dashboard.html";
            },
            {
                timeout: 15000,
                timeoutMsg: "O login não redirecionou para o dashboard."
            }
        );
    }
}

module.exports = { LoginPage };