const db = require("../../config/db");

// Listar itens do carrinho do usuário.
const getUserBasket = (req, res) => {
  const userId = Number(req.params.userId);

  if (userId !== req.user.id) {
    return res.status(403).json({
      message: "Acesso negado. Você só pode ver seu próprio carrinho."
    });
  }

  const query = `
    SELECT
      b.id,
      b.user_id,
      b.book_id,
      b.quantity,
      b.added_date,
      bk.title AS book_title,
      bk.author AS book_author,
      bk.cover_image,
      bk.available_copies >= b.quantity AS available,
      bk.available_copies,
      bk.total_copies,
      bk.preco_centavos,
      b.quantity * bk.preco_centavos AS subtotal_centavos
    FROM Basket b
    INNER JOIN Books bk ON b.book_id = bk.id
    WHERE b.user_id = ?
    ORDER BY b.added_date DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar carrinho:", err.message);

      return res.status(500).json({
        message: "Erro ao buscar itens do carrinho."
      });
    }

    const precosValidos = rows.every((item) =>
      Number.isSafeInteger(item.preco_centavos) &&
      item.preco_centavos > 0 &&
      Number.isSafeInteger(item.subtotal_centavos) &&
      item.subtotal_centavos > 0
    );

    const total_centavos = precosValidos
      ? rows.reduce((soma, item) => soma + item.subtotal_centavos, 0)
      : null;
    let percentual_desconto = 0;

    if (total_centavos !== null) {
      if (total_centavos > 60000) {
        percentual_desconto = 15;
      } else if (total_centavos >= 20000) {
        percentual_desconto = 10;
      }
    }

    const desconto_centavos = total_centavos === null
      ? null
      : Math.floor(total_centavos * percentual_desconto / 100);

    const total_final_centavos = total_centavos === null
      ? null
      : total_centavos - desconto_centavos;

    res.json({
      items: rows,
      total: rows.length,
      total_centavos,
      percentual_desconto,
      desconto_centavos,
      total_final_centavos,
      userId,
      summary: {
        totalItems: rows.length,
        totalUnits: rows.reduce((soma, item) => soma + item.quantity, 0),
        availableItems: rows.filter((item) => item.available).length,
        unavailableItems: rows.filter((item) => !item.available).length
      }
    });
  });
};

// Adicionar livro novo ou aumentar a quantidade existente.
const addToBasket = (req, res) => {
  const { userId, bookId, quantity = 1 } = req.body || {};
  const requestingUserId = req.user.id;

  if (
    !Number.isSafeInteger(userId) || userId <= 0 ||
    !Number.isSafeInteger(bookId) || bookId <= 0
  ) {
    return res.status(400).json({
      message: "userId e bookId devem ser números inteiros positivos."
    });
  }

  if (userId !== requestingUserId) {
    return res.status(403).json({
      message: "Acesso negado. Você só pode adicionar ao seu próprio carrinho."
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).json({
      message: "A quantidade deve ser um número inteiro entre 1 e 10."
    });
  }

  db.get("SELECT * FROM Books WHERE id = ?", [bookId], (err, book) => {
    if (err) {
      console.error("Erro ao verificar livro:", err.message);

      return res.status(500).json({
        message: "Erro ao verificar livro."
      });
    }

    if (!book) {
      return res.status(404).json({
        message: "Livro não encontrado."
      });
    }

    if (
      !Number.isSafeInteger(book.preco_centavos) ||
      book.preco_centavos <= 0
    ) {
      return res.status(400).json({
        message: "Este livro ainda não possui um preço válido."
      });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        message: "Livro não está disponível.",
        bookTitle: book.title,
        availableCopies: book.available_copies
      });
    }

    db.get(
      "SELECT * FROM Basket WHERE user_id = ? AND book_id = ?",
      [requestingUserId, bookId],
      (err, existingItem) => {
        if (err) {
          console.error("Erro ao verificar carrinho:", err.message);

          return res.status(500).json({
            message: "Erro ao verificar carrinho."
          });
        }

        const quantidadeAtual = existingItem ? existingItem.quantity : 0;
        const quantidadeFinal = quantidadeAtual + quantity;

        if (quantidadeFinal > 10) {
          return res.status(400).json({
            message: "O carrinho permite no máximo 10 unidades do mesmo livro."
          });
        }

        if (quantidadeFinal > book.available_copies) {
          return res.status(400).json({
            message: "Quantidade solicitada supera os exemplares disponíveis.",
            availableCopies: book.available_copies
          });
        }

        // Condição compartilhada pelo UPDATE e pelo INSERT.
        // O limite considera o total antes de descontos.
        const limiteCarrinhoSql = `
          NOT EXISTS (
            SELECT 1
            FROM Basket b
            JOIN Books bk ON bk.id = b.book_id
            WHERE b.user_id = ?
              AND (
                bk.preco_centavos IS NULL
                OR bk.preco_centavos <= 0
              )
          )
          AND (
            SELECT COALESCE(SUM(b.quantity * bk.preco_centavos), 0)
            FROM Basket b
            JOIN Books bk ON bk.id = b.book_id
            WHERE b.user_id = ?
          ) + ? * ? <= 99000
        `;

        const parametrosLimite = [
          requestingUserId,
          requestingUserId,
          quantity,
          book.preco_centavos
        ];

        let sql;
        let parametros;

        if (existingItem) {
          sql = `
            UPDATE Basket
            SET quantity = quantity + ?
            WHERE id = ?
              AND user_id = ?
              AND quantity + ? <= 10
              AND quantity + ? <= ?
              AND ${limiteCarrinhoSql}
          `;

          parametros = [
            quantity,
            existingItem.id,
            requestingUserId,
            quantity,
            quantity,
            book.available_copies,
            ...parametrosLimite
          ];
        } else {
          sql = `
            INSERT INTO Basket (
              user_id, book_id, quantity, added_date
            )
            SELECT ?, ?, ?, datetime('now')
            WHERE NOT EXISTS (
              SELECT 1
              FROM Basket
              WHERE user_id = ? AND book_id = ?
            )
            AND ${limiteCarrinhoSql}
          `;

          parametros = [
            requestingUserId,
            bookId,
            quantity,
            requestingUserId,
            bookId,
            ...parametrosLimite
          ];
        }

        db.run(sql, parametros, function (err) {
          if (err) {
            console.error("Erro ao salvar item:", err.message);

            return res.status(500).json({
              message: "Erro ao salvar item no carrinho."
            });
          }

          if (this.changes === 0) {
            return res.status(409).json({
              message: "Adição não permitida. Confira os preços, o estoque e os limites de 10 unidades por livro e R$ 990 por carrinho. Consulte o carrinho novamente."
            });
          }

          if (existingItem) {
            return res.status(200).json({
              message: "Quantidade atualizada no carrinho.",
              itemId: existingItem.id
            });
          }

          return res.status(201).json({
            message: "Livro adicionado ao carrinho com sucesso.",
            itemId: this.lastID,
            bookTitle: book.title,
            bookAuthor: book.author,
            addedDate: new Date().toISOString()
          });
        });
      }
    );
  });
};

// Remover um livro do carrinho, incluindo todas as suas unidades.
const removeFromBasket = (req, res) => {
  const userId = Number(req.params.userId);
  const bookId = Number(req.params.bookId);

  if (
    !Number.isSafeInteger(userId) || userId <= 0 ||
    !Number.isSafeInteger(bookId) || bookId <= 0
  ) {
    return res.status(400).json({
      message: "IDs inválidos."
    });
  }

  if (userId !== req.user.id) {
    return res.status(403).json({
      message: "Acesso negado. Você só pode modificar seu próprio carrinho."
    });
  }

  db.get(
    `SELECT b.*, bk.title, bk.author
     FROM Basket b
     INNER JOIN Books bk ON b.book_id = bk.id
     WHERE b.user_id = ? AND b.book_id = ?`,
    [userId, bookId],
    (err, item) => {
      if (err) {
        console.error("Erro ao buscar item:", err.message);

        return res.status(500).json({
          message: "Erro ao buscar item do carrinho."
        });
      }

      if (!item) {
        return res.status(404).json({
          message: "Item não encontrado no carrinho."
        });
      }

      db.run(
        "DELETE FROM Basket WHERE user_id = ? AND book_id = ?",
        [userId, bookId],
        function (err) {
          if (err) {
            console.error("Erro ao remover item:", err.message);

            return res.status(500).json({
              message: "Erro ao remover item do carrinho."
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              message: "Item não encontrado no carrinho."
            });
          }

          res.json({
            message: "Item removido do carrinho com sucesso.",
            removedItem: {
              bookId,
              bookTitle: item.title,
              bookAuthor: item.author
            }
          });
        }
      );
    }
  );
};

// Limpar todos os itens do carrinho.
const clearBasket = (req, res) => {
  const userId = Number(req.params.userId);

  if (userId !== req.user.id) {
    return res.status(403).json({
      message: "Acesso negado. Você só pode limpar seu próprio carrinho."
    });
  }

  db.run(
    "DELETE FROM Basket WHERE user_id = ?",
    [userId],
    function (err) {
      if (err) {
        console.error("Erro ao limpar carrinho:", err.message);

        return res.status(500).json({
          message: "Erro ao limpar carrinho."
        });
      }

      res.json({
        message: this.changes > 0
          ? "Carrinho limpo com sucesso."
          : "Carrinho já estava vazio.",
        itemsRemoved: this.changes,
        previousItemCount: this.changes
      });
    }
  );
};

// Conferir se há exemplares suficientes para cada quantidade.
const checkBasketAvailability = (req, res) => {
  const userId = Number(req.params.userId);

  if (userId !== req.user.id) {
    return res.status(403).json({
      message: "Acesso negado."
    });
  }

  const query = `
    SELECT
      b.book_id,
      b.quantity,
      bk.title,
      bk.author,
      bk.available_copies,
      bk.available_copies >= b.quantity AS available,
      CASE
        WHEN bk.available_copies >= b.quantity THEN 'available'
        ELSE 'unavailable'
      END AS status
    FROM Basket b
    INNER JOIN Books bk ON b.book_id = bk.id
    WHERE b.user_id = ?
  `;

  db.all(query, [userId], (err, items) => {
    if (err) {
      console.error("Erro ao verificar disponibilidade:", err.message);

      return res.status(500).json({
        message: "Erro ao verificar disponibilidade."
      });
    }

    const available = items.filter((item) => item.available);
    const unavailable = items.filter((item) => !item.available);

    res.json({
      total: items.length,
      available: available.length,
      unavailable: unavailable.length,
      canProceedToReservation: unavailable.length === 0,
      items,
      unavailableBooks: unavailable.map((item) => ({
        bookId: item.book_id,
        title: item.title,
        author: item.author
      }))
    });
  });
};

module.exports = {
  getUserBasket,
  addToBasket,
  removeFromBasket,
  clearBasket,
  checkBasketAvailability
};