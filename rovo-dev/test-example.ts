/**
 * 简单的测试示例
 * 运行: npx tsx test-example.ts
 */

import RovoDevAgent from './src/agent/rovo-agent.js';

async function testAgent() {
  // 使用你提供的 API Key
  const agent = new RovoDevAgent({
    apiKey: 'sk-19dfff435fdb4518849c3c566a0e16bb',
    model: 'deepseek-chat',
    temperature: 0.1
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