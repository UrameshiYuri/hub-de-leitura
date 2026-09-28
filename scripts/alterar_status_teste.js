const db = require("../config/db");

const valor = process.argv[2];

if (valor !== "0" && valor !== "1") {
    console.error("Informe 0 para desativar ou 1 para ativar.");
    process.exitCode = 1;
    db.close();
} else {
    db.run(
        "UPDATE Users SET ativo = ? WHERE email = ?",
        [Number(valor), "teste@teste.com"],
        function (err) {
            if (err) {
                console.error(err.message);
                process.exitCode = 1;
            } else {
                console.log(`Usuários alterados: ${this.changes}`);
                console.log(`Ativo: ${valor}`);
            }

            db.close();
        }
    );
}