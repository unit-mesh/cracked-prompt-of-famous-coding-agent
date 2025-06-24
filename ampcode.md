# 🚀 Amp Agent 工具能力与提示词设计指导

## 概述

基于对 Amp (Sourcegraph) 工具架构的深度分析，本文档总结了 Amp 的核心优势和设计理念，为开发更强大的 AI Coding Agent 提供指导。

## 📊 Amp Agent 核心工具能力分析

### 🛠️ 完整工具清单

| 类别 | 工具名称 | 核心能力 | 独特优势 |
|------|----------|----------|----------|
| **文件操作** | `read_file` | 智能文件读取，支持行数限制和范围查看 | 防止超长输出，支持分页读取 |
| | `edit_file` | 精确字符串替换编辑 | 基于精确匹配的安全编辑 |
| | `create_file` | 文件创建 | 一步完成文件创建和内容写入 |
| | `list_directory` | 目录结构查看 | 简洁的目录浏览能力 |
| | `undo_edit` | 编辑撤销 | 安全的变更回滚机制 |
| | `format_file` | 代码格式化 | VS Code 集成的格式化能力 |
| **代码搜索** | `codebase_search_agent` | AI 驱动的语义代码搜索 | 🌟 **理解意图而非仅匹配关键词** |
| | `Grep` | 精确文本搜索 | 高性能的 ripgrep 集成 |
| | `glob` | 文件模式匹配 | 快速文件发现和筛选 |
| **终端执行** | `Bash` | Shell 命令执行 | 支持工作目录切换，输出限制保护 |
| **诊断分析** | `get_diagnostics` | IDE 级别的代码诊断 | 🌟 **获取编译错误、警告等实时诊断** |
| **网络功能** | `read_web_page` | 网页内容读取 | Markdown 格式化的网页内容提取 |
| | `web_search` | 网络信息搜索 | 实时信息获取能力 |
| **可视化** | `mermaid` | 图表渲染 | 🌟 **主动创建架构图和流程图** |
| **任务管理** | `todo_read`/`todo_write` | 会话级任务管理 | 🌟 **结构化的任务规划和跟踪** |
| **代理协作** | `Task` | 子任务代理 | 🌟 **多代理并发执行复杂任务** |

### 🛠️ 完整工具清单 (JSON Schema)

#### 📁 文件操作工具

```json
{
  "name": "read_file",
  "description": "读取文件内容，支持行数范围和智能分页",
  "category": "file",
  "parameters": {
    "path": {
      "type": "string",
      "required": true,
      "description": "文件路径，必须存在"
    },
    "read_range": {
      "type": "array",
      "items": "number",
      "minItems": 2,
      "maxItems": 2,
      "required": false,
      "description": "行号范围 [start, end]，1-indexed"
    }
  },
  "capabilities": [
    "智能行数限制（最多1000行）",
    "分页读取支持",
    "防止token溢出"
  ],
  "limitations": [
    "单次最多返回1000行",
    "超长行可能导致失败"
  ]
}
```

```json
{
  "name": "edit_file",
  "description": "基于精确字符串匹配的安全文件编辑",
  "category": "file",
  "parameters": {
    "path": {
      "type": "string",
      "required": true,
      "description": "目标文件路径"
    },
    "old_str": {
      "type": "string",
      "required": true,
      "description": "要替换的原始字符串，必须完全匹配"
    },
    "new_str": {
      "type": "string",
      "required": true,
      "description": "新的字符串内容"
    },
    "replace_all": {
      "type": "boolean",
      "required": false,
      "default": false,
      "description": "是否替换所有匹配项"
    }
  },
  "capabilities": [
    "精确匹配替换",
    "防止意外修改",
    "支持批量替换"
  ],
  "limitations": [
    "old_str必须在文件中存在",
    "old_str和new_str必须不同"
  ]
}
```

```json
{
  "name": "create_file",
  "description": "创建新文件或覆写现有文件",
  "category": "file",
  "parameters": {
    "path": {
      "type": "string",
      "required": true,
      "description": "文件路径"
    },
    "content": {
      "type": "string",
      "required": true,
      "description": "文件内容"
    }
  },
  "capabilities": [
    "一步完成创建和写入",
    "自动覆写现有文件"
  ],
  "limitations": [
    "会覆写现有文件"
  ]
}
```

```json
{
  "name": "list_directory",
  "description": "列出目录内容",
  "category": "file",
  "parameters": {
    "path": {
      "type": "string",
      "required": false,
      "description": "目录路径，默认为工作区根目录"
    }
  },
  "capabilities": [
    "显示文件和文件夹",
    "简洁的目录结构"
  ],
  "limitations": [
    "不显示隐藏文件",
    "不递归显示子目录"
  ]
}
```

