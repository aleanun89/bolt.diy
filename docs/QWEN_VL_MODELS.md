# Qwen Vision-Language (VL) Models - Usage Guide

## Overview

Qwen VL models are advanced multimodal AI models that can process both text and images. This guide covers the enhanced implementation of Qwen VL models in bolt.diy, including setup, configuration, and best practices.

## Supported Qwen VL Models

### Current Models (Qwen 2 VL Series)

1. **Qwen2-VL-7B-Instruct**
   - Context window: 32k tokens
   - Vision capabilities: Yes (up to 10 images)
   - Best for: Lightweight vision tasks, image understanding
   - Available in: HuggingFace provider

2. **Qwen2-VL-72B-Instruct**
   - Context window: 32k tokens
   - Vision capabilities: Yes (up to 10 images)
   - Best for: Complex vision tasks, detailed image analysis
   - Available in: HuggingFace, Hyperbolic providers

3. **Qwen VL Plus**
   - Context window: 8k tokens
   - Vision capabilities: Yes (up to 10 images)
   - Best for: Fast vision tasks
   - Available in: Qwen provider (requires API key)

4. **Qwen VL Max**
   - Context window: 32k tokens
   - Vision capabilities: Yes (up to 10 images)
   - Best for: High-quality vision understanding
   - Available in: Qwen provider (requires API key)

### Future Models (Qwen 3 VL Series)

The system is designed to support upcoming Qwen 3 VL models when they become available:
- Enhanced multimodal capabilities
- Improved image resolution support
- Better context understanding
- Support for up to 16 images per request

## Configuration

### 1. Provider Setup

#### HuggingFace Provider
```bash
# Add to .env.local
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

#### Hyperbolic Provider
```bash
# Add to .env.local
HYPERBOLIC_API_KEY=your_hyperbolic_api_key_here
```

#### Qwen Direct Provider
```bash
# Add to .env.local
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 2. Model Selection

In the bolt.diy UI:
1. Open Settings (⚙️ icon in sidebar)
2. Navigate to Providers tab
3. Enable the provider containing your desired Qwen VL model
4. Enter your API key if required
5. Select a model marked with "(Vision)" in the model dropdown

## Features and Capabilities

### Vision Model Detection
The system automatically detects vision-capable models by:
- Model name containing "VL" or "vision"
- Explicit vision capability flags from provider APIs
- Manual configuration in static model definitions

### Model Metadata
Each Qwen VL model includes:
- `supportsVision`: Boolean flag for vision capability
- `supportsMultimodal`: Boolean flag for multimodal inputs
- `visionMaxImages`: Maximum number of images supported
- `maxTokenAllowed`: Context window size
- `maxCompletionTokens`: Maximum output tokens

### Memory Management
Qwen VL models are optimized for:
- Efficient image processing
- Context window management (32k tokens for most models)
- Automatic token calculation for images
- Smart completion token limits

## Usage Examples

### Basic Image Understanding
```javascript
// Example: Using Qwen VL to analyze an image
const messages = [
  {
    role: "user",
    content: [
      { type: "text", text: "What is shown in this image?" },
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
    ]
  }
];
```

### Multiple Image Analysis
```javascript
// Example: Comparing multiple images
const messages = [
  {
    role: "user",
    content: [
      { type: "text", text: "Compare these images and describe the differences" },
      { type: "image_url", image_url: { url: "image1_url" } },
      { type: "image_url", image_url: { url: "image2_url" } }
    ]
  }
];
```

### Code + Vision Task
```javascript
// Example: Generate code based on UI screenshot
const messages = [
  {
    role: "user",
    content: [
      { type: "text", text: "Generate React code to recreate this UI" },
      { type: "image_url", image_url: { url: "ui_screenshot_url" } }
    ]
  }
];
```

## Best Practices

### 1. Image Optimization
- Resize images to reasonable dimensions (max 1920x1080 recommended)
- Use JPEG format for photos, PNG for screenshots with text
- Compress images to reduce token usage without quality loss
- Limit to 10 images per request for optimal performance

