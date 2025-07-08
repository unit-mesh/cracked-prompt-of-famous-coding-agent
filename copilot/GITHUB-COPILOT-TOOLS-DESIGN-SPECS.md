# GitHub Copilot 工具设计规范

GitHub Copilot 是集成了多种开发工具能力的 AI 编程助手，提供全面的代码开发、项目管理和自动化支持。

## 🎯 Copilot 核心设计理念

1. **多工具集成** - 整合 GitHub API、文件系统、浏览器自动化、命令行等多种工具
2. **工作流驱动** - 支持完整的开发工作流，从代码编写到项目管理
3. **安全可控** - 提供安全的代码执行和文件操作环境
4. **智能交互** - 结合 AI 推理能力提供智能化的开发建议
5. **协作优化** - 专注于提升开发团队的协作效率

## 🛠️ 完整工具清单 (JSON Schema)

### 📁 GitHub API 工具集

#### `github-get_me`

```json
{
  "name": "github-mcp-server-get_me",
  "description": "获取当前认证用户的 GitHub 个人信息",
  "category": "github_api",
  "parameters": {
    "reason": {
      "type": "string",
      "required": false,
      "description": "请求用户信息的原因说明（可选）"
    }
  },
  "capabilities": [
    "获取用户基本信息",
    "验证认证状态",
    "获取用户权限信息"
  ],
  "limitations": [
    "需要 GitHub 认证",
    "输出内容不会频繁变化"
  ]
}
```

#### `github-search_repositories`

```json
{
  "name": "github-mcp-server-search_repositories",
  "description": "搜索 GitHub 仓库",
  "category": "github_api",
  "parameters": {
    "query": {
      "type": "string",
      "required": true,
      "description": "搜索查询语句"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码（最小值 1）"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数（1-100）"
    }
  },
  "capabilities": [
    "全平台仓库搜索",
    "支持复杂查询语法",
    "分页结果获取"
  ],
  "limitations": [
    "受 GitHub API 限制",
    "需要网络连接"
  ]
}
```

#### `github-search_code`

```json
{
  "name": "github-mcp-server-search_code",
  "description": "跨 GitHub 仓库搜索代码",
  "category": "github_api",
  "parameters": {
    "q": {
      "type": "string",
      "required": true,
      "description": "使用 GitHub 代码搜索语法的查询语句"
    },
    "sort": {
      "type": "string",
      "required": false,
      "description": "排序字段（仅支持 'indexed'）"
    },
    "order": {
      "type": "string",
      "required": false,
      "enum": ["asc", "desc"],
      "description": "排序顺序"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "全平台代码搜索",
    "支持高级搜索语法",
    "代码片段预览"
  ],
  "limitations": [
    "受 GitHub 搜索 API 限制",
    "需要网络连接"
  ]
}
```

#### `github-search_issues`

```json
{
  "name": "github-mcp-server-search_issues",
  "description": "搜索 GitHub Issues",
  "category": "github_api",
  "parameters": {
    "q": {
      "type": "string",
      "required": true,
      "description": "使用 GitHub Issues 搜索语法的查询语句"
    },
    "sort": {
      "type": "string",
      "required": false,
      "enum": ["comments", "reactions", "reactions-+1", "reactions--1", "reactions-smile", "reactions-thinking_face", "reactions-heart", "reactions-tada", "interactions", "created", "updated"],
      "description": "排序字段，默认为最佳匹配"
    },
    "order": {
      "type": "string",
      "required": false,
      "enum": ["asc", "desc"],
      "description": "排序顺序"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "全平台 Issue 搜索",
    "多种排序方式",
    "高级搜索过滤"
  ],
  "limitations": [
    "受 GitHub API 限制",
    "需要网络连接"
  ]
}
```

#### `github-search_users`

