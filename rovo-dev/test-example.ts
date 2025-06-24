/**
 * 简单的测试示例
 * 运行: npx tsx test-example.ts
 */

import RovoDevAgent from './src/agent/rovo-agent.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testAgent() {
  // 从环境变量读取 API Key
  const apiKey = process.env.DEEPSEEK_TOKEN;
  
  if (!apiKey) {
    console.error('❌ 请在 .env 文件中设置 DEEPSEEK_TOKEN');
    process.exit(1);
  }

  const agent = new RovoDevAgent({
    apiKey,
    model: process.env.DEFAULT_MODEL || 'deepseek-chat',
    temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.1')
  });

  console.log('🤖 测试 Rovo Dev Agent');
  console.log('可用工具:', agent.getAvailableTools());

  // 测试简单任务
  try {
    await agent.executeTask('查看当前目录的文件，并告诉我这是什么项目');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testAgent().catch(console.error);