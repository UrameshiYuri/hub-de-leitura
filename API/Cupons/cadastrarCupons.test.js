const { spec } = require("pactum");
const { randomUUID } = require("node:crypto");

describe("Cadastro de cupons", () => {
    before(async () => {
        await spec()
            .post("http://localhost:3000/api/login")
            .withJson({
                email: "admin@biblioteca.com",
                password: "admin123"
            })
            .expectStatus(200)
            .stores("tokenCadastroCupons", "token_for_swagger");
    });

    it("Deve cadastrar cupom fixo e rejeitar código repetido", async () => {
        const cupom = {
            codigo: `TESTE-${randomUUID()}`,
            tipo_desconto: "fixed_product",
            valor_centavos: 1000,
            descricao: "Cupom criado pelo teste automatizado"
        };

        // 1. Cadastra o cupom e guarda seu ID.
        await spec()
            .post("http://localhost:3000/api/coupons")
            .withHeaders("Authorization", "Bearer $S{tokenCadastroCupons}")
            .withJson(cupom)
            .expectStatus(201)
            .expectJson("codigo", cupom.codigo)
            .expectJson("tipo_desconto", "fixed_product")
            .expectJson("valor_centavos", 1000)
            .expectJson("percentual", null)
            .expectJson("validade", null)
            .stores("idCupomCadastrado", "id");

        // 2. Busca o cupom pelo ID que acabou de receber.
        await spec()
            .get("http://localhost:3000/api/coupons/$S{idCupomCadastrado}")
            .withHeaders("Authorization", "Bearer $S{tokenCadastroCupons}")
            .expectStatus(200)
            .expectJson("codigo", cupom.codigo)
            .expectJson("tipo_desconto", "fixed_product")
            .expectJson("valor_centavos", 1000);

        // 3. Tenta cadastrar o mesmo código novamente.
        await spec()
            .post("http://localhost:3000/api/coupons")
            .withHeaders("Authorization", "Bearer $S{tokenCadastroCupons}")
            .withJson(cupom)
            .expectStatus(409)
            .expectJson("message", "Já existe um cupom com esse código.");
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
        it(`Deve rejeitar cadastro sem ${campo}`, async () => {
            const cupom = {
                codigo: `TESTE-${randomUUID()}`,
                tipo_desconto: "fixed_product",
                valor_centavos: 1000,
                descricao: "Teste de campo obrigatório"
            };

            delete cupom[campo];

            await spec()
                .post("http://localhost:3000/api/coupons")
                .withHeaders("Authorization", "Bearer $S{tokenCadastroCupons}")
                .withJson(cupom)
                .expectStatus(400)
                .expectJson("message", mensagem);
        });
    });
    it("Deve rejeitar cadastro de cupom sem token", async () => {
        await spec()
            .post("http://localhost:3000/api/coupons")
            .withJson({
                codigo: `TESTE-${randomUUID()}`,
                tipo_desconto: "fixed_product",
                valor_centavos: 1000,
                descricao: "Teste de cadastro sem autenticação"
            })
            .expectStatus(401)
            .expectJson("error", "MISSING_TOKEN");
    });
    it("Deve rejeitar cadastro de cupom por usuário comum", async () => {
        await spec()
            .post("http://localhost:3000/api/login")
            .withJson({
                email: "teste@teste.com",
                password: "teste@123"
            })
            .expectStatus(200)
            .expectJson("isAdmin", false)
            .stores("tokenUsuarioCadastro", "token_for_swagger");

        await spec()
            .post("http://localhost:3000/api/coupons")
            .withHeaders("Authorization", "Bearer $S{tokenUsuarioCadastro}")
            .withJson({
                codigo: `TESTE-${randomUUID()}`,
                tipo_desconto: "fixed_product",
                valor_centavos: 1000,
                descricao: "Teste de cadastro por usuário comum"
            })
            .expectStatus(403)
            .expectJson("error", "ADMIN_REQUIRED");
    });
});