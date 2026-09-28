const db = require("../config/db");

db.all(
  `SELECT name, sql
   FROM sqlite_master
   WHERE type = 'table'
     AND name IN ('Books', 'Basket')`,
  [],
  (err, tabelas) => {
    if (err) {
      console.error("Erro ao consultar estrutura:", err.message);
      process.exitCode = 1;
    } else {
      tabelas.forEach((tabela) => {
        console.log(`\nTabela: ${tabela.name}`);
        console.log(tabela.sql);
      });
    }

    db.close();
  }
);