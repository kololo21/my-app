## Imported Claude Cowork project instructions

「これから家計簿アプリの開発を始めます。すでに設計の壁打ちは終わっており、詳細な仕様書があります。まずはこの設計を読み込んで、開発の全体像を把握してください。準備ができたら教えてください。その後に実装を依頼します。」


# 多機能家計簿アプリ 設計仕様書

## 1. プロジェクト概要
個人およびグループ（家族・パートナー）で利用可能な、高度な家計簿・資産管理アプリを構築する。

## 2. 技術スタック
- **Frontend**: React / TypeScript (UI, グラフ表示)
- **Backend**: Node.js / Express (TypeScript)
- **Database**: PostgreSQL または SQLite (Prisma ORM 使用)
- **Architecture**: 三層構成 (Presentation / Application / Data)

## 3. データモデル (Prisma Schema 案)
以下のエンティティを定義する：
- **User / Group**: ユーザー管理と共有グループ
- **Transaction**: 収支記録（amount, date, type[支出/収入/NISA], category_id, payment_method_id, user_id, group_id）
- **Category / PaymentMethod**: 支出の分類と支払い手段（カード、現金等）
- **Subscription**: 定期支払いのルール設定
- **SavingGoal**: 貯金目標と達成状況
- **Tag / TransactionTag**: 支出への自由なタグ付け（多対多）

## 4. 主要な API エンドポイント
### 収支管理
- `POST /transactions`: 記録の登録
- `GET /transactions`: 履歴の一覧（フィルタ機能付き）
- `DELETE /transactions/:id`: 記録の削除
### 分析・予測
- `GET /analysis/summary`: カテゴリ別・支払い方法別の集計
- `GET /analysis/forecast`: 過去データに基づく将来の収支推移予測
### 特殊機能
- `POST /ocr/receipt`: レシート画像解析結果の取得
- `GET /saving-goals`: 目標達成状況の取得

## 5. 実装への指示
まずは、上記のデータモデルを反映した Prisma のスキーマファイル（schema.prisma）と、バックエンドの初期構造（Express + TypeScript）を作成してください。
また、最初に `POST /transactions` の実装から着手し、バリデーションとデータベース保存ができるようにしてください。
