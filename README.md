<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 多機能家計簿アプリ

フロントエンド(React + Vite)とバックエンド(Express + TypeScript + Prisma、`backend/`)からなる家計簿アプリ。

## ローカル実行

**前提**: Node.js (v22系)

1. 依存関係をインストール:
   ```
   npm install
   cd backend && npm install && cd ..
   ```
2. （任意）`backend/.env` の `GEMINI_API_KEY` にGemini APIキーを設定するとレシートOCR・バーコード予測・AIコーチングが本物のAI応答になる。未設定でもモック応答で動作する。
3. フロントエンド・バックエンドを同時に起動:
   ```
   npm start
   ```
   ブラウザで表示されたViteのURL（既定 http://localhost:5173）にアクセスする。

フロントエンドのみを起動したい場合は `npm run dev` を使う（この場合 `backend` は別途 `npm run dev --prefix backend` で起動する必要がある）。
