## answer

Muse Code 是 Meta 基于 Muse Spark 1.2 的终端编码 Agent，用于在大型代码库中完成复杂的软件工程任务。

## introduction

Muse Code 将主 Agent 与持续运行的后台 Agent 结合起来。它可以规划变更、编辑代码、验证结果，并将模型调用、工具运行、审批和编辑写入本地只追加事件日志，以便在中断后准确恢复会话。

## capabilities.items.0.title

持续运行的后台 Agent

## capabilities.items.0.description

专门的后台 Agent 会在整个会话期间保持活动，并把有用的发现或后续步骤反馈给主 Agent。

## capabilities.items.1.title

可恢复执行

## capabilities.items.1.description

本地只追加事件日志记录每次模型调用、工具运行、审批和编辑，使运行时能在故障后重放并继续工作。

## capabilities.items.2.title

内置规划技能

## capabilities.items.2.description

内置的 /plan、/grill 和 /goal 技能分别支持需审批的规划、计划审查，以及朝指定目标持续推进。

## faq.items.0.question

Muse Code 是什么？

## faq.items.0.answer

Muse Code 是 Meta 的终端编码 Agent，用于在大型代码库中规划、实施并验证软件变更。

## faq.items.1.question

Muse Code 使用什么模型？

## faq.items.1.answer

Muse Code 由 Muse Spark 1.2 驱动，这是 Meta Muse Spark 模型系列面向编码任务的更新版本。

## faq.items.2.question

如何安装和启动 Muse Code？

## faq.items.2.answer

在 macOS 或 Linux 上运行 Meta 官方安装命令，然后在终端中执行 muse 启动 Agent。

## faq.items.3.question

Muse Code 是开源的吗？

## faq.items.3.answer

Muse Code 没有公开源码仓库或开源许可证，分发的 CLI 属于专有软件。

## faq.items.4.question

Muse Code 如何恢复中断的任务？

## faq.items.4.answer

Muse Code 会把模型调用、工具运行、审批和编辑写入本地只追加事件日志，使运行时能够在故障后重放并继续会话。
