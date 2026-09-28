const db = require("../config/db");

const campos = [
    {
        nome: "ativo",
        sql: `ALTER TABLE Users
          ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1
          CHECK (ativo IN (0, 1))`
    },
    {
        nome: "tentativas_login",
        sql: `ALTER TABLE Users
          ADD COLUMN tentativas_login INTEGER NOT NULL DEFAULT 0
          CHECK (tentativas_login >= 0)`
    },
    {
        nome: "bloqueado_ate",
        sql: `ALTER TABLE Users
          ADD COLUMN bloqueado_ate INTEGER DEFAULT NULL`
    }
];

db.all("PRAGMA table_info(Users)", (err, colunas) => {
    if (err) {
        console.error("Erro ao consultar tabela:", err.message);
        process.exitCode = 1;
        return db.close();
    }

    const existentes = new Set(colunas.map(coluna => coluna.name));

    function adicionarProximo(indice) {
        if (indice >= campos.length) {
            console.log("Campos de login preparados.");
            return db.close();
        }

        const campo = campos[indice];

        if (existentes.has(campo.nome)) {
            console.log(`Campo ${campo.nome} já existe.`);
            return adicionarProximo(indice + 1);
        }

        db.run(campo.sql, erro => {
            if (erro) {
                console.error(`Erro ao adicionar ${campo.nome}:`, erro.message);
                process.exitCode = 1;
                return db.close();
            }

            console.log(`Campo ${campo.nome} adicionado.`);
            adicionarProximo(indice + 1);
        });
    }

    adicionarProximo(0);
});