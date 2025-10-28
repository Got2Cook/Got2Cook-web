const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/environment');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Gera uma receita com base no humor e ingredientes
   */
  async generateRecipe({ mood, ingredients, type = 'todos', restrictions = [] }) {
    try {
      const prompt = this.buildPrompt(mood, ingredients, type, restrictions);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse da resposta JSON
      const recipe = this.parseRecipeResponse(text);
      
      return recipe;
    } catch (error) {
      console.error('❌ Erro no Gemini:', error.message);
      throw new Error('Falha ao gerar receita com IA');
    }
  }

  /**
   * Constrói o prompt otimizado
   */
  buildPrompt(mood, ingredients, type, restrictions) {
    const restrictionsText = restrictions.length > 0 
      ? `\n\n⚠️ RESTRIÇÕES ALIMENTARES: ${restrictions.join(', ')}. NÃO use esses ingredientes.`
      : '';

    const typeText = type !== 'todos' ? `\n\n🍽️ TIPO: Receita ${type.toUpperCase()}.` : '';

    return `Você é um chef especialista em neurociência gastronômica e técnicas culinárias avançadas. Crie uma receita criativa e saborosa baseada nos dados abaixo:

📊 HUMOR DO USUÁRIO: ${mood}
🛒 INGREDIENTES DISPONÍVEIS: ${ingredients.join(', ')}${typeText}${restrictionsText}

🧠 INSTRUÇÕES:
1. Use técnicas gastronômicas reais (ex: sous-vide, caramelização, emulsificação)
2. Considere a neurociência da alimentação (texturas, cores, aromas que conectam com o humor)
3. Seja criativo mas prático
4. Responda APENAS com JSON no formato abaixo (sem markdown, sem comentários):

{
  "name": "Nome criativo da receita",
  "ingredients": ["ingrediente 1", "ingrediente 2", ...],
  "instructions": ["passo 1", "passo 2", ...],
  "prepTime": 30,
  "calories": 450
}

⚠️ IMPORTANTE: Retorne APENAS o JSON, sem \`\`\`json ou qualquer texto adicional.`;
  }

  /**
   * Faz parse da resposta do Gemini
   */
  parseRecipeResponse(text) {
    try {
      // Remove possíveis markdown tags
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const recipe = JSON.parse(cleanText);

      // Validações
      if (!recipe.name || !recipe.ingredients || !recipe.instructions || !recipe.prepTime) {
        throw new Error('Resposta incompleta da IA');
      }

      return {
        name: recipe.name,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: parseInt(recipe.prepTime),
        calories: parseInt(recipe.calories) || null
      };
    } catch (error) {
      console.error('❌ Erro ao fazer parse:', error.message);
      console.error('Texto recebido:', text);
      throw new Error('Erro ao processar resposta da IA');
    }
  }
}

module.exports = new GeminiService();