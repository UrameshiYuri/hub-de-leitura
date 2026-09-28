const db = require("../config/db");

db.all("PRAGMA table_info(Users)", (err, colunas) => {
    if (err) {
        console.error("Erro ao consultar a tabela:", err.message);
        process.exitCode = 1;
    } else {
        console.table(
            colunas.map(coluna => ({
                nome: coluna.name,
                tipo: coluna.type,
                padrao: coluna.dflt_value
            }))
        );
    }

    db.close();
});