```json
{
  "name": "undo_edit",
  "description": "撤销最近一次文件编辑",
  "category": "file",
  "parameters": {
    "path": {
      "type": "string",
      "required": true,
      "description": "要撤销编辑的文件路径"
    }
  },
  "capabilities": [
    "安全的变更回滚",
    "恢复到编辑前状态"
  ],
  "limitations": [
    "只能撤销最近一次编辑"
  ]
}
```

```json
{
  "name": "format_file",
  "description": "使用VS Code格式化器格式化文件",
  "category": "file",
  "parameters": {
    "path": {
      "type": "string",
      "required": true,
      "description": "要格式化的文件路径"
    }
  },
  "capabilities": [
    "VS Code集成格式化",
    "自动代码美化"
  ],
  "limitations": [
    "仅在VS Code环境可用"
  ]
}
```

#### 🔍 代码搜索工具

```json
{
  "name": "codebase_search_agent",
  "description": "AI驱动的语义代码搜索，理解开发意图",
  "category": "search",
  "parameters": {
    "query": {
      "type": "string",
      "required": true,
      "description": "自然语言搜索查询，描述要查找的功能或概念"
    }
  },
  "capabilities": [
    "理解开发意图",
    "跨文件语义搜索",
    "智能上下文分析"
  ],
  "limitations": [
    "适合概念性搜索",
    "不适合精确字符串匹配"
  ]
}
```

```json
{
  "name": "Grep",
  "description": "基于ripgrep的高性能精确文本搜索",
  "category": "search",
  "parameters": {
    "pattern": {
      "type": "string",
      "required": true,
      "description": "搜索模式，支持正则表达式"
    },
    "path": {
      "type": "string",
      "required": false,
      "description": "搜索路径，可以是文件或目录"
    },
    "caseSensitive": {
      "type": "boolean",
      "required": false,
      "description": "是否区分大小写"
    }
  },
  "capabilities": [
    "正则表达式支持",
    "高性能搜索",
    "路径限制搜索"
  ],
  "limitations": [
    "每文件最多15个匹配",
    "长行会被截断"
  ]
}
```

```json
{
  "name": "glob",
  "description": "快速文件模式匹配和发现",
  "category": "search",
  "parameters": {
    "filePattern": {
      "type": "string",
      "required": true,
      "description": "文件模式，如 '**/*.js' 或 'src/**/*.ts'"
    },
    "limit": {
      "type": "number",
      "required": false,
      "description": "最大返回结果数"
    },
    "offset": {
      "type": "number",
      "required": false,
      "description": "跳过的结果数（分页）"
    }
  },
  "capabilities": [
    "快速文件发现",
    "模式匹配",
    "按修改时间排序"
  ],
  "limitations": [
    "仅匹配文件名模式"
  ]
}
```

#### 🖥️ 终端执行工具

```json
{
  "name": "Bash",
  "description": "执行Shell命令，支持工作目录切换",
  "category": "terminal",
  "parameters": {
    "cmd": {
      "type": "string",
      "required": true,
      "description": "要执行的shell命令"
    },
    "cwd": {
      "type": "string",
      "required": false,
      "description": "命令执行的工作目录"
    }
  },
  "capabilities": [
    "工作目录切换",
    "输出限制保护",
    "Git命令支持"
  ],
  "limitations": [
    "输出限制50000字符",
    "环境变量不持久化"
  ]
}
```

#### 🔧 诊断分析工具

```json
{
  "name": "get_diagnostics",
  "description": "获取IDE级别的代码诊断信息",
  "category": "diagnostics",
  "parameters": {
    "path": {
      "type": "string",
      "required": true,
      "description": "要诊断的文件或目录路径"
    }
  },
  "capabilities": [
    "实时错误检测",
    "编译警告获取",
    "类型检查问题"
  ],
  "limitations": [
    "依赖IDE环境"
  ]
}
```

#### 🌐 网络功能工具

```json
{
  "name": "read_web_page",
  "description": "读取网页内容并转换为Markdown格式",
  "category": "web",
  "parameters": {
    "url": {
      "type": "string",
      "required": true,
      "description": "要读取的网页URL"
    },
    "max_length": {
      "type": "number",
      "required": false,
      "default": 5000,
      "description": "最大返回字符数"
    },
    "start_index": {
      "type": "number",
      "required": false,
      "default": 0,
      "description": "起始字符索引（分页）"
    },
    "raw": {
      "type": "boolean",
      "required": false,
      "default": false,
      "description": "是否返回原始HTML"
    }
  },
  "capabilities": [
    "HTML到Markdown转换",
    "内容分页支持",
    "文本提取"
  ],
  "limitations": [
    "不支持JavaScript渲染内容"
  ]
}
```

