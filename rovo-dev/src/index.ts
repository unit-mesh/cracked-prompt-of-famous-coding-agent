#!/usr/bin/env node

/**
 * Rovo Dev Agent - 命令行入口
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import RovoDevAgent from './agent/rovo-agent.js';

// 加载环境变量
dotenv.config();

const program = new Command();

// ============================================================================
// 命令行配置
// ============================================================================

program
  .name('rovo-dev-agent')
  .description('Rovo Dev Agent - 综合型 AI Coding Agent')
  .version('1.0.0');

// ============================================================================
// 交互式模式
// ============================================================================

program
  .command('chat')
  .description('启动交互式聊天模式')
  .option('-k, --api-key <key>', 'DeepSeek API Key')
  .option('-m, --model <model>', '模型名称', 'deepseek-chat')
  .option('-t, --temperature <temp>', '温度参数', '0.1')
  .action(async (options) => {
    try {
      // 获取 API Key
      let apiKey = options.apiKey || process.env.DEEPSEEK_TOKEN;
      
      if (!apiKey) {
        const { inputApiKey } = await inquirer.prompt([
          {
            type: 'password',
            name: 'inputApiKey',
            message: '请输入 DeepSeek API Key:',
            mask: '*'
          }
        ]);
        apiKey = inputApiKey;
      }

      if (!apiKey) {
        console.error(chalk.red('❌ 需要提供 DeepSeek API Key'));
        process.exit(1);
      }

      // 初始化 Agent
      const agent = new RovoDevAgent({
        apiKey,
        model: options.model,
        temperature: parseFloat(options.temperature)
      });

      console.log(chalk.blue('🤖 Rovo Dev Agent 已启动'));
      console.log(chalk.gray(`模型: ${options.model}`));
      console.log(chalk.gray(`可用工具: ${agent.getAvailableTools().join(', ')}`));
      console.log(chalk.yellow('\n💡 输入 "exit" 退出，"clear" 清空对话历史，"help" 查看帮助\n'));

      // 交互式循环
      while (true) {
        const { userInput } = await inquirer.prompt([
          {
            type: 'input',
            name: 'userInput',
            message: chalk.cyan('👤 你:'),
            validate: (input) => input.trim().length > 0 || '请输入有效内容'
          }
        ]);

        const input = userInput.trim();

        // 处理特殊命令
        if (input.toLowerCase() === 'exit') {
          console.log(chalk.yellow('👋 再见！'));
          break;
        }

        if (input.toLowerCase() === 'clear') {
          agent.clearHistory();
          console.log(chalk.green('✅ 对话历史已清空'));
          continue;
        }

        if (input.toLowerCase() === 'help') {
          printHelp();
          continue;
        }

        if (input.toLowerCase() === 'tools') {
          console.log(chalk.blue('🔧 可用工具:'));
          agent.getAvailableTools().forEach(tool => {
            console.log(chalk.gray(`  - ${tool}`));
          });
          continue;
        }

        // 执行任务
        try {
          console.log();
          await agent.executeTask(input);
          console.log();
        } catch (error) {
          console.error(chalk.red('❌ 执行失败:'), error);
        }
      }

    } catch (error) {
      console.error(chalk.red('❌ 启动失败:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// 单次执行模式
// ============================================================================

program
  .command('exec <task>')
  .description('执行单个任务')
  .option('-k, --api-key <key>', 'DeepSeek API Key')
  .option('-m, --model <model>', '模型名称', 'deepseek-chat')
  .option('-t, --temperature <temp>', '温度参数', '0.1')
  .option('-o, --output <file>', '输出结果到文件')
  .action(async (task, options) => {
    try {
      // 获取 API Key
      const apiKey = options.apiKey || process.env.DEEPSEEK_TOKEN;
      
      if (!apiKey) {
        console.error(chalk.red('❌ 需要提供 DeepSeek API Key (使用 -k 参数或设置 DEEPSEEK_TOKEN 环境变量)'));
        process.exit(1);
      }

      // 初始化 Agent
      const agent = new RovoDevAgent({
        apiKey,
        model: options.model,
        temperature: parseFloat(options.temperature)
      });

      console.log(chalk.blue('🤖 Rovo Dev Agent 执行任务'));
      console.log(chalk.gray(`任务: ${task}`));
      console.log();

      // 执行任务
      const execution = await agent.executeTask(task);

      // 输出结果
      if (options.output) {
        const fs = await import('fs-extra');
        await fs.writeJSON(options.output, execution, { spaces: 2 });
        console.log(chalk.green(`📄 结果已保存到: ${options.output}`));
      }

    } catch (error) {
      console.error(chalk.red('❌ 执行失败:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// 工具测试模式
// ============================================================================

program
  .command('test-tool <toolName>')
  .description('测试特定工具')
  .option('-p, --params <params>', '工具参数 (JSON格式)')
  .action(async (toolName, options) => {
    try {
      const { MCPToolRegistry } = await import('./tools/mcp-tools.js');
      const registry = new MCPToolRegistry();

      const tool = registry.getTool(toolName);
      if (!tool) {
        console.error(chalk.red(`❌ 工具 '${toolName}' 不存在`));
        console.log(chalk.yellow('可用工具:'), registry.getAllTools().map(t => t.name).join(', '));
        process.exit(1);
      }

      let params = {};
      if (options.params) {
        try {
          params = JSON.parse(options.params);
        } catch (error) {
          console.error(chalk.red('❌ 参数格式错误，请使用有效的 JSON 格式'));
          process.exit(1);
        }
      }

      console.log(chalk.blue(`🔧 测试工具: ${toolName}`));
      console.log(chalk.gray(`参数: ${JSON.stringify(params, null, 2)}`));
      console.log();

      const result = await registry.executeTool(toolName, params);

      if (result.success) {
        console.log(chalk.green('✅ 执行成功'));
        console.log(chalk.gray('结果:'), JSON.stringify(result.data, null, 2));
      } else {
        console.log(chalk.red('❌ 执行失败'));
        console.log(chalk.red('错误:'), result.error);
      }

    } catch (error) {
      console.error(chalk.red('❌ 测试失败:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// 帮助信息
// ============================================================================

function printHelp() {
  console.log(chalk.blue('\n🤖 Rovo Dev Agent 帮助'));
  console.log(chalk.gray('='.repeat(50)));
  console.log(chalk.yellow('特殊命令:'));
  console.log('  exit   - 退出程序');
  console.log('  clear  - 清空对话历史');
  console.log('  help   - 显示此帮助信息');
  console.log('  tools  - 显示可用工具列表');
  
  console.log(chalk.yellow('\n示例任务:'));
  console.log('  "查看当前目录的文件"');
  console.log('  "在项目中搜索包含 TODO 的代码"');
  console.log('  "创建一个新的 TypeScript 文件"');
  console.log('  "检查代码中的语法错误"');
  console.log('  "运行 npm install"');
  
  console.log(chalk.yellow('\n可用工具:'));
  console.log('  open_files         - 打开并查看文件');
  console.log('  find_and_replace_code - 查找替换代码');
  console.log('  create_file        - 创建新文件');
  console.log('  grep_file_content  - 搜索文件内容');
  console.log('  codebase_search    - 语义代码搜索');
  console.log('  bash               - 执行命令');
  console.log('  get_diagnostics    - 代码诊断');
  
  console.log(chalk.gray('='.repeat(50)));
}

// ============================================================================
// 错误处理
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ 未捕获的异常:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ 未处理的 Promise 拒绝:'), reason);
  process.exit(1);
});

// ============================================================================
// 启动程序
// ============================================================================

program.parse();

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}