const express = require("express");
const db = require("../../config/db");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateAdmin, (req, res) => {
  db.all("SELECT * FROM Coupons ORDER BY id", [], (err, cupons) => {
    if (err) {
      console.error("Erro ao listar cupons:", err.message);

      return res.status(500).json({
        message: "Erro ao listar cupons."
      });
    }

    res.json(cupons);
  });
});
router.get("/:id", authenticateAdmin, (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "ID do cupom inválido."
    });
  }

  db.get("SELECT * FROM Coupons WHERE id = ?", [id], (err, cupom) => {
    if (err) {
      console.error("Erro ao buscar cupom:", err.message);

      return res.status(500).json({
        message: "Erro ao buscar cupom."
      });
    }

    if (!cupom) {
      return res.status(404).json({
        message: "Cupom não encontrado."
      });
    }

    res.json(cupom);
  });
});
router.post("/", authenticateAdmin, (req, res) => {
  const {
    codigo,
    tipo_desconto,
    percentual = null,
    valor_centavos = null,
    descricao,
    minimo_centavos = 0,
    ativo = true,
    validade = null
  } = req.body || {};

  // Campos de texto obrigatórios.
  if (
    typeof codigo !== "string" || codigo.trim() === "" ||
    typeof descricao !== "string" || descricao.trim() === ""
  ) {
    return res.status(400).json({
      message: "Código e descrição são obrigatórios."
    });
  }

  // Tipos de desconto aceitos.
  if (!["percent", "fixed_product"].includes(tipo_desconto)) {
    return res.status(400).json({
      message: "Tipo de desconto deve ser percent ou fixed_product."
    });
  }

  // Cada tipo utiliza seu próprio campo de valor.
  if (
    tipo_desconto === "percent" &&
    (
      !Number.isInteger(percentual) ||
      percentual < 1 ||
      percentual > 100 ||
      valor_centavos !== null
    )
  ) {
    return res.status(400).json({
      message: "Informe percentual inteiro de 1 a 100 e valor_centavos nulo ou omitido."
    });
  }

  if (
    tipo_desconto === "fixed_product" &&
    (
      !Number.isSafeInteger(valor_centavos) ||
      valor_centavos <= 0 ||
      percentual !== null
    )
  ) {
    return res.status(400).json({
      message: "Informe valor_centavos inteiro positivo e percentual nulo ou omitido."
    });
  }

  // Campos opcionais também precisam ser válidos quando enviados.
  if (!Number.isSafeInteger(minimo_centavos) || minimo_centavos < 0) {
    return res.status(400).json({
      message: "O mínimo deve ser um inteiro maior ou igual a zero."
    });
  }

  if (typeof ativo !== "boolean") {
    return res.status(400).json({
      message: "Ativo deve ser true ou false."
    });
  }

  if (validade !== null) {
    const data = typeof validade === "string"
      ? new Date(validade)
      : new Date(NaN);

    if (
      !Number.isFinite(data.getTime()) ||
      data.toISOString().replace(".000Z", "Z") !==
      validade.replace(".000Z", "Z")
    ) {
      return res.status(400).json({
        message: "Validade deve usar o formato 2026-12-31T23:59:59Z ou ser nula."
      });
    }
  }

  const novoCupom = {
    codigo: codigo.trim(),
    tipo_desconto,
    percentual,
    valor_centavos,
    descricao: descricao.trim(),
    minimo_centavos,
    ativo: ativo ? 1 : 0,
    validade
  };

  const sql = `
    INSERT INTO Coupons (
      codigo, tipo_desconto, percentual, valor_centavos,
      descricao, minimo_centavos, ativo, validade
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    novoCupom.codigo,
    novoCupom.tipo_desconto,
    novoCupom.percentual,
    novoCupom.valor_centavos,
    novoCupom.descricao,
    novoCupom.minimo_centavos,
    novoCupom.ativo,
    novoCupom.validade
  ];

  db.run(sql, valores, function (err) {
    if (err) {
      if (
        err.code === "SQLITE_CONSTRAINT" &&
        err.message.includes("UNIQUE constraint failed: Coupons.codigo")
      ) {
        return res.status(409).json({
          message: "Já existe um cupom com esse código."
        });
      }

      console.error("Erro ao cadastrar cupom:", err.message);

      return res.status(500).json({
        message: "Erro ao cadastrar cupom."
      });
    }

    return res.status(201).json({
      id: this.lastID,
      ...novoCupom
    });
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

      if (
        cupom.validade !== null &&
        Date.now() >= new Date(cupom.validade).getTime()
      ) {
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
      if (cupom.tipo_desconto !== "percent") {
        return res.status(422).json({
          message: "Esta rota de aplicação aceita apenas cupons percentuais."
        });
      }
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