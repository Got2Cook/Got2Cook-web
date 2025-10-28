const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');

/**
 * POST /api/auth/register - Registra novo usuário
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validações
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Criar usuário
    const user = new User({ email, password, name });
    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpires }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login - Login de usuário
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpires }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremiumActive()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me - Retorna dados do usuário autenticado
 */
router.get('/me', require('../middlewares/auth'), async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        isPremium: req.user.isPremiumActive()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;