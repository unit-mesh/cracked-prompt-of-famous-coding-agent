/**
 * Mock Agent for testing without API calls
 */

import chalk from 'chalk';
import MCPToolRegistry, { MCPToolResult } from '../tools/mcp-tools.js';

export interface MockTaskExecution {
  id: string;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: MockExecutionStep[];
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export interface MockExecutionStep {
  id: string;
  type: 'analysis' | 'tool_call' | 'reflection' | 'completion';
  description: string;
  tool?: string;
  params?: any;
  result?: MCPToolResult;
  timestamp: Date;
}

export class MockRovoDevAgent {
  private toolRegistry: MCPToolRegistry;

  constructor() {
    this.toolRegistry = new MCPToolRegistry();
  }

  async executeTask(userInput: string): Promise<MockTaskExecution> {
    const taskId = `mock_task_${Date.now()}`;
    const execution: MockTaskExecution = {
      id: taskId,
      task: userInput,
      status: 'running',
      steps: [],
      startTime: new Date()
    };

    try {
      console.log(chalk.blue('🤖 Mock Rovo Dev Agent 开始执行任务...'));
      console.log(chalk.gray(`任务: ${userInput}`));
      console.log();

      // 模拟任务分析
      await this.simulateAnalysis(execution, userInput);

      // 根据任务类型选择工具
      const tools = this.selectToolsForTask(userInput);
      
      for (const toolCall of tools) {
        await this.executeToolCall(execution, toolCall);
      }

      // 模拟完成
      await this.simulateCompletion(execution);

      execution.status = 'completed';
      execution.endTime = new Date();

      console.log(chalk.green('✅ 模拟任务执行完成'));
      this.printExecutionSummary(execution);

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = new Date();

      console.log(chalk.red('❌ 模拟任务执行失败:'), error);
    }

    return execution;
  }

  private async simulateAnalysis(execution: MockTaskExecution, task: string) {
    console.log(chalk.cyan('💭 Agent 分析任务:'));
    
    const analysisStep: MockExecutionStep = {
      id: `analysis_${Date.now()}`,
      type: 'analysis',
      description: '分析用户需求',
      timestamp: new Date()
    };

    execution.steps.push(analysisStep);

    // 模拟分析过程
    if (task.includes('查看') || task.includes('列出') || task.includes('显示')) {
      console.log('- 识别为文件查看任务');
      console.log('- 计划使用 open_files 或 bash 工具');
    } else if (task.includes('搜索') || task.includes('查找')) {
      console.log('- 识别为搜索任务');
      console.log('- 计划使用 grep_file_content 或 codebase_search 工具');
    } else if (task.includes('创建') || task.includes('新建')) {
      console.log('- 识别为创建任务');
      console.log('- 计划使用 create_file 工具');
    } else if (task.includes('运行') || task.includes('执行')) {
      console.log('- 识别为命令执行任务');
      console.log('- 计划使用 bash 工具');
    } else {
      console.log('- 识别为综合任务');
      console.log('- 计划使用多个工具组合');
    }
    
    console.log();
  }

  private selectToolsForTask(task: string): Array<{tool: string, params: any}> {
    const tools = [];

    if (task.includes('查看') || task.includes('列出') || task.includes('显示')) {
      if (task.includes('目录') || task.includes('文件')) {
        tools.push({
          tool: 'bash',
          params: { command: 'ls -la' }
        });
      }
      if (task.includes('package.json') || task.includes('项目')) {
        tools.push({
          tool: 'open_files',
          params: { file_paths: ['package.json'] }
        });
      }
    }

    if (task.includes('搜索') || task.includes('查找')) {
      const pattern = this.extractSearchPattern(task);
      tools.push({
        tool: 'grep_file_content',
        params: { pattern, max_results: 10 }
      });
    }

    if (task.includes('创建') || task.includes('新建')) {
      tools.push({
        tool: 'create_file',
        params: { 
          file_path: 'example.txt',
          content: '# 示例文件\n这是一个由 AI Agent 创建的示例文件。'
        }
      });
    }

    if (task.includes('诊断') || task.includes('检查')) {
      tools.push({
        tool: 'get_diagnostics',
        params: { file_paths: ['src/index.ts'] }
      });
    }

    // 如果没有匹配到特定工具，使用默认组合
    if (tools.length === 0) {
      tools.push(
        {
          tool: 'bash',
          params: { command: 'pwd && ls -la' }
        },
        {
          tool: 'open_files',
          params: { file_paths: ['package.json'] }
        }
      );
    }

    return tools;
  }

  private extractSearchPattern(task: string): string {
    // 简单的模式提取
    if (task.includes('TODO')) return 'TODO';
    if (task.includes('import')) return 'import';
    if (task.includes('function')) return 'function';
    if (task.includes('class')) return 'class';
    return 'console.log'; // 默认搜索
  }

  private async executeToolCall(execution: MockTaskExecution, toolCall: {tool: string, params: any}) {
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const step: MockExecutionStep = {
      id: stepId,
      type: 'tool_call',
      description: `调用工具: ${toolCall.tool}`,
      tool: toolCall.tool,
      params: toolCall.params,
      timestamp: new Date()
    };

    execution.steps.push(step);

    console.log(chalk.blue(`🔧 调用工具: ${toolCall.tool}`));
    console.log(chalk.gray(`参数: ${JSON.stringify(toolCall.params, null, 2)}`));

    try {
      // 实际执行工具
      const toolResult = await this.toolRegistry.executeTool(toolCall.tool, toolCall.params);
      step.result = toolResult;

      if (toolResult.success) {
        console.log(chalk.green(`✅ ${toolCall.tool} 执行成功`));
        
        // 根据工具类型提供不同的分析
        this.analyzeToolResult(toolCall.tool, toolResult);
      } else {
        console.log(chalk.red(`❌ ${toolCall.tool} 执行失败: ${toolResult.error}`));
      }

    } catch (error) {
      step.result = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };

      console.log(chalk.red(`❌ 工具执行异常: ${error}`));
    }