```json
{
  "name": "web_search",
  "description": "网络搜索获取实时信息",
  "category": "web",
  "parameters": {
    "query": {
      "type": "string",
      "required": true,
      "description": "搜索查询词"
    },
    "num_results": {
      "type": "number",
      "required": false,
      "default": 5,
      "description": "返回结果数量，最大10"
    }
  },
  "capabilities": [
    "实时信息获取",
    "搜索结果摘要"
  ],
  "limitations": [
    "最多返回10个结果"
  ]
}
```

#### 🎨 可视化工具

```json
{
  "name": "mermaid",
  "description": "渲染Mermaid图表，主动可视化复杂概念",
  "category": "visualization",
  "parameters": {
    "code": {
      "type": "string",
      "required": true,
      "description": "Mermaid图表代码"
    }
  },
  "capabilities": [
    "架构图渲染",
    "流程图生成",
    "时序图绘制"
  ],
  "limitations": [
    "不支持自定义样式"
  ]
}
```

#### 📋 任务管理工具

```json
{
  "name": "todo_write",
  "description": "会话级任务管理，结构化规划和跟踪",
  "category": "task",
  "parameters": {
    "todos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "description": "唯一标识符"},
          "content": {"type": "string", "description": "任务内容"},
          "status": {"type": "string", "enum": ["todo", "in-progress", "completed"]},
          "priority": {"type": "string", "enum": ["low", "medium", "high"]}
        },
        "required": ["id", "content", "status", "priority"]
      },
      "required": true,
      "description": "任务列表，替换现有任务"
    }
  },
  "capabilities": [
    "结构化任务规划",
    "进度跟踪",
    "优先级管理"
  ],
  "limitations": [
    "仅会话级持久化"
  ]
}
```

```json
{
  "name": "todo_read",
  "description": "读取当前会话的任务列表",
  "category": "task",
  "parameters": {},
  "capabilities": [
    "任务状态查看",
    "进度监控"
  ],
  "limitations": [
    "仅会话级访问"
  ]
}
```

#### 🤖 代理协作工具

```json
{
  "name": "Task",
  "description": "子任务代理，支持复杂任务分解和并发执行",
  "category": "agent",
  "parameters": {
    "prompt": {
      "type": "string",
      "required": true,
      "description": "详细的任务描述和上下文"
    },
    "description": {
      "type": "string",
      "required": true,
      "description": "任务的简短描述"
    }
  },
  "capabilities": [
    "多代理并发执行",
    "独立工具访问",
    "复杂任务分解"
  ],
  "limitations": [
    "无法与子代理实时通信",
    "需要详细的上下文描述"
  ]
}
```

## 🎯 Amp Agent 独特设计理念

### 1. 🧠 **智能化工作流设计**

#### 主动任务管理
```markdown
# Amp 的任务管理模式
1. **主动规划**: 使用 todo_write 制定结构化任务清单
2. **实时跟踪**: 完成一个任务立即标记 completed
3. **分解执行**: 复杂任务自动分解为可管理的子任务
4. **并发处理**: 通过 Task 工具实现多代理协作
```

#### 智能搜索策略
```markdown
# 双重搜索模式
- **语义搜索**: codebase_search_agent 理解开发意图
- **精确搜索**: Grep 进行关键词和模式匹配
- **文件发现**: glob 快速定位相关文件
```

### 2. 🛡️ **安全优先的执行策略**

#### 渐进式验证
```markdown
# Amp 的安全执行流程
1. **预分析**: 使用 read_file 了解代码结构
2. **精确编辑**: edit_file 基于精确字符串匹配
3. **即时验证**: get_diagnostics 检查编辑结果
4. **回滚保护**: undo_edit 提供安全退路
```

#### 输出控制策略
```markdown
# 智能输出管理
- 文件读取限制 1000 行，防止 token 溢出
- Bash 输出限制 50000 字符，避免系统卡顿
- 分页读取支持，处理大文件时使用 read_range
```

### 3. 🎨 **用户体验优化**

#### 主动可视化
```markdown
# Amp 的可视化理念
- **主动创建图表**: 无需用户要求，自动生成架构图
- **流程可视化**: 复杂工作流自动绘制时序图
- **关系图谱**: 组件依赖关系的可视化展示
```

#### 简洁沟通模式
```markdown
# 高效沟通策略
- **简洁回复**: 默认 1-3 句话回答问题
- **直接响应**: 避免冗长的解释和总结
- **工具透明**: 不暴露工具名称，关注结果
```

