<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 多機能家計簿アプリ

フロントエンド(React + Vite)とバックエンド(Express + TypeScript + Prisma、`backend/`)からなる家計簿アプリ。

## ローカル実行

**前提**: Node.js (v22系)、PostgreSQL（詳細は [backend/README.md](backend/README.md) 参照）

1. 依存関係をインストール:
   ```
   npm install
   cd backend && npm install && cd ..
   ```
2. `backend/.env` の `DATABASE_URL` を実際のPostgreSQL接続文字列に設定し、`npm run prisma:push && npm run prisma:seed --prefix backend` でスキーマ反映・初期データ投入する。
3. （任意）`backend/.env` の `GEMINI_API_KEY` にGemini APIキーを設定するとレシートOCR・バーコード予測・AIコーチングが本物のAI応答になる。未設定でもモック応答で動作する。
4. フロントエンド・バックエンドを同時に起動:
   ```
   npm start
   ```
   ブラウザで表示されたViteのURL（既定 http://localhost:5173）にアクセスする。

フロントエンドのみを起動したい場合は `npm run dev` を使う（この場合 `backend` は別途 `npm run dev --prefix backend` で起動する必要がある）。

## Renderへのデプロイ

`backend/`をWeb Service、ルートをStatic Siteとして別々にデプロイする。詳細な手順はチャットでの案内を参照。
概要:
- PostgreSQL: Renderの無料PostgreSQLを作成し、`DATABASE_URL`をバックエンドの環境変数に設定
- バックエンド(Web Service): Root Directory `backend`、Build Command `npm install && npm run build`、Start Command `npm start`
- フロントエンド(Static Site): Root Directory `.`（リポジトリ直下）、Build Command `npm install && npm run build`、Publish Directory `dist`、環境変数 `VITE_API_BASE_URL` にバックエンドのURLを設定
