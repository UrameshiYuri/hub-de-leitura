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

        const botao = await this.botaoEntrar;

        await botao.scrollIntoView({
            block: "center",
            inline: "center",
            behavior: "auto"
        });

        await botao.waitForClickable({
            timeout: 15000,
            timeoutMsg: "O botão de login está coberto ou indisponível."
        });
        await this.driver.execute(() => {
            window.diagnosticoLogin = {
                eventos: [],
                erros: []
            };

            const formulario = document.getElementById("login-form");
            const botao = document.getElementById("login-btn");

            window.diagnosticoLogin.botaoLigadoAoFormulario =
                botao.form === formulario;

            document.addEventListener("click", (evento) => {
                const registro = {
                    tipo: "click",
                    elemento: evento.target.tagName,
                    id: evento.target.id,
                    cancelado: false
                };

                window.diagnosticoLogin.eventos.push(registro);

                setTimeout(() => {
                    registro.cancelado = evento.defaultPrevented;
                }, 0);
            }, { capture: true, once: true });

            formulario.addEventListener("submit", () => {
                window.diagnosticoLogin.eventos.push({
                    tipo: "submit"
                });
            }, { capture: true, once: true });

            window.addEventListener("error", (evento) => {
                window.diagnosticoLogin.erros.push(evento.message);
            });

            window.addEventListener("unhandledrejection", (evento) => {
                window.diagnosticoLogin.erros.push(String(evento.reason));
            });
        });

        await this.driver
            .action("pointer", {
                parameters: { pointerType: "touch" }
            })
            .move({
                origin: botao,
                x: 0,
                y: 0,
                duration: 0
            })
            .down({ button: 0 })
            .pause(100)
            .up({ button: 0 })
            .perform();
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