### 4. 🔄 **并发与协作架构**

#### 多代理协作模式
```markdown
# Task 工具的协作理念
- **任务分离**: 独立任务并发执行
- **上下文隔离**: 子代理有独立的工具访问权限
- **结果汇总**: 主代理统一处理子任务结果
```

## 📋 提示词设计最佳实践

### 1. 任务管理驱动的提示词结构

```markdown
# 建议的提示词框架
## 核心原则
- 所有复杂任务必须使用 todo_write 进行规划
- 完成单个任务立即标记为 completed
- 频繁使用任务管理确保进度可见

## 工作流程
1. **接收任务** → 使用 todo_write 制定计划
2. **执行阶段** → 标记 in-progress，逐步完成
3. **验证阶段** → get_diagnostics 检查结果
4. **完成阶段** → 标记 completed，继续下一任务
```

### 2. 智能搜索策略的提示词指导

```markdown
# 搜索工具使用指导
## 语义搜索 (codebase_search_agent)
- 适用场景: "如何实现用户认证"、"错误处理在哪里"
- 查询方式: 使用自然语言描述功能需求
- 并发执行: 同时启动多个搜索代理

## 精确搜索 (Grep)
- 适用场景: 查找具体函数名、变量名、错误信息
- 模式匹配: 支持正则表达式和复杂模式
- 路径限制: 使用 path 参数缩小搜索范围
```

### 3. 安全编辑的提示词规范

```markdown
# 文件编辑安全规范
## 编辑前准备
1. 使用 read_file 查看文件结构
2. 理解代码上下文和依赖关系
3. 确定精确的替换字符串

## 编辑执行
1. 使用 edit_file 进行精确替换
2. old_str 必须完全匹配现有代码
3. 保持代码格式和缩进一致

## 编辑后验证
1. 立即运行 get_diagnostics 检查错误
2. 执行相关的 lint 和 typecheck 命令
3. 如有问题，使用 undo_edit 回滚
```

### 4. 主动可视化的提示词指导

```markdown
# 可视化创建指导
## 自动图表生成场景
- 解释系统架构时 → 创建组件关系图
- 描述工作流程时 → 绘制时序图或流程图
- 分析数据流时 → 制作数据流向图

## Mermaid 图表类型选择
- `graph`: 组件关系和架构图
- `sequenceDiagram`: API 交互和时序流程
- `flowchart`: 决策流程和算法步骤
- `classDiagram`: 类层次和数据模型
```

### 5. 并发执行的提示词策略

```markdown
# 并发任务处理指导
## 适用场景
- 多文件独立修改任务
- 不同层级的系统更新
- 独立的功能模块开发

## 实现方式
- 单次调用包含多个 Task 工具
- 每个子代理处理独立的工作范围
- 主代理负责结果整合和用户沟通

## 注意事项
- 避免同时编辑同一文件的相同部分
- 确保子任务之间的依赖关系清晰
- 提供详细的上下文给子代理
```

## 🔧 工具协议设计建议

### 1. 参数设计原则

```json
{
  "design_principles": {
    "简洁性": "必填参数最小化，可选参数提供默认值",
    "安全性": "危险操作需要多重确认和验证",
    "灵活性": "支持多种工作模式和使用场景",
    "一致性": "相似功能的工具保持参数命名一致"
  }
}
```

### 2. 错误处理设计

```markdown
# 建议的错误处理策略
## 渐进式降级
1. 工具调用失败 → 尝试替代方案
2. 文件不存在 → 自动搜索相似文件
3. 权限不足 → 提示用户并建议解决方案

## 智能重试机制
- 网络请求失败 → 自动重试 3 次
- 命令执行超时 → 提供中断和继续选项
- 文件锁定 → 等待后重试
```

### 3. 上下文感知设计

```markdown
# 上下文感知功能建议
## 自动环境识别
- 检测项目类型 (React, Node.js, Python 等)
- 识别构建工具 (webpack, vite, cargo 等)
- 适配开发环境 (本地、容器、云端)

## 智能参数推断
- 根据文件类型选择合适的格式化器
- 基于项目结构推断测试命令
- 从 package.json 自动获取脚本命令
```

## 🚀 进阶功能开发建议

### 1. 增强现有工具

```markdown
# 现有工具的增强方向
## 搜索功能增强
- 支持多文件类型的混合搜索
- 增加搜索结果的相关性排序
- 提供搜索历史和常用模式

## 编辑功能增强  
- 支持多位置同时编辑
- 增加编辑预览和差异对比
- 提供批量重构和重命名功能

## 诊断功能增强
- 支持自定义规则和检查器
- 增加性能分析和优化建议
- 提供代码质量评分和趋势
```
