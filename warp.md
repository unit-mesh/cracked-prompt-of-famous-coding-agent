# Warp Agent Mode 工具与提示词分析

基于 Warp AI 终端中的 Agent Mode 实际工具能力和提示词设计的深度分析。

## 🛠️ Agent Mode 工具集分析

### 核心工具能力矩阵

| 功能类别 | 工具名称 | 核心能力 | 安全级别 | 使用场景 |
|---------|---------|---------|---------|---------|
| **文件操作** | `create_file` | 创建新文件 | 中 | 代码生成、文档创建 |
| | `edit_files` | 批量文件编辑 | 中 | 代码重构、批量修改 |
| | `read_files` | 文件内容读取 | 低 | 代码分析、内容查看 |
| **搜索分析** | `search_codebase` | 语义代码搜索 | 低 | 代码理解、功能定位 |
| | `grep` | 精确模式匹配 | 低 | 符号查找、内容搜索 |
| | `file_glob` | 文件名模式匹配 | 低 | 文件发现、批量操作 |
| **命令执行** | `run_command` | 终端命令执行 | 高 | 构建、测试、部署 |

### 详细工具 JSON Schema

#### 1. create_file 工具

```json
{
  "name": "create_file",
  "description": "创建包含指定内容的新文件",
  "parameters": {
    "type": "object",
    "properties": {
      "summary": {
        "type": "string",
        "description": "新文件的简短摘要",
        "required": true
      },
      "file_path": {
        "type": "string",
        "description": "新文件应创建的绝对路径",
        "required": true,
        "pattern": "^/"
      },
      "contents": {
        "type": "string",
        "description": "要创建的文件的完整内容",
        "required": true
      }
    },
    "additionalProperties": false
  },
  "safety": {
    "level": "medium",
    "constraints": ["不能覆盖已存在文件", "需要有效的文件路径"]
  }
}
```

#### 2. edit_files 工具

```json
{
  "name": "edit_files",
  "description": "基于提供的差异补丁编辑文件内容",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "变更的简短摘要",
        "required": true
      },
      "diffs": {
        "type": "array",
        "description": "代码文件编辑列表，指定为差异",
        "items": {
          "type": "object",
          "properties": {
            "file_path": {
              "type": "string",
              "description": "要编辑的文件的绝对路径"
            },
            "search": {
              "type": "string",
              "description": "原始文件中要替换的行范围"
            },
            "replace": {
              "type": "string",
              "description": "要插入文件中以替代搜索范围的行"
            },
            "search_start_line_number": {
              "type": "integer",
              "description": "search 字符串开始的1索引行号"
            }
          },
          "required": ["file_path", "search", "replace", "search_start_line_number"],
          "additionalProperties": false
        },
        "minItems": 1
      }
    },
    "required": ["title", "diffs"],
    "additionalProperties": false
  },
  "safety": {
    "level": "medium",
    "constraints": ["精确字符串匹配", "完整行包含", "语法正确性检查"]
  }
}
```

#### 3. read_files 工具

```json
{
  "name": "read_files",
  "description": "读取指定文件的内容",
  "parameters": {
    "type": "object",
    "properties": {
      "files": {
        "type": "array",
        "description": "要读取的文件列表",
        "items": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "文件路径",
              "required": true
            },
            "ranges": {
              "type": "array",
              "description": "行范围列表（可选）",
              "items": {
                "type": "string",
                "pattern": "^\\d+-\\d+$"
              }
            }
          },
          "required": ["path"],
          "additionalProperties": false
        },
        "minItems": 1
      }
    },
    "required": ["files"],
    "additionalProperties": false
  },
  "safety": {
    "level": "low",
    "constraints": ["最大5000行限制", "支持行范围指定"]
  }
}
```

#### 4. search_codebase 工具

```json
{
  "name": "search_codebase",
  "description": "在当前代码库中搜索与给定查询相关的文件",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "语义代码库搜索的查询",
        "required": true,
        "minLength": 3
      },
      "codebase_path": {
        "type": "string",
        "description": "要搜索的特定代码库路径",
        "required": true
      },
      "path_filters": {
        "type": "array",
        "description": "应用于结果集的可选路径段",
        "items": {
          "type": "string"
        }
      }
    },
    "required": ["query", "codebase_path"],
    "additionalProperties": false
  },
  "safety": {
    "level": "low",
    "constraints": ["精确查询描述", "避免模糊广泛查询"]
  }
}
```

#### 5. run_command 工具

```json
{
  "name": "run_command",
  "description": "在用户机器上执行shell命令",
  "parameters": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "description": "要执行的shell命令",
        "required": true
      },
      "is_read_only": {
        "type": "boolean",
        "description": "命令是否完全只读且不产生副作用",
        "required": true
      },
      "uses_pager": {
        "type": "boolean",
        "description": "命令是否可能使用分页器",
        "required": true
      },
      "is_risky": {
        "type": "boolean",
        "description": "命令是否可能产生危险或不良副作用",
        "required": true
      },
      "citations": {
        "type": "object",
        "description": "命令的引用列表",
        "properties": {
          "documents": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "document_type": {"type": "string"},
                "document_id": {"type": "string"}
              },
              "required": ["document_type", "document_id"]
            }
          }
        }
      }
    },
    "required": ["command", "is_read_only", "uses_pager", "is_risky"],
    "additionalProperties": false
  },
  "safety": {
    "level": "high",
    "constraints": [
      "禁止恶意或有害命令",
      "强烈偏向避免不安全命令",
      "不使用交互式或全屏命令",
      "使用绝对路径避免cd操作",
      "使用--no-pager选项避免分页"
    ]
  }
}
```

