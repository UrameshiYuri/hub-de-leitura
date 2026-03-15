const { spec } = require('pactum')

let token;
beforeEach(async () => {
    token = await spec()
        .post('http://localhost:3000/api/login')
        .withJson({
            "email": "admin@biblioteca.com",
            "password": "admin123"
        })
        .stores('token')
});

it('Deve adicionar livro com sucesso', async () => {
    await spec()
        .post('http://localhost:3000/api/books')
        .withJson({
            "title": "livro de teste com vscode",
            "author": "video de teste",
            "description": "teste",
            "category": "Literatura Brasileira",
            "isbn": "111111111111111",
            "editor": "test",
            "language": "Português",
            "publication_year": 2026,
            "pages": 312,
            "format": "Físico",
            "total_copies": 4,
            "available_copies": 4
        })
        .expectStatus(201)
        .expectJson('message', 'Livro criado com sucesso.');
});