```json
{
  "name": "github-mcp-server-search_users",
  "description": "搜索 GitHub 用户",
  "category": "github_api",
  "parameters": {
    "q": {
      "type": "string",
      "required": true,
      "description": "使用 GitHub 用户搜索语法的查询语句"
    },
    "sort": {
      "type": "string",
      "required": false,
      "enum": ["followers", "repositories", "joined"],
      "description": "按类别排序字段"
    },
    "order": {
      "type": "string",
      "required": false,
      "enum": ["asc", "desc"],
      "description": "排序顺序"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "全平台用户搜索",
    "用户关系分析",
    "开发者发现"
  ],
  "limitations": [
    "受 GitHub API 限制",
    "需要网络连接"
  ]
}
```

#### `github-get_file_contents`

```json
{
  "name": "github-mcp-server-get_file_contents",
  "description": "获取 GitHub 仓库中文件或目录的内容",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者（用户名或组织）"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "path": {
      "type": "string",
      "required": true,
      "description": "文件/目录路径（目录必须以斜杠 '/' 结尾）"
    },
    "branch": {
      "type": "string",
      "required": false,
      "description": "分支名称"
    }
  },
  "capabilities": [
    "远程文件内容获取",
    "目录结构浏览",
    "分支版本控制"
  ],
  "limitations": [
    "受文件大小限制",
    "需要仓库访问权限"
  ]
}
```

#### `github-list_issues`

```json
{
  "name": "github-mcp-server-list_issues",
  "description": "列出 GitHub 仓库中的 Issues",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "state": {
      "type": "string",
      "required": false,
      "enum": ["open", "closed", "all"],
      "description": "按状态过滤"
    },
    "labels": {
      "type": "array",
      "required": false,
      "items": {"type": "string"},
      "description": "按标签过滤"
    },
    "sort": {
      "type": "string",
      "required": false,
      "enum": ["created", "updated", "comments"],
      "description": "排序方式"
    },
    "direction": {
      "type": "string",
      "required": false,
      "enum": ["asc", "desc"],
      "description": "排序方向"
    },
    "since": {
      "type": "string",
      "required": false,
      "description": "按日期过滤（ISO 8601 时间戳）"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "仓库 Issue 管理",
    "多维度过滤排序",
    "批量 Issue 分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "受 API 限制"
  ]
}
```

#### `github-get_issue`

```json
{
  "name": "github-mcp-server-get_issue",
  "description": "获取特定 Issue 的详细信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "issue_number": {
      "type": "number",
      "required": true,
      "description": "Issue 编号"
    }
  },
  "capabilities": [
    "详细 Issue 信息获取",
    "Issue 状态跟踪",
    "相关元数据分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "单个 Issue 操作"
  ]
}
```

#### `github-get_issue_comments`

```json
{
  "name": "github-mcp-server-get_issue_comments",
  "description": "获取特定 Issue 的评论",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "issue_number": {
      "type": "number",
      "required": true,
      "description": "Issue 编号"
    },
    "page": {
      "type": "number",
      "required": false,
      "description": "分页页码"
    },
    "per_page": {
      "type": "number",
      "required": false,
      "description": "每页记录数"
    }
  },
  "capabilities": [
    "Issue 讨论内容获取",
    "评论历史跟踪",
    "协作信息分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "按时间排序"
  ]
}
```

#### `github-list_pull_requests`

```json
{
  "name": "github-mcp-server-list_pull_requests",
  "description": "列出 GitHub 仓库中的 Pull Requests",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "state": {
      "type": "string",
      "required": false,
      "enum": ["open", "closed", "all"],
      "description": "按状态过滤"
    },
    "head": {
      "type": "string",
      "required": false,
      "description": "按头部用户/组织和分支过滤"
    },
    "base": {
      "type": "string",
      "required": false,
      "description": "按基础分支过滤"
    },
    "sort": {
      "type": "string",
      "required": false,
      "enum": ["created", "updated", "popularity", "long-running"],
      "description": "排序方式"
    },
    "direction": {
      "type": "string",
      "required": false,
      "enum": ["asc", "desc"],
      "description": "排序方向"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "Pull Request 管理",
    "代码审查跟踪",
    "合并状态监控"
  ],
  "limitations": [
    "需要仓库访问权限",
    "受 API 限制"
  ]
}
```

