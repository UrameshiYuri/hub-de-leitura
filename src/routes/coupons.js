const express = require("express");

const router = express.Router();
const cupom = {
  codigo: "PROMO10",
  percentual: 10,
  minimo_centavos: 5000,
  ativo: true,
  validade: "2026-12-31T23:59:59Z"
};

router.get("/", (req, res) => {
  res.json({
    message: "Rota de cupons funcionando!"
  });
});
router.post("/aplicar", (req, res) => {
  const { codigo, total_centavos } = req.body;
  if (codigo !== cupom.codigo) {
    return res.status(400).json({
      message: "Cupom inválido."
    });
  }
  if (!cupom.ativo) {
    return res.status(400).json({
      message: "Este cupom não existe."
    });
  }
  if (!Number.isSafeInteger(total_centavos) || total_centavos <= 0) {
    return res.status(400).json({
      message: "O total deve ser um número inteiro positivo em centavos."
    });
  }
  if (total_centavos < cupom.minimo_centavos) {
    return res.status(400).json({
      message: "Valor da compra abaixo do mínimo para este cupom.",
      minimo_centavos: cupom.minimo_centavos
    });
  }
  if (Date.now() >= new Date(cupom.validade).getTime()) {
    return res.status(400).json({
      message: "Este cupom está vencido."
    });
  }
  const desconto_centavos = Math.floor(
    total_centavos * cupom.percentual / 100
  );

  const total_final_centavos = total_centavos - desconto_centavos;

  res.json({
    codigo,
    total_centavos,
    desconto_centavos,
    total_final_centavos
  });
});

module.exports = router;