const request = require("supertest");
const Joi = require("joi");
const assert = require("node:assert/strict");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");
const { randomUUID } = require("node:crypto");
const api = request("http://localhost:3000");

describe("Contrato de login com Supertest", function () {
    this.timeout(10000);
    let db;
    let userId;

    const email = `contrato-${randomUUID()}@teste.com`;
    const senha = "TesteContrato123!";

    function executar(sql, parametros = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, parametros, function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    }
    beforeEach(async () => {
        await executar(
            `UPDATE Users
       SET ativo = 1,
           tentativas_login = 0,
           bloqueado_ate = NULL
       WHERE id = ?`,
            [userId]
        );
    });
    before(async () => {
        const caminho = path.join(
            __dirname,
            "../../database/biblioteca.db"
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
            ["Usuário de contrato", email, hash]
        );

        userId = resultado.lastID;
    });

    after(async () => {
        if (!db) return;

        try {
            if (userId) {
                await executar(
                    "DELETE FROM Users WHERE id = ?",
                    [userId]
                );
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

    it("Deve retornar o contrato esperado quando faltam credenciais", async () => {
        const resposta = await api
            .post("/api/login")
            .send({})
            .expect("Content-Type", /json/)
            .expect(400);

        const contrato = Joi.object({
            message: Joi.string().min(1).required(),
            error: Joi.string().valid("MISSING_FIELDS").required()
        }).unknown(false);

        const { error } = contrato.validate(resposta.body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);

        assert.equal(
            resposta.body.message,
            "Email e senha são obrigatórios."
        );
    });
    it("Deve retornar o contrato esperado para email inválido", async () => {
        const resposta = await api
            .post("/api/login")
            .send({
                email: "email-sem-arroba",
                password: "SenhaTeste123!"
            })
            .expect("Content-Type", /json/)
            .expect(400);

        const contrato = Joi.object({
            message: Joi.string().min(1).required(),
            error: Joi.string()
                .valid("INVALID_EMAIL_FORMAT")
                .required()
        }).unknown(false);

        const { error } = contrato.validate(resposta.body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);

        assert.equal(
            resposta.body.message,
            "Formato de email inválido."
        );
    });
    it("Deve retornar o contrato de login bem-sucedido", async () => {
        const resposta = await api
            .post("/api/login")
            .send({ email, password: senha })
            .expect("Content-Type", /json/)
            .expect(200);

        const formatoJwt =
            /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

        const contrato = Joi.object({
            id: Joi.number().integer().positive().required(),
            name: Joi.string().min(1).required(),
            email: Joi.string().email().required(),
            isAdmin: Joi.boolean().required(),
            token: Joi.string()
                .pattern(/^Bearer \S+$/)
                .required(),
            token_for_swagger: Joi.string()
                .pattern(formatoJwt)
                .required(),
            expiresIn: Joi.string().valid("8h").required(),
            loginTime: Joi.string().isoDate().required()
        }).unknown(false);

        const { error } = contrato.validate(resposta.body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);

        assert.equal(resposta.body.id, userId);
        assert.equal(resposta.body.email, email);
        assert.equal(resposta.body.name, "Usuário de contrato");
        assert.equal(resposta.body.isAdmin, false);

        assert.equal(
            resposta.body.token,
            `Bearer ${resposta.body.token_for_swagger}`
        );
    });
    it("Deve retornar o contrato esperado para senha incorreta", async () => {
        const resposta = await api
            .post("/api/login")
            .send({
                email,
                password: "senha-incorreta"
            })
            .expect("Content-Type", /json/)
            .expect(401);

        const contrato = Joi.object({
            message: Joi.string()
                .valid("Email ou senha incorretos.")
                .required(),
            error: Joi.string()
                .valid("INVALID_CREDENTIALS")
                .required()
        }).unknown(false);

        const { error } = contrato.validate(resposta.body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);
    });
    it("Deve retornar o contrato esperado para usuário inativo", async () => {
        await executar(
            "UPDATE Users SET ativo = 0 WHERE id = ?",
            [userId]
        );

        const resposta = await api
            .post("/api/login")
            .send({ email, password: senha })
            .expect("Content-Type", /json/)
            .expect(403);

        const contrato = Joi.object({
            message: Joi.string()
                .valid("Usuário inativo.")
                .required(),
            error: Joi.string()
                .valid("USER_INACTIVE")
                .required()
        }).unknown(false);

        const { error } = contrato.validate(resposta.body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);
    });
    it("Deve retornar o contrato de bloqueio após três erros", async () => {
        for (let tentativa = 1; tentativa <= 2; tentativa++) {
            await api
                .post("/api/login")
                .send({ email, password: "senha-incorreta" })
                .expect(401);
        }

        const inicio = Date.now();

        const resposta = await api
            .post("/api/login")
            .send({ email, password: "senha-incorreta" })
            .expect("Content-Type", /json/)
            .expect(429);

        const fim = Date.now();

        const contrato = Joi.object({
            message: Joi.string().min(1).required(),
            error: Joi.string()
                .valid("LOGIN_BLOCKED")
                .required(),
            bloqueado_ate: Joi.string().isoDate().required()
        }).unknown(false);

        function validarContrato(body) {
            const { error } = contrato.validate(body, {
                abortEarly: false,
                convert: false
            });

            assert.ifError(error);
        }

        validarContrato(resposta.body);

        const bloqueadoAte = Date.parse(resposta.body.bloqueado_ate);
        const quinzeMinutos = 15 * 60 * 1000;

        assert.ok(
            bloqueadoAte >= inicio + quinzeMinutos &&
            bloqueadoAte <= fim + quinzeMinutos,
            "O bloqueio deve terminar 15 minutos após o terceiro erro."
        );

        // Mesmo com senha correta, o bloqueio deve permanecer.
        const segundaResposta = await api
            .post("/api/login")
            .send({ email, password: senha })
            .expect("Content-Type", /json/)
            .expect(429);

        validarContrato(segundaResposta.body);

        assert.equal(
            segundaResposta.body.bloqueado_ate,
            resposta.body.bloqueado_ate,
            "Uma tentativa durante o bloqueio não deve renovar o prazo."
        );
    });
    it("Deve permitir login após o bloqueio vencer", async () => {
        await executar(
            `UPDATE Users
       SET tentativas_login = 3, bloqueado_ate = ?
       WHERE id = ?`,
            [Date.now() - 1000, userId]
        );

        const resposta = await api
            .post("/api/login")
            .send({ email, password: senha })
            .expect("Content-Type", /json/)
            .expect(200);

        assert.equal(resposta.body.id, userId);
        assert.equal(resposta.body.email, email);
    });

    it("Deve zerar as tentativas após um login correto", async () => {
        for (let tentativa = 1; tentativa <= 2; tentativa++) {
            await api
                .post("/api/login")
                .send({ email, password: "senha-incorreta" })
                .expect(401);
        }

        await api
            .post("/api/login")
            .send({ email, password: senha })
            .expect(200);

        // Se os erros anteriores não fossem zerados,
        // esta tentativa provocaria o bloqueio.
        const resposta = await api
            .post("/api/login")
            .send({ email, password: "senha-incorreta" })
            .expect(401);

        assert.equal(resposta.body.error, "INVALID_CREDENTIALS");

        await api
            .post("/api/login")
            .send({ email, password: senha })
            .expect(200);
    });
});
