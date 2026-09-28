const db = require("../config/db");

const sql = `
  UPDATE Books
  SET preco_centavos = CASE id
    WHEN 3 THEN 10000
    WHEN 24 THEN 9900
  END
  WHERE id IN (3, 24)
    AND preco_centavos IS NULL
`;

db.run(sql, [], function (err) {
    if (err) {
        console.error("Erro ao definir preços:", err.message);
        process.exitCode = 1;
    } else {
        console.log("Livros com preço definido:", this.changes);
    }

    db.close();
});