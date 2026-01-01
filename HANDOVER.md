# プロジェクト引き継ぎ資料

## プロジェクト概要

**プロジェクト名**: Realtime Approval System  
**目的**: Azure Web PubSubを使ったリアルタイム承認システムの学習  
**作成日**: 2026年1月1日  
**現在のステータス**: 基本実装完了、Azure設定待ち

## ビジネス要件

### 背景
- 本業でWeb会議システムの入室許可承認システムにAzure PubSubを使用
- 類似の承認フローを持つシステムで学習したい
- リアルタイム通知の仕組みを理解したい

### システムフロー
1. ユーザーが名前とメッセージを入力してリクエスト送信
2. 承認者にリアルタイムで通知
3. 承認者が「承認」または「拒否」をクリック
4. 結果がリアルタイムで全ユーザーに通知

### 仕様決定事項
- **リクエスト内容**: 名前とメッセージのみ（シンプル）
- **承認フロー**: 1段階承認（承認者1人）
- **コメント**: なし（ボタンのみ）
- **API**: Hono使用（Next.js API Routes内で実装）
- **デプロイ先**: Vercel

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks** (カスタムフック: usePubSub)

### バックエンド
- **Hono** (API Routes実装)
- **Prisma** (ORM)
- **SQLite** (開発環境、本番はPostgreSQL推奨)
- **Zod** (バリデーション)

### インフラ・サービス
- **Azure Web PubSub** (リアルタイム通信)
- **Vercel** (デプロイ予定)

## プロジェクト構造

```
/Users/rikit/achievement/realtime-approval/
├── app/
│   ├── page.tsx                      # ホームページ（ランディング）
│   ├── layout.tsx                    # ルートレイアウト
│   ├── globals.css                   # グローバルスタイル
│   ├── request/
│   │   └── page.tsx                  # リクエスト送信画面
│   ├── admin/
│   │   └── page.tsx                  # 承認者ダッシュボード
│   ├── status/
│   │   └── [id]/
│   │       └── page.tsx              # ステータス確認画面
│   └── api/
│       ├── [[...route]]/
│       │   └── route.ts              # Hono API (CRUD操作)
│       └── pubsub/
│           └── [[...route]]/
│               └── route.ts          # PubSub接続用API
├── hooks/
│   └── usePubSub.ts                  # PubSubカスタムフック
├── lib/
│   ├── prisma.ts                     # Prismaクライアント
│   └── pubsub.ts                     # PubSubヘルパー関数
├── prisma/
│   ├── schema.prisma                 # データベーススキーマ
│   └── migrations/                   # マイグレーションファイル
├── .env.local                        # 環境変数（gitignore済み）
├── prisma.config.ts                  # Prisma 7系の設定ファイル
├── package.json                      # 依存関係
├── tsconfig.json                     # TypeScript設定
├── tailwind.config.ts                # Tailwind設定
├── README.md                         # プロジェクトドキュメント
├── AZURE_SETUP.md                    # Azure設定ガイド
└── HANDOVER.md                       # この引き継ぎ資料
```

## データベース設計

