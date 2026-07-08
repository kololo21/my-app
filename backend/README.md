# 家計簿アプリ バックエンド

Express + TypeScript + Prisma による三層構成(Presentation / Application / Data)のバックエンド。

```
src/
  presentation/   … ルーティング・コントローラ(HTTPの入出力)
  application/    … サービス・DTO/バリデーション(ビジネスロジック)
  data/           … Prismaクライアント・リポジトリ(DBアクセス)
  app.ts          … Expressアプリ組み立て
  server.ts       … エントリーポイント
prisma/
  schema.prisma   … データモデル定義
  seed.ts         … カテゴリ・支払い方法の初期データ投入
```

## セットアップ手順

PostgreSQLが必要（ローカル開発・本番共通）。Renderの無料PostgreSQLをローカル開発でもそのまま使うか、
自前のローカルPostgresを用意する。

```bash
cd backend
npm install
cp .env.example .env
# .env の DATABASE_URL を実際のPostgreSQL接続文字列に書き換える

# DBスキーマ反映 (マイグレーション履歴を持たずスキーマを直接同期)
npm run prisma:push

# カテゴリ・支払い方法・ユーザー(自分/父/母/共通)の初期データ投入
npm run prisma:seed

# 開発サーバー起動 (http://localhost:4000)
npm run dev
```

## 動作確認 (POST /transactions)

```bash
curl -X POST http://localhost:4000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1200,
    "date": "2026-07-01",
    "type": "EXPENSE",
    "memo": "スーパーで食材購入",
    "categoryId": "<seed後にCategoryテーブルから取得したID>",
    "paymentMethodId": "<seed後にPaymentMethodテーブルから取得したIDまたは名前>",
    "userId": "<Userテーブルに作成したID>"
  }'
```

ユーザーは現時点で作成APIがないため、`npx prisma studio` から手動で1件作成するか、
別途 `POST /users` を実装するまでは動作確認用に直接DBへ挿入してください。

## 実装済み

- `schema.prisma`: User / Group / Transaction / Category / PaymentMethod / Subscription / SavingGoal / Tag / TransactionTag
- `POST /transactions`: zodによるバリデーション + Prisma経由のDB保存
- `GET /transactions`: userId / groupId / categoryId / paymentMethodId / type / tagId / dateFrom / dateTo でのフィルタと、page / pageSize によるページネーション付き一覧取得
- `DELETE /transactions/:id`: 指定IDの取引を削除。存在しない場合は404、成功時は204
- `GET /analysis/summary`: userId / groupId / type / dateFrom / dateTo で絞り込んだ上での、カテゴリ別・支払い方法別の集計（合計金額・件数）と全体合計

### GET /transactions の使用例

```bash
curl "http://localhost:4000/transactions?userId=<userId>&type=EXPENSE&dateFrom=2026-06-01&dateTo=2026-06-30&page=1&pageSize=20"
```

レスポンス:

```json
{
  "success": true,
  "transactions": [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 }
}
```

## 補足: enum

`Transaction.type` と `Subscription.period` はスキーマ上 `String` で保持している（元々SQLite向けの設計の名残）。
値の妥当性は `src/common/enums.ts` の定数とzod（`transaction.dto.ts`）でアプリケーション層にて検証する。
ネイティブenumへの移行は今後の任意対応。

### DELETE /transactions/:id の使用例

```bash
curl -X DELETE http://localhost:4000/transactions/<transactionのid>
# 成功: 204 No Content
# 存在しないid: 404 { "success": false, "error": "指定された取引が見つかりません。" }
```

### GET /analysis/summary の使用例

```bash
curl "http://localhost:4000/analysis/summary?userId=<userId>&dateFrom=2026-06-01&dateTo=2026-06-30"
```

レスポンス:

```json
{
  "success": true,
  "overall": { "totalAmount": 12000, "count": 5 },
  "byCategory": [
    { "categoryId": "...", "categoryName": "食費", "totalAmount": 8000, "count": 3 }
  ],
  "byPaymentMethod": [
    { "paymentMethodId": "...", "paymentMethodName": "現金", "totalAmount": 5000, "count": 2 }
  ]
}
```

## 実装済み(追加分)

- `POST /ocr/receipt`, `POST /ocr/barcode`: レシートOCR・バーコード価格予測(Gemini、APIキー未設定時はモック応答)
- `POST /coaching`: AI貯金コーチング(Gemini、APIキー未設定時はモック応答)
- `GET /categories`, `GET /payment-methods`, `GET /users`: フロントエンドのname⇄id変換用マスタ取得

## 未実装 (次のステップ)

- `GET /analysis/forecast`
- `GET /saving-goals`、`Subscription`/`SavingGoal`のDB永続化（現状フロントエンドのlocalStorageのまま）
- User/Group作成API（現状は`prisma/seed.ts`で自分/父/母/共通の4ユーザーを固定シードする暫定対応。認証機能はまだ無い）
