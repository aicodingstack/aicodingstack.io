## answer

Reasonix 是一款原生面向 DeepSeek 的开源终端编码 Agent，重点优化前缀缓存稳定性和可持续运行的本地会话。

## introduction

Reasonix 将 Go 编写的 CLI/TUI 与代码工具、插件和项目上下文结合起来，可连接 DeepSeek 或 OpenAI 兼容端点。它支持 macOS、Windows 和 Linux，使用用户自己的模型凭据，并与桌面应用和编辑器扩展共用同一个本地引擎。

## capabilities.items.0.title

缓存稳定的 Agent 会话

## capabilities.items.0.description

保持系统提示词和工具定义稳定，使兼容的模型服务能够在长时间编码会话中复用前缀缓存。

## capabilities.items.1.title

工具与可配置插件

## capabilities.items.1.description

使用内置工具检查和修改代码仓库，并通过配置与插件调整工作方式，而不是受限于固定交互模式。

## capabilities.items.2.title

跨界面共用本地引擎

## capabilities.items.2.description

可从终端界面、桌面应用或通过 ACP 接入的编辑器扩展使用同一个 Reasonix 引擎。

## faq.items.0.question

Reasonix 是什么？

## faq.items.0.answer

Reasonix 是采用 MIT 许可证的编码 Agent，终端体验围绕 DeepSeek 模型、本地工具和注重缓存效率的多轮会话设计。

## faq.items.1.question

Reasonix 可以使用哪些模型服务？

## faq.items.1.answer

Reasonix 提供面向 DeepSeek 的预设，也能使用用户在本地配置的凭据连接 OpenAI 兼容端点。

## faq.items.2.question

如何开始使用 Reasonix？

## faq.items.2.answer

通过官方软件包渠道安装 CLI，配置所需的模型服务凭据，然后在希望它处理的代码仓库中启动 Reasonix。

## faq.items.3.question

Reasonix 支持哪些操作系统？

## faq.items.3.answer

Reasonix CLI 支持 macOS、Windows 和 Linux，官方文档为各平台提供对应的软件包和二进制文件。

## faq.items.4.question

Reasonix 的许可证和定价方式是什么？

## faq.items.4.answer

Reasonix 是采用 MIT 许可证的开源软件，软件本身免费；实际使用费用取决于所连接的模型服务和账户。
