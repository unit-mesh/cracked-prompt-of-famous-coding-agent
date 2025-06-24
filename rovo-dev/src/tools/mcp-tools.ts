/**
 * MCP Tools Implementation for Rovo Dev Agent
 * 基于 Model Context Protocol 的工具实现
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { execa } from 'execa';

// ============================================================================
// 基础工具接口
// ============================================================================

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseMCPTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: z.ZodSchema;

  abstract execute(params: any): Promise<MCPToolResult>;

  toMCPTool(): Tool {
    return {
      name: this.name,
      description: this.description,
      inputSchema: {
        type: "object",
        properties: {},
        description: this.description
      }
    };
  }
}

// ============================================================================
// 文件系统工具
// ============================================================================

export class OpenFilesTool extends BaseMCPTool {
  name = 'open_files';
  description = '打开并查看一个或多个文件的内容';
  inputSchema = z.object({
    file_paths: z.array(z.string()).describe('要打开的文件路径列表'),
    max_lines: z.number().optional().default(1000).describe('每个文件最大显示行数')
  });

  async execute(params: { file_paths: string[]; max_lines?: number }): Promise<MCPToolResult> {
    try {
      const results = await Promise.all(
        params.file_paths.map(async (filePath) => {
          if (!await fs.pathExists(filePath)) {
            return { path: filePath, error: '文件不存在' };
          }

          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          const truncated = lines.length > (params.max_lines || 1000);
          const displayContent = truncated 
            ? lines.slice(0, params.max_lines || 1000).join('\n') + '\n... (文件被截断)'
            : content;

          return {
            path: filePath,
            content: displayContent,
            lines: lines.length,
            truncated,
            size: content.length
          };
        })
      );

      return {
        success: true,
        data: results,
        metadata: { files_opened: params.file_paths.length }
      };
    } catch (error) {
      return {
        success: false,
        error: `打开文件失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export class FindAndReplaceCodeTool extends BaseMCPTool {
  name = 'find_and_replace_code';
  description = '在文件中查找并替换代码';
  inputSchema = z.object({
    file_path: z.string().describe('目标文件路径'),
    find: z.string().describe('要查找的代码字符串'),
    replace: z.string().describe('替换后的代码字符串'),
    backup: z.boolean().optional().default(true).describe('是否创建备份')
  });

  async execute(params: { file_path: string; find: string; replace: string; backup?: boolean }): Promise<MCPToolResult> {
    try {
      if (!await fs.pathExists(params.file_path)) {
        return { success: false, error: '文件不存在' };
      }

      const content = await fs.readFile(params.file_path, 'utf-8');
      
      if (!content.includes(params.find)) {
        return { success: false, error: '未找到要替换的内容' };
      }

      // 创建备份
      if (params.backup) {
        const backupPath = `${params.file_path}.backup.${Date.now()}`;
        await fs.copy(params.file_path, backupPath);
      }

      const newContent = content.replace(new RegExp(params.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), params.replace);
      await fs.writeFile(params.file_path, newContent, 'utf-8');

      const occurrences = (content.match(new RegExp(params.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

      return {
        success: true,
        data: {
          file_path: params.file_path,
          occurrences_replaced: occurrences,
          backup_created: params.backup
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `替换失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export class CreateFileTool extends BaseMCPTool {
  name = 'create_file';
  description = '创建新文件';
  inputSchema = z.object({
    file_path: z.string().describe('文件路径'),
    content: z.string().describe('文件内容'),
    overwrite: z.boolean().optional().default(false).describe('是否覆盖已存在的文件')
  });

  async execute(params: { file_path: string; content: string; overwrite?: boolean }): Promise<MCPToolResult> {
    try {
      if (await fs.pathExists(params.file_path) && !params.overwrite) {
        return { success: false, error: '文件已存在，使用 overwrite: true 来覆盖' };
      }

      await fs.ensureDir(path.dirname(params.file_path));
      await fs.writeFile(params.file_path, params.content, 'utf-8');

      return {
        success: true,
        data: {
          file_path: params.file_path,
          size: params.content.length,
          lines: params.content.split('\n').length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `创建文件失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// ============================================================================
// 代码搜索工具
// ============================================================================

export class GrepFileContentTool extends BaseMCPTool {
  name = 'grep_file_content';
  description = '在文件中搜索内容模式';
  inputSchema = z.object({
    pattern: z.string().describe('搜索模式（支持正则表达式）'),
    file_pattern: z.string().optional().default('**/*').describe('文件名模式'),
    max_results: z.number().optional().default(50).describe('最大结果数'),
    context_lines: z.number().optional().default(2).describe('上下文行数')
  });

  async execute(params: { pattern: string; file_pattern?: string; max_results?: number; context_lines?: number }): Promise<MCPToolResult> {
    try {
      const files = await glob(params.file_pattern || '**/*', {
        ignore: ['node_modules/**', '.git/**', 'dist/**', '*.log'],
        nodir: true
      });

      const results = [];
      const regex = new RegExp(params.pattern, 'gi');

      for (const file of files.slice(0, 100)) { // 限制文件数量
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              const start = Math.max(0, i - (params.context_lines || 2));
              const end = Math.min(lines.length, i + (params.context_lines || 2) + 1);
              
              results.push({
                file,
                line_number: i + 1,
                line_content: lines[i],
                context: lines.slice(start, end),
                match: lines[i].match(regex)?.[0]
              });

              if (results.length >= (params.max_results || 50)) {
                break;
              }
            }
          }
          
          if (results.length >= (params.max_results || 50)) {
            break;
          }
        } catch (err) {
          // 跳过无法读取的文件
          continue;
        }
      }

      return {
        success: true,
        data: results,
        metadata: {
          pattern: params.pattern,
          files_searched: files.length,
          matches_found: results.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `搜索失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export class CodebaseSearchTool extends BaseMCPTool {
  name = 'codebase_search';
  description = '基于语义的代码库搜索（简化版本，基于关键词匹配）';
  inputSchema = z.object({
    query: z.string().describe('搜索查询'),
    scope: z.string().optional().describe('搜索范围'),
    max_results: z.number().optional().default(10).describe('最大结果数')
  });

  async execute(params: { query: string; scope?: string; max_results?: number }): Promise<MCPToolResult> {
    try {
      // 简化版本：将查询分解为关键词
      const keywords = params.query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const searchPattern = params.scope || '**/*.{js,ts,jsx,tsx,py,java,cpp,c,h}';
      
      const files = await glob(searchPattern, {
        ignore: ['node_modules/**', '.git/**', 'dist/**'],
        nodir: true
      });

      const results = [];

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          
          let relevanceScore = 0;
          const matchedLines = [];

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            let lineScore = 0;
            
            for (const keyword of keywords) {
              if (line.includes(keyword)) {
                lineScore += 1;
                relevanceScore += 1;
              }
            }

            if (lineScore > 0) {
              matchedLines.push({
                line_number: i + 1,
                content: lines[i].trim(),
                score: lineScore
              });
            }
          }

          if (relevanceScore > 0) {
            results.push({
              file,
              relevance_score: relevanceScore,
              matched_lines: matchedLines.slice(0, 5), // 只显示前5个匹配行
              total_matches: matchedLines.length
            });
          }
        } catch (err) {
          continue;
        }
      }

      // 按相关性排序
      results.sort((a, b) => b.relevance_score - a.relevance_score);

      return {
        success: true,
        data: results.slice(0, params.max_results || 10),
        metadata: {
          query: params.query,
          keywords,
          files_searched: files.length,
          relevant_files: results.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `语义搜索失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// ============================================================================
// 终端执行工具
// ============================================================================

export class BashTool extends BaseMCPTool {
  name = 'bash';
  description = '执行bash命令（带安全检查）';
  inputSchema = z.object({
    command: z.string().describe('要执行的命令'),
    timeout: z.number().optional().default(30000).describe('超时时间（毫秒）'),
    cwd: z.string().optional().describe('工作目录')
  });

  private bannedCommands = ['rm -rf /', 'sudo rm', 'format', 'del /f', 'curl', 'wget'];
  private riskyPatterns = [/rm\s+-rf/, /sudo\s+/, />\s*\/dev\/null/, /&\s*$/, /;\s*rm/, /\|\s*sh/];

  async execute(params: { command: string; timeout?: number; cwd?: string }): Promise<MCPToolResult> {
    try {
      // 安全检查
      const command = params.command.trim();
      
      // 检查禁用命令
      for (const banned of this.bannedCommands) {
        if (command.includes(banned)) {
          return {
            success: false,
            error: `命令被禁用: ${banned}`
          };
        }
      }

      // 检查危险模式
      for (const pattern of this.riskyPatterns) {
        if (pattern.test(command)) {
          return {
            success: false,
            error: `检测到危险命令模式，请确认安全性`
          };
        }
      }

      const result = await execa('bash', ['-c', command], {
        timeout: params.timeout || 30000,
        cwd: params.cwd || process.cwd(),
        encoding: 'utf8'
      });

      return {
        success: true,
        data: {
          stdout: result.stdout,
          stderr: result.stderr,
          exit_code: result.exitCode,
          command: command,
          execution_time: Date.now()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `命令执行失败: ${error.message}`,
        data: {
          stdout: error.stdout || '',
          stderr: error.stderr || '',
          exit_code: error.exitCode || -1,
          command: params.command
        }
      };
    }
  }
}

// ============================================================================
// 诊断工具
// ============================================================================

export class GetDiagnosticsTool extends BaseMCPTool {
  name = 'get_diagnostics';
  description = '获取代码诊断信息（基于文件扩展名的基础检查）';
  inputSchema = z.object({
    file_paths: z.array(z.string()).describe('要检查的文件路径'),
    check_syntax: z.boolean().optional().default(true).describe('是否检查语法'),
    check_style: z.boolean().optional().default(false).describe('是否检查代码风格')
  });

  async execute(params: { file_paths: string[]; check_syntax?: boolean; check_style?: boolean }): Promise<MCPToolResult> {
    try {
      const diagnostics = [];

      for (const filePath of params.file_paths) {
        if (!await fs.pathExists(filePath)) {
          diagnostics.push({
            file: filePath,
            issues: [{ type: 'error', message: '文件不存在', line: 0 }]
          });
          continue;
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const ext = path.extname(filePath);
        const issues = [];

        // 基础语法检查
        if (params.check_syntax) {
          if (ext === '.json') {
            try {
              JSON.parse(content);
            } catch (e) {
              issues.push({
                type: 'error',
                message: `JSON 语法错误: ${e instanceof Error ? e.message : String(e)}`,
                line: 0
              });
            }
          }

          // TypeScript/JavaScript 基础检查
          if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              // 检查常见问题
              if (line.includes('console.log') && !line.includes('//')) {
                issues.push({
                  type: 'warning',
                  message: '包含 console.log 语句',
                  line: index + 1
                });
              }
              
              if (line.includes('debugger')) {
                issues.push({
                  type: 'warning',
                  message: '包含 debugger 语句',
                  line: index + 1
                });
              }

              // 检查未闭合的括号（简单检查）
              const openBrackets = (line.match(/\{/g) || []).length;
              const closeBrackets = (line.match(/\}/g) || []).length;
              if (openBrackets !== closeBrackets && line.trim().endsWith('{')) {
                // 这是正常的多行代码块开始
              }
            });
          }
        }

        diagnostics.push({
          file: filePath,
          issues,
          lines: content.split('\n').length,
          size: content.length
        });
      }

      return {
        success: true,
        data: diagnostics,
        metadata: {
          files_checked: params.file_paths.length,
          total_issues: diagnostics.reduce((sum, d) => sum + d.issues.length, 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `诊断失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// ============================================================================
// 工具注册器
// ============================================================================

export class MCPToolRegistry {
  private tools: Map<string, BaseMCPTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    const defaultTools = [
      new OpenFilesTool(),
      new FindAndReplaceCodeTool(),
      new CreateFileTool(),
      new GrepFileContentTool(),
      new CodebaseSearchTool(),
      new BashTool(),
      new GetDiagnosticsTool()
    ];

    defaultTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  getTool(name: string): BaseMCPTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): BaseMCPTool[] {
    return Array.from(this.tools.values());
  }

  getMCPTools(): Tool[] {
    return this.getAllTools().map(tool => tool.toMCPTool());
  }

  async executeTool(name: string, params: any): Promise<MCPToolResult> {
    const tool = this.getTool(name);
    if (!tool) {
      return {
        success: false,
        error: `工具 '${name}' 不存在`
      };
    }

    try {
      // 验证参数
      const validatedParams = tool.inputSchema.parse(params);
      return await tool.execute(validatedParams);
    } catch (error) {
      return {
        success: false,
        error: `参数验证失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export default MCPToolRegistry;