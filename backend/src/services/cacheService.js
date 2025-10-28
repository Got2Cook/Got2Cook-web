const crypto = require('crypto');
const Recipe = require('../models/Recipe');

class CacheService {
  /**
   * Gera hash único do prompt para detectar receitas duplicadas
   */
  generatePromptHash(mood, ingredients, type) {
    const sortedIngredients = [...ingredients].sort().join(',');
    const data = `${mood}|${sortedIngredients}|${type}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Busca receita no cache
   */
  async findCachedRecipe(userId, promptHash) {
    try {
      // Busca receita com o mesmo hash que NÃO foi gerada pelo mesmo usuário
      // (para evitar repetição para o próprio usuário)
      const cachedRecipe = await Recipe.findOne({
        promptHash,
        userId: { $ne: userId } // Diferente do usuário atual
      }).sort({ createdAt: -1 }).limit(1);

      return cachedRecipe;
    } catch (error) {
      console.error('❌ Erro ao buscar cache:', error.message);
      return null;
    }
  }

  /**
   * Salva receita no cache
   */
  async saveRecipe(userId, recipeData, promptHash) {
    try {
      const recipe = new Recipe({
        userId,
        name: recipeData.name,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prepTime: recipeData.prepTime,
        calories: recipeData.calories,
        mood: recipeData.mood,
        type: recipeData.type,
        image: recipeData.image || null,
        promptHash
      });

      await recipe.save();
      return recipe;
    } catch (error) {
      console.error('❌ Erro ao salvar receita:', error.message);
      throw error;
    }
  }

  /**
   * Busca receitas salvas pelo usuário
   */
  async getUserRecipes(userId, limit = 50) {
    try {
      return await Recipe.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('❌ Erro ao buscar receitas do usuário:', error.message);
      return [];
    }
  }
}

module.exports = new CacheService();