### Requestモデル
```prisma
model Request {
  id        String   @id @default(cuid())
  name      String
  message   String
  status    String   @default("pending")  // pending, approved, rejected
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- シンプルな1テーブル構成
- ユーザー管理は実装していない（名前入力のみ）

## API設計

### エンドポイント一覧

#### リクエスト管理（/api/requests）
- **POST /api/requests** - 新規リクエスト作成
  - Body: `{ name: string, message: string }`
  - Response: Request オブジェクト
  - 処理: DBに保存 → PubSubで`admins`グループに通知

- **GET /api/requests** - リクエスト一覧取得
  - Response: Request[] (作成日時降順)

- **GET /api/requests/:id** - 特定リクエスト取得
  - Response: Request オブジェクト

- **PATCH /api/requests/:id** - ステータス更新
  - Body: `{ status: "approved" | "rejected" }`
  - Response: Request オブジェクト
  - 処理: DBを更新 → PubSubで`users`グループに通知

#### PubSub接続（/api/pubsub）
- **POST /api/pubsub/negotiate** - WebSocket接続用トークン取得
  - Body: `{ userId?: string }`
  - Response: `{ url: string, userId: string }`

## リアルタイム通信の仕組み

### グループ構成
- **admins**: 承認者が参加（新規リクエストを受信）
- **users**: 全ユーザーが参加（ステータス更新を受信）

### メッセージタイプ
```typescript
{
  type: 'new_request' | 'status_update',
  data: Request
}
```

### フロー
1. クライアントが `/api/pubsub/negotiate` でトークン取得
2. `WebPubSubClient` でWebSocket接続確立
3. 該当グループに参加（`joinGroup`）
4. サーバーが `sendToGroup` でメッセージ送信
5. クライアントが `group-message` イベントで受信

## 現在の実装状況

### ✅ 完了している項目
1. Next.jsプロジェクトセットアップ
2. 必要なパッケージのインストール
3. Prismaのセットアップとマイグレーション
4. 環境変数設定ファイル（.env.local）作成
5. Hono API Routes実装（CRUD操作）
6. Azure PubSub統合コード
7. フロントエンド画面（4画面）
   - ホームページ
   - リクエスト送信画面
   - 承認者ダッシュボード
   - ステータス確認画面
8. usePubSubカスタムフック
9. ドキュメント（README.md, AZURE_SETUP.md）

### ⚠️ 未完了・要対応項目

#### 1. Azure Web PubSubリソースの作成（最重要）
**現在の状態**: `.env.local`に仮の値が設定されている
```env
AZURE_PUBSUB_CONNECTION_STRING="your_connection_string_here"
```

**対応方法**: 
- [AZURE_SETUP.md](./AZURE_SETUP.md) に詳細な手順を記載済み
- Azure Portalで無料のFreeプランで作成可能
- 接続文字列を取得して`.env.local`に設定

#### 2. 動作確認
- 開発サーバーを起動してエラーがないか確認
- リアルタイム通知が正しく動作するかテスト
- 複数ブラウザタブでの同時動作確認

#### 3. エラーハンドリング強化
- PubSub接続失敗時の再接続ロジック
- ネットワークエラー時のユーザーフィードバック
- バリデーションエラーの詳細表示

#### 4. 本番環境対応（Vercel）
- SQLiteからPostgreSQLへの移行
- 環境変数の設定
- ビルドエラーの対応

## インストール済みパッケージ

### 主要パッケージ
```json
{
  "@azure/web-pubsub": "^1.2.0",
  "@azure/web-pubsub-client": "^1.0.9",
  "@azure/web-pubsub-express": "^1.0.6",
  "@prisma/client": "^7.2.0",
  "hono": "^4.11.3",
  "next": "16.1.1",
  "prisma": "^7.2.0",
  "react": "19.2.3",
  "zod": "^4.3.4"
}
```

## 注意点・ハマりポイント

### 1. Prisma 7系の設定
- `prisma.config.ts`ファイルが必要
- `schema.prisma`の`datasource`に`url`を書かない（新仕様）
- 接続文字列は`prisma.config.ts`で設定

### 2. Hono + Next.js統合
- `handle` を使って Next.js API Routesとして実装
- `export const runtime = 'nodejs'` が必要
- Vercelでは`GET`, `POST`, `PATCH`をそれぞれエクスポート

### 3. Azure Web PubSub Client
- `@azure/web-pubsub-client` パッケージを使用
- クライアントサイドでの接続確立が必要
- `'use client'` ディレクティブ必須

### 4. リアルタイム状態管理
- `usePubSub` フックで接続状態とメッセージを管理
- `useEffect`でメッセージを監視して状態更新
- グループは配列で複数指定可能

## 次のステップ（優先順位順）

### 1. Azure Web PubSubの設定 【最優先】
```bash
# AZURE_SETUP.mdの手順に従って実施
1. Azure Portalでリソース作成
2. 接続文字列を取得
3. .env.localに設定
```

### 2. 開発サーバーの起動と動作確認
```bash
npm run dev
# http://localhost:3000 にアクセス
```

### 3. 機能テスト
- [ ] リクエスト送信が成功するか
- [ ] 承認者ダッシュボードにリアルタイム表示されるか
- [ ] 承認/拒否が正しく動作するか
- [ ] ステータス画面がリアルタイム更新されるか

### 4. エラー対応
- コンソールのエラーを確認
- ネットワークタブでAPI呼び出しを確認
- WebSocket接続状態を確認

### 5. 機能拡張（オプション）
- コメント機能の追加
- 複数承認者対応
- 承認履歴の表示
- 通知音の追加
- メール通知

## トラブルシューティング

### PubSub接続エラー
```
Failed to connect to PubSub
```
**原因**: 接続文字列が未設定または不正  
**対応**: `.env.local`の`AZURE_PUBSUB_CONNECTION_STRING`を確認

### Prismaエラー
```
Error: Prisma schema validation failed
```
**原因**: Prisma 7系の設定不備  
**対応**: `prisma.config.ts`と`schema.prisma`の整合性確認

### Honoのルーティングエラー
```
404 Not Found
```
**原因**: `[[...route]]`のパス設定ミス  
**対応**: `/api/requests`や`/api/pubsub/negotiate`のパスを確認

## 参考リンク

- [Azure Web PubSub ドキュメント](https://learn.microsoft.com/ja-jp/azure/azure-web-pubsub/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Hono ドキュメント](https://hono.dev/)
- [Prisma 7 リリースノート](https://www.prisma.io/docs/orm/more/releases)

## 質問リスト（次のCopilotへ）

1. Azure Web PubSubの設定が必要ですか？それとも別のリアルタイム通信手段を使いますか？
2. Vercelへのデプロイを行いますか？その場合、PostgreSQLの設定が必要です
3. 機能追加の要望はありますか？
4. セキュリティ強化（認証機能など）は必要ですか？

## プロジェクト引き継ぎチェックリスト

- [x] プロジェクト構造の説明
- [x] 技術スタックの説明
- [x] データベース設計の説明
- [x] API設計の説明
- [x] 実装済み機能の確認
- [x] 未完了項目の明記
- [x] 注意点の記載
- [x] 次のステップの提示
- [x] トラブルシューティング情報

## 最後に

このプロジェクトは基本的な実装は完了していますが、**Azure Web PubSubリソースの作成が必須**です。無料プランで作成できるので、[AZURE_SETUP.md](./AZURE_SETUP.md)を参照して設定してください。

設定が完了すれば、すぐにリアルタイム承認システムとして動作します。本業のWeb会議システムと同じ承認パターンなので、良い学習材料になるはずです。

何か不明点があれば、このドキュメントとREADME.md、AZURE_SETUP.mdを参照してください。

---

**作成者**: GitHub Copilot  
**作成日**: 2026年1月1日  
**プロジェクトパス**: `/Users/rikit/achievement/realtime-approval/`
