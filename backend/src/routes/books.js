const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const [books] = await pool.query('SELECT * FROM books WHERE user_id = ?', [req.user.userId]);
    res.json(books);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const [books] = await pool.query('SELECT * FROM books WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.userId
    ]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(books[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  const { title, author, description, cover_url } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, description, cover_url, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, author, description, cover_url, req.user.userId]
    );
    res.status(201).json({ id: result.insertId, title, author, description, cover_url });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  const { title, author, description, cover_url } = req.body;
  try {
    await pool.query(
      'UPDATE books SET title = ?, author = ?, description = ?, cover_url = ? WHERE id = ? AND user_id = ?',
      [title, author, description, cover_url, req.params.id, req.user.userId]
    );
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM books WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.userId
    ]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
