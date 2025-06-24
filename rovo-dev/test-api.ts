/**
 * 测试 DeepSeek API 连接
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testAPI() {
  const apiKey = process.env.DEEPSEEK_TOKEN;
  
  if (!apiKey) {
    console.error('❌ 请在 .env 文件中设置 DEEPSEEK_TOKEN');
    process.exit(1);
  }

  const openai = createOpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
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