#### `github-get_pull_request`

```json
{
  "name": "github-mcp-server-get_pull_request",
  "description": "获取特定 Pull Request 的详细信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "pullNumber": {
      "type": "number",
      "required": true,
      "description": "Pull Request 编号"
    }
  },
  "capabilities": [
    "详细 PR 信息获取",
    "代码变更分析",
    "审查状态跟踪"
  ],
  "limitations": [
    "需要仓库访问权限",
    "单个 PR 操作"
  ]
}
```

#### `github-get_pull_request_files`

```json
{
  "name": "github-mcp-server-get_pull_request_files",
  "description": "获取 Pull Request 中变更的文件列表",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "pullNumber": {
      "type": "number",
      "required": true,
      "description": "Pull Request 编号"
    }
  },
  "capabilities": [
    "变更文件列表获取",
    "文件差异分析",
    "代码变更统计"
  ],
  "limitations": [
    "需要仓库访问权限",
    "文件数量限制"
  ]
}
```

#### `github-get_pull_request_diff`

```json
{
  "name": "github-mcp-server-get_pull_request_diff",
  "description": "获取 Pull Request 的代码差异",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "pullNumber": {
      "type": "number",
      "required": true,
      "description": "Pull Request 编号"
    }
  },
  "capabilities": [
    "完整代码差异获取",
    "变更内容详细分析",
    "差异格式化显示"
  ],
  "limitations": [
    "需要仓库访问权限",
    "大文件差异限制"
  ]
}
```

#### `github-get_pull_request_comments`

```json
{
  "name": "github-mcp-server-get_pull_request_comments",
  "description": "获取 Pull Request 的评论",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "pullNumber": {
      "type": "number",
      "required": true,
      "description": "Pull Request 编号"
    }
  },
  "capabilities": [
    "PR 评论获取",
    "代码审查反馈分析",
    "讨论历史跟踪"
  ],
  "limitations": [
    "需要仓库访问权限",
    "评论数量限制"
  ]
}
```

#### `github-get_pull_request_reviews`

```json
{
  "name": "github-mcp-server-get_pull_request_reviews",
  "description": "获取 Pull Request 的审查信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "pullNumber": {
      "type": "number",
      "required": true,
      "description": "Pull Request 编号"
    }
  },
  "capabilities": [
    "审查状态获取",
    "审查决定跟踪",
    "审查者反馈分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "按时间排序"
  ]
}
```

#### `github-get_pull_request_status`

```json
{
  "name": "github-mcp-server-get_pull_request_status",
  "description": "获取 Pull Request 的状态信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "pullNumber": {
      "type": "number",
      "required": true,
      "description": "Pull Request 编号"
    }
  },
  "capabilities": [
    "PR 状态检查",
    "CI/CD 状态监控",
    "合并准备状态确认"
  ],
  "limitations": [
    "需要仓库访问权限",
    "依赖外部 CI 系统"
  ]
}
```

#### `github-list_commits`

```json
{
  "name": "github-mcp-server-list_commits",
  "description": "获取 GitHub 仓库分支的提交列表",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "sha": {
      "type": "string",
      "required": false,
      "description": "SHA 或分支名称"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "提交历史获取",
    "版本控制跟踪",
    "代码变更时间线"
  ],
  "limitations": [
    "需要仓库访问权限",
    "按时间倒序排列"
  ]
}
```

#### `github-get_commit`

```json
{
  "name": "github-mcp-server-get_commit",
  "description": "获取 GitHub 仓库中特定提交的详细信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "sha": {
      "type": "string",
      "required": true,
      "description": "提交 SHA、分支名称或标签名称"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "详细提交信息获取",
    "文件变更详情",
    "提交差异分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "大提交的性能限制"
  ]
}
```

