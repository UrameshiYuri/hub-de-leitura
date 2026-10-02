const request = require("supertest");
const Joi = require("joi");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const api = request("http://localhost:3000");

describe("Contratos de cupons com Supertest", function () {
    this.timeout(10000);

    let tokenAdmin;
    const codigoTeste = `CONTRATO-${randomUUID()}`;

    after(async () => {
        const caminho = path.join(
            __dirname,
            "../../database/biblioteca.db"
        );

        const db = await new Promise((resolve, reject) => {
            const conexao = new sqlite3.Database(
                caminho,
                sqlite3.OPEN_READWRITE,
                err => {
                    if (err) return reject(err);
                    resolve(conexao);
                }
            );
        });

        try {
            await new Promise((resolve, reject) => {
                db.run(
                    "DELETE FROM Coupons WHERE codigo = ?",
                    [codigoTeste],
                    err => {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });
        } finally {
            await new Promise((resolve, reject) => {
                db.close(err => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
    });

    function validarContrato(contrato, body) {
        const { error } = contrato.validate(body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);
    }

    before(async () => {
        const resposta = await api
            .post("/api/login")
            .send({
                email: "admin@biblioteca.com",
                password: "admin123"
            })
            .expect(200);

        assert.equal(resposta.body.isAdmin, true);
        assert.equal(typeof resposta.body.token_for_swagger, "string");

        tokenAdmin = resposta.body.token_for_swagger;
    });

    it("Deve retornar o contrato de acesso sem token", async () => {
        const resposta = await api
            .get("/api/coupons")
            .expect("Content-Type", /json/)
            .expect(401);

        const contrato = Joi.object({
            message: Joi.string()
                .valid("Token de acesso necessário")
                .required(),
            error: Joi.string()
                .valid("MISSING_TOKEN")
                .required(),
            hint: Joi.string().min(1).required()
        }).unknown(false);

        validarContrato(contrato, resposta.body);
    });

    it("Deve retornar o contrato de ID inválido", async () => {
        const resposta = await api
            .get("/api/coupons/abc")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect("Content-Type", /json/)
            .expect(400);

        const contrato = Joi.object({
            message: Joi.string()
                .valid("ID do cupom inválido.")
                .required()
        }).unknown(false);

        validarContrato(contrato, resposta.body);
    });
    it("Deve validar cadastro, consulta e duplicidade de cupom fixo", async () => {
        const cupom = {
            codigo: codigoTeste,
            tipo_desconto: "fixed_product",
            valor_centavos: 1000,
            descricao: "Cupom temporário de contrato"
        };

        const contratoCupomFixo = Joi.object({
            id: Joi.number().integer().positive().required(),
            codigo: Joi.string().valid(codigoTeste).required(),
            tipo_desconto: Joi.string()
                .valid("fixed_product")
                .required(),
            percentual: Joi.valid(null).required(),
            valor_centavos: Joi.number().integer().valid(1000).required(),
            descricao: Joi.string().valid(cupom.descricao).required(),
            minimo_centavos: Joi.number().integer().valid(0).required(),
            ativo: Joi.number().integer().valid(1).required(),
            validade: Joi.valid(null).required()
        }).unknown(false);

        // Cadastrar o cupom.
        const cadastro = await api
            .post("/api/coupons")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(cupom)
            .expect("Content-Type", /json/)
            .expect(201);

        validarContrato(contratoCupomFixo, cadastro.body);

        // Consultar o registro salvo.
        const consulta = await api
            .get(`/api/coupons/${cadastro.body.id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect("Content-Type", /json/)
            .expect(200);

        validarContrato(contratoCupomFixo, consulta.body);
        assert.deepEqual(consulta.body, cadastro.body);

        // Repetir o código deve gerar conflito.
        const duplicado = await api
            .post("/api/coupons")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(cupom)
            .expect("Content-Type", /json/)
            .expect(409);

        const contratoDuplicidade = Joi.object({
            message: Joi.string()
                .valid("Já existe um cupom com esse código.")
                .required()
        }).unknown(false);

        validarContrato(contratoDuplicidade, duplicado.body);
    });
    const camposObrigatorios = [
        {
            campo: "codigo",
            mensagem: "Código e descrição são obrigatórios."
        },
        {
            campo: "descricao",
            mensagem: "Código e descrição são obrigatórios."
        },
        {
            campo: "tipo_desconto",
            mensagem: "Tipo de desconto deve ser percent ou fixed_product."
        },
        {
            campo: "valor_centavos",
            mensagem:
                "Informe valor_centavos inteiro positivo e percentual nulo ou omitido."
        }
    ];

    camposObrigatorios.forEach(({ campo, mensagem }) => {
        it(`Deve validar o contrato de cadastro sem ${campo}`, async () => {
            const cupom = {
                codigo: codigoTeste,
                tipo_desconto: "fixed_product",
                valor_centavos: 1000,
                descricao: "Teste de campo obrigatório"
            };

            delete cupom[campo];

            const resposta = await api
                .post("/api/coupons")
                .set("Authorization", `Bearer ${tokenAdmin}`)
                .send(cupom)
                .expect("Content-Type", /json/)
                .expect(400);

            const contrato = Joi.object({
                message: Joi.string().valid(mensagem).required()
            }).unknown(false);

            validarContrato(contrato, resposta.body);
        });
    });
    it("Deve retornar o contrato de acesso negado para usuário comum", async () => {
        const login = await api
            .post("/api/login")
            .send({
                email: "teste@teste.com",
                password: "teste@123"
            })
            .expect(200);

        assert.equal(login.body.isAdmin, false);
        assert.equal(typeof login.body.token_for_swagger, "string");

        const resposta = await api
            .post("/api/coupons")
            .set(
                "Authorization",
                `Bearer ${login.body.token_for_swagger}`
            )
            .send({
                codigo: codigoTeste,
                tipo_desconto: "fixed_product",
                valor_centavos: 1000,
                descricao: "Tentativa de cadastro por usuário comum"
            })
            .expect("Content-Type", /json/)
            .expect(403);

        const contrato = Joi.object({
            message: Joi.string()
                .valid("Acesso negado. Apenas administradores podem realizar esta ação.")
                .required(),
            error: Joi.string().valid("ADMIN_REQUIRED").required(),
            userRole: Joi.string().valid("user").required(),
            requiredRole: Joi.string().valid("admin").required()
        }).unknown(false);

        validarContrato(contrato, resposta.body);
    });
    it("Deve retornar uma lista de cupons com contrato válido", async () => {
        const resposta = await api
            .get("/api/coupons")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect("Content-Type", /json/)
            .expect(200);

        const contratoCupom = Joi.object({
            id: Joi.number().integer().positive().required(),
            codigo: Joi.string().trim().min(1).required(),

            tipo_desconto: Joi.string()
                .valid("percent", "fixed_product")
                .required(),

            percentual: Joi.when("tipo_desconto", {
                is: "percent",
                then: Joi.number().integer().min(1).max(100).required(),
                otherwise: Joi.valid(null).required()
            }),

            valor_centavos: Joi.when("tipo_desconto", {
                is: "fixed_product",
                then: Joi.number().integer().positive().required(),
                otherwise: Joi.valid(null).required()
            }),

            descricao: Joi.string().trim().min(1).required(),
            minimo_centavos: Joi.number().integer().min(0).required(),
            ativo: Joi.number().integer().valid(0, 1).required(),
            validade: Joi.string().isoDate().allow(null).required()
        }).unknown(false);

        const contratoLista = Joi.array()
            .items(contratoCupom)
            .required();

        validarContrato(contratoLista, resposta.body);
    });
    it("Deve rejeitar cadastro sem token com contrato válido", async () => {
        const resposta = await api
            .post("/api/coupons")
            .send({
                codigo: codigoTeste,
                tipo_desconto: "fixed_product",
                valor_centavos: 1000,
                descricao: "Tentativa de cadastro sem autenticação"
            })
            .expect("Content-Type", /json/)
            .expect(401);

        const contrato = Joi.object({
            message: Joi.string()
                .valid("Token de acesso necessário")
                .required(),
            error: Joi.string()
                .valid("MISSING_TOKEN")
                .required(),
            hint: Joi.string().min(1).required()
        }).unknown(false);

        validarContrato(contrato, resposta.body);
    });
});