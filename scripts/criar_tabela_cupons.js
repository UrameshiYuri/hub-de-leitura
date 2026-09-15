const db = require("../config/db");
const sql = `
  CREATE TABLE IF NOT EXISTS Coupons (
    id INTEGER PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    percentual INTEGER NOT NULL CHECK (percentual BETWEEN 1 AND 100),
    minimo_centavos INTEGER NOT NULL CHECK (minimo_centavos >= 0),
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    validade TEXT NOT NULL
  )
`;

db.run(sql, (err) => {
    if (err) {
        console.error("Erro ao criar tabela:", err.message);
        process.exitCode = 1;
    } else {
        console.log("Tabela Coupons pronta.");
    }

    db.close();
});