#### `github-list_branches`

```json
{
  "name": "github-mcp-server-list_branches",
  "description": "列出 GitHub 仓库中的分支",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "分支列表获取",
    "分支状态查看",
    "分支管理支持"
  ],
  "limitations": [
    "需要仓库访问权限",
    "按字母顺序排列"
  ]
}
```

#### `github-list_tags`

```json
{
  "name": "github-mcp-server-list_tags",
  "description": "列出 GitHub 仓库中的 Git 标签",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "版本标签获取",
    "发布版本跟踪",
    "版本历史分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "按创建时间倒序"
  ]
}
```

#### `github-get_tag`

```json
{
  "name": "github-mcp-server-get_tag",
  "description": "获取 GitHub 仓库中特定标签的详细信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "tag": {
      "type": "string",
      "required": true,
      "description": "标签名称"
    }
  },
  "capabilities": [
    "标签详细信息获取",
    "关联提交信息",
    "版本发布分析"
  ],
  "limitations": [
    "需要仓库访问权限",
    "标签必须存在"
  ]
}
```

#### `github-list_notifications`

```json
{
  "name": "github-mcp-server-list_notifications",
  "description": "列出当前认证用户的所有 GitHub 通知",
  "category": "github_api",
  "parameters": {
    "filter": {
      "type": "string",
      "required": false,
      "enum": ["default", "include_read_notifications", "only_participating"],
      "description": "通知过滤方式，默认为 default"
    },
    "owner": {
      "type": "string",
      "required": false,
      "description": "可选的仓库所有者，与 repo 配合使用"
    },
    "repo": {
      "type": "string",
      "required": false,
      "description": "可选的仓库名称，与 owner 配合使用"
    },
    "since": {
      "type": "string",
      "required": false,
      "description": "仅显示此时间后更新的通知（ISO 8601 格式）"
    },
    "before": {
      "type": "string",
      "required": false,
      "description": "仅显示此时间前更新的通知（ISO 8601 格式）"
    },
    "page": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "description": "分页页码"
    },
    "perPage": {
      "type": "number",
      "required": false,
      "minimum": 1,
      "maximum": 100,
      "description": "每页结果数"
    }
  },
  "capabilities": [
    "通知中心管理",
    "未读通知跟踪",
    "参与项目提醒",
    "审查请求通知",
    "任务分配通知",
    "更新提醒"
  ],
  "limitations": [
    "需要用户认证",
    "按时间排序"
  ]
}
```

#### `github-get_notification_details`

```json
{
  "name": "github-mcp-server-get_notification_details",
  "description": "获取特定 GitHub 通知的详细信息",
  "category": "github_api",
  "parameters": {
    "notificationID": {
      "type": "string",
      "required": true,
      "description": "通知的 ID"
    }
  },
  "capabilities": [
    "通知详情获取",
    "相关 Issue/PR 信息",
    "通知上下文分析"
  ],
  "limitations": [
    "需要用户认证",
    "通知必须存在"
  ]
}
```

#### `github-list_code_scanning_alerts`

```json
{
  "name": "github-mcp-server-list_code_scanning_alerts",
  "description": "列出 GitHub 仓库中的代码扫描警报",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "tool_name": {
      "type": "string",
      "required": false,
      "description": "代码扫描工具名称"
    },
    "severity": {
      "type": "string",
      "required": false,
      "enum": ["critical", "high", "medium", "low", "warning", "note", "error"],
      "description": "按严重级别过滤代码扫描警报"
    },
    "state": {
      "type": "string",
      "required": false,
      "enum": ["open", "closed", "dismissed", "fixed"],
      "default": "open",
      "description": "按状态过滤代码扫描警报，默认为 open"
    },
    "ref": {
      "type": "string",
      "required": false,
      "description": "要列出结果的 Git 引用"
    }
  },
  "capabilities": [
    "安全漏洞扫描",
    "代码质量分析",
    "安全警报管理"
  ],
  "limitations": [
    "需要仓库访问权限",
    "依赖 GitHub 安全功能"
  ]
}
```