## 🎯 提示词设计分析

### 核心设计理念

1. **任务驱动** - 区分问题咨询和任务执行
2. **复杂度感知** - 简单任务直接执行，复杂任务先确认
3. **安全优先** - 多层安全检查和确认机制
4. **上下文感知** - 充分利用外部上下文信息

### 关键提示词模式

#### 1. 任务分类模式

```markdown
# 问题 vs 任务判断
- 问题：提供操作指南，询问是否执行
- 任务：直接执行，偏向行动

## 复杂度评估
- 简单任务：直接执行，不询问细节
- 复杂任务：理解意图后执行，必要时询问
```

#### 2. 安全控制模式

```markdown
# 安全等级控制
- 文件读取：低风险，直接执行
- 文件编辑：中风险，确保正确性
- 命令执行：高风险，多重检查

## 恶意内容检测
- 绝不协助恶意或有害任务
- 密钥处理采用环境变量
- 星号流检测和替换机制
```

#### 3. 工具选择策略

```markdown
# 搜索工具选择
- 已知精确符号：使用 grep
- 语义理解需求：使用 search_codebase
- 文件名模式：使用 file_glob

# 文件操作策略
- 不使用终端命令读取文件
- 优先使用专用文件工具
- 大文件分块处理（5000行）
```

### 提示词优化建议

#### 1. 增强上下文利用

```markdown
## 当前不足
- 外部上下文利用不够充分
- 缺乏项目级别的理解能力

## 优化方向
- 增加项目结构自动分析
- 添加代码库索引和语义理解
- 增强多轮对话上下文保持
```

#### 2. 智能化程度提升

```markdown
## 当前限制
- 需要明确指令才能行动
- 缺乏主动建议和预测能力

## 优化建议
- 添加任务完成后的后续建议
- 实现错误自动修复和重试
- 增加性能优化建议
```

#### 3. 个性化定制

```markdown
## 缺失功能
- 无用户习惯学习能力
- 缺乏项目特定规则

## 建议增加
- 用户偏好记忆系统
- 项目特定配置文件支持
- 编码风格自动适应
```

## 🚀 与其他 Agent 对比优势

### Warp Agent Mode 独特优势

1. **终端原生集成** - 与 Warp 终端深度集成，无需额外配置
2. **命令执行安全** - 多层安全检查机制，防止恶意命令
3. **文件操作精确** - 基于差异的精确文件编辑，避免意外修改
4. **语义搜索能力** - 支持自然语言的代码库搜索
5. **批量操作支持** - 单次调用可处理多个文件编辑

### 相比其他 Agent 的不足

1. **缺乏任务管理** - 无 Augment Agent 的任务分解和状态跟踪
2. **无专用模型** - 缺乏 Cursor Agent 的 Apply 专用模型
3. **沙箱化不足** - 不如 CodeX Agent 的完全沙箱隔离
4. **记忆能力弱** - 无 Cascade 的持久化记忆管理
5. **可视化缺失** - 无图表渲染和可视化能力

## 📈 改进建议

### 短期优化（1-3个月）

1. **增加任务管理工具**
   ```json
   {
     "name": "create_task",
     "description": "创建和管理开发任务"
   }
   ```

2. **加强记忆管理**
   ```json
   {
     "name": "store_context",
     "description": "存储项目上下文和用户偏好"
   }
   ```

3. **增加代码分析工具**
   ```json
   {
     "name": "analyze_code",
     "description": "静态代码分析和质量检查"
   }
   ```

### 中期发展（3-6个月）

1. **专用模型集成** - 开发类似 Cursor Apply 的代码应用模型
2. **沙箱执行环境** - 增加可选的沙箱执行模式
3. **可视化能力** - 支持图表和架构图生成
4. **IDE 集成增强** - 深度集成主流 IDE

### 长期愿景（6-12个月）

1. **预测式编程** - 实现代码意图预测和自动补全
2. **个性化 AI** - 基于用户习惯的智能行为定制
3. **项目级理解** - 完整的代码库语义理解和导航
4. **协作式开发** - 支持团队协作和知识共享

## 💡 最佳实践指南

### 工具使用最佳实践

1. **文件操作**
   - 编辑前先读取了解文件结构
   - 使用精确的搜索字符串避免误匹配
   - 大文件分块处理避免截断

2. **命令执行**
   - 优先使用只读命令探索
   - 危险操作增加用户确认
   - 使用绝对路径避免路径混乱

3. **代码搜索**
   - 精确查询用 grep，语义查询用 search_codebase
   - 结合多种搜索工具提高查找效率
   - 利用路径过滤缩小搜索范围

### 提示词编写建议

1. **清晰的任务描述** - 明确目标和约束条件
2. **适当的上下文** - 提供足够的背景信息
3. **安全性考虑** - 明确风险级别和安全要求
4. **错误处理** - 包含失败场景的处理策略

## 📚 参考资源

- [Warp AI Terminal Documentation](https://docs.warp.dev/)
- [JSON Schema Specification](https://json-schema.org/)
- [AI Agent Design Patterns](https://github.com/patterns/ai-agents)
- [Tool Use API Best Practices](https://docs.anthropic.com/claude/docs/tool-use)

---

*本文档基于 Warp Agent Mode 的实际工具能力和提示词分析，为 AI Agent 工具设计提供参考。*
