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

it('Deve deletar livro com sucesso', async () => {
    await spec()
        .delete('http://localhost:3000/api/books/20')
        .withHeaders('Authorization', `Bearer $S{token}`)
        .expectStatus(200)
        .expectJson('message', 'Livro deletado com sucesso.');
});