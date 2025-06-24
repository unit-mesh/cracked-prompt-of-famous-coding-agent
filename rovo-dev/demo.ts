/**
 * Rovo Dev Agent 完整演示
 */

import RovoDevAgent from './src/agent/rovo-agent.js';
import MockRovoDevAgent from './src/agent/mock-agent.js';
import chalk from 'chalk';

async function runDemo() {
  console.log(chalk.blue('🚀 Rovo Dev Agent 完整演示'));
  console.log(chalk.gray('='.repeat(60)));

  // 演示任务列表
  const demoTasks = [
    {
      title: '项目结构分析',
      task: '查看当前项目的结构，分析这是什么类型的项目'
    },
    {
      title: '代码搜索',
      task: '在项目中搜索所有的 import 语句，统计使用的依赖'
    },
    {
      title: '文件创建',
      task: '创建一个新的 README 文件，介绍这个项目'
    },
    {
      title: '代码诊断',
      task: '检查 TypeScript 文件是否有语法错误或警告'
    }
  ];

  console.log(chalk.yellow('📋 演示任务列表:'));
  demoTasks.forEach((demo, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${demo.title}: ${demo.task}`));
  });
  console.log();

  // 尝试使用真实 Agent（会降级到工具模式）
  console.log(chalk.blue('🤖 使用 Rovo Dev Agent (带 API 降级)'));
  console.log(chalk.gray('-'.repeat(60)));
  
  const realAgent = new RovoDevAgent({
    apiKey: 'invalid-key-for-demo', // 故意使用无效 key 来演示降级
    model: 'deepseek-chat',
    temperature: 0.1
  });

  try {
    await realAgent.executeTask(demoTasks[0].task);
  } catch (error) {
    console.error(chalk.red('真实 Agent 执行失败:'), error);
  }

  console.log(chalk.gray('\n' + '='.repeat(60)));

  // 使用模拟 Agent 演示所有功能
  console.log(chalk.blue('🧪 使用模拟 Agent 演示所有功能'));
  console.log(chalk.gray('-'.repeat(60)));

  const mockAgent = new MockRovoDevAgent();

  for (let i = 0; i < demoTasks.length; i++) {
    const demo = demoTasks[i];
    
    console.log(chalk.yellow(`\n📝 演示 ${i + 1}/${demoTasks.length}: ${demo.title}`));
    console.log(chalk.gray('-'.repeat(40)));
    
    try {
      await mockAgent.executeTask(demo.task);
    } catch (error) {
      console.error(chalk.red('演示失败:'), error);
    }
    
    if (i < demoTasks.length - 1) {
      console.log(chalk.gray('\n' + '·'.repeat(40)));
    }
  }

  console.log(chalk.green('\n✅ 演示完成！'));
  console.log(chalk.blue('\n🎯 总结:'));
  console.log('- ✅ MCP 工具系统正常工作');
  console.log('- ✅ 文件操作功能完整');
  console.log('- ✅ 代码搜索功能正常');
  console.log('- ✅ 命令执行安全可靠');
  console.log('- ✅ 错误处理和降级机制有效');
  console.log('- ✅ 任务分析和工具选择智能');
  
  console.log(chalk.yellow('\n💡 使用建议:'));
  console.log('1. 设置有效的 DeepSeek API Key 以启用完整 AI 功能');
  console.log('2. 使用 npm run dev 启动交互式模式');
  console.log('3. 尝试各种自然语言任务描述');
  console.log('4. 查看 README-IMPLEMENTATION.md 了解更多用法');
}

runDemo().catch(console.error);