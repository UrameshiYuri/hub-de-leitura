const { spec } = require("pactum");

it("Deve rejeitar listagem de cupons sem token", async () => {
    await spec()
        .get("http://localhost:3000/api/coupons")
        .expectStatus(401)
        .expectJson("error", "MISSING_TOKEN");
});
it("Deve permitir listagem de cupons para administrador", async () => {
    await spec()
        .post("http://localhost:3000/api/login")
        .withJson({
            email: "admin@biblioteca.com",
            password: "admin123"
        })
        .expectStatus(200)
        .stores("tokenAdminCupons", "token_for_swagger");

    await spec()
        .get("http://localhost:3000/api/coupons")
        .withHeaders("Authorization", "Bearer $S{tokenAdminCupons}")
        .expectStatus(200)
        .expectJsonLike([
            {
                codigo: "PROMO10",
                percentual: 10
            }
        ]);
});
it("Deve rejeitar listagem de cupons para usuário comum", async () => {
    await spec()
        .post("http://localhost:3000/api/login")
        .withJson({
            email: "teste@teste.com",
            password: "teste@123"
        })
        .expectStatus(200)
        .expectJson("isAdmin", false)
        .stores("tokenUsuarioCupons", "token_for_swagger");

    await spec()
        .get("http://localhost:3000/api/coupons")
        .withHeaders("Authorization", "Bearer $S{tokenUsuarioCupons}")
        .expectStatus(403)
        .expectJson("error", "ADMIN_REQUIRED");
});