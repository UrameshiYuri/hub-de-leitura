const { spec } = require('pactum');
const { eachLike, like } = require('pactum-matchers');


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

it('Listagem de usuarios', async () => {
    await spec()
        .post('http://lojaebac.ebaconline.art.br/graphql')
        .withHeaders('Authorization', token)
        .withGraphQLQuery(`
query {
  Users {
    id
    email
    profile {
      firstName
    }
  }
}
  `)
        .expectStatus(200)
        .expectJsonMatch({
            data: {
                Users: eachLike({
                    id: like('679f50eb0cf0a913258b286c'),
                    email: like('admin@admin.com'),
                    profile: {
                        firstName: like('admin')
                    }
                })
            }
        })

});