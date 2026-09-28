const { spec } = require("pactum");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

describe("Login", function () {
    this.timeout(10000);

    let db;
    let userId;

    const email = `qa-login-${Date.now()}@teste.com`;
    const senha = "TesteLogin123!";

    function executar(sql, parametros = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, parametros, function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    }

    function login(password) {
        return spec()
            .post("http://localhost:3000/api/login")
            .withJson({ email, password });
    }

    before(async () => {
        const caminho = path.join(
            __dirname, "../../database/biblioteca.db"
        );

        db = await new Promise((resolve, reject) => {
            const conexao = new sqlite3.Database(
                caminho,
                sqlite3.OPEN_READWRITE,
                err => {
                    if (err) return reject(err);
                    resolve(conexao);
                }
            );
        });

        const hash = await bcrypt.hash(senha, 10);

        const resultado = await executar(
            `INSERT INTO Users (name, email, password, isAdmin, ativo)
       VALUES (?, ?, ?, 0, 1)`,
            ["Usuário de teste automatizado", email, hash]
        );

        userId = resultado.lastID;
    });

    beforeEach(async () => {
        await executar(
            `UPDATE Users
       SET ativo = 1, tentativas_login = 0, bloqueado_ate = NULL
       WHERE id = ?`,
            [userId]
        );
    });

    after(async () => {
        if (!db) return;

        try {
            if (userId) {
                await executar("DELETE FROM Users WHERE id = ?", [userId]);
            }
        } finally {
            await new Promise((resolve, reject) => {
                db.close(err => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
    });

    it("Deve permitir login de usuário ativo", async () => {
        await login(senha)
            .expectStatus(200)
            .expectJson("email", email)
            .expectJson("isAdmin", false);
    });

    it("Deve rejeitar senha incorreta", async () => {
        await login("senha-errada")
            .expectStatus(401)
            .expectJson("error", "INVALID_CREDENTIALS");
    });

    it("Deve rejeitar usuário inativo", async () => {
        await executar(
            "UPDATE Users SET ativo = 0 WHERE id = ?",
            [userId]
        );

        await login(senha)
            .expectStatus(403)
            .expectJson("error", "USER_INACTIVE");
    });

    it("Deve bloquear no terceiro erro e recusar a senha correta", async () => {
        await login("senha-errada").expectStatus(401);
        await login("senha-errada").expectStatus(401);

        const resposta = await login("senha-errada")
            .expectStatus(429)
            .expectJson("error", "LOGIN_BLOCKED");

        await login(senha)
            .expectStatus(429)
            .expectJson("error", "LOGIN_BLOCKED")
            .expectJson("bloqueado_ate", resposta.body.bloqueado_ate);
    });

    it("Deve permitir login após o bloqueio vencer", async () => {
        await executar(
            `UPDATE Users
       SET tentativas_login = 3, bloqueado_ate = ?
       WHERE id = ?`,
            [Date.now() - 1000, userId]
        );

        await login(senha).expectStatus(200);
    });

    it("Deve zerar os erros após login correto", async () => {
        await login("senha-errada").expectStatus(401);
        await login("senha-errada").expectStatus(401);

        await login(senha).expectStatus(200);

        await login("senha-errada")
            .expectStatus(401)
            .expectJson("error", "INVALID_CREDENTIALS");

        await login(senha).expectStatus(200);
    });
});