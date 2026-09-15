const express = require("express");
const db = require("../../config/db");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Rota de cupons funcionando!"
  });
});

router.post("/aplicar", (req, res) => {
  const { codigo, total_centavos } = req.body;

  // Verifica os dados antes de consultar o banco.
  if (typeof codigo !== "string" || codigo.trim() === "") {
    return res.status(400).json({
      message: "Cupom inválido."
    });
  }

  if (!Number.isSafeInteger(total_centavos) || total_centavos <= 0) {
    return res.status(400).json({
      message: "O total deve ser um número inteiro positivo em centavos."
    });
  }

  // Busca o cupom pelo código informado.
  db.get(
    "SELECT * FROM Coupons WHERE codigo = ?",
    [codigo],
    (err, cupom) => {
      if (err) {
        console.error("Erro ao consultar cupom:", err.message);

        return res.status(500).json({
          message: "Erro ao consultar cupom."
        });
      }

      if (!cupom) {
        return res.status(400).json({
          message: "Cupom inválido."
        });
      }

      if (!cupom.ativo) {
        return res.status(400).json({
          message: "Este cupom está desativado."
        });
      }

      if (Date.now() >= new Date(cupom.validade).getTime()) {
        return res.status(400).json({
          message: "Este cupom está vencido."
        });
      }

      if (total_centavos < cupom.minimo_centavos) {
        return res.status(400).json({
          message: "Valor da compra abaixo do mínimo para este cupom.",
          minimo_centavos: cupom.minimo_centavos
        });
      }

      // Calcula o desconto usando o percentual salvo no banco.
      const desconto_centavos = Math.floor(
        total_centavos * cupom.percentual / 100
      );

      const total_final_centavos = total_centavos - desconto_centavos;

      res.json({
        codigo: cupom.codigo,
        total_centavos,
        desconto_centavos,
        total_final_centavos
      });
    }
  ); // Fecha a consulta ao banco.
}); // Fecha a rota POST.

module.exports = router;