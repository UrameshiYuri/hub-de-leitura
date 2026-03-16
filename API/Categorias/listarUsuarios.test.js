const { spec } = require('pactum');

beforeEach(async () => {
    await spec()
        .post('http://localhost:3000/api/login')
        .withJson({
            "email": "admin@biblioteca.com",
            "password": "admin123"
        })
        .stores('token', 'token_for_swagger');
});

it('Deve atualizar livro com sucesso', async () => {
    await spec()
        .get('http://localhost:3000/api/users?page=1&limit=20&search=usuario')
        .withHeaders('Authorization', `Bearer $S{token}`)
        .expectStatus(200)
        .expectJsonLength('users', 3)
});