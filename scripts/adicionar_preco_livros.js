const db = require("../config/db");

db.all("PRAGMA table_info(Books)", [], (err, colunas) => {
    if (err) {
        console.error("Erro ao consultar tabela:", err.message);
        process.exitCode = 1;
        db.close();
        return;
    }

    if (colunas.some((coluna) => coluna.name === "preco_centavos")) {
        console.log("A coluna preco_centavos já existe.");
        db.close();
        return;
    }

    const sql = `
    ALTER TABLE Books
    ADD COLUMN preco_centavos INTEGER
    CHECK (
      preco_centavos IS NULL OR (
        typeof(preco_centavos) = 'integer'
        AND preco_centavos > 0
      )
    )
  `;

    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao adicionar preço:", err.message);
            process.exitCode = 1;
        } else {
            console.log("Coluna preco_centavos adicionada.");
        }

        db.close();
    });
});