#### `github-get_code_scanning_alert`

```json
{
  "name": "github-mcp-server-get_code_scanning_alert",
  "description": "获取 GitHub 仓库中特定代码扫描警报的详细信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "alertNumber": {
      "type": "number",
      "required": true,
      "description": "警报编号"
    }
  },
  "capabilities": [
    "详细安全警报信息",
    "漏洞修复建议",
    "风险等级评估"
  ],
  "limitations": [
    "需要仓库访问权限",
    "警报必须存在"
  ]
}
```

#### `github-list_secret_scanning_alerts`

```json
{
  "name": "github-mcp-server-list_secret_scanning_alerts",
  "description": "列出 GitHub 仓库中的秘密扫描警报",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "state": {
      "type": "string",
      "required": false,
      "enum": ["open", "resolved"],
      "description": "按状态过滤"
    },
    "secret_type": {
      "type": "string",
      "required": false,
      "description": "要返回的秘密类型，逗号分隔列表"
    },
    "resolution": {
      "type": "string",
      "required": false,
      "enum": ["false_positive", "wont_fix", "revoked", "pattern_edited", "pattern_deleted", "used_in_tests"],
      "description": "按解决方案过滤"
    }
  },
  "capabilities": [
    "秘密泄露检测",
    "安全凭证保护",
    "敏感信息警报"
  ],
  "limitations": [
    "需要仓库访问权限",
    "依赖 GitHub 安全功能"
  ]
}
```

#### `github-get_secret_scanning_alert`

```json
{
  "name": "github-mcp-server-get_secret_scanning_alert",
  "description": "获取 GitHub 仓库中特定秘密扫描警报的详细信息",
  "category": "github_api",
  "parameters": {
    "owner": {
      "type": "string",
      "required": true,
      "description": "仓库所有者"
    },
    "repo": {
      "type": "string",
      "required": true,
      "description": "仓库名称"
    },
    "alertNumber": {
      "type": "number",
      "required": true,
      "description": "警报编号"
    }
  },
  "capabilities": [
    "详细秘密警报信息",
    "泄露位置定位",
    "修复指导"
  ],
  "limitations": [
    "需要仓库访问权限",
    "警报必须存在"
  ]
}
```

### 📁 文件系统工具集

#### `str_replace_editor`

```json
{
  "name": "str_replace_editor",
  "description": "综合文件编辑工具，支持查看、创建、编辑和撤销操作",
  "category": "file_system",
  "parameters": {
    "command": {
      "type": "string",
      "required": true,
      "enum": ["view", "create", "str_replace", "insert", "undo_edit"],
      "description": "要执行的命令类型"
    },
    "path": {
      "type": "string",
      "required": true,
      "description": "文件或目录的绝对路径"
    },
    "view_range": {
      "type": "array",
      "required": false,
      "items": {"type": "integer"},
      "description": "查看文件时的行号范围，如 [11, 12] 显示第11-12行"
    },
    "file_text": {
      "type": "string",
      "required": false,
      "description": "创建文件时的内容"
    },
    "old_str": {
      "type": "string",
      "required": false,
      "description": "要替换的原始字符串（必须完全匹配）"
    },
    "new_str": {
      "type": "string",
      "required": false,
      "description": "替换后的新字符串或插入的内容"
    },
    "insert_line": {
      "type": "integer",
      "required": false,
      "description": "插入内容的行号位置"
    }
  },
  "capabilities": [
    "文件内容查看",
    "新文件创建",
    "精确字符串替换",
    "行级内容插入",
    "编辑操作撤销",
    "目录结构浏览"
  ],
  "limitations": [
    "大文件查看可能被截断",
    "替换字符串必须完全匹配",
    "只能撤销最后一次编辑"
  ]
}
```

### 🖥️ 终端执行工具集

#### `bash`