    console.log();
  }

  private analyzeToolResult(toolName: string, result: MCPToolResult) {
    if (!result.success || !result.data) return;

    switch (toolName) {
      case 'bash':
        console.log(chalk.gray('📊 命令执行分析:'));
        if (result.data.stdout) {
          const lines = result.data.stdout.split('\n').filter((line: string) => line.trim());
          console.log(chalk.gray(`  - 输出行数: ${lines.length}`));
          if (result.data.command?.includes('ls')) {
            const files = lines.filter((line: string) => !line.startsWith('total'));
            console.log(chalk.gray(`  - 发现文件/目录: ${files.length} 个`));
          }
        }
        break;

      case 'open_files':
        console.log(chalk.gray('📊 文件分析:'));
        if (Array.isArray(result.data)) {
          result.data.forEach((file: any) => {
            if (file.path && file.lines) {
              console.log(chalk.gray(`  - ${file.path}: ${file.lines} 行, ${file.size} 字节`));
              
              if (file.path === 'package.json' && file.content) {
                try {
                  const pkg = JSON.parse(file.content);
                  console.log(chalk.gray(`    项目名称: ${pkg.name || '未知'}`));
                  console.log(chalk.gray(`    项目类型: ${pkg.type || 'CommonJS'}`));
                  if (pkg.dependencies) {
                    console.log(chalk.gray(`    依赖数量: ${Object.keys(pkg.dependencies).length}`));
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          });
        }
        break;

      case 'grep_file_content':
        console.log(chalk.gray('📊 搜索结果分析:'));
        if (Array.isArray(result.data)) {
          console.log(chalk.gray(`  - 找到匹配项: ${result.data.length} 个`));
          const files = new Set(result.data.map((item: any) => item.file));
          console.log(chalk.gray(`  - 涉及文件: ${files.size} 个`));
        }
        break;

      case 'get_diagnostics':
        console.log(chalk.gray('📊 诊断结果分析:'));
        if (Array.isArray(result.data)) {
          const totalIssues = result.data.reduce((sum: number, file: any) => sum + (file.issues?.length || 0), 0);
          console.log(chalk.gray(`  - 检查文件: ${result.data.length} 个`));
          console.log(chalk.gray(`  - 发现问题: ${totalIssues} 个`));
        }
        break;
    }
  }

  private async simulateCompletion(execution: MockTaskExecution) {
    console.log(chalk.cyan('📝 任务完成总结:'));
    
    const completionStep: MockExecutionStep = {
      id: `completion_${Date.now()}`,
      type: 'completion',
      description: '生成任务总结',
      timestamp: new Date()
    };

    execution.steps.push(completionStep);

    // 基于执行的工具生成总结
    const toolsUsed = execution.steps
      .filter(step => step.tool)
      .map(step => step.tool);

    console.log('根据执行的工具调用，我已经完成了以下操作：');
    
    if (toolsUsed.includes('bash')) {
      console.log('- 执行了系统命令，获取了目录和文件信息');
    }
    
    if (toolsUsed.includes('open_files')) {
      console.log('- 查看了项目文件，分析了项目结构');
    }
    
    if (toolsUsed.includes('grep_file_content')) {
      console.log('- 搜索了代码内容，找到了相关匹配项');
    }
    
    if (toolsUsed.includes('create_file')) {
      console.log('- 创建了新文件');
    }
    
    if (toolsUsed.includes('get_diagnostics')) {
      console.log('- 进行了代码诊断检查');
    }

    console.log('\n基于分析结果，这是一个 TypeScript/Node.js 项目，具备以下特征：');
    console.log('- 使用现代的 ES 模块系统');
    console.log('- 包含完整的开发工具链');
    console.log('- 实现了 AI Coding Agent 功能');
    console.log('- 支持 MCP 工具协议');
    
    console.log();
  }

  private printExecutionSummary(execution: MockTaskExecution) {
    console.log(chalk.blue('\n📊 执行总结'));
    console.log(chalk.gray('='.repeat(50)));
    console.log(`任务ID: ${execution.id}`);
    console.log(`状态: ${execution.status}`);
    console.log(`开始时间: ${execution.startTime.toLocaleString()}`);
    console.log(`结束时间: ${execution.endTime?.toLocaleString()}`);
    console.log(`执行步骤: ${execution.steps.length}`);
    
    if (execution.endTime) {
      const duration = execution.endTime.getTime() - execution.startTime.getTime();
      console.log(`执行时长: ${Math.round(duration / 1000)}秒`);
    }

    console.log('\n🔧 工具使用统计:');
    const toolUsage = execution.steps.reduce((acc, step) => {
      if (step.tool) {
        acc[step.tool] = (acc[step.tool] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    Object.entries(toolUsage).forEach(([tool, count]) => {
      console.log(`  ${tool}: ${count}次`);
    });

    console.log(chalk.gray('='.repeat(50)));
  }

  getAvailableTools(): string[] {
    return this.toolRegistry.getAllTools().map(tool => tool.name);
  }
}

export default MockRovoDevAgent;