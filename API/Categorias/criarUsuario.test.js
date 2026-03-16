const { spec } = require('pactum')

it('API deve autenticar usuario corretamente', async () => {
    await spec()
        .post('http://localhost:3000/api/users')
        .withJson({
            "name": "Usuario a ser excluido 2",
            "email": "excluido2@email.com",
            "password": "senha123"
        })
        .expectStatus(201)
        .expectJson('message', 'Usuário criado com sucesso.');
});