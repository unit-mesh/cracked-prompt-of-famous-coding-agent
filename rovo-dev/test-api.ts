/**
 * 测试 DeepSeek API 连接
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

async function testAPI() {
  const openai = createOpenAI({
    apiKey: 'sk-19dfff435fdb4518849c3c566a0e16bb',
    baseURL: 'https://api.deepseek.com'
  });

  try {
    console.log('🔍 测试 DeepSeek API 连接...');
    
    const result = await generateText({
      model: openai('deepseek-chat'),
      prompt: '你好，请回复"连接成功"',
      maxTokens: 50
    });

    console.log('✅ API 连接成功');
    console.log('响应:', result.text);
  } catch (error) {
    console.error('❌ API 连接失败:', error);
    
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  }
}

testAPI();