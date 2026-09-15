const { spec } = require('pactum')

it('API deve autenticar usuario corretamente', async () => {
    await spec()
        .post('http://localhost:3000/api/login')
        .withJson({
            "email": "admin@biblioteca.com",
            "password": "admin123"
        })
        .expectStatus(200)
        .expectJson('isAdmin', true);
});