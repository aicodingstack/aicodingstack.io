## answer

DeepSeek Harness 是一款处于开发者预览阶段的开源插件化 Agent Harness，可通过本地 Web UI 构建和运行编码 Agent。

## introduction

DeepSeek Harness 采用插件优先架构，提供编码工具、可追踪会话、可配置工作流和多种运行模式。它通过 @deepseek-ai/dsh npm 软件包在本地运行，目前仍属早期开发者预览，后续版本可能包含破坏性变更。

## capabilities.items.0.title

一切皆插件

## capabilities.items.0.description

通过统一的插件系统替换或扩展模型、工具、上下文提供器、权限策略、用户界面和工作流。

## capabilities.items.1.title

可追踪的编码会话

## capabilities.items.1.description

检查 Agent 操作、工具调用、上下文和会话历史，使编码过程保持可观测并更易调试。

## capabilities.items.2.title

多种运行模式

## capabilities.items.2.description

既可使用本地 Web UI 运行 Harness，也可在同一运行时之上组合其他界面和工作流。

## faq.items.0.question

DeepSeek Harness 是什么？

## faq.items.0.answer

DeepSeek Harness 是 DeepSeek 推出的开源运行时，用于通过可互换插件组装和运行编码 Agent。

## faq.items.1.question

DeepSeek Harness 可以用于生产环境了吗？

## faq.items.1.answer

还不可以。DeepSeek 将其标为开发者预览，并提示不同版本之间的接口和行为可能发生变化。

## faq.items.2.question

如何启动 DeepSeek Harness？

## faq.items.2.answer

准备好 Node.js 和 npm 后，运行 npx @deepseek-ai/dsh web 即可启动本地 Web 界面。

## faq.items.3.question

可以自定义模型和工具吗？

## faq.items.3.answer

可以。其插件架构让模型、工具、上下文、权限、界面和工作流都能够被替换或扩展。

## faq.items.4.question

DeepSeek Harness 使用什么许可证？

## faq.items.4.answer

DeepSeek Harness 是采用 MIT 许可证发布的开源软件。
