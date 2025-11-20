import { BaseProvider, getOpenAILikeModel } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';

/**
 * Qwen Provider - Optimized for Qwen models with enhanced VL support
 *
 * This provider is specifically designed to support Qwen models, including:
 * - Qwen 2.5 Coder models
 * - Qwen 2 VL (Vision-Language) models
 * - Future Qwen 3 VL models when available
 *
 * Features:
 * - Automatic vision capability detection
 * - Optimized context windows for Qwen models
 * - Support for multimodal inputs (images)
 */
export default class QwenProvider extends BaseProvider {
  name = 'Qwen';
  getApiKeyLink = 'https://dashscope.aliyun.com/';

  config = {
    baseUrlKey: 'QWEN_API_BASE_URL',
    apiTokenKey: 'QWEN_API_KEY',
  };

  staticModels: ModelInfo[] = [
    // Qwen 2.5 Coder models - optimized for code generation
    {
      name: 'qwen-2.5-coder-32b-instruct',
      label: 'Qwen 2.5 Coder 32B Instruct',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
    },
    {
      name: 'qwen-2.5-72b-instruct',
      label: 'Qwen 2.5 72B Instruct',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
    },

    // Qwen 2 VL models - vision-language models
    {
      name: 'qwen-vl-plus',
      label: 'Qwen VL Plus (Vision)',
      provider: 'Qwen',
      maxTokenAllowed: 8192,
      maxCompletionTokens: 2048,
      supportsVision: true,
      supportsMultimodal: true,
      visionMaxImages: 10,
    },
    {
      name: 'qwen-vl-max',
      label: 'Qwen VL Max (Vision)',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      supportsVision: true,
      supportsMultimodal: true,
      visionMaxImages: 10,
    },

    // Placeholder for future Qwen 3 VL models
    {
      name: 'qwen3-vl-7b',
      label: 'Qwen 3 VL 7B (Vision) [Experimental]',
      provider: 'Qwen',
      maxTokenAllowed: 32768,
      maxCompletionTokens: 8192,
      supportsVision: true,
      supportsMultimodal: true,
      visionMaxImages: 16,
    },
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv: Record<string, string> = {},
  ): Promise<ModelInfo[]> {
    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'QWEN_API_BASE_URL',
      defaultApiTokenKey: 'QWEN_API_KEY',
    });

    // If no API key or baseUrl, return empty array
    if (!apiKey || !baseUrl) {
      return [];
    }

    try {
      // Try to fetch models from Qwen API (if available)
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as any;
      const models = data.data || data.models || [];

      return models
        .filter((m: any) => m.id || m.name)
        .map((m: any) => {
          const modelId = m.id || m.name;
          const isVisionModel =
            modelId.toLowerCase().includes('vl') ||
            modelId.toLowerCase().includes('vision') ||
            m.capabilities?.includes('vision');
          const contextLength = m.context_length || m.max_tokens || 32768;

          return {
            name: modelId,
            label: `${modelId}${isVisionModel ? ' (Vision)' : ''} - context ${Math.floor(contextLength / 1000)}k`,
            provider: this.name,
            maxTokenAllowed: contextLength,
            maxCompletionTokens: Math.min(Math.floor(contextLength / 4), 8192),
            supportsVision: isVisionModel,
            supportsMultimodal: isVisionModel,
            visionMaxImages: isVisionModel ? 10 : undefined,
          };
        });
    } catch (error) {
      console.error('Error fetching Qwen models:', error);
      return [];
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'QWEN_API_BASE_URL',
      defaultApiTokenKey: 'QWEN_API_KEY',
    });

    if (!baseUrl || !apiKey) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return getOpenAILikeModel(baseUrl, apiKey, model);
  }
}
