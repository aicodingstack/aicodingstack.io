## answer

DeepSeek Harnessは、ローカルWeb UIでコーディングエージェントを構築・実行するための、開発者プレビュー段階にあるオープンソースのプラグイン型エージェント基盤です。

## introduction

DeepSeek Harnessはプラグイン中心の設計で、コーディングツール、追跡可能なセッション、設定可能なワークフロー、複数の実行モードを提供します。npmパッケージ@deepseek-ai/dshからローカルで動作し、互換性を損なう変更が入り得る初期の開発者プレビューです。

## capabilities.items.0.title

すべてをプラグイン化

## capabilities.items.0.description

モデル、ツール、コンテキストプロバイダー、権限ポリシー、ユーザーインターフェース、ワークフローを同じプラグインシステムで置き換えたり拡張したりできます。

## capabilities.items.1.title

追跡可能なコーディングセッション

## capabilities.items.1.description

エージェントの操作、ツール呼び出し、コンテキスト、セッション履歴を確認でき、作業を観測しやすくデバッグしやすい状態に保ちます。

## capabilities.items.2.title

複数の実行モード

## capabilities.items.2.description

ローカルWeb UIで実行するほか、同じランタイム上に別のインターフェースやワークフローを構成できます。

## faq.items.0.question

DeepSeek Harnessとは何ですか？

## faq.items.0.answer

DeepSeek Harnessは、交換可能なプラグインからコーディングエージェントを組み立てて実行するDeepSeekのオープンソースランタイムです。

## faq.items.1.question

DeepSeek Harnessは本番環境で使えますか？

## faq.items.1.answer

まだ推奨されません。DeepSeekは開発者プレビューと位置付け、リリース間でインターフェースや動作が変わる可能性を示しています。

## faq.items.2.question

DeepSeek Harnessを起動するには？

## faq.items.2.answer

Node.jsとnpmを用意し、npx @deepseek-ai/dsh webを実行するとローカルWebインターフェースが起動します。

## faq.items.3.question

モデルやツールをカスタマイズできますか？

## faq.items.3.answer

はい。プラグイン設計により、モデル、ツール、コンテキスト、権限、インターフェース、ワークフローを交換または拡張できます。

## faq.items.4.question

DeepSeek Harnessのライセンスは何ですか？

## faq.items.4.answer

DeepSeek HarnessはMITライセンスで公開されているオープンソースソフトウェアです。
