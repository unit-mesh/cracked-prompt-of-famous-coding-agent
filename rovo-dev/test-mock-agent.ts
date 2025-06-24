/**
 * 测试模拟 Agent
 */

import MockRovoDevAgent from './src/agent/mock-agent.js';
import chalk from 'chalk';

async function testMockAgent() {
  console.log(chalk.blue('🧪 测试模拟 Rovo Dev Agent'));
  console.log(chalk.gray('='.repeat(50)));

  const agent = new MockRovoDevAgent();
  
  console.log('可用工具:', agent.getAvailableTools());
  console.log();

  // 测试不同类型的任务
  const testTasks = [
    '查看当前项目的结构，分析这是什么类型的项目',
    '在项目中搜索所有的 import 语句',
    '检查 TypeScript 文件的语法错误',
    '创建一个新的示例文件'
  ];

  for (let i = 0; i < testTasks.length; i++) {
    console.log(chalk.yellow(`\n🔄 测试任务 ${i + 1}/${testTasks.length}`));
    console.log(chalk.gray('-'.repeat(50)));
    
    try {
      await agent.executeTask(testTasks[i]);
    } catch (error) {
      console.error(chalk.red('测试失败:'), error);
    }
    
    if (i < testTasks.length - 1) {
      console.log(chalk.gray('\n' + '='.repeat(50)));
    }
  }

  console.log(chalk.green('\n✅ 所有测试完成'));
}

testMockAgent().catch(console.error);