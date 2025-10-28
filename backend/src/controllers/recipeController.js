const geminiService = require('../services/geminiService');
const stabilityService = require('../services/stabilityService');
const cacheService = require('../services/cacheService');
const UsageLimit = require('../models/UsageLimit');
const config = require('../config/environment');

class RecipeController {
  /**
   * Gera uma nova receita
   * POST /api/receitas/gerar
   */
  async generate(req, res, next) {
    try {
      const { mood, ingredients, type = 'todos', restrictions = [] } = req.body;
      const userId = req.user.id;
      const isPremium = req.user.isPremiumActive();

      // Validações
      if (!mood || !ingredients || ingredients.length === 0) {
        return res.status(400).json({ 
          error: 'Humor e ingredientes são obrigatórios' 
        });
      }

      // Verificar limite diário
      const canGenerate = await this.checkUsageLimit(userId, isPremium);
      if (!canGenerate) {
        return res.status(429).json({ 
          error: 'Limite diário atingido. Faça upgrade para Premium!' 
        });
      }

      // Gerar hash do prompt
      const promptHash = cacheService.generatePromptHash(mood, ingredients, type);

      // Tentar buscar no cache primeiro
      let cachedRecipe = await cacheService.findCachedRecipe(userId, promptHash);

      let recipe;
      if (cachedRecipe) {
        console.log('✅ Receita encontrada no cache');
        recipe = {
          name: cachedRecipe.name,
          ingredients: cachedRecipe.ingredients,
          instructions: cachedRecipe.instructions,
          prepTime: cachedRecipe.prepTime,
          calories: cachedRecipe.calories,
          mood,
          type,
          image: cachedRecipe.image,
          fromCache: true
        };
      } else {
        console.log('🔄 Gerando nova receita com IA...');
        
        // Gerar receita nova com Gemini
        const generatedRecipe = await geminiService.generateRecipe({
          mood,
          ingredients,
          type,
          restrictions
        });

        recipe = {
          ...generatedRecipe,
          mood,
          type,
          fromCache: false
        };

        // Gerar imagem se for premium
        if (isPremium) {
          console.log('🎨 Gerando imagem (Premium)...');
          const image = await stabilityService.generateImage(
            recipe.name,
            ingredients.join(', ')
          );
          recipe.image = image;
        }

        // Salvar no cache
        await cacheService.saveRecipe(userId, recipe, promptHash);
      }

      // Incrementar contador de uso
      await this.incrementUsageCount(userId);

      // Retornar receita
      res.json({
        success: true,
        recipe,
        isPremium,
        remainingToday: await this.getRemainingRecipes(userId, isPremium)
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista receitas salvas do usuário
   * GET /api/receitas/minhas
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;

      const recipes = await cacheService.getUserRecipes(userId, limit);

      res.json({
        success: true,
        recipes,
        total: recipes.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica se o usuário pode gerar mais receitas hoje
   */
  async checkUsageLimit(userId, isPremium) {
    if (isPremium) return true; // Premium ilimitado

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const usage = await UsageLimit.findOne({ userId, date: today });

    if (!usage) return true; // Primeiro uso do dia

    return usage.count < config.freeRecipesPerDay;
  }

  /**
   * Incrementa o contador de uso diário
   */
  async incrementUsageCount(userId) {
    const today = new Date().toISOString().split('T')[0];

    await UsageLimit.findOneAndUpdate(
      { userId, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
  }

  /**
   * Retorna quantas receitas ainda podem ser geradas hoje
   */
  async getRemainingRecipes(userId, isPremium) {
    if (isPremium) return 999; // "Ilimitado"

    const today = new Date().toISOString().split('T')[0];
    const usage = await UsageLimit.findOne({ userId, date: today });

    if (!usage) return config.freeRecipesPerDay;

    return Math.max(0, config.freeRecipesPerDay - usage.count);
  }
}

module.exports = new RecipeController();