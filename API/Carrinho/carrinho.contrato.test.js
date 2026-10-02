const request = require("supertest");
const Joi = require("joi");
const assert = require("node:assert/strict");

const api = request("http://localhost:3000");

describe("Contratos do carrinho com Supertest", function () {
    this.timeout(10000);

    let userId;
    let token;

    function validarContrato(contrato, body) {
        const { error } = contrato.validate(body, {
            abortEarly: false,
            convert: false
        });

        assert.ifError(error);
    }

    async function limparCarrinho() {
        await api
            .delete(`/api/basket/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    }

    before(async () => {
        const resposta = await api
            .post("/api/login")
            .send({
                email: "teste@teste.com",
                password: "teste@123"
            })
            .expect(200);

        userId = resposta.body.id;
        token = resposta.body.token_for_swagger;

        assert.ok(Number.isSafeInteger(userId) && userId > 0);
        assert.equal(typeof token, "string");
        assert.ok(token.length > 0);
    });

    beforeEach(async () => {
        await limparCarrinho();
    });

    after(async () => {
        if (userId && token) {
            await limparCarrinho();
        }
    });

    it("Deve retornar o contrato de carrinho vazio", async () => {
        const resposta = await api
            .get(`/api/basket/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /json/)
            .expect(200);

        const contrato = Joi.object({
            items: Joi.array().length(0).required(),
            total: Joi.number().integer().valid(0).required(),
            total_centavos: Joi.number().integer().valid(0).required(),
            percentual_desconto: Joi.number().integer().valid(0).required(),
            desconto_centavos: Joi.number().integer().valid(0).required(),
            total_final_centavos: Joi.number().integer().valid(0).required(),
            userId: Joi.number().integer().valid(userId).required(),

            summary: Joi.object({
                totalItems: Joi.number().integer().valid(0).required(),
                totalUnits: Joi.number().integer().valid(0).required(),
                availableItems: Joi.number().integer().valid(0).required(),
                unavailableItems: Joi.number().integer().valid(0).required()
            }).unknown(false).required()
        }).unknown(false);

        validarContrato(contrato, resposta.body);
    });
    const cenarios = [
        { quantidade: 1, total: 10000, percentual: 0, desconto: 0, final: 10000 },
        { quantidade: 2, total: 20000, percentual: 10, desconto: 2000, final: 18000 },
        { quantidade: 6, total: 60000, percentual: 10, desconto: 6000, final: 54000 },
        { quantidade: 7, total: 70000, percentual: 15, desconto: 10500, final: 59500 }
    ];

    cenarios.forEach(cenario => {
        it(`Deve validar contrato e desconto para R$ ${cenario.total / 100}`, async () => {
            await api
                .post("/api/basket")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    bookId: 3,
                    quantity: cenario.quantidade
                })
                .expect(201);

            const resposta = await api
                .get(`/api/basket/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect("Content-Type", /json/)
                .expect(200);

            const contratoItem = Joi.object({
                id: Joi.number().integer().positive().required(),
                user_id: Joi.number().integer().valid(userId).required(),
                book_id: Joi.number().integer().valid(3).required(),
                quantity: Joi.number()
                    .integer()
                    .valid(cenario.quantidade)
                    .required(),

                added_date: Joi.string()
                    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
                    .required(),

                book_title: Joi.string().min(1).required(),
                book_author: Joi.string().min(1).required(),
                cover_image: Joi.string().allow("", null).required(),
                available: Joi.number().integer().valid(1).required(),
                available_copies: Joi.number()
                    .integer()
                    .min(cenario.quantidade)
                    .required(),
                total_copies: Joi.number()
                    .integer()
                    .min(cenario.quantidade)
                    .required(),
                preco_centavos: Joi.number().integer().valid(10000).required(),
                subtotal_centavos: Joi.number()
                    .integer()
                    .valid(cenario.total)
                    .required()
            }).unknown(false);

            const contratoCarrinho = Joi.object({
                items: Joi.array().items(contratoItem).length(1).required(),
                total: Joi.number().integer().valid(1).required(),
                userId: Joi.number().integer().valid(userId).required(),
                total_centavos: Joi.number()
                    .integer().valid(cenario.total).required(),
                percentual_desconto: Joi.number()
                    .integer().valid(cenario.percentual).required(),
                desconto_centavos: Joi.number()
                    .integer().valid(cenario.desconto).required(),
                total_final_centavos: Joi.number()
                    .integer().valid(cenario.final).required(),

                summary: Joi.object({
                    totalItems: Joi.number().integer().valid(1).required(),
                    totalUnits: Joi.number()
                        .integer().valid(cenario.quantidade).required(),
                    availableItems: Joi.number().integer().valid(1).required(),
                    unavailableItems: Joi.number().integer().valid(0).required()
                }).unknown(false).required()
            }).unknown(false);

            validarContrato(contratoCarrinho, resposta.body);
        });
    });
    it("Deve rejeitar inclusão acima de R$ 990 e preservar o carrinho", async () => {
        const antes = await api
            .get(`/api/basket/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        // 10 unidades de R$ 100 totalizam R$ 1.000.
        const resposta = await api
            .post("/api/basket")
            .set("Authorization", `Bearer ${token}`)
            .send({
                userId,
                bookId: 3,
                quantity: 10
            })
            .expect("Content-Type", /json/)
            .expect(409);

        const contratoErro = Joi.object({
            message: Joi.string()
                .valid(
                    "Adição não permitida. Confira os preços, o estoque e os limites de 10 unidades por livro e R$ 990 por carrinho. Consulte o carrinho novamente."
                )
                .required()
        }).unknown(false);

        validarContrato(contratoErro, resposta.body);

        const depois = await api
            .get(`/api/basket/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        assert.deepEqual(antes.body.items, []);
        assert.deepEqual(
            depois.body,
            antes.body,
            "A tentativa rejeitada não deve alterar o carrinho."
        );
    });
    it("Deve aceitar R$ 990 e rejeitar a 11ª unidade sem alterar o carrinho", async () => {
        // Livro 24: R$ 99 por unidade.
        await api
            .post("/api/basket")
            .set("Authorization", `Bearer ${token}`)
            .send({
                userId,
                bookId: 24,
                quantity: 10
            })
            .expect(201);

        const antes = await api
            .get(`/api/basket/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /json/)
            .expect(200);

        assert.equal(antes.body.items.length, 1);
        assert.equal(antes.body.items[0].book_id, 24);
        assert.equal(antes.body.items[0].quantity, 10);
        assert.equal(antes.body.total_centavos, 99000);
        assert.equal(antes.body.percentual_desconto, 15);
        assert.equal(antes.body.desconto_centavos, 14850);
        assert.equal(antes.body.total_final_centavos, 84150);

        const resposta = await api
            .post("/api/basket")
            .set("Authorization", `Bearer ${token}`)
            .send({
                userId,
                bookId: 24,
                quantity: 1
            })
            .expect("Content-Type", /json/)
            .expect(400);

        const contratoErro = Joi.object({
            message: Joi.string()
                .valid("O carrinho permite no máximo 10 unidades do mesmo livro.")
                .required()
        }).unknown(false);

        validarContrato(contratoErro, resposta.body);

        const depois = await api
            .get(`/api/basket/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        assert.deepEqual(
            depois.body,
            antes.body,
            "A 11ª unidade deve ser rejeitada sem alterar o carrinho."
        );
    });
    const inclusoesAcimaDoLimite = [
        {
            nome: "atualização de livro existente",
            bookId: 3,
            quantity: 8
        },
        {
            nome: "inclusão de outro livro",
            bookId: 24,
            quantity: 8
        }
    ];

    inclusoesAcimaDoLimite.forEach(cenario => {
        it(`Deve rejeitar ${cenario.nome} acima de R$ 990`, async () => {
            // Estado inicial: duas unidades de R$ 100.
            await api
                .post("/api/basket")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    bookId: 3,
                    quantity: 2
                })
                .expect(201);

            const antes = await api
                .get(`/api/basket/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            assert.equal(antes.body.items.length, 1);
            assert.equal(antes.body.items[0].quantity, 2);
            assert.equal(antes.body.total_centavos, 20000);

            const resposta = await api
                .post("/api/basket")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userId,
                    bookId: cenario.bookId,
                    quantity: cenario.quantity
                })
                .expect("Content-Type", /json/)
                .expect(409);

            const contratoErro = Joi.object({
                message: Joi.string()
                    .valid(
                        "Adição não permitida. Confira os preços, o estoque e os limites de 10 unidades por livro e R$ 990 por carrinho. Consulte o carrinho novamente."
                    )
                    .required()
            }).unknown(false);

            validarContrato(contratoErro, resposta.body);

            const depois = await api
                .get(`/api/basket/${userId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);

            assert.deepEqual(
                depois.body,
                antes.body,
                "A inclusão rejeitada deve preservar todo o carrinho."
            );
        });
    });
});