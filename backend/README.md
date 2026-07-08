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

```bash
cd backend
npm install
cp .env.example .env

# DBスキーマ反映 (SQLiteのdev.dbを作成)
npx prisma migrate dev --name init

# カテゴリ・支払い方法の初期データ投入
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

## 補足: SQLiteとenum

SQLiteコネクタはPrismaのネイティブenumをサポートしないため、`Transaction.type` と
`Subscription.period` はスキーマ上 `String` で保持している。値の妥当性は
`src/common/enums.ts` の定数とzod（`transaction.dto.ts`）でアプリケーション層にて検証する。
将来PostgreSQLへ切り替える場合は、ネイティブenumへの移行を検討してよい。

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

## 未実装 (次のステップ)

- `GET /analysis/forecast`
- `POST /ocr/receipt`（既存のプロトタイプ `server.ts` の `/api/scan-receipt` をこちらに統合予定）
- `GET /saving-goals`
- User/Group作成API（今のところPOST /transactionsはuserId/categoryId/paymentMethodIdが事前に存在する前提）
