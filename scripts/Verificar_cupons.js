const db = require("../config/db");

db.all("PRAGMA table_info(Coupons)", [], (err, colunas) => {
    if (err) {
        console.error("Erro ao consultar estrutura:", err.message);
        process.exitCode = 1;
    } else {
        console.table(colunas);
    }

    db.close();
});