```json
{
  "name": "bash",
  "description": "在交互式 bash 会话中运行命令",
  "category": "terminal",
  "parameters": {
    "command": {
      "type": "string",
      "required": true,
      "description": "要运行的 bash 命令和参数"
    },
    "sessionId": {
      "type": "string",
      "required": true,
      "description": "标识持久 bash 会话的 ID"
    },
    "async": {
      "type": "boolean",
      "required": true,
      "description": "是否异步运行命令"
    },
    "timeout": {
      "type": "integer",
      "required": false,
      "description": "命令超时时间（秒），默认 120 秒"
    }
  },
  "capabilities": [
    "命令行程序执行",
    "多会话管理",
    "异步任务支持",
    "环境变量持久化",
    "管道和重定向",
    "交互式程序支持"
  ],
  "limitations": [
    "无互联网访问",
    "命令超时限制",
    "TTY 设备依赖"
  ]
}
```

#### `write_bash`

```json
{
  "name": "write_bash",
  "description": "向指定的 bash 会话或运行中的命令发送输入",
  "category": "terminal",
  "parameters": {
    "sessionId": {
      "type": "string",
      "required": true,
      "description": "要发送输入的 bash 会话 ID"
    },
    "input": {
      "type": "string",
      "required": true,
      "description": "要发送的输入内容，支持文本和控制键"
    },
    "delay": {
      "type": "integer",
      "required": false,
      "description": "输入后等待输出的时间（秒）"
    }
  },
  "capabilities": [
    "交互式程序控制",
    "键盘输入模拟",
    "菜单导航支持",
    "确认对话框处理"
  ],
  "limitations": [
    "需要对应的异步 bash 会话",
    "延迟设置影响响应速度"
  ]
}
```

#### `read_bash`

```json
{
  "name": "read_bash",
  "description": "读取异步 bash 命令的输出",
  "category": "terminal",
  "parameters": {
    "sessionId": {
      "type": "string",
      "required": true,
      "description": "bash 会话的 ID"
    },
    "delay": {
      "type": "integer",
      "required": true,
      "description": "读取输出前等待的时间（秒）"
    }
  },
  "capabilities": [
    "异步输出读取",
    "长时间运行任务监控",
    "实时日志获取"
  ],
  "limitations": [
    "需要活跃的异步会话",
    "不包含 ANSI 控制码"
  ]
}
```

#### `stop_bash`

```json
{
  "name": "stop_bash",
  "description": "停止运行中的 bash 命令",
  "category": "terminal",
  "parameters": {
    "sessionId": {
      "type": "string",
      "required": true,
      "description": "要停止的 bash 会话 ID"
    }
  },
  "capabilities": [
    "强制终止命令",
    "进程清理",
    "资源释放"
  ],
  "limitations": [
    "会终止整个会话",
    "环境变量会丢失"
  ]
}
```

### 🌐 浏览器自动化工具集

#### `playwright-browser_navigate`

```json
{
  "name": "playwright-mcp-server-browser_navigate",
  "description": "导航到指定 URL",
  "category": "browser_automation",
  "parameters": {
    "url": {
      "type": "string",
      "required": true,
      "description": "要导航到的 URL"
    }
  },
  "capabilities": [
    "网页导航",
    "URL 加载",
    "页面跳转"
  ],
  "limitations": [
    "需要有效的 URL",
    "依赖网络连接"
  ]
}
```

#### `playwright-browser_snapshot`

```json
{
  "name": "playwright-mcp-server-browser_snapshot",
  "description": "捕获当前页面的可访问性快照",
  "category": "browser_automation",
  "parameters": {},
  "capabilities": [
    "页面结构分析",
    "可访问性检查",
    "DOM 元素识别"
  ],
  "limitations": [
    "需要加载的页面",
    "依赖页面渲染完成"
  ]
}
```

#### `playwright-browser_click`

