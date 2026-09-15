const db = require("../config/db");

const sql = `
  INSERT INTO Coupons (
    codigo, percentual, minimo_centavos, ativo, validade
  )
  VALUES (?, ?, ?, ?, ?)
`;

const valores = [
    "PROMO10",
    10,
    5000,
    1,
    "2026-12-31T23:59:59Z"
];

db.run(sql, valores, function (err) {
    if (err) {
        console.error("Erro ao inserir cupom:", err.message);
        process.exitCode = 1;
    } else {
        console.log("Cupom salvo com ID:", this.lastID);
    }

    db.close();
});