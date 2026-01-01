# Azure Web PubSubセットアップガイド

このガイドでは、Azure Web PubSubリソースの作成と設定方法を説明します。

## 前提条件

- Azureアカウント（無料アカウントでも可能）
- Azure CLI（オプション）

## 手順1: Azure ポータルにログイン

1. [Azure Portal](https://portal.azure.com/)にアクセス
2. Azureアカウントでログイン

## 手順2: Web PubSubリソースの作成

### ポータルから作成（推奨）

1. **リソースの作成**
   - 左上の「リソースの作成」をクリック
   - 検索ボックスに「Web PubSub」と入力
   - 「Azure Web PubSub Service」を選択
   - 「作成」をクリック

2. **基本設定**
   - **サブスクリプション**: 使用するサブスクリプションを選択
   - **リソースグループ**: 新規作成または既存のものを選択（例: `realtime-approval-rg`）
   - **リソース名**: 一意の名前を入力（例: `realtime-approval-pubsub`）
   - **場所**: 最寄りのリージョンを選択（例: `Japan East`）
   - **価格レベル**: 
     - 開発/テスト: `Free` （1日20ユニット、同時接続数20）
     - 本番環境: `Standard` （必要に応じて）

3. **確認と作成**
   - 「確認および作成」をクリック
   - 検証が完了したら「作成」をクリック
   - デプロイが完了するまで数分待つ

### Azure CLIから作成（代替方法）

```bash
# リソースグループの作成
az group create --name realtime-approval-rg --location japaneast

# Web PubSubリソースの作成
az webpubsub create \
  --name realtime-approval-pubsub \
  --resource-group realtime-approval-rg \
  --location japaneast \
  --sku Free_F1
```

## 手順3: 接続文字列の取得

1. **リソースに移動**
   - デプロイが完了したら「リソースに移動」をクリック
   - または、検索バーでリソース名を検索

2. **接続文字列をコピー**
   - 左メニューの「キー」または「Keys」をクリック
   - **接続文字列（Connection String）** をコピー
   - 形式: `Endpoint=https://...;AccessKey=...;Version=1.0;`

## 手順4: プロジェクトに設定

1. `.env.local`ファイルを開く
2. 接続文字列を設定:

```env
AZURE_PUBSUB_CONNECTION_STRING="Endpoint=https://realtime-approval-pubsub.webpubsub.azure.com;AccessKey=YOUR_ACCESS_KEY;Version=1.0;"
AZURE_PUBSUB_HUB_NAME="approval"
```

⚠️ **注意**: `.env.local`は`.gitignore`に含まれていることを確認してください。

## 手順5: 動作確認

1. 開発サーバーを起動:
```bash
npm run dev
```

2. ブラウザで `http://localhost:3000` を開く
3. リクエストを送信して、リアルタイム通知が動作することを確認

## トラブルシューティング

### 接続エラーが発生する場合

1. **接続文字列が正しいか確認**
   - `Endpoint`, `AccessKey`, `Version`が含まれているか
   - 余計な空白や改行がないか

2. **リソースが有効か確認**
   - Azureポータルでリソースのステータスを確認
   - 「概要」ページで「状態」が「実行中」になっているか

3. **ネットワーク設定**
   - ファイアウォールやVPNが接続をブロックしていないか
   - 「ネットワーク」設定で「すべてのネットワーク」が許可されているか

### Free tierの制限

- **同時接続数**: 最大20接続
- **メッセージ数**: 1日あたり20,000メッセージ
- **帯域幅**: 1日あたり20MB

開発・テスト用途には十分ですが、本番環境では`Standard`プランを検討してください。

## 本番環境へのデプロイ（Vercel）

1. Vercelプロジェクトの環境変数に追加:
   - `AZURE_PUBSUB_CONNECTION_STRING`
   - `AZURE_PUBSUB_HUB_NAME`

2. デプロイコマンド:
```bash
vercel --prod
```

## セキュリティのベストプラクティス

1. **アクセスキーの定期的なローテーション**
   - Azureポータルで定期的にキーを再生成

2. **接続文字列を環境変数で管理**
   - コードに直接書かない
   - `.env.local`を`.gitignore`に追加

3. **本番環境ではMicrosoft Entra ID認証を検討**
   - より安全な認証方式

## 参考リンク

- [Azure Web PubSub公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/azure-web-pubsub/)
- [価格ページ](https://azure.microsoft.com/ja-jp/pricing/details/web-pubsub/)
- [クイックスタート](https://learn.microsoft.com/ja-jp/azure/azure-web-pubsub/quickstart-cli-create)
