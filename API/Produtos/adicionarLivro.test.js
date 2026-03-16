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
            "title": "TURMA DA MÔNICA - TODAS AS COPAS DO MUNDO 2026",
            "author": "Mauricio De Sousa",
            "description": "Mauricio de Sousa conta para a turminha a história de todas as Copas do Mundo.A edição 2026 de Todas as Copas do Mundo atualizada com a história da Copa de 2022!",
            "category": "GIBI",
            "isbn": "404-NOT FOUND",
            "editor": "test",
            "language": "Português",
            "publication_year": 2026,
            "pages": 136,
            "format": "Físico",
            "total_copies": 5,
            "available_copies": 5
        })
        .expectStatus(201)
        .expectJson('message', 'Livro criado com sucesso.');
});