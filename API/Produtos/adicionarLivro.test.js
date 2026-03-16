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

it('Deve adicionar livro com sucesso', async () => {
    await spec()
        .post('http://localhost:3000/api/books')
        .withHeaders('Authorization', `Bearer $S{token}`)
        .withJson({
            "title": "livro a ser deletado com vscode",
            "author": "livro a ser deletado",
            "description": "deletado",
            "category": "delet",
            "isbn": "404-NOT FOUND",
            "editor": "test",
            "language": "Português",
            "publication_year": 2026,
            "pages": 312,
            "format": "Físico",
            "total_copies": 5,
            "available_copies": 5
        })
        .expectStatus(201)
        .expectJson('message', 'Livro criado com sucesso.');
});