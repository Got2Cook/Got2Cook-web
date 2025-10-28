const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middlewares/auth');
const { recipeLimiter } = require('../middlewares/rateLimiter');

// Todas as rotas precisam de autenticação
router.use(auth);

// POST /api/receitas/gerar - Gera nova receita
router.post('/gerar', recipeLimiter, recipeController.generate.bind(recipeController));

// GET /api/receitas/minhas - Lista receitas salvas
router.get('/minhas', recipeController.list.bind(recipeController));

module.exports = router;