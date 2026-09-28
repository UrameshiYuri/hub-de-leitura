const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "admin@admin";
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../config/swaggerDef");

// Importar middlewares
const { authenticateToken, authenticateAdmin } = require("./middleware/auth");

// Importar todas as rotas
const booksRoutes = require("./routes/books");
const couponsRoutes = require("./routes/coupons");
const usersRoutes = require("./routes/users");
const reservationsRoutes = require("./routes/reservations");
const basketRoutes = require("./routes/basket");
const adminRoutes = require("./routes/admin");

// Importar configuração do banco
const db = require("../config/db");

const app = express();
const port = process.env.PORT || 3000;

// === MIDDLEWARE GLOBAL ===
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware para logs de requisições (desenvolvimento)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// === CONFIGURAÇÃO DO SWAGGER UI ===
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    // Persistir autorização entre requisições
    persistAuthorization: true,
    // Mostrar apenas um esquema de autenticação por vez
    authAction: {
      BearerAuth: {
        name: "BearerAuth",
        schema: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        value: "",
      },
    },
    // Configurações de UI
    docExpansion: "list",
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    // Configurar interceptor para adicionar automaticamente o token
    requestInterceptor: function (req) {
      // Se existe um token salvo, adiciona automaticamente
      const token = localStorage.getItem("swagger_auth_token");
      if (token && !req.headers.Authorization) {
        req.headers.Authorization = token;
      }
      return req;
    },
  },
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })
);