```json
{
  "name": "playwright-mcp-server-browser_click",
  "description": "在网页上执行点击操作",
  "category": "browser_automation",
  "parameters": {
    "element": {
      "type": "string",
      "required": true,
      "description": "用于获取交互权限的人类可读元素描述"
    },
    "ref": {
      "type": "string",
      "required": true,
      "description": "页面快照中的精确目标元素引用"
    }
  },
  "capabilities": [
    "元素点击",
    "按钮激活",
    "链接导航"
  ],
  "limitations": [
    "需要元素可见",
    "需要页面快照引用"
  ]
}
```

#### `playwright-browser_type`

```json
{
  "name": "playwright-mcp-server-browser_type",
  "description": "在可编辑元素中输入文本",
  "category": "browser_automation",
  "parameters": {
    "element": {
      "type": "string",
      "required": true,
      "description": "用于获取交互权限的人类可读元素描述"
    },
    "ref": {
      "type": "string",
      "required": true,
      "description": "页面快照中的精确目标元素引用"
    },
    "text": {
      "type": "string",
      "required": true,
      "description": "要输入到元素中的文本"
    },
    "slowly": {
      "type": "boolean",
      "required": false,
      "description": "是否逐字符输入，用于触发页面键盘事件"
    },
    "submit": {
      "type": "boolean",
      "required": false,
      "description": "输入后是否提交（按回车键）"
    }
  },
  "capabilities": [
    "表单填写",
    "文本输入",
    "搜索查询",
    "数据录入"
  ],
  "limitations": [
    "需要可编辑元素",
    "需要页面快照引用"
  ]
}
```

#### `playwright-browser_take_screenshot`

```json
{
  "name": "playwright-mcp-server-browser_take_screenshot",
  "description": "截取当前页面或指定元素的屏幕截图",
  "category": "browser_automation",
  "parameters": {
    "filename": {
      "type": "string",
      "required": false,
      "description": "保存截图的文件名，默认为时间戳命名"
    },
    "element": {
      "type": "string",
      "required": false,
      "description": "要截图的元素描述"
    },
    "ref": {
      "type": "string",
      "required": false,
      "description": "精确的元素引用"
    },
    "raw": {
      "type": "boolean",
      "required": false,
      "description": "是否返回未压缩的 PNG 格式，默认返回 JPEG"
    }
  },
  "capabilities": [
    "全页面截图",
    "元素截图",
    "视觉记录",
    "UI 测试验证"
  ],
  "limitations": [
    "需要页面加载完成",
    "元素截图需要引用"
  ]
}
```

#### `playwright-browser_select_option`

```json
{
  "name": "playwright-mcp-server-browser_select_option",
  "description": "在下拉菜单中选择选项",
  "category": "browser_automation",
  "parameters": {
    "element": {
      "type": "string",
      "required": true,
      "description": "用于获取交互权限的人类可读元素描述"
    },
    "ref": {
      "type": "string",
      "required": true,
      "description": "页面快照中的精确目标元素引用"
    },
    "values": {
      "type": "array",
      "required": true,
      "items": {"type": "string"},
      "description": "要在下拉菜单中选择的值数组"
    }
  },
  "capabilities": [
    "下拉菜单操作",
    "选项选择",
    "表单控制"
  ],
  "limitations": [
    "需要下拉元素",
    "选项必须存在"
  ]
}
```

#### `playwright-browser_wait_for`

```json
{
  "name": "playwright-mcp-server-browser_wait_for",
  "description": "等待文本出现、消失或指定时间",
  "category": "browser_automation",
  "parameters": {
    "text": {
      "type": "string",
      "required": false,
      "description": "等待出现的文本"
    },
    "textGone": {
      "type": "string",
      "required": false,
      "description": "等待消失的文本"
    },
    "time": {
      "type": "number",
      "required": false,
      "description": "等待时间（秒）"
    }
  },
  "capabilities": [
    "页面状态等待",
    "动态内容监控",
    "异步操作同步"
  ],
  "limitations": [
    "超时限制",
    "文本必须可见"
  ]
}
```

