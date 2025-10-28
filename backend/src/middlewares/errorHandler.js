module.exports = (err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  console.error(err.stack);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erro de duplicação (chave única)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Registro já existe' });
  }

  // Erro genérico
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message 
  });
};