// === ROTAS DE AUTENTICAÇÃO ===

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [🔐 Autenticação]
 *     summary: Login de usuário
 *     description: |
 *       **Autentica usuário e retorna token JWT para uso na API**
 *
 *       ### 🎯 Cenários para testar:
 *       - ✅ Login com credenciais válidas
 *       - ❌ Email inexistente
 *       - ❌ Senha incorreta
 *       - ❌ Campos obrigatórios em branco
 *       - ✅ Login de admin vs usuário comum
 *
 *       ### 🔑 Credenciais de teste pré-configuradas:
 *       - **Admin:** admin@biblioteca.com / admin123
 *       - **Usuário:** usuario@teste.com / user123
 *
 *       ### 🚀 Como usar no Swagger:
 *       1. Faça login com uma das credenciais acima
 *       2. Copie o campo **"token_for_swagger"** (apenas o hash, sem "Bearer")
 *       3. Clique no botão "🔒 Authorize" no topo desta página
 *       4. Cole APENAS o hash no campo "Value" - Swagger adiciona "Bearer" automaticamente
 *       5. Clique em "Authorize" e depois "Close"
 *       6. Agora você pode testar os endpoints protegidos!
 *
 *       ### 📮 Para Postman/Insomnia:
 *       - Use o campo **"token"** completo (que já inclui "Bearer ")
 *
 *       ### ⚠️ IMPORTANTE:
 *       - **Swagger:** Use apenas o hash (token_for_swagger)
 *       - **Postman:** Use o token completo (token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário cadastrado
 *                 example: "admin@biblioteca.com"
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "admin123"
 *                 minLength: 6
 *           examples:
 *             admin_login:
 *               summary: 👑 Login como Administrador
 *               description: "Use estas credenciais para testar funcionalidades de admin"
 *               value:
 *                 email: "admin@biblioteca.com"
 *                 password: "admin123"
 *             user_login:
 *               summary: 👤 Login como Usuário Comum
 *               description: "Use estas credenciais para testar funcionalidades de usuário"
 *               value:
 *                 email: "usuario@teste.com"
 *                 password: "user123"
 *             teste_erro:
 *               summary: ❌ Credenciais Inválidas (para testar erro)
 *               description: "Use para testar o comportamento com credenciais erradas"
 *               value:
 *                 email: "inexistente@email.com"
 *                 password: "senhaerrada"
 *     responses:
 *       200:
 *         description: ✅ Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID único do usuário
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Nome completo do usuário
 *                   example: "Administrador"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email do usuário
 *                   example: "admin@biblioteca.com"
 *                 isAdmin:
 *                   type: boolean
 *                   description: Se o usuário é administrador
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: "Token JWT completo para Postman/Insomnia (inclui 'Bearer ')"
 *                   example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 token_for_swagger:
 *                   type: string
 *                   description: "Apenas o hash do token para usar no Swagger (sem 'Bearer ')"
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn:
 *                   type: string
 *                   description: Tempo de expiração do token
 *                   example: "8h"
 *                 swagger_instructions:
 *                   type: object
 *                   description: Instruções para usar no Swagger
 *                   properties:
 *                     step1:
 *                       type: string
 *                       example: "Copie o campo 'token_for_swagger' (sem Bearer)"
 *                     step2:
 *                       type: string
 *                       example: "Clique no botão 'Authorize' 🔒 no topo da página"
 *                     step3:
 *                       type: string
 *                       example: "Cole APENAS o hash no campo 'Value' (Swagger adiciona 'Bearer' automaticamente)"
 *                     step4:
 *                       type: string
 *                       example: "Clique 'Authorize' e depois 'Close'"
 *                     step5:
 *                       type: string
 *                       example: "Agora você pode usar endpoints protegidos!"
 *                     postman_note:
 *                       type: string
 *                       example: "Para Postman, use o campo 'token' completo (com Bearer)"
 *       400:
 *         description: ❌ Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: ❌ Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Email e senha são obrigatórios.",
      error: "MISSING_FIELDS"
    });
  }

  const emailInformado = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailInformado)) {
    return res.status(400).json({
      message: "Formato de email inválido.",
      error: "INVALID_EMAIL_FORMAT"
    });
  }

  function erroInterno(erro) {
    console.error("Erro no login:", erro.message);

    return res.status(500).json({
      message: "Erro interno do servidor.",
      error: "LOGIN_ERROR"
    });
  }

  function credenciaisInvalidas() {
    return res.status(401).json({
      message: "Email ou senha incorretos.",
      error: "INVALID_CREDENTIALS"
    });
  }

  function responderBloqueio(bloqueadoAte) {
    return res.status(429).json({
      message: "Login bloqueado após 3 erros de senha. Tente novamente após o horário informado.",
      error: "LOGIN_BLOCKED",
      bloqueado_ate: new Date(bloqueadoAte).toISOString()
    });
  }

  db.get(
    "SELECT * FROM Users WHERE email = ?",
    [emailInformado],
    (err, user) => {
      if (err) return erroInterno(err);

      if (!user) return credenciaisInvalidas();

      if (user.ativo !== 1) {
        return res.status(403).json({
          message: "Usuário inativo.",
          error: "USER_INACTIVE"
        });
      }

      if (user.bloqueado_ate > Date.now()) {
        return responderBloqueio(user.bloqueado_ate);
      }

      bcrypt.compare(password, user.password, (erro, senhaCorreta) => {
        if (erro) return erroInterno(erro);

        const agora = Date.now();

        if (!senhaCorreta) {
          // Após um bloqueio vencido, a contagem recomeça em 1.
          // O incremento acontece diretamente no banco.
          const sql = `
            UPDATE Users
            SET
              tentativas_login = CASE
                WHEN bloqueado_ate IS NOT NULL THEN 1
                ELSE tentativas_login + 1
              END,
              bloqueado_ate = CASE
                WHEN bloqueado_ate IS NOT NULL THEN NULL
                WHEN tentativas_login + 1 >= 3 THEN ?
                ELSE NULL
              END
            WHERE id = ?
              AND ativo = 1
              AND (bloqueado_ate IS NULL OR bloqueado_ate <= ?)
          `;

          db.run(
            sql,
            [agora + 15 * 60 * 1000, user.id, agora],
            (erroAtualizacao) => {
              if (erroAtualizacao) return erroInterno(erroAtualizacao);

              db.get(
                "SELECT bloqueado_ate FROM Users WHERE id = ?",
                [user.id],
                (erroConsulta, estado) => {
                  if (erroConsulta) return erroInterno(erroConsulta);

                  if (estado?.bloqueado_ate > Date.now()) {
                    return responderBloqueio(estado.bloqueado_ate);
                  }

                  return credenciaisInvalidas();
                }
              );
            }
          );

          return;
        }

        // Login correto zera os erros, desde que a conta continue
        // ativa e não tenha sido bloqueada durante a verificação.
        db.run(
          `UPDATE Users
           SET tentativas_login = 0, bloqueado_ate = NULL
           WHERE id = ?
             AND ativo = 1
             AND (bloqueado_ate IS NULL OR bloqueado_ate <= ?)`,
          [user.id, agora],
          function (erroAtualizacao) {
            if (erroAtualizacao) return erroInterno(erroAtualizacao);

            if (this.changes === 0) {
              return res.status(403).json({
                message: "Login não permitido. A conta foi bloqueada ou desativada.",
                error: "LOGIN_NOT_ALLOWED"
              });
            }

            const token = jwt.sign(
              {
                id: user.id,
                email: user.email,
                isAdmin: !!user.isAdmin
              },
              SECRET_KEY,
              { expiresIn: "8h" }
            );

            return res.status(200).json({
              id: user.id,
              name: user.name,
              email: user.email,
              isAdmin: !!user.isAdmin,
              token: `Bearer ${token}`,
              token_for_swagger: token,
              expiresIn: "8h",
              loginTime: new Date().toISOString()
            });
          }
        );
      });
    }
  );
});

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nome, email e senha são obrigatórios.",
    });
  }

  if (name.length < 2) {
    return res.status(400).json({
      message: "Nome deve ter pelo menos 2 caracteres.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Senha deve ter pelo menos 6 caracteres.",
    });
  }

  /* Rota de contato */

  app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const sql = `INSERT INTO Contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, subject, message], function (err) {
      if (err) {
        console.error("❌ Erro ao inserir contato:", err);
        return res
          .status(500)
          .json({ message: "Erro interno ao salvar contato." });
      }
      res.json({ message: "Contato enviado com sucesso!" });
    });
  });

  // Verificar se email já existe
  db.get(
    "SELECT * FROM Users WHERE email = ?",
    [email],
    (err, existingUser) => {
      if (err) {
        console.error("Erro ao verificar email:", err);
        return res.status(500).json({
          message: "Erro interno do servidor.",
        });
      }

      if (existingUser) {
        return res.status(400).json({
          message: "Email já está sendo usado por outro usuário.",
          conflictingEmail: email,
        });
      }

      // Criptografar senha e criar usuário
      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
          console.error("Erro ao criptografar senha:", err);
          return res.status(500).json({
            message: "Erro ao processar senha.",
          });
        }

        db.run(
          "INSERT INTO Users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, 0],
          function (err) {
            if (err) {
              console.error("Erro ao criar usuário:", err);
              return res.status(500).json({
                message: "Erro ao criar usuário.",
              });
            }

            res.status(201).json({
              message: "Usuário criado com sucesso.",
              user: {
                id: this.lastID,
                name: name,
                email: email,
                isAdmin: false,
              },
            });
          }
        );
      });
    }
  );
});

/**
 * Recebe dados do formulário de contato e salva no SQLite
 */
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  const sql = `
    INSERT INTO Contacts (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [name, email, subject, message], function (err) {
    if (err) {
      console.error("❌ Erro ao inserir contato:", err);
      return res
        .status(500)
        .json({ message: "Erro interno ao salvar contato." });
    }
    res.json({ message: "Contato enviado com sucesso!" });
  });
});

