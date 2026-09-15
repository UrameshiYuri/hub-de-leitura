const { spec } = require("pactum");

it("Deve aplicar cupom válido com sucesso", async () => {
    await spec()
        .post("http://localhost:3000/api/coupons/aplicar")
        .withJson({
            codigo: "PROMO10",
            total_centavos: 10000
        })
        .expectStatus(200)
        .expectJson("desconto_centavos", 1000)
        .expectJson("total_final_centavos", 9000);
});

it("Deve rejeitar cupom com código inválido", async () => {
    await spec()
        .post("http://localhost:3000/api/coupons/aplicar")
        .withJson({
            codigo: "ERRADO",
            total_centavos: 10000
        })
        .expectStatus(400)
        .expectJson("message", "Cupom inválido.");
});

it("Deve rejeitar compra abaixo do valor mínimo", async () => {
    await spec()
        .post("http://localhost:3000/api/coupons/aplicar")
        .withJson({
            codigo: "PROMO10",
            total_centavos: 4000
        })
        .expectStatus(400)
        .expectJson(
            "message",
            "Valor da compra abaixo do mínimo para este cupom."
        )
        .expectJson("minimo_centavos", 5000);
});

it("Deve aceitar compra com valor igual ao mínimo", async () => {
    await spec()
        .post("http://localhost:3000/api/coupons/aplicar")
        .withJson({
            codigo: "PROMO10",
            total_centavos: 5000
        })
        .expectStatus(200)
        .expectJson("desconto_centavos", 500)
        .expectJson("total_final_centavos", 4500);
});

it("Deve rejeitar valor de compra negativo", async () => {
    await spec()
        .post("http://localhost:3000/api/coupons/aplicar")
        .withJson({
            codigo: "PROMO10",
            total_centavos: -100
        })
        .expectStatus(400)
        .expectJson(
            "message",
            "O total deve ser um número inteiro positivo em centavos."
        );
});

const totaisInvalidos = [0, 10.5, "10000", null];

totaisInvalidos.forEach((total) => {
    it(`Deve rejeitar total inválido: ${JSON.stringify(total)}`, async () => {
        await spec()
            .post("http://localhost:3000/api/coupons/aplicar")
            .withJson({
                codigo: "PROMO10",
                total_centavos: total
            })
            .expectStatus(400)
            .expectJson(
                "message",
                "O total deve ser um número inteiro positivo em centavos."
            );
    });
});