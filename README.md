# 📚 Hub de Leitura - Sistema de Biblioteca para QA

**Sistema educacional completo para aprendizado e prática de Quality Assurance (QA)**

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)
![SQLite](https://img.shields.io/badge/SQLite-3+-lightgrey.svg)
![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)
![License](https://img.shields.io/badge/License-Educational-yellow.svg)

## 🎯 Objetivo

O **Hub de Leitura** é um sistema de gestão de biblioteca desenvolvido especificamente para **ensinar e praticar Quality Assurance**. Cada funcionalidade representa cenários reais que profissionais de QA encontram no dia a dia.

### 🎓 Para Estudantes de QA

- ✅ **Aprenda testando** - Sistema real com cenários complexos
- ✅ **API REST completa** - Todos os tipos de endpoint
- ✅ **Diferentes perfis** - Usuário comum vs Administrador
- ✅ **Autenticação JWT** - Sistema de login profissional
- ✅ **Cenários de erro** - Como sistemas falham na prática
- ✅ **Documentação Swagger** - API bem documentada
- ✅ **Interface moderna** - Frontend para testes E2E

## 🚀 Funcionalidades

### 👤 **Gestão de Usuários**

- Registro e login de usuários
- Autenticação JWT com expiração
- Perfis diferenciados (Usuário/Admin)
- Atualização de perfil

### 📖 **Catálogo de Livros**

- Listagem com filtros e busca
- CRUD completo (Admin)
- Controle de estoque
- Upload de capas
- Categorização

### 📝 **Reservas**

- Reserva de livros disponíveis
- Controle de prazos
- Gestão de retiradas e devoluções
- Histórico completo
- Alertas de atraso

### 🛠️ **Painel Administrativo**

- Dashboard com estatísticas
- Gestão de todas as reservas
- Controle de usuários
- Relatórios e exportações
- Logs do sistema

## 🛠️ Tecnologias

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados leve
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Joi** - Validação de dados
- **Swagger** - Documentação da API

### Frontend

- **HTML5/CSS3** - Estrutura e estilo
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Interatividade
- **Font Awesome** - Ícones
- **Chart.js** - Gráficos (futuro)

## ⚡ Instalação Rápida

### Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- Editor de código (Visual Studio Code recomendado)

### 1. Clone o Repositório e entre na pasta

```bash
git clone https://github.com/fabioaraujoqa/hub-de-leitura.git
cd hub-de-leitura
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Inicie o Servidor

```bash
npm start
```

### 4. Acesse o Sistema

- **Sistema:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs
- **Admin:** http://localhost:3000/admin-dashboard.html

## 🔑 Credenciais de Teste

### Administrador

- **Email:** admin@biblioteca.com
- **Senha:** admin123
- **Permissões:** Acesso total ao sistema

### Usuário Comum

- **Email:** usuario@teste.com
- **Senha:** user123
- **Permissões:** Reservas e consultas

## 🧪 Testando a API

### Com cURL

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biblioteca.com","password":"admin123"}'

# Listar livros (com token)
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Com Postman/Insomnia

1. Importe a coleção do Swagger: http://localhost:3000/api-docs
2. Configure o token JWT no cabeçalho Authorization
3. Teste todos os endpoints disponíveis

## 🤝 Contribuindo

### Para Instrutores

1. Fork o repositório
2. Crie cenários de teste adicionais
3. Adicione novos endpoints para prática
4. Documente bugs intencionais para os alunos encontrarem
5. Envie um Pull Request

### Para Alunos

1. Reporte bugs encontrados (é parte do aprendizado!)
2. Sugira melhorias na documentação
3. Compartilhe casos de teste interessantes
4. Contribua com exemplos de automação

### Resetar Banco de Dados

```bash
# Pare o servidor "CTRL + C" e delete o arquivo do banco
rm database/biblioteca.db
ou apague manualmente entrando na pasta.
# Rode o comando para recriar o banco
npm run db
# Reinicie o servidor para recriar as tabelas
npm start
```

## 🐛 Problemas Comuns

### Erro "Port 3000 already in use"

```bash
# Encontrar processo usando a porta
lsof -ti:3000
# Finalizar processo
kill -9 PID_DO_PROCESSO
```

### Token expirado

- Faça login novamente para obter um novo token
- Tokens expiram em 1 hora por padrão

### Banco de dados corrompido

- Delete o arquivo `database/biblioteca.db`
- Rode o comando `npm run db` para recriar o banco

## 📚 Recursos de Aprendizado

### Documentação

- [Express.js](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Swagger/OpenAPI](https://swagger.io/docs/)

### Ferramentas de Teste

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Jest](https://jestjs.io/) - Para testes automatizados
- [Newman](https://github.com/postmanlabs/newman) - CLI do Postman

### Uso Permitido

- ✅ Uso educacional e acadêmico
- ✅ Modificação para fins didáticos
- ✅ Distribuição para alunos
- ✅ Criação de cursos baseados no projeto

### Uso Restrito

- ❌ Uso comercial direto
- ❌ Venda do código
- ❌ Redistribuição sem créditos

---

## ⭐ Agradecimentos

Desenvolvido com ❤️ para a comunidade de **Quality Assurance**.

**Contribuidores:**

- Fábio Araújo
  - [Repositório](https://github.com/fabioaraujoqa)
  - [Linkedin](https://www.linkedin.com/in/fabio10/)

---

### 🚀 **Bons Testes!**

_"A qualidade nunca é um acidente; ela é sempre o resultado de um esforço inteligente."_ - John Ruskin

## Funcionalidades desenvolvidas e testes

Implementações realizadas no Hub de Leitura, adaptando os exercícios
de cupons, carrinho e login ao projeto.

### API de cupons

Concluído:

- Cadastro de cupons por administrador.
- Listagem de cupons e consulta por ID.
- Validação dos campos obrigatórios.
- Rejeição de códigos de cupom duplicados.
- Cadastro de desconto percentual ou fixo por produto.
- Restrição de acesso às operações administrativas.
- Aplicação de desconto percentual com validação de valor mínimo,
  validade e situação do cupom.

O cadastro de desconto fixo está disponível. Sua aplicação por produto
não foi integrada ao carrinho.

### Carrinho de livros

Concluído:

- Adição, consulta, remoção de livros e limpeza do carrinho pela API.
- Acesso restrito ao carrinho do próprio usuário.
- Validação de preço e disponibilidade.
- Limite de 10 unidades por livro.
- Limite de R$ 990,00 no total antes do desconto.
- Desconto automático conforme o total:
  - Abaixo de R$ 200,00: sem desconto.
  - De R$ 200,00 até R$ 600,00: 10%.
  - Acima de R$ 600,00: 15%.
- Valores monetários calculados em centavos.
- Integração do catálogo e da página de detalhes com a API.
- Exibição de quantidade, subtotal, desconto e total final na cesta.
- Remoção de livros e limpeza da cesta pelo site.

O desconto do carrinho é automático e não exige informar um cupom.

### Login

Concluído:

- Autenticação com email e senha.
- Emissão de token JWT.
- Login permitido apenas para usuários ativos.
- Mensagem de erro para credenciais incorretas.
- Bloqueio por 15 minutos após três erros de senha.
- Recusa de novos logins durante o bloqueio, mesmo com senha correta.
- Liberação após o vencimento do bloqueio.
- Contagem de erros zerada após login bem-sucedido.

O bloqueio impede novos logins. Tokens emitidos anteriormente
continuam válidos até sua expiração.

### Testes automatizados

Ferramentas utilizadas:

- Mocha.
- Pactum.
- SQLite para preparar e remover a conta temporária dos testes de login.

Com o banco preparado, inicie o servidor:

    npm start

Em outro terminal, execute cada conjunto:

    npx mocha "API/Cupons/**/*.test.js"
    npx mocha "API/Carrinho/**/*.test.js"
    npx mocha "API/Login/**/*.test.js"

Resultados registrados nas execuções individuais:

| Funcionalidade | Testes passando |
| -------------- | --------------- |
| Cupons         | 19              |
| Carrinho       | 10              |
| Login          | 6               |
| Total          | 35              |

Para executar os três conjuntos juntos:

    npx mocha "API/Cupons/**/*.test.js" "API/Carrinho/**/*.test.js" "API/Login/**/*.test.js"

Os testes devem ser executados em ambiente local de desenvolvimento.
Os testes de carrinho limpam o carrinho da conta utilizada.
Os testes de login criam uma conta temporária e a removem ao finalizar.

### Preparação dos dados

As funcionalidades dependem das alterações de banco feitas durante
o desenvolvimento:

- Tabela de cupons com tipo de desconto, valor e descrição.
- Coluna preco_centavos na tabela Books.
- Colunas ativo, tentativas_login e bloqueado_ate na tabela Users.

Para adicionar os campos de login em um banco existente:

    node scripts/adicionar_campos_login.js

Os testes de carrinho utilizam os livros de teste:

| ID  | Livro                                      | Preço     |
| --- | ------------------------------------------ | --------- |
| 3   | O Pequeno Príncipe                         | R$ 100,00 |
| 24  | As Grandes Sagas da Turma da Mônica Vol. 9 | R$ 99,00  |

Os cenários de limite dependem de esses livros terem pelo menos
10 exemplares disponíveis.

### Escopo e pendências

Os requisitos de API e regras de negócio descritos acima foram
implementados e testados.

Permanecem fora desta entrega:

- Finalização de compra ou adaptação completa do fluxo de reservas.
- Aplicação de desconto fixo por produto no carrinho.
- Ajuste da atualização imediata do contador na página de detalhes:
  foi observado que, em alguns testes, ele atualizou apenas após
  recarregar a página.

Arquivos de banco locais (.db), backups, tokens e senhas reais
não devem ser incluídos no repositório.