// === ROTAS ORGANIZADAS ===

// Rotas principais da API
app.use("/api/books", booksRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/basket", basketRoutes);
app.use("/api/admin", adminRoutes);

// === ROTA DE HEALTH CHECK GERAL ===

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [🔧 Sistema]
 *     summary: Verificar status do sistema
 *     description: |
 *       **Endpoint para monitoramento da saúde do sistema**
 *
 *       ### 📋 Verifica:
 *       - Status do servidor
 *       - Conexão com banco de dados
 *       - Serviços disponíveis
 *       - Versão da API
 *     security: []
 *     responses:
 *       200:
 *         description: ✅ Sistema funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     auth:
 *                       type: string
 *                       example: "working"
 *                     swagger:
 *                       type: string
 *                       example: "active"
 *                 routes:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: string
 *                       example: "/api/books"
 *                     users:
 *                       type: string
 *                       example: "/api/users"
 *                     reservations:
 *                       type: string
 *                       example: "/api/reservations"
 *                     basket:
 *                       type: string
 *                       example: "/api/basket"
 *                     admin:
 *                       type: string
 *                       example: "/api/admin"
 */
app.get("/api/health", (req, res) => {
  // Verificar conexão com banco
  db.get("SELECT 1", (err) => {
    const dbStatus = err ? "disconnected" : "connected";

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: dbStatus,
        auth: "working",
        swagger: "active",
      },
      routes: {
        books: "/api/books",
        users: "/api/users",
        reservations: "/api/reservations",
        basket: "/api/basket",
        admin: "/api/admin",
      },
      documentation: "/api-docs",
    });
  });
});

