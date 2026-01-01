# Realtime Approval System

Azure Web PubSubを使ったリアルタイム承認システムのデモアプリケーション。

## 機能

- ✅ リアルタイムリクエスト通知
- ✅ 承認/拒否のワンクリック操作
- ✅ リアルタイムステータス更新
- ✅ シンプルで直感的なUI
- ✅ モバイル対応

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **API**: Hono
- **データベース**: Prisma + SQLite
- **リアルタイム通信**: Azure Web PubSub
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Azure Web PubSubの設定

詳細は[AZURE_SETUP.md](./AZURE_SETUP.md)を参照してください。

簡単な手順:
1. [Azure Portal](https://portal.azure.com/)でWeb PubSubリソースを作成
2. 接続文字列をコピー
3. `.env.local`に設定

### 3. 環境変数の設定

`.env.local`ファイルを作成:

```env
# Database
DATABASE_URL="file:./dev.db"

# Azure Web PubSub
AZURE_PUBSUB_CONNECTION_STRING="your_connection_string_here"
AZURE_PUBSUB_HUB_NAME="approval"
```

### 4. データベースのセットアップ

```bash
npm run db:migrate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

### リクエスト送信

1. トップページで「リクエスト送信」をクリック
2. 名前とメッセージを入力
3. 「リクエストを送信」をクリック
4. ステータス画面に自動遷移

### 承認・拒否

1. トップページで「承認者ダッシュボード」をクリック
2. リクエスト一覧が表示される
3. 各リクエストの「承認」または「拒否」をクリック
4. リアルタイムで全ユーザーに通知される

### リアルタイム機能

- 新しいリクエストは承認者ダッシュボードに即座に表示
- ステータス変更は全ユーザーにリアルタイムで通知
- 接続状態は画面右上に表示

## プロジェクト構造

```
realtime-approval/
├── app/
│   ├── api/
│   │   ├── [[...route]]/        # Hono APIルート（CRUD操作）
│   │   └── pubsub/[[...route]]/ # PubSub接続用API
│   ├── request/                 # リクエスト送信ページ
│   ├── admin/                   # 承認者ダッシュボード
│   ├── status/[id]/            # ステータス確認ページ
│   └── page.tsx                # ホームページ
├── hooks/
│   └── usePubSub.ts            # PubSubカスタムフック
├── lib/
│   ├── prisma.ts               # Prismaクライアント
│   └── pubsub.ts               # PubSubヘルパー
├── prisma/
│   └── schema.prisma           # データベーススキーマ
└── AZURE_SETUP.md              # Azure設定ガイド
```

## API エンドポイント

### リクエスト関連

- `POST /api/requests` - 新規リクエスト作成
- `GET /api/requests` - リクエスト一覧取得
- `GET /api/requests/:id` - 特定リクエスト取得
- `PATCH /api/requests/:id` - ステータス更新

### PubSub関連

- `POST /api/pubsub/negotiate` - WebSocket接続用トークン取得

## スクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # リント
npm run db:migrate   # データベースマイグレーション
npm run db:push      # スキーマ変更をプッシュ
npm run db:studio    # Prisma Studio起動
```

## デプロイ

### Vercelへのデプロイ

1. GitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定:
   - `AZURE_PUBSUB_CONNECTION_STRING`
   - `AZURE_PUBSUB_HUB_NAME`
4. デプロイ

注意: SQLiteは本番環境では使用できません。PostgreSQLなどに変更が必要です。

## 学習ポイント

このプロジェクトから学べること:

1. **Azure Web PubSubの基本**
   - WebSocket接続の確立
   - グループへの参加
   - メッセージの送受信

2. **リアルタイム通信パターン**
   - サーバーからクライアントへの通知
   - グループ単位のメッセージング

3. **Next.js App Router**
   - Server ComponentsとClient Components
   - API Routesの実装

4. **Honoの使い方**
   - Next.jsとの統合
   - RESTful API設計

## トラブルシューティング

### リアルタイム通知が届かない

- Azure PubSubの接続文字列が正しいか確認
- ブラウザのコンソールでWebSocket接続エラーを確認
- ネットワーク設定でWebSocketが許可されているか確認

### データベースエラー

```bash
# データベースをリセット
rm dev.db
npm run db:migrate
```

## ライセンス

MIT

## 作成日

2026年1月1日
