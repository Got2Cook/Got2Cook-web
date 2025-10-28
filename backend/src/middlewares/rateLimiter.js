const rateLimit = require('express-rate-limit');

// Limita geração de receitas a 10 por hora por IP
const recipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: { error: 'Muitas requisições. Aguarde 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { recipeLimiter };