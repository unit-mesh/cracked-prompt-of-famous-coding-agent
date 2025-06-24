# 🛠️ Augment Agent 工具能力参考

## 📁 文件系统工具

### 1. view
**描述**: 查看文件和目录内容，支持正则搜索
**参数**:
- `path` (string): 文件或目录路径（相对于工作区根目录）
- `type` (enum): "file" | "directory" 
- `search_query_regex` (string, 可选): 正则表达式搜索模式
- `case_sensitive` (boolean, 可选): 是否区分大小写，默认false
- `context_lines_before` (integer, 可选): 匹配前显示行数，默认5
- `context_lines_after` (integer, 可选): 匹配后显示行数，默认5
- `view_range` (array, 可选): 行号范围 [start, end]，如 [501, 1000]

**使用场景**:
- 查看文件内容进行代码分析
- 列出目录结构进行项目探索
- 使用正则搜索查找特定代码模式
- 查看大文件的特定行范围

### 2. str-replace-editor
**描述**: 精确的字符串替换和插入编辑工具
**参数**:
- `command` (enum): "str_replace" | "insert"
- `path` (string): 文件路径
- `instruction_reminder` (string): 固定值 "ALWAYS BREAK DOWN EDITS INTO SMALLER CHUNKS OF AT MOST 150 LINES EACH."

**str_replace 模式参数**:
- `old_str_1` (string): 要替换的原始字符串
- `new_str_1` (string): 新字符串内容
- `old_str_start_line_number_1` (integer): 原始字符串起始行号
- `old_str_end_line_number_1` (integer): 原始字符串结束行号

**insert 模式参数**:
- `insert_line_1` (integer): 插入位置行号（0表示文件开头）
- `new_str_1` (string): 要插入的内容

**使用场景**:
- 精确修改代码文件
- 批量替换多个位置
- 在特定位置插入新代码

### 3. save-file
**描述**: 创建新文件
**参数**:
- `instructions_reminder` (string): 固定值 "LIMIT THE FILE CONTENT TO AT MOST 300 LINES..."
- `path` (string): 文件路径
- `file_content` (string): 文件内容
- `add_last_line_newline` (boolean, 可选): 是否在文件末尾添加换行符，默认true

**使用场景**:
- 创建新的代码文件
- 生成配置文件
- 创建文档和说明文件

### 4. remove-files
**描述**: 安全删除文件（支持批量操作）
**参数**:
- `file_paths` (array): 要删除的文件路径数组

**使用场景**:
- 清理临时文件
- 删除不需要的代码文件
- 批量清理操作

## 🔍 代码搜索工具

### 5. codebase-retrieval
**描述**: AI驱动的语义代码搜索，理解意图而非仅匹配关键词
**参数**:
- `information_request` (string): 自然语言描述的搜索需求

**使用场景**:
- 查找相关功能代码
- 理解代码库结构
- 寻找特定实现模式
- 当不知道确切文件名或函数名时使用

## 🖥️ 进程管理工具

### 6. launch-process
**描述**: 启动新进程执行shell命令
**参数**:
- `command` (string): 要执行的shell命令
- `cwd` (string): 工作目录绝对路径
- `wait` (boolean): 是否等待进程完成
- `max_wait_seconds` (number): 最大等待时间（秒）

**使用场景**:
- 启动开发服务器（wait=false）
- 执行构建任务（wait=true）
- 运行测试命令
- 启动长期运行的后台进程

### 7. read-process
**描述**: 读取终端输出
**参数**:
- `terminal_id` (integer): 终端ID
- `wait` (boolean): 是否等待进程完成
- `max_wait_seconds` (number): 最大等待时间

**使用场景**:
- 监控进程输出
- 获取命令执行结果
- 检查进程状态

### 8. write-process
**描述**: 向终端写入输入
**参数**:
- `terminal_id` (integer): 终端ID
- `input_text` (string): 要写入的文本

**使用场景**:
- 与交互式程序通信
- 发送命令到运行中的进程
- 控制交互式shell

### 9. kill-process
**描述**: 终止进程
**参数**:
- `terminal_id` (integer): 要终止的终端ID

**使用场景**:
- 停止失控的进程
- 清理后台任务
- 重启服务

### 10. list-processes
**描述**: 列出所有已知终端及其状态
**参数**: 无

**使用场景**:
- 查看当前运行的进程
- 管理多个终端会话
- 调试进程问题

## 🌐 网络工具

### 11. web-search
**描述**: 使用Google自定义搜索API搜索网络信息
**参数**:
- `query` (string): 搜索查询
- `num_results` (integer, 可选): 返回结果数量，默认5，最大10

**使用场景**:
- 查找技术文档
- 搜索错误解决方案
- 获取最新技术信息

### 12. web-fetch
**描述**: 获取网页内容并转换为Markdown格式
**参数**:
- `url` (string): 要获取的URL

**使用场景**:
- 获取文档内容
- 抓取技术文章
- 分析网页信息

## 🔧 GitHub集成工具

### 13. github-api
**描述**: 执行GitHub API调用
**参数**:
- `path` (string): GitHub API路径
- `method` (enum, 可选): "GET" | "POST" | "PATCH" | "PUT"，默认GET
- `data` (object, 可选): 请求数据
- `details` (boolean, 可选): 是否返回详细信息，默认false
- `summary` (string, 可选): API调用的简短描述

**使用场景**:
- 管理GitHub仓库
- 处理Issues和PRs
- 获取提交信息
- 管理GitHub Actions

## 📊 可视化工具

### 14. render-mermaid
**描述**: 渲染Mermaid图表
**参数**:
- `diagram_definition` (string): Mermaid图表定义代码
- `title` (string, 可选): 图表标题，默认"Mermaid Diagram"

**使用场景**:
- 创建流程图
- 绘制架构图
- 可视化数据关系
- 生成文档图表

## 🧠 记忆工具

### 15. remember (概念性工具)
**描述**: 长期记忆和上下文保持
**参数**:
- `information` (string): 要记住的信息
- `context` (string, 可选): 上下文标识

**使用场景**:
- 保存用户偏好
- 记录项目模式
- 维护长期上下文

## 🔍 诊断工具

### 16. diagnostics (概念性工具)
**描述**: 获取IDE诊断信息（错误、警告、类型问题）
**参数**:
- `paths` (array): 要检查的文件路径数组
- `severity` (enum, 可选): "error" | "warning" | "info"

**使用场景**:
- 代码质量检查
- 错误检测
- 类型检查验证
- 代码修改后的验证

## 📋 工具使用最佳实践

### 工具组合模式
1. **代码分析流程**: codebase-retrieval → view → diagnostics
2. **文件编辑流程**: view → str-replace-editor → diagnostics  
3. **进程调试流程**: launch-process → read-process → write-process → kill-process
4. **问题解决流程**: diagnostics → codebase-retrieval → web-search → str-replace-editor

### 参数设置建议
- **大文件处理**: 使用 view 的 view_range 参数限制行数
- **精确编辑**: str-replace-editor 使用行号范围避免歧义
- **进程管理**: 长期任务使用 wait=false，短期任务使用 wait=true
- **搜索优化**: 使用自然语言描述进行 codebase-retrieval

### 错误处理策略
- 文件不存在 → 使用 codebase-retrieval 查找
- 权限错误 → 检查文件权限或使用 diagnostics
- 进程超时 → 使用 kill-process 终止并重启
- 语法错误 → 使用 view 查看代码并 web-search 解决方案
