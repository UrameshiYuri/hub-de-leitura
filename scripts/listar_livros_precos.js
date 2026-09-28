const db = require("../config/db");

const sql = `
  SELECT id, title, available_copies, preco_centavos
  FROM Books
  ORDER BY id
`;

db.all(sql, [], (err, livros) => {
    if (err) {
        console.error("Erro ao listar livros:", err.message);
        process.exitCode = 1;
    } else {
        console.table(livros);
    }

    db.close();
});