// === ROTA DE INFORMAÇÕES DA API ===

/**
 * @swagger
 * /api/info:
 *   get:
 *     tags: [🔧 Sistema]
 *     summary: Informações da API
 *     description: Retorna informações gerais sobre a API e endpoints disponíveis
 *     responses:
 *       200:
 *         description: ✅ Informações carregadas
 */
app.get("/api/info", (req, res) => {
  res.json({
    name: "Hub de Leitura API",
    description: "Sistema de biblioteca para aprendizado de QA",
    version: "1.0.0",
    author: "Fábio Araújo",
    contact: {
      email: "fabio@qualityassurance.com",
      github: "https://github.com/fabioaraujoqa/hub-de-leitura",
    },
    documentation: {
      swagger: "/api-docs",
      postman: "Disponível no repositório",
    },
    endpoints: {
      auth: ["/api/login", "/api/register"],
      books: ["/api/books", "/api/books/:id"],
      users: ["/api/users", "/api/users/:id"],
      reservations: ["/api/reservations", "/api/reservations/:id"],
      basket: ["/api/basket/:userId", "/api/basket"],
      admin: ["/api/admin/reservations", "/api/admin/users"],
    },
    testCredentials: {
      admin: { email: "admin@biblioteca.com", password: "admin123" },
      user: { email: "usuario@teste.com", password: "user123" },
    },
  });
});

// === ROTAS LEGADAS E REDIRECIONAMENTOS ===

// Compatibilidade com rotas antigas
app.get("/api/produtos", (req, res) => {
  res.redirect(301, "/api/books");
});

app.get("/api/produtos/:id", (req, res) => {
  res.redirect(301, `/api/books/${req.params.id}`);
});

app.get("/api/registrar", (req, res) => {
  res.redirect(301, "/api/register");
});

// === ROTAS ESTÁTICAS E PÁGINAS HTML ===

// Página inicial - redireciona para dashboard
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

// Servir páginas HTML diretamente
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

app.get("/admin-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin-dashboard.html"));
});

app.get("/admin-reservations.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin-reservations.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// === MIDDLEWARE DE TRATAMENTO DE ERROS ===

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  // Se é uma rota da API, retorna JSON
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({
      message: "Endpoint não encontrado",
      endpoint: req.originalUrl,
      method: req.method,
      availableEndpoints: {
        auth: ["/api/login", "/api/register"],
        books: ["/api/books", "/api/books/:id"],
        users: ["/api/users", "/api/users/:id"],
        reservations: ["/api/reservations", "/api/reservations/:id"],
        basket: ["/api/basket/:userId"],
        admin: ["/api/admin/reservations", "/api/admin/users"],
        system: ["/api/health", "/api/info"],
      },
      documentation: "/api-docs",
    });
  }

  // Para outras rotas, redireciona para página inicial
  res.redirect("/login.html");
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);

  // Erro de token JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Token JWT inválido",
      error: "INVALID_TOKEN",
    });
  }

  // Erro de token expirado
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token JWT expirado",
      error: "EXPIRED_TOKEN",
      expiredAt: err.expiredAt,
    });
  }

  // Erro de validação
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Dados inválidos",
      details: err.details,
    });
  }

  // Erro de banco de dados
  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(400).json({
      message: "Violação de restrição do banco de dados",
      error: "DATABASE_CONSTRAINT",
    });
  }

  // Erro genérico
  res.status(500).json({
    message: "Erro interno do servidor",
    error:
      process.env.NODE_ENV === "development" ? err.message : "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  });
});

// === INICIALIZAÇÃO E CONFIGURAÇÃO DO SERVIDOR ===

// Função para inicializar dados de exemplo (ADAPTADA PARA BANCO EXISTENTE)
async function initializeTestData() {
  return new Promise((resolve, reject) => {
    // Verificar se já existem dados
    db.get("SELECT COUNT(*) as count FROM Users", (err, result) => {
      if (err) {
        console.error("Erro ao verificar dados existentes:", err);
        return reject(err);
      }

      // Se já existem usuários, não inicializa dados
      if (result.count > 0) {
        console.log("📊 Dados já existem no banco");

        // Verificar credenciais existentes
        db.all("SELECT name, email FROM Users", (err, users) => {
          if (!err && users.length > 0) {
            console.log("👥 Usuários disponíveis:");
            users.forEach((user) => {
              const userType =
                user.email.includes("admin") ||
                  user.email.includes("biblioteca")
                  ? "👑 Admin"
                  : "👤 User";
              console.log(`   ${userType}: ${user.email}`);
            });
          }
        });

        return resolve();
      }

      console.log("🔧 Banco vazio, mas isso é normal se você já tem dados...");
      resolve();
    });
  });
}

// === INICIALIZAÇÃO DO SERVIDOR ===

async function startServer() {
  try {
    // Inicializar dados de teste se necessário
    await initializeTestData();

    // Iniciar servidor
    app.listen(port, () => {
      console.log("\n🚀 ===============================================");
      console.log("📚 HUB DE LEITURA - Sistema de Biblioteca QA");
      console.log("🚀 ===============================================\n");

      console.log(`🌐 Servidor rodando em: http://localhost:${port}`);
      console.log(`📖 Documentação API: http://localhost:${port}/api-docs`);
      console.log(`👤 Login: http://localhost:${port}/login.html`);
      console.log(`🏠 Dashboard: http://localhost:${port}/dashboard.html`);
      console.log(`🛠️  Admin: http://localhost:${port}/admin-dashboard.html`);

      console.log("\n🔑 Credenciais de Teste (Banco Existente):");
      console.log("   👑 Admin: admin@biblioteca.com / admin123");
      console.log("   👤 User:  usuario@teste.com / user123");

      console.log("\n📋 Endpoints Principais:");
      console.log("   🔐 POST /api/login        - Autenticação");
      console.log("   📚 GET  /api/books        - Listar livros");
      console.log("   👥 GET  /api/users        - Listar usuários (Admin)");
      console.log("   📝 GET  /api/reservations - Minhas reservas");
      console.log("   🛒 GET  /api/basket/:id   - Meu carrinho");
      console.log("   🛠️  GET  /api/admin/*     - Rotas administrativas");
      console.log("   ❤️  GET  /api/health      - Status do sistema");

      console.log("\n✨ Recursos Disponíveis:");
      console.log("   📖 Sistema completo de biblioteca");
      console.log("   🔐 Autenticação JWT com roles");
      console.log("   📝 Gestão de reservas e carrinho");
      console.log("   🛠️  Painel administrativo completo");
      console.log("   📚 Documentação Swagger interativa");
      console.log("   🧪 Dados de teste pré-configurados");

      console.log("\n🎯 Perfeito para:");
      console.log("   ✅ Aprendizado de QA Manual");
      console.log("   ✅ Automação de testes de API");
      console.log("   ✅ Testes de integração");
      console.log("   ✅ Práticas de teste E2E");

      console.log("\n🚀 ===============================================");
      console.log("✨ Sistema pronto para uso! Bons testes! 🧪");
      console.log("🚀 ===============================================\n");
    });

    // Abrir automaticamente no navegador (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== "production") {
      try {
        const open = await import("open");
        setTimeout(() => {
          open.default(`http://localhost:${port}/index.html`);
        }, 1000);
      } catch (error) {
        // Falha silenciosa se o módulo 'open' não estiver disponível
      }
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Encerrando servidor graciosamente...");

  // Fechar conexão com banco de dados
  db.close((err) => {
    if (err) {
      console.error("❌ Erro ao fechar banco de dados:", err);
    } else {
      console.log("✅ Banco de dados fechado");
    }

    console.log("👋 Servidor encerrado. Até mais!");
    process.exit(0);
  });
});

// Tratar erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// === INICIAR SERVIDOR ===
startServer();

module.exports = app;
