# 🤖 Rovo Dev Agent 实现

基于 MCP (Model Context Protocol) 和 AI SDK 的完整 AI Coding Agent 实现。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd rovo-dev
npm install
```

### 2. 配置环境

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，设置你的 DeepSeek API Key
# DEEPSEEK_TOKEN=sk-your-api-key-here
```

### 3. 构建项目

```bash
npm run build
```

### 4. 启动交互式模式

```bash
npm run dev
# 或者
npm start
```

## 📋 使用方式

### 交互式聊天模式

```bash
# 启动交互式模式
npm run dev

# 或者直接指定 API Key
npx tsx src/index.ts chat -k sk-your-api-key
```

在交互式模式中，你可以：
- 输入任何编程相关的需求
- 使用特殊命令：`exit`（退出）、`clear`（清空历史）、`help`（帮助）、`tools`（查看工具）

### 单次执行模式

```bash
# 执行单个任务
npx tsx src/index.ts exec "查看当前目录的文件" -k sk-your-api-key

# 保存结果到文件
npx tsx src/index.ts exec "分析项目结构" -k sk-your-api-key -o result.json
```

### 工具测试模式

```bash
# 测试特定工具
npx tsx src/index.ts test-tool open_files -p '{"file_paths": ["package.json"]}'

# 测试搜索工具
npx tsx src/index.ts test-tool grep_file_content -p '{"pattern": "import"}'
```

## 🛠️ 可用工具

### 文件操作工具
- **`open_files`** - 打开并查看文件内容
- **`find_and_replace_code`** - 查找替换代码
- **`create_file`** - 创建新文件

### 代码搜索工具
- **`grep_file_content`** - 正则表达式内容搜索
- **`codebase_search`** - 语义代码搜索（基于关键词）

### 执行工具
- **`bash`** - 安全的命令执行（带安全检查）

### 诊断工具
- **`get_diagnostics`** - 基础代码诊断

## 💡 使用示例

### 示例 1：查看项目结构

```
👤 你: 帮我查看当前项目的结构，分析主要文件

🤖 Agent 会：
1. 使用 bash 工具执行 ls -la
2. 使用 open_files 查看关键文件（如 package.json）
3. 分析项目结构并给出总结
```

### 示例 2：搜索和修改代码

```
👤 你: 在项目中搜索所有的 TODO 注释，并帮我创建一个任务清单

🤖 Agent 会：
1. 使用 grep_file_content 搜索 "TODO" 模式
2. 分析搜索结果
3. 使用 create_file 创建任务清单文件
4. 总结找到的 TODO 项目
```

### 示例 3：代码质量检查

```
👤 你: 检查 src 目录下的 TypeScript 文件是否有语法错误

🤖 Agent 会：
1. 使用 bash 工具列出 src 目录的 .ts 文件
2. 使用 get_diagnostics 检查每个文件
3. 总结发现的问题和建议
```

### 示例 4：创建新功能

```
👤 你: 帮我创建一个简单的用户管理模块，包含基本的 CRUD 操作

🤖 Agent 会：
1. 分析需求，规划文件结构
2. 使用 create_file 创建相关文件
3. 实现基本的 CRUD 功能
4. 使用 get_diagnostics 检查代码质量
```

## 🔧 架构说明

### 核心组件

```
src/
├── agent/
│   └── rovo-agent.ts      # 主 Agent 实现
├── tools/
│   └── mcp-tools.ts       # MCP 工具实现
├── utils/
│   └── logger.ts          # 日志工具
└── index.ts               # 命令行入口
```

### 工作流程

1. **用户输入** → 解析需求
2. **任务分析** → AI 模型分析并制定计划
3. **工具调用** → 根据计划调用相应的 MCP 工具
4. **结果处理** → 处理工具执行结果
5. **迭代执行** → 根据结果决定下一步行动
6. **任务完成** → 提供总结和建议

### 安全机制

- **命令安全检查**：禁用危险命令，检测命令注入
- **文件操作保护**：自动备份，路径验证
- **超时控制**：防止长时间运行的操作
- **参数验证**：使用 Zod 进行严格的参数验证

## 🎯 扩展开发

### 添加新工具

1. 在 `src/tools/mcp-tools.ts` 中创建新的工具类：

```typescript
export class MyCustomTool extends BaseMCPTool {
  name = 'my_custom_tool';
  description = '我的自定义工具';
  inputSchema = z.object({
    param1: z.string().describe('参数1'),
    param2: z.number().optional().describe('可选参数2')
  });

  async execute(params: { param1: string; param2?: number }): Promise<MCPToolResult> {
    // 实现工具逻辑
    return {
      success: true,
      data: { result: 'success' }
    };
  }
}
```

2. 在 `MCPToolRegistry` 的 `registerDefaultTools` 方法中注册：

```typescript
const defaultTools = [
  // ... 现有工具
  new MyCustomTool()
];
```

### 自定义提示词

修改 `src/agent/rovo-agent.ts` 中的 `initializeSystemPrompt` 方法来自定义 Agent 的行为。

### 配置选项

通过环境变量或命令行参数调整：
- 模型参数（温度、最大迭代次数）
- 工具行为（超时时间、安全级别）
- 日志级别

## 🐛 故障排除

### 常见问题

1. **API Key 错误**
   ```
   ❌ 需要提供 DeepSeek API Key
   ```
   解决：设置环境变量 `DEEPSEEK_TOKEN` 或使用 `-k` 参数

2. **工具执行失败**
   ```
   ❌ bash 执行失败: 命令被禁用
   ```
   解决：检查命令是否在安全白名单中

3. **文件权限错误**
   ```
   ❌ 创建文件失败: EACCES: permission denied
   ```
   解决：检查目录权限或使用 sudo

### 调试模式

设置环境变量启用详细日志：
```bash
LOG_LEVEL=DEBUG npm run dev
```

## 📈 性能优化

- **并行工具调用**：支持同时执行多个工具
- **智能缓存**：缓存文件内容和搜索结果
- **增量更新**：只处理变更的文件
- **资源限制**：限制文件大小和搜索结果数量

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 添加测试
4. 提交 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**让我们一起构建更智能的编程助手！** 🚀