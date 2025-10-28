const axios = require('axios');
const config = require('../config/environment');

class StabilityService {
  constructor() {
    this.apiKey = config.stabilityApiKey;
    this.baseURL = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';
  }

  /**
   * Gera imagem da receita usando Stable Diffusion
   * (Somente para usuários premium)
   */
  async generateImage(recipeName, description = '') {
    try {
      const prompt = this.buildImagePrompt(recipeName, description);

      const response = await axios.post(
        this.baseURL,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            {
              text: 'blurry, distorted, ugly, low quality, watermark',
              weight: -1
            }
          ],
          cfg_scale: 7,
          height: 512,
          width: 512,
          samples: 1,
          steps: 30
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          },
          timeout: 60000 // 60 segundos
        }
      );

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const imageBase64 = response.data.artifacts[0].base64;
        return `data:image/png;base64,${imageBase64}`;
      }

      throw new Error('Nenhuma imagem gerada');
    } catch (error) {
      console.error('❌ Erro Stability AI:', error.response?.data || error.message);
      
      // Se falhar, retorna null ao invés de quebrar (imagem é opcional)
      return null;
    }
  }

  /**
   * Constrói prompt otimizado para geração de imagem
   */
  buildImagePrompt(recipeName, description) {
    return `Professional food photography of ${recipeName}, ${description}, high quality, appetizing, well-lit, styled, gourmet presentation, top view, white plate, restaurant quality, 4k, sharp focus`;
  }
}

module.exports = new StabilityService();