### 2. Context Management
- Reserve ~25% of context window for image tokens
- Monitor token usage when combining text and images
- Use streaming for long responses
- Clear conversation history periodically for memory efficiency

### 3. Model Selection
- Use Qwen2-VL-7B for quick, lightweight vision tasks
- Use Qwen2-VL-72B for complex analysis requiring high accuracy
- Use Qwen VL Plus for fast API responses
- Use Qwen VL Max for highest quality vision understanding

### 4. Performance Optimization
- Cache frequently used images
- Batch similar image analysis tasks
- Use appropriate context windows based on task complexity
- Monitor API rate limits and usage

## Troubleshooting

### Common Issues

**Issue: Model not showing vision capability**
- Solution: Check if model name includes "VL" or "vision"
- Verify the model is properly marked in provider configuration

**Issue: Image not being processed**
- Solution: Ensure image is base64 encoded or accessible URL
- Check image size is under provider limits
- Verify API key has vision model access

**Issue: High token usage**
- Solution: Reduce image resolution
- Limit number of images per request
- Use shorter text prompts
- Clear conversation history

**Issue: Slow response times**
- Solution: Use smaller VL models (7B instead of 72B)
- Reduce image count
- Check network connectivity
- Consider using cached models

## Performance Metrics

### Expected Token Usage
- Small image (512x512): ~85 tokens
- Medium image (1024x1024): ~340 tokens
- Large image (1920x1080): ~600 tokens
- Text tokens: 1 token ≈ 4 characters

### Typical Response Times
- Qwen2-VL-7B: 1-3 seconds
- Qwen2-VL-72B: 3-8 seconds
- Qwen VL Plus: 1-2 seconds
- Qwen VL Max: 2-5 seconds

*Note: Times vary based on image complexity, text length, and provider infrastructure*

## Advanced Features

### Dynamic Model Loading
The system automatically fetches available Qwen VL models from provider APIs and caches them for quick access.

### Automatic Vision Detection
Vision capabilities are detected automatically from:
- Model names containing "VL" or "vision"
- Provider API metadata
- Static model definitions

### Multi-Provider Support
Access Qwen VL models through multiple providers:
- Direct Qwen API for official models
- HuggingFace for open-source variants
- Hyperbolic for high-performance inference
- OpenRouter for unified access

## API Reference

### Model Configuration Options
```typescript
interface ModelInfo {
  name: string;                    // Model identifier
  label: string;                   // Display name
  provider: string;                // Provider name
  maxTokenAllowed: number;         // Context window size
  maxCompletionTokens?: number;    // Max output tokens
  supportsVision?: boolean;        // Vision capability flag
  supportsMultimodal?: boolean;    // Multimodal flag
  visionMaxImages?: number;        // Max images per request
}
```

### Provider Configuration
```typescript
interface QwenProviderConfig {
  baseUrlKey: 'QWEN_API_BASE_URL';
  apiTokenKey: 'QWEN_API_KEY';
}
```

## Future Enhancements

Planned improvements for Qwen VL model support:
- [ ] Qwen 3 VL model integration when released
- [ ] Enhanced image preprocessing pipeline
- [ ] Automatic image quality optimization
- [ ] Vision-specific prompt templates
- [ ] Multi-image comparison utilities
- [ ] Vision model performance monitoring
- [ ] Advanced caching strategies
- [ ] Support for video inputs (when available)

## Resources

- [Qwen Official Documentation](https://qwen.readthedocs.io/)
- [Qwen2-VL Model Card](https://huggingface.co/Qwen/Qwen2-VL-72B-Instruct)
- [Vision-Language Models Guide](https://huggingface.co/docs/transformers/model_doc/qwen2_vl)
- [bolt.diy Community](https://thinktank.ottomator.ai)

## Support

For issues or questions:
1. Check the FAQ.md in the repository
2. Search existing GitHub issues
3. Join the bolt.diy community forum
4. Create a new GitHub issue with detailed information

---

Last updated: 2025-11-20
Version: 1.0.0
