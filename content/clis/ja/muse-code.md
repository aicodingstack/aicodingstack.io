## answer

Muse CodeはMuse Spark 1.2を搭載したMetaのターミナル向けコーディングエージェントで、大規模リポジトリの複雑なソフトウェア開発タスクを実行します。

## introduction

Muse Codeはメインエージェントと常駐バックグラウンドエージェントを組み合わせます。変更の計画、コード編集、結果検証を行い、モデル呼び出し、ツール実行、承認、編集をローカルの追記専用イベントログに記録するため、中断後もセッションを再開できます。

## capabilities.items.0.title

常駐バックグラウンドエージェント

## capabilities.items.0.description

専門化されたバックグラウンドエージェントがセッション中ずっと稼働し、有用な調査結果や次の手順をメインエージェントへ報告します。

## capabilities.items.1.title

再開可能な実行

## capabilities.items.1.description

ローカルの追記専用イベントログにモデル呼び出し、ツール実行、承認、編集を記録し、障害後に処理を再現して再開できます。

## capabilities.items.2.title

組み込みの計画スキル

## capabilities.items.2.description

/plan、/grill、/goalスキルが、承認付きの計画作成、計画の検証、指定目標に向けた継続的な作業を支援します。

## faq.items.0.question

Muse Codeとは何ですか？

## faq.items.0.answer

Muse Codeは、大規模リポジトリのソフトウェア変更を計画、実装、検証するMetaのターミナル向けコーディングエージェントです。

## faq.items.1.question

Muse Codeを動かすモデルは何ですか？

## faq.items.1.answer

Muse Codeは、MetaのMuse Sparkモデルファミリーをコーディング向けに更新したMuse Spark 1.2を搭載しています。

## faq.items.2.question

Muse Codeをインストールして起動する方法は？

## faq.items.2.answer

macOSまたはLinuxでMeta公式のインストールコマンドを実行し、ターミナルからmuseでエージェントを起動します。

## faq.items.3.question

Muse Codeはオープンソースですか？

## faq.items.3.answer

Muse Codeには公開ソースリポジトリやオープンソースライセンスが提供されていません。配布されるCLIはプロプライエタリソフトウェアです。

## faq.items.4.question

Muse Codeは中断した作業をどのように再開しますか？

## faq.items.4.answer

Muse Codeはモデル呼び出し、ツール実行、承認、編集をローカルの追記専用イベントログに保存し、障害後にセッションを再現して再開できるようにします。
