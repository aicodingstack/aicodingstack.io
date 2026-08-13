## answer

Muse Code 是 Meta 以 Muse Spark 1.2 驅動的終端機程式設計 Agent，用於在大型程式碼庫中完成複雜的軟體工程任務。

## introduction

Muse Code 結合主 Agent 與持續運作的背景 Agent。它能規劃變更、編輯程式碼、驗證結果，並將模型呼叫、工具執行、核准與編輯寫入本機僅附加事件紀錄，以便在中斷後準確恢復工作階段。

## capabilities.items.0.title

持續運作的背景 Agent

## capabilities.items.0.description

專門的背景 Agent 會在整個工作階段保持運作，並將有用的發現或後續步驟回報給主 Agent。

## capabilities.items.1.title

可恢復執行

## capabilities.items.1.description

本機僅附加事件紀錄會保存每次模型呼叫、工具執行、核准與編輯，讓執行環境能在故障後重播並繼續工作。

## capabilities.items.2.title

內建規劃技能

## capabilities.items.2.description

內建的 /plan、/grill 與 /goal 技能分別支援需核准的規劃、計畫檢視，以及朝指定目標持續推進。

## faq.items.0.question

Muse Code 是什麼？

## faq.items.0.answer

Muse Code 是 Meta 的終端機程式設計 Agent，用於在大型程式碼庫中規劃、實作並驗證軟體變更。

## faq.items.1.question

Muse Code 使用什麼模型？

## faq.items.1.answer

Muse Code 由 Muse Spark 1.2 驅動，這是 Meta Muse Spark 模型系列針對程式設計任務的更新版本。

## faq.items.2.question

如何安裝並啟動 Muse Code？

## faq.items.2.answer

在 macOS 或 Linux 上執行 Meta 官方安裝命令，然後在終端機中執行 muse 啟動 Agent。

## faq.items.3.question

Muse Code 是開放原始碼嗎？

## faq.items.3.answer

Muse Code 沒有公開原始碼儲存庫或開放原始碼授權，所發佈的 CLI 屬於專有軟體。

## faq.items.4.question

Muse Code 如何恢復中斷的任務？

## faq.items.4.answer

Muse Code 會將模型呼叫、工具執行、核准與編輯寫入本機僅附加事件紀錄，讓執行環境能在故障後重播並繼續工作階段。
