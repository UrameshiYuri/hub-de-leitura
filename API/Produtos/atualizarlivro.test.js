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
        .put('http://localhost:3000/api/books/1')
        .withHeaders('Authorization', `Bearer $S{token}`)
        .withJson(
            {
                "title": "Nome livro atualizado com vscode",
                "author": "Autor Atualizado",
                "description": "Descrição atualizada do livro",
                "category": "Categoria atualizada",
                "editor": "Editora Atualizada",
                "language": "Português",
                "publication_year": 2000,
                "pages": 300,
                "format": "Físico",
                "total_copies": 10,
                "available_copies": 5
            })
        .expectStatus(200)
        .expectJson('message', 'Livro atualizado com sucesso.');
});