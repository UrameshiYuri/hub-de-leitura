# 📚 Hub de Leitura - Sistema de Biblioteca para QA

**Sistema educacional completo para aprendizado e prática de Quality Assurance (QA)**

![Node.js](https://img.shields.io/badge/Node.js-24.11.1-green.svg)

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

### 👤 Gestão de Usuários

- Registro e login de usuários

- Autenticação JWT com expiração

- Perfis diferenciados (Usuário/Admin)

- Atualização de perfil

### 📖 Catálogo de Livros

- Listagem com filtros e busca

- CRUD completo (Admin)

- Controle de estoque

- Upload de capas

- Categorização

### 📝 Reservas

- Reserva de livros disponíveis

- Controle de prazos

- Gestão de retiradas e devoluções

- Histórico completo

- Alertas de atraso

### 🛠️ Painel Administrativo

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

- Node.js 24.11.1 e npm 11.6.2 (versões utilizadas nas automações e no CI)

- Git instalado

- Editor de código (Visual Studio Code recomendado)

### 1. Clone o Repositório e entre na pasta

```bash
git clone https://github.com/UrameshiYuri/hub-de-leitura.git
cd hub-de-leitura
git switch Carrinho
```

### 2. Instale as Dependências

```bash
npm ci
```

Antes de iniciar, o arquivo `database/biblioteca.db` deve existir e conter as migrações descritas em **Preparação do banco para as automações**, abaixo.

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

Esse procedimento apaga os dados locais. Pare o servidor e faça um backup antes. A recriação da base precisa ser seguida pelas migrações de login, preços e cupons descritas adiante.

```bash
# Pare o servidor "CTRL + C" e delete o arquivo do banco
rm database/biblioteca.db
# Ou apague manualmente entrando na pasta.
# Rode o comando para recriar o banco
npm run db
# Aplique também as migrações descritas abaixo antes de iniciar o servidor
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

- Na implementação atual, os tokens expiram em 8 horas

### Banco de dados corrompido

Preserve uma cópia do arquivo antes de recriá-lo; a recriação não recupera os dados antigos. Depois, reaplique as migrações.

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

- **YURI ALVES MIELLI** — implementação dos exercícios e automações descritos neste README.
- Fábio Araújo — autor do projeto-base.
  - [Repositório](https://github.com/fabioaraujoqa)

  - [Linkedin](https://www.linkedin.com/in/fabio10/)

---

### 🚀 Bons Testes!

_*"A qualidade nunca é um acidente; ela é sempre o resultado de um esforço inteligente."*_ - John Ruskin

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

### Testes automatizados iniciais — histórico com Pactum

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

Resultados históricos das suítes Pactum, antes de acrescentar os testes de contrato. Os comandos acima agora também encontram arquivos `*.contrato.test.js`, portanto a contagem atual pode ser maior:

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

---

## Automação de qualidade — ampliação do projeto

Trabalho desenvolvido por **YURI ALVES MIELLI**, no Hub de Leitura, a partir do projeto educacional de Fábio Araújo.

Além dos testes iniciais com Pactum, foram implementadas automações de API com Supertest e contratos, Web com Playwright, Mobile Web no Android com Appium e performance com K6. As execuções foram integradas ao GitHub Actions e geram relatórios.

### Resultados registrados

| Camada             | Ferramentas                               | Cenários            | Resultado registrado                          |
| ------------------ | ----------------------------------------- | ------------------- | --------------------------------------------- |
| API e contratos    | Mocha, Supertest e Joi                    | 27 testes           | Aprovados no workflow de API e Web            |
| Web                | Playwright com JavaScript                 | 6 testes            | Aprovados no workflow de API e Web            |
| Mobile Web Android | Appium, UiAutomator2, WebdriverIO e Mocha | 2 testes            | Aprovados no workflow Mobile Android          |
| Performance        | K6                                        | 2 cenários de carga | Thresholds aprovados nas execuções realizadas |

O relatório Android de **02/10/2026** registrou **2 testes aprovados, nenhuma falha e nenhum teste ignorado**, com duração total aproximada de 52 segundos. Esses números são evidências das execuções registradas, não uma garantia de ausência de defeitos ou de aprovação de execuções futuras. Os 35 testes Pactum documentados anteriormente representam uma etapa anterior e não são a contagem da suíte de contratos do CI.

### Organização dos arquivos adicionados

| Caminho                                  | Finalidade                                                |
| ---------------------------------------- | --------------------------------------------------------- |
| `API/Login/login.contrato.test.js`       | Testes de login com Supertest e validação do contrato     |
| `API/Cupons/cupons.contrato.test.js`     | Testes de cupons com Supertest e validação do contrato    |
| `API/Carrinho/carrinho.contrato.test.js` | Testes de carrinho com Supertest e validação do contrato  |
| `UI/pages/`                              | Page Objects Web: LoginPage, CatalogoPage e CarrinhoPage  |
| `UI/tests/`                              | Cenários Web de login, catálogo e carrinho                |
| `playwright.config.js`                   | Configuração de navegador, execução e relatórios Web      |
| `Mobile/config.js`                       | Conexão com Appium e capacidades do Android/Chrome        |
| `Mobile/pages/LoginPage.js`              | Page Object de login no Chrome Android                    |
| `Mobile/tests/login.test.js`             | Cenários de login Mobile e diagnóstico de falhas          |
| `performance/catalogo.js`                | Cenário K6 de consulta ao catálogo                        |
| `performance/busca.js`                   | Cenário K6 de busca de livro                              |
| `scripts/preparar_dados_ci.js`           | Preparação dos usuários e livros no banco do CI           |
| `scripts/executar_mobile_ci.sh`          | Inicialização do servidor, Appium e execução Mobile no CI |
| `.github/workflows/testes.yml`           | Workflow de API, Web e performance                        |
| `.github/workflows/mobile.yml`           | Workflow Mobile Android                                   |
| `relatorios/`                            | Relatórios gerados localmente ou no runner                |
| `test-results/`                          | Evidências da execução Web, conforme configuração         |

Respeite as maiúsculas de `API`, `UI`, `Mobile` e `scripts/Migrar_cupons.js`: o runner Linux diferencia maiúsculas e minúsculas.

### Preparação do banco para as automações

Use uma base de desenvolvimento/teste. Os testes de carrinho limpam os itens da conta utilizada. Não execute as suítes simultaneamente contra o mesmo usuário e banco.

Em uma instalação sem banco, crie a base primeiro:

```bash
npm run db
```

Com o servidor parado, aplique as alterações na ordem abaixo. Em uma base existente, faça backup antes:

```bash
node scripts/adicionar_campos_login.js
node scripts/adicionar_preco_livros.js
node scripts/criar_tabela_cupons.js
node scripts/Migrar_cupons.js
node scripts/definir_precos_teste.js
```

Os scripts verificam as estruturas já existentes. O script de preços preenche os preços nulos dos livros 3 e 24; ele não cria os livros nem corrige estoque insuficiente. Confirme os dados antes de executar as suítes:

| Dado utilizado               | Valor esperado                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Usuário comum das automações | `teste@teste.com` / `teste@123`, nome `teste`, ativo e sem perfil de administrador                       |
| Administrador                | `admin@biblioteca.com` / `admin123`, ativo e com perfil de administrador                                 |
| Livro 3                      | O Pequeno Príncipe, preço de 10000 centavos, pelo menos 10 exemplares disponíveis                        |
| Livro 24                     | As Grandes Sagas da Turma da Mônica Vol. 9, preço de 9900 centavos, pelo menos 10 exemplares disponíveis |

São contas de demonstração. A conta `usuario@teste.com`, fornecida pelo projeto-base, é diferente da conta `teste@teste.com` utilizada nas automações.

No GitHub Actions, os workflows recriam uma base de teste, aplicam as migrações e executam `scripts/preparar_dados_ci.js`. Esse script prepara as contas e os livros necessários e possui proteção para execução somente no CI. Não remova essa proteção para executá-lo sobre seu banco local.

### API com Supertest e validação de contratos

As novas suítes utilizam **Supertest** para as requisições HTTP, **Mocha** para organizar os testes e **Joi** para validar os contratos das respostas. São verificados campos obrigatórios, tipos, valores permitidos e campos nulos, além do status HTTP e das regras de negócio. A validação estrita evita aceitar respostas com conversão automática de tipos ou campos inesperados nos schemas definidos.

A validação implementada é de schemas de resposta; não se trata de um serviço de contratos entre consumidores e provedores.

| Suíte    | Quantidade | Principais verificações                                                                                           |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Login    | 8          | Sucesso, dados inválidos, usuário inativo, senha incorreta, bloqueio, desbloqueio e reinício da contagem de erros |
| Cupons   | 10         | Cadastro, consulta, listagem, duplicidade, campos obrigatórios e autorização                                      |
| Carrinho | 9          | Carrinho vazio, faixas de desconto, limites e preservação do carrinho após rejeição                               |

Os testes de login criam uma conta temporária, preparam seu estado e a removem ao finalizar. Os testes de cupons usam códigos únicos e limpeza dos dados criados. Os testes de carrinho preparam o carrinho da conta de demonstração.

Com `npm start` rodando em outro terminal:

```bash
# Executar somente as suítes de contrato com Supertest
npm run test:api

# Executar e gerar o relatório Mochawesome
npm run test:api:report
```

Relatórios: `relatorios/api/resultado-api.html` e `relatorios/api/resultado-api.json`.

O comando `npm test` utiliza o conjunto mais amplo de arquivos de API e pode executar tanto testes antigos Pactum quanto os novos testes de contrato. Ele não executa automaticamente as suítes Web, Mobile ou K6.

### Automação Web e comparação de ferramentas

Foi escolhido **Playwright com JavaScript**, mantendo a linguagem do projeto e concentrando a execução Web e seus relatórios em uma ferramenta. As alternativas abaixo foram comparadas documentalmente; não foram implementadas três suítes equivalentes para medir desempenho entre ferramentas.

| Opção avaliada     | Linguagem considerada | Características relevantes                                                                       | Decisão para este projeto                                                                            |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Playwright         | JavaScript            | Runner, esperas automáticas, relatório HTML e rastreamento de execução                           | Escolhido pela integração com o projeto Node.js e pelos recursos de diagnóstico                      |
| Cypress            | JavaScript            | Execução interativa, repetição automática de consultas/assertivas e interceptação de requisições | Alternativa adequada; exigiria adotar a organização e a cadeia de comandos próprias do Cypress       |
| Selenium WebDriver | Java                  | Automação pelo padrão WebDriver e integração com frameworks de teste                             | Alternativa flexível; a opção Java acrescentaria outra linguagem e configuração de runner/relatórios |

Referências do comparativo: [Playwright](https://playwright.dev/docs/intro), [Cypress](https://docs.cypress.io/app/core-concepts/introduction-to-cypress) e [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/).

O **Testing Pattern utilizado é Page Object Model (POM)**. Os seletores e as ações ficam em `UI/pages/`, enquanto os cenários e suas verificações ficam em `UI/tests/`. Isso permite reutilizar ações e concentrar mudanças de seletores no Page Object correspondente.

Cenários Web implementados:

1. Login válido e redirecionamento ao dashboard.
2. Rejeição de credenciais inválidas.
3. Busca de um livro existente.
4. Busca sem resultados.
5. Adição de livros e conferência das quantidades e valores no carrinho.
6. Rejeição de adição acima do limite financeiro, preservando os itens existentes.

Instale o navegador uma vez e mantenha o servidor da aplicação ativo:

```bash
npx playwright install chromium
npm run test:ui
npm run report:ui
```

A configuração usa Chromium, execução sequencial e Page Objects. O relatório fica em `relatorios/ui/index.html`; as evidências de falha, como screenshots e traces, ficam em `test-results/`, conforme `playwright.config.js`.

### Automação Mobile Web no Android

A automação acessa o **site pelo Chrome dentro de um emulador Android**. O Hub de Leitura não exige um APK para esse escopo. Essa execução testa Mobile Web em Android; não representa testes de aplicativo nativo nem testes em iOS.

Ferramentas utilizadas: **Appium 3.8.0**, **UiAutomator2 8.7.0**, **WebdriverIO 9.32.0**, **Mocha** e **Mochawesome**, conforme as versões instaladas durante o trabalho.

Também foi aplicado **Page Object Model**: `Mobile/pages/LoginPage.js` centraliza os campos, a navegação e a ação de entrar; `Mobile/tests/login.test.js` contém os cenários e as assertivas.

Cenários implementados:

1. Permitir login de usuário ativo pelo Chrome Android, verificar redirecionamento e sessão.
2. Rejeitar credenciais inválidas, verificar mensagem de erro e ausência de sessão.

Para executar localmente, prepare Android Studio/SDK, um emulador com Chrome, Java e as variáveis `ANDROID_HOME` e `JAVA_HOME`. No ambiente local utilizado, o Java era 21.0.10 e o dispositivo era `emulator-5554`.

Com o emulador iniciado:

```bash
adb devices
npx appium driver list --installed
npx appium driver doctor uiautomator2
```

Se o driver ainda não estiver instalado:

```bash
npx appium driver install uiautomator2
```

Mantenha a aplicação ativa em um terminal:

```bash
npm start
```

Inicie o Appium em outro:

```bash
npx appium --address 127.0.0.1 --port 4723 --allow-insecure=uiautomator2:chromedriver_autodownload
```

O recurso habilitado permite ao Appium obter um Chromedriver compatível com o Chrome do emulador. O servidor fica limitado ao endereço local.

Execute os testes em um terceiro terminal:

```bash
npm run test:mobile

# Ou execute com relatório:
npm run test:mobile:report
```

A configuração utiliza `http://10.0.2.2:3000` para o emulador acessar a aplicação no computador. É possível configurar `MOBILE_BASE_URL` e `ANDROID_UDID`. O Appium atende em `127.0.0.1:4723`.

Relatórios: `relatorios/mobile/resultado-mobile.html` e `relatorios/mobile/resultado-mobile.json`.

Foram adicionados diagnósticos de falha com captura de tela e JSON contendo estado da página, campos, botão e eventos de interação. A senha não é gravada nesses JSONs; registra-se apenas seu comprimento. Os logs detalhados do Appium podem incluir os valores enviados aos campos: use somente as contas de teste.

No CI, as tentativas com a imagem API 30 e Chrome 83 registraram cliques em elementos incorretos. Foram adicionados rolagem centralizada, espera pelo botão, toque por ações de ponteiro e diagnósticos. A execução foi aprovada após mudar a imagem do workflow para **API 35**. Esse resultado valida a configuração final; não isola, por si só, a causa exata da incompatibilidade anterior.

### Performance com K6

Foram implementados dois cenários independentes:

| Script                    | Operação                     | Verificações                                              |
| ------------------------- | ---------------------------- | --------------------------------------------------------- |
| `performance/catalogo.js` | Consulta ao catálogo         | HTTP 200, lista de livros e pelo menos um resultado       |
| `performance/busca.js`    | Busca por O Pequeno Príncipe | HTTP 200, lista de livros e presença do título pesquisado |

Perfil de carga de cada cenário: subida de 0 para **20 usuários virtuais em 20 segundos**, seguida por **100 segundos com 20 usuários**, totalizando **2 minutos de carga programada**. Cada iteração inclui pausa de 1 segundo. O encerramento pode incluir o tempo de tolerância configurado no script.

Critérios de aprovação configurados no projeto:

- 100% dos checks aprovados (`rate==1`).
- Menos de 1% de requisições HTTP com falha (`rate<0.01`).
- Percentil 95 do tempo de resposta abaixo de 500 ms (`p(95)<500`).

Os thresholds de qualidade acima são os critérios adotados na implementação; devem ser confrontados com eventuais exigências específicas da avaliação.

Com K6 instalado e a aplicação ativa:

```bash
k6 run performance/catalogo.js
k6 run performance/busca.js
```

Para gerar os relatórios HTML, execute no Git Bash ou Bash:

```bash
mkdir -p relatorios/performance

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_PORT=-1 K6_WEB_DASHBOARD_EXPORT=relatorios/performance/catalogo.html k6 run performance/catalogo.js

K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_PORT=-1 K6_WEB_DASHBOARD_EXPORT=relatorios/performance/busca.html k6 run performance/busca.js
```

Resultados de uma execução local registrada, usando K6 2.2.0:

| Métrica          | Catálogo     | Busca        |
| ---------------- | ------------ | ------------ |
| Requisições      | 2190         | 2190         |
| Checks aprovados | 6570 de 6570 | 6570 de 6570 |
| Falhas HTTP      | 0%           | 0%           |
| Tempo médio      | 1,82 ms      | 2,43 ms      |
| Percentil 95     | 3,12 ms      | 4,48 ms      |
| Thresholds       | Aprovados    | Aprovados    |

São medições em ambiente local, com a base de demonstração. Não representam capacidade garantida em produção, na internet ou com bases maiores. Os números de cada nova execução devem ser consultados no respectivo relatório.

### Integração contínua — GitHub Actions

Foram implementados dois workflows, acionados por push, pull request e execução manual, conforme os arquivos versionados:

| Workflow              | Arquivo                        | Conteúdo                                            | Artefato                    |
| --------------------- | ------------------------------ | --------------------------------------------------- | --------------------------- |
| Testes de API e Web   | `.github/workflows/testes.yml` | Supertest/contratos, Playwright e K6                | `relatorios-automacoes`     |
| Testes Mobile Android | `.github/workflows/mobile.yml` | Emulador Android API 35, Appium e testes Mobile Web | `relatorios-mobile-android` |

O workflow de API e Web mantém esse nome, embora também execute performance. Uma execução verde nele não confirma a aprovação do workflow Android: os dois resultados devem ser consultados separadamente.

Os workflows instalam dependências com `npm ci`, preparam o banco de teste e iniciam os serviços necessários. O Mobile habilita KVM no runner Ubuntu, cria o emulador e aguarda aplicação e Appium ficarem disponíveis antes dos testes. Os relatórios e logs são enviados como artefatos mesmo quando há falha, desde que tenham sido gerados. A retenção configurada é de 14 dias.

Node.js **24.11.1** e npm **11.6.2** foram fixados nos workflows para manter consistência com o ambiente de desenvolvimento. `package.json` e `package-lock.json` devem ser commitados sincronizados.

### Como consultar os relatórios

| Execução local | Arquivo/ação                                    |
| -------------- | ----------------------------------------------- |
| API            | Abrir `relatorios/api/resultado-api.html`       |
| Web            | Executar `npm run report:ui`                    |
| Android        | Abrir `relatorios/mobile/resultado-mobile.html` |
| K6 catálogo    | Abrir `relatorios/performance/catalogo.html`    |
| K6 busca       | Abrir `relatorios/performance/busca.html`       |

Para relatórios gerados no GitHub:

1. Abra **Actions** no repositório.
2. Selecione o workflow e a execução desejados.
3. Abra **Summary** e localize **Artifacts**.
4. Baixe `relatorios-automacoes` ou `relatorios-mobile-android`.
5. Extraia o ZIP inteiro e abra o HTML correspondente. Preserve as pastas auxiliares dos relatórios Web.

Os arquivos produzidos no runner não aparecem automaticamente no VS Code local. As pastas `relatorios/` e `test-results/` são saídas geradas e ficam fora dos commits; as evidências do CI são distribuídas pelos artefatos.

### Escopo desta ampliação

Estão implementadas as automações e os relatórios descritos acima. A aprovação das suítes comprova os cenários executados, não cobertura integral de todas as funcionalidades do sistema. Permanecem válidas as limitações funcionais registradas em **Escopo e pendências**, incluindo aplicação de desconto fixo no carrinho e finalização da compra.

A documentação acadêmica, os links de entrega e os demais itens do modelo do professor precisam ser conferidos separadamente antes de considerar a entrega final completa.

### Referências das automações

- [Supertest](https://github.com/forwardemail/supertest)
- [Joi](https://joi.dev/api/)
- [Mocha](https://mochajs.org/)
- [Mochawesome](https://github.com/adamgruber/mochawesome)
- [Playwright — Page Object Model](https://playwright.dev/docs/pom)
- [WebdriverIO — ações de interação](https://webdriver.io/docs/api/browser/action/)
- [Appium UiAutomator2](https://github.com/appium/appium-uiautomator2-driver)
- [Android Emulator Runner](https://github.com/ReactiveCircus/android-emulator-runner)
- [K6 — Web Dashboard](https://grafana.com/docs/k6/latest/results-output/web-dashboard/)
- [GitHub Actions](https://docs.github.com/en/actions)
