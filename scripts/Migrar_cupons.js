const db = require("../config/db");

const criarTabelaNova = `
  CREATE TABLE Coupons_nova (
    id INTEGER PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    tipo_desconto TEXT NOT NULL
      CHECK (tipo_desconto IN ('percent', 'fixed_product')),
    percentual INTEGER,
    valor_centavos INTEGER,
    descricao TEXT NOT NULL,
    minimo_centavos INTEGER NOT NULL DEFAULT 0
      CHECK (minimo_centavos >= 0),
    ativo INTEGER NOT NULL DEFAULT 1
      CHECK (ativo IN (0, 1)),
    validade TEXT,
    CHECK (
      (
        tipo_desconto = 'percent'
        AND percentual IS NOT NULL
        AND percentual BETWEEN 1 AND 100
        AND valor_centavos IS NULL
      )
      OR
      (
        tipo_desconto = 'fixed_product'
        AND valor_centavos IS NOT NULL
        AND valor_centavos > 0
        AND percentual IS NULL
      )
    )
  )
`;
// Permite aguardar cada comando SQL antes de executar o próximo.
function executar(sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function consultarColunas() {
    return new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(Coupons)", [], (err, colunas) => {
            if (err) return reject(err);
            resolve(colunas);
        });
    });
}

async function migrar() {
    let transacaoAberta = false;

    try {
        await executar("BEGIN IMMEDIATE TRANSACTION");
        transacaoAberta = true;

        const colunas = await consultarColunas();

        // Evita executar a mesma migração novamente.
        if (colunas.some((coluna) => coluna.name === "tipo_desconto")) {
            await executar("ROLLBACK");
            transacaoAberta = false;
            console.log("A tabela já possui a nova estrutura.");
            return;
        }

        await executar(criarTabelaNova);

        await executar(`
      INSERT INTO Coupons_nova (
        id,
        codigo,
        tipo_desconto,
        percentual,
        valor_centavos,
        descricao,
        minimo_centavos,
        ativo,
        validade
      )
      SELECT
        id,
        codigo,
        'percent',
        percentual,
        NULL,
        'Cupom percentual migrado',
        minimo_centavos,
        ativo,
        validade
      FROM Coupons
    `);

        await executar("DROP TABLE Coupons");
        await executar("ALTER TABLE Coupons_nova RENAME TO Coupons");

        await executar("COMMIT");
        transacaoAberta = false;

        console.log("Migração de cupons concluída.");
    } catch (err) {
        console.error("Erro na migração:", err.message);
        process.exitCode = 1;

        if (transacaoAberta) {
            try {
                await executar("ROLLBACK");
                console.log("Alterações da migração desfeitas.");
            } catch (rollbackErr) {
                console.error("Erro ao desfazer:", rollbackErr.message);
            }
        }
    } finally {
        db.close((err) => {
            if (err) {
                console.error("Erro ao fechar banco:", err.message);
                process.exitCode = 1;
            }
        });
    }
}

migrar();