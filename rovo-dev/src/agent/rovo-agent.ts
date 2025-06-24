/**
 * Rovo Dev Agent - 核心 AI Agent 实现
 * 使用 AI SDK 连接模型，MCP 工具执行任务
 */

import { generateText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import chalk from 'chalk';
import ora from 'ora';
import MCPToolRegistry, { MCPToolResult } from '../tools/mcp-tools.js';

// ============================================================================
// Agent 配置和类型
// ============================================================================

export interface AgentConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  maxIterations?: number;
  temperature?: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TaskExecution {
  id: string;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: ExecutionStep[];
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export interface ExecutionStep {
  id: string;
  type: 'analysis' | 'tool_call' | 'reflection' | 'completion';
  description: string;
  tool?: string;
  params?: any;
  result?: MCPToolResult;
  timestamp: Date;
}

// ============================================================================
// Rovo Dev Agent 主类
// ============================================================================

export class RovoDevAgent {
  private openai: any;
  private toolRegistry: MCPToolRegistry;
  private config: AgentConfig;
  private conversationHistory: ConversationMessage[] = [];
  private currentExecution?: TaskExecution;

  constructor(config: AgentConfig) {
    this.config = {
      model: 'deepseek-chat',
      maxIterations: 10,
      temperature: 0.1,
      ...config
    };

    // 初始化 OpenAI 客户端（使用 DeepSeek）
    this.openai = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.deepseek.com'
    });

    this.toolRegistry = new MCPToolRegistry();
    this.initializeSystemPrompt();
  }

  private initializeSystemPrompt() {
    const systemPrompt = `你是 **Rovo Dev Agent**，一个智能的 AI 编程助手，专门帮助开发者完成各种软件开发任务。

## 🎯 核心能力

### 1. 代码理解与分析
- **语义搜索**：理解代码意图，而非仅匹配关键词
- **符号定位**：精确定位类、方法、变量等定义位置
- **依赖分析**：理解代码间的依赖关系和调用链

### 2. 智能编辑与重构
- **精确修改**：基于上下文的精确代码替换
- **批量操作**：支持多文件、多位置的并行编辑
- **安全重构**：保证代码功能不变的结构优化

### 3. 任务自动化
- **复杂任务分解**：将大任务分解为可执行的小步骤
- **自主执行**：在明确目标下自主完成多步骤任务
- **错误恢复**：遇到问题时自动尝试修复或寻求帮助

## 🔄 工作流程

### 标准工作流程
1. **详细分析**：深入理解问题和需求
2. **制定计划**：分解任务，选择合适工具
3. **执行操作**：按计划使用工具完成任务
4. **质量检查**：验证结果，确保质量
5. **总结反馈**：提供清晰的完成总结

### 响应格式
- 始终以详细的问题分析开始
- 明确说明将要执行的步骤和使用的工具
- 在执行过程中提供进度更新
- 完成后提供全面的总结和建议

## ⚡ 工具使用原则

### 文件操作
- 修改前先用 \`open_files\` 查看文件内容
- 用 \`find_and_replace_code\` 进行精确修改
- 重要修改前先备份

### 代码搜索
- 不确定位置时优先使用 \`codebase_search\` 语义搜索
- 需要全局搜索时使用 \`grep_file_content\`

### 任务执行
- 简单命令直接使用 \`bash\` 工具
- 修改后使用 \`get_diagnostics\` 检查错误

## 🛡️ 安全原则

1. **命令安全**：检测并阻止潜在的命令注入
2. **文件安全**：验证路径，避免意外删除重要文件
3. **权限控制**：敏感操作需要用户确认
4. **备份策略**：重要修改前自动备份

## 🎨 交互风格

- **专业友好**：保持专业水准，同时友好易懂
- **详细透明**：清楚说明每个步骤的目的和方法
- **主动建议**：基于经验主动提供优化建议
- **学习导向**：帮助用户理解和学习最佳实践

当用户提出需求时，你需要：
1. 分析需求，制定执行计划
2. 使用合适的工具执行任务
3. 根据结果调整策略，继续执行
4. 提供详细的完成总结

记住：你可以使用多个工具来完成复杂任务，每次工具调用后都要分析结果并决定下一步行动。`;

    this.conversationHistory.push({
      role: 'system',
      content: systemPrompt,
      timestamp: new Date()
    });
  }

  // ============================================================================
  // 主要方法
  // ============================================================================

  async executeTask(userInput: string): Promise<TaskExecution> {
    const taskId = `task_${Date.now()}`;
    const execution: TaskExecution = {
      id: taskId,
      task: userInput,
      status: 'running',
      steps: [],
      startTime: new Date()
    };

    this.currentExecution = execution;

    try {
      console.log(chalk.blue('🤖 Rovo Dev Agent 开始执行任务...'));
      console.log(chalk.gray(`任务: ${userInput}`));
      console.log();

      // 添加用户消息到对话历史
      this.conversationHistory.push({
        role: 'user',
        content: userInput,
        timestamp: new Date()
      });

      let iteration = 0;
      let shouldContinue = true;

      while (shouldContinue && iteration < (this.config.maxIterations || 10)) {
        iteration++;
        
        console.log(chalk.yellow(`🔄 执行轮次 ${iteration}`));
        
        try {
          const stepResult = await this.executeStep(execution);
          
          if (!stepResult.shouldContinue) {
            shouldContinue = false;
          }
        } catch (error) {
          // 如果是 API 错误，尝试降级到工具模式
          if (this.isAPIError(error)) {
            console.log(chalk.yellow('⚠️  API 调用失败，切换到工具模式'));
            await this.fallbackToToolMode(execution, userInput);
            shouldContinue = false;
          } else {
            throw error;
          }
        }

        // 避免无限循环
        if (iteration >= (this.config.maxIterations || 10)) {
          console.log(chalk.red('⚠️  达到最大迭代次数，停止执行'));
          break;
        }
      }

      execution.status = 'completed';
      execution.endTime = new Date();

      console.log(chalk.green('✅ 任务执行完成'));
      this.printExecutionSummary(execution);

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = new Date();

      console.log(chalk.red('❌ 任务执行失败:'), error);
    }

    return execution;
  }

  private async executeStep(execution: TaskExecution): Promise<{ shouldContinue: boolean }> {
    const spinner = ora('思考中...').start();

    try {
      // 准备工具定义
      const tools = this.createAISDKTools();

      // 调用 AI 模型
      const result = await generateText({
        model: this.openai(this.config.model!),
        temperature: this.config.temperature,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        tools,
        maxToolRoundtrips: 5,
      });

      spinner.stop();

      // 处理模型响应
      if (result.text) {
        console.log(chalk.cyan('💭 Agent 思考:'));
        console.log(result.text);
        console.log();

        // 添加助手响应到对话历史
        this.conversationHistory.push({
          role: 'assistant',
          content: result.text,
          timestamp: new Date()
        });
      }

      // 处理工具调用
      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const toolCall of result.toolCalls) {
          await this.handleToolCall(execution, toolCall);
        }
        return { shouldContinue: true };
      }

      // 如果没有工具调用，检查是否完成
      const isCompleted = this.checkTaskCompletion(result.text);
      return { shouldContinue: !isCompleted };

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('执行步骤失败:'), error);
      throw error;
    }
  }

  private async handleToolCall(execution: TaskExecution, toolCall: any) {
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const step: ExecutionStep = {
      id: stepId,
      type: 'tool_call',
      description: `调用工具: ${toolCall.toolName}`,
      tool: toolCall.toolName,
      params: toolCall.args,
      timestamp: new Date()
    };

    execution.steps.push(step);

    console.log(chalk.blue(`🔧 调用工具: ${toolCall.toolName}`));
    console.log(chalk.gray(`参数: ${JSON.stringify(toolCall.args, null, 2)}`));

    const spinner = ora(`执行 ${toolCall.toolName}...`).start();

    try {
      // 执行工具
      const toolResult = await this.toolRegistry.executeTool(toolCall.toolName, toolCall.args);
      step.result = toolResult;

      spinner.stop();

      if (toolResult.success) {
        console.log(chalk.green(`✅ ${toolCall.toolName} 执行成功`));
        if (toolResult.data) {
          console.log(chalk.gray('结果:'), JSON.stringify(toolResult.data, null, 2));
        }
      } else {
        console.log(chalk.red(`❌ ${toolCall.toolName} 执行失败: ${toolResult.error}`));
      }

      // 将工具结果添加到对话历史
      const resultMessage = `工具 ${toolCall.toolName} 执行${toolResult.success ? '成功' : '失败'}。${
        toolResult.success 
          ? `结果: ${JSON.stringify(toolResult.data)}` 
          : `错误: ${toolResult.error}`
      }`;

      this.conversationHistory.push({
        role: 'assistant',
        content: resultMessage,
        timestamp: new Date(),
        metadata: { toolCall: toolCall.toolName, result: toolResult }
      });

    } catch (error) {
      spinner.stop();
      step.result = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };

      console.log(chalk.red(`❌ 工具执行异常: ${error}`));
    }

    console.log();
  }

  private createAISDKTools() {
    const tools: Record<string, any> = {};

    for (const mcpTool of this.toolRegistry.getAllTools()) {
      tools[mcpTool.name] = tool({
        description: mcpTool.description,
        parameters: mcpTool.inputSchema,
        execute: async (params) => {
          const result = await this.toolRegistry.executeTool(mcpTool.name, params);
          return result;
        }
      });
    }

    return tools;
  }

  private checkTaskCompletion(response: string): boolean {
    const completionIndicators = [
      '任务完成',
      '执行完成',
      '已完成',
      '任务已完成',
      '✅',
      '完成总结',
      '总结如下'
    ];

    return completionIndicators.some(indicator => 
      response.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  private printExecutionSummary(execution: TaskExecution) {
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

    if (execution.error) {
      console.log(chalk.red(`\n❌ 错误: ${execution.error}`));
    }

    console.log(chalk.gray('='.repeat(50)));
  }

  // ============================================================================
  // 公共方法
  // ============================================================================

  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  getCurrentExecution(): TaskExecution | undefined {
    return this.currentExecution;
  }

  clearHistory() {
    this.conversationHistory = this.conversationHistory.slice(0, 1); // 保留系统提示
  }

  getAvailableTools(): string[] {
    return this.toolRegistry.getAllTools().map(tool => tool.name);
  }

  private isAPIError(error: any): boolean {
    return error && (
      error.message?.includes('Authentication Fails') ||
      error.message?.includes('API key') ||
      error.message?.includes('invalid') ||
      error.statusCode === 401 ||
      error.statusCode === 403
    );
  }

  private async fallbackToToolMode(execution: TaskExecution, userInput: string) {
    console.log(chalk.cyan('🔧 使用工具模式执行任务...'));
    
    // 基于任务内容选择合适的工具
    const tools = this.selectToolsForTask(userInput);
    
    for (const toolCall of tools) {
      await this.handleToolCall(execution, toolCall);
    }

    // 生成简单的总结
    console.log(chalk.cyan('📝 任务执行总结:'));
    console.log('已使用以下工具完成任务:');
    tools.forEach(tool => {
      console.log(`- ${tool.toolName}: ${tool.args ? JSON.stringify(tool.args) : ''}`);
    });
  }

  private selectToolsForTask(task: string): Array<{toolName: string, args: any}> {
    const tools = [];

    if (task.includes('查看') || task.includes('列出') || task.includes('显示')) {
      if (task.includes('目录') || task.includes('文件')) {
        tools.push({
          toolName: 'bash',
          args: { command: 'ls -la' }
        });
      }
      if (task.includes('package.json') || task.includes('项目')) {
        tools.push({
          toolName: 'open_files',
          args: { file_paths: ['package.json'] }
        });
      }
    }

    if (task.includes('搜索') || task.includes('查找')) {
      const pattern = this.extractSearchPattern(task);
      tools.push({
        toolName: 'grep_file_content',
        args: { pattern, max_results: 10 }
      });
    }

    if (task.includes('创建') || task.includes('新建')) {
      tools.push({
        toolName: 'create_file',
        args: { 
          file_path: 'ai-generated-file.txt',
          content: '# AI 生成的文件\n这是一个由 Rovo Dev Agent 创建的文件。'
        }
      });
    }

    if (task.includes('诊断') || task.includes('检查')) {
      tools.push({
        toolName: 'get_diagnostics',
        args: { file_paths: ['src/index.ts', 'package.json'] }
      });
    }

    // 如果没有匹配到特定工具，使用默认组合
    if (tools.length === 0) {
      tools.push(
        {
          toolName: 'bash',
          args: { command: 'pwd && ls -la' }
        },
        {
          toolName: 'open_files',
          args: { file_paths: ['package.json'] }
        }
      );
    }

    return tools;
  }

  private extractSearchPattern(task: string): string {
    if (task.includes('TODO')) return 'TODO';
    if (task.includes('import')) return 'import';
    if (task.includes('function')) return 'function';
    if (task.includes('class')) return 'class';
    if (task.includes('console')) return 'console.log';
    return 'export'; // 默认搜索
  }
}

export default RovoDevAgent;