### 📊 工作流管理工具集

#### `report_progress`

```json
{
  "name": "report_progress",
  "description": "报告任务进度并提交代码变更",
  "category": "workflow",
  "parameters": {
    "commitMessage": {
      "type": "string",
      "required": true,
      "description": "简短的单行提交消息"
    },
    "prDescription": {
      "type": "string",
      "required": true,
      "description": "工作完成和剩余情况的描述，使用 markdown 检查列表"
    }
  },
  "capabilities": [
    "进度跟踪",
    "代码提交",
    "PR 描述更新",
    "工作流程管理"
  ],
  "limitations": [
    "需要 Git 仓库",
    "需要网络连接"
  ]
}
```

### 🧠 分析推理工具集

#### `think`

```json
{
  "name": "think",
  "description": "用于复杂推理和头脑风暴的思考工具",
  "category": "analysis",
  "parameters": {
    "thought": {
      "type": "string",
      "required": true,
      "description": "思考内容"
    }
  },
  "capabilities": [
    "复杂推理分析",
    "问题解决策略",
    "头脑风暴",
    "决策支持"
  ],
  "limitations": [
    "不获取新信息",
    "不改变仓库状态"
  ]
}
```

## 🎯 Copilot 核心优势

### 1. **🌐 全面的 GitHub 生态集成**
- 涵盖 GitHub API 的所有核心功能
- 从代码搜索到 Issue/PR 管理的完整工作流
- 支持安全扫描和通知管理

### 2. **🔧 灵活的文件系统操作**
- 统一的文件编辑工具支持多种操作模式
- 精确的字符串替换和行级插入
- 安全的撤销机制

### 3. **⚡ 强大的终端控制能力**
- 支持同步和异步命令执行
- 多会话管理和交互式程序控制
- 完善的输入输出处理

### 4. **🌐 完整的浏览器自动化**
- 基于 Playwright 的现代 Web 自动化
- 支持复杂的用户交互模拟
- 可访问性快照和截图功能

### 5. **📊 智能工作流管理**
- 集成的进度报告和代码提交
- 结构化的任务跟踪
- 自动化的项目管理

### 6. **🧠 AI 驱动的分析能力**
- 内置推理和分析工具
- 智能决策支持
- 问题解决策略生成

## 🔒 安全特性

1. **隔离执行环境** - 沙箱化的命令执行
2. **权限控制** - 基于会话的访问控制
3. **输入验证** - 严格的参数类型检查
4. **操作审计** - 完整的操作日志记录

## 🚀 使用场景

### 开发工作流
- 代码审查和 PR 管理
- Issue 跟踪和项目管理
- 自动化测试和部署

### 代码分析
- 跨仓库代码搜索
- 安全漏洞检测
- 代码质量分析

### 自动化任务
- Web 应用测试
- 数据抓取和处理
- 批量操作执行

### 协作管理
- 团队通知处理
- 任务分配跟踪
- 进度报告生成

## 📈 工具统计

| 工具类别 | 工具数量 | 主要功能 |
|---------|---------|----------|
| GitHub API | 25 | 仓库管理、Issue/PR、安全扫描 |
| 文件系统 | 1 | 文件查看、编辑、创建 |
| 终端执行 | 4 | 命令执行、会话管理 |
| 浏览器自动化 | 6 | Web 交互、截图、表单操作 |
| 工作流管理 | 1 | 进度跟踪、代码提交 |
| 分析推理 | 1 | 智能分析、决策支持 |
| **总计** | **38** | **全栈开发支持** |

## 🎨 工具协议风格

GitHub Copilot 采用混合协议设计：
- **GitHub API 工具**: Model Context Protocol (MCP) 风格
- **文件系统工具**: 统一命令接口
- **终端工具**: 会话管理模式
- **浏览器工具**: Playwright MCP 标准
- **工作流工具**: 结构化参数模式

这种设计确保了各类工具的最佳性能，同时保持了整体架构的一致性和可维护性。