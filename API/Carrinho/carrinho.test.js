const { spec } = require("pactum");

describe("Carrinho de livros", () => {
    let userId;

    before(async () => {
        const resposta = await spec()
            .post("http://localhost:3000/api/login")
            .withJson({
                email: "teste@teste.com",
                password: "teste@123"
            })
            .expectStatus(200)
            .stores("tokenCarrinho", "token_for_swagger");

        userId = resposta.body.id;
    });

    beforeEach(async () => {
        await spec()
            .delete(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200);
    });

    it("Deve retornar carrinho vazio sem desconto", async () => {
        await spec()
            .get(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200)
            .expectJson("items", [])
            .expectJson("total_centavos", 0)
            .expectJson("percentual_desconto", 0)
            .expectJson("desconto_centavos", 0)
            .expectJson("total_final_centavos", 0);
    });
    const cenarios = [
        { quantidade: 1, total: 10000, percentual: 0, desconto: 0, final: 10000 },
        { quantidade: 2, total: 20000, percentual: 10, desconto: 2000, final: 18000 },
        { quantidade: 6, total: 60000, percentual: 10, desconto: 6000, final: 54000 },
        { quantidade: 7, total: 70000, percentual: 15, desconto: 10500, final: 59500 }
    ];

    cenarios.forEach((cenario) => {
        it(`Deve aplicar ${cenario.percentual}% para compra de R$ ${cenario.total / 100}`, async () => {
            await spec()
                .post("http://localhost:3000/api/basket")
                .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
                .withJson({
                    userId,
                    bookId: 3,
                    quantity: cenario.quantidade
                })
                .expectStatus(201);

            await spec()
                .get(`http://localhost:3000/api/basket/${userId}`)
                .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
                .expectStatus(200)
                .expectJson("total_centavos", cenario.total)
                .expectJson("percentual_desconto", cenario.percentual)
                .expectJson("desconto_centavos", cenario.desconto)
                .expectJson("total_final_centavos", cenario.final);
        });
    });
    it("Deve aceitar 10 unidades com total de R$ 990", async () => {
        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 24,
                quantity: 10
            })
            .expectStatus(201);

        await spec()
            .get(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200)
            .expectJson("items[0].book_id", 24)
            .expectJson("items[0].quantity", 10)
            .expectJson("total_centavos", 99000)
            .expectJson("percentual_desconto", 15)
            .expectJson("desconto_centavos", 14850)
            .expectJson("total_final_centavos", 84150);
    });
    it("Deve rejeitar inclusão acima de R$ 990 e manter carrinho vazio", async () => {
        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 3,
                quantity: 10
            })
            .expectStatus(409);

        await spec()
            .get(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200)
            .expectJson("items", [])
            .expectJson("total_centavos", 0)
            .expectJson("total_final_centavos", 0);
    });
    it("Deve rejeitar atualização acima de R$ 990 e preservar o carrinho", async () => {
        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 3,
                quantity: 2
            })
            .expectStatus(201);

        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 3,
                quantity: 8
            })
            .expectStatus(409);

        await spec()
            .get(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200)
            .expectJsonLength("items", 1)
            .expectJson("items[0].book_id", 3)
            .expectJson("items[0].quantity", 2)
            .expectJson("total_centavos", 20000)
            .expectJson("total_final_centavos", 18000);
    });
    it("Deve rejeitar soma acima de 10 unidades do mesmo livro", async () => {
        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 24,
                quantity: 10
            })
            .expectStatus(201);

        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 24,
                quantity: 1
            })
            .expectStatus(400)
            .expectJson(
                "message",
                "O carrinho permite no máximo 10 unidades do mesmo livro."
            );

        await spec()
            .get(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200)
            .expectJsonLength("items", 1)
            .expectJson("items[0].quantity", 10)
            .expectJson("total_centavos", 99000);
    });
    it("Deve rejeitar livro novo quando a soma do carrinho ultrapassar R$ 990", async () => {
        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 3,
                quantity: 2
            })
            .expectStatus(201);

        await spec()
            .post("http://localhost:3000/api/basket")
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .withJson({
                userId,
                bookId: 24,
                quantity: 8
            })
            .expectStatus(409);

        await spec()
            .get(`http://localhost:3000/api/basket/${userId}`)
            .withHeaders("Authorization", "Bearer $S{tokenCarrinho}")
            .expectStatus(200)
            .expectJsonLength("items", 1)
            .expectJson("items[0].book_id", 3)
            .expectJson("items[0].quantity", 2)
            .expectJson("total_centavos", 20000)
            .expectJson("total_final_centavos", 18000);
    });
});