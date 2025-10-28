module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY,
  stabilityApiKey: process.env.STABILITY_API_KEY,
  freeRecipesPerDay: parseInt(process.env.FREE_RECIPES_PER_DAY) || 2,
  premiumRecipesPerDay: parseInt(process.env.PREMIUM_RECIPES_PER_DAY) || 999
};