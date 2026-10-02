// Evita modificar o banco local por engano.
if (process.env.GITHUB_ACTIONS !== "true") {
    console.error("Este script deve ser executado apenas no GitHub Actions.");
    process.exit(1);
}

const db = require("../config/db");
const bcrypt = require("bcrypt");

function executar(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, parametros, function (erro) {
            if (erro) return reject(erro);
            resolve(this);
        });
    });
}

async function prepararDados() {
    let transacaoAberta = false;

    try {
        const senhaAdmin = await bcrypt.hash("admin123", 10);
        const senhaUsuario = await bcrypt.hash("teste@123", 10);

        await executar("BEGIN IMMEDIATE TRANSACTION");
        transacaoAberta = true;

        // Criar ou atualizar as contas utilizadas pelos testes.
        const usuarios = [
            ["Bibliotecário Admin", "admin@biblioteca.com", senhaAdmin, 1],
            ["teste", "teste@teste.com", senhaUsuario, 0]
        ];

        for (const usuario of usuarios) {
            await executar(
                `INSERT INTO Users (
          name, email, password, isAdmin,
          ativo, tentativas_login, bloqueado_ate
        )
        VALUES (?, ?, ?, ?, 1, 0, NULL)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          password = excluded.password,
          isAdmin = excluded.isAdmin,
          ativo = 1,
          tentativas_login = 0,
          bloqueado_ate = NULL`,
                usuario
            );
        }

        // Garantir os IDs, preços e estoques esperados pelos testes.
        const livros = [
            {
                id: 3,
                titulo: "O Pequeno Príncipe",
                autor: "Antoine de Saint-Exupéry",
                preco: 10000,
                capa: "pequeno-principe.png"
            },
            {
                id: 24,
                titulo: "As Grandes Sagas Da Turma Da Mônica Vol. 9",
                autor: "Mauricio De Sousa",
                preco: 9900,
                capa: ""
            }
        ];

        for (const livro of livros) {
            await executar(
                `INSERT INTO Books (
          id, title, author, total_copies,
          available_copies, preco_centavos, cover_image
        )
        VALUES (?, ?, ?, 10, 10, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          author = excluded.author,
          total_copies = 10,
          available_copies = 10,
          preco_centavos = excluded.preco_centavos,
          cover_image = excluded.cover_image`,
                [
                    livro.id,
                    livro.titulo,
                    livro.autor,
                    livro.preco,
                    livro.capa
                ]
            );
        }

        await executar("COMMIT");
        transacaoAberta = false;

        console.log("Usuários e livros preparados para os testes no CI.");
    } catch (erro) {
        process.exitCode = 1;
        console.error("Erro ao preparar dados:", erro.message);

        if (transacaoAberta) {
            try {
                await executar("ROLLBACK");
            } catch (erroRollback) {
                console.error("Erro ao desfazer alterações:", erroRollback.message);
            }
        }
    } finally {
        db.close((erro) => {
            if (erro) {
                process.exitCode = 1;
                console.error("Erro ao fechar banco:", erro.message);
            }
        });
    }
}

prepararDados();