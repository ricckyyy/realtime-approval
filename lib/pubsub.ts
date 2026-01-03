import { WebPubSubServiceClient } from "@azure/web-pubsub";

const connectionString = process.env.AZURE_PUBSUB_CONNECTION_STRING;
const hubName = process.env.AZURE_PUBSUB_HUB_NAME || "approval";

if (!connectionString) {
	throw new Error("AZURE_PUBSUB_CONNECTION_STRING is not defined");
}

const serviceClient = new WebPubSubServiceClient(connectionString, hubName);

export { serviceClient, hubName };

// クライアント接続用のトークンを生成
export async function generateClientToken(userId: string) {
	const token = await serviceClient.getClientAccessToken({
		userId,
		roles: ["webpubsub.sendToGroup", "webpubsub.joinLeaveGroup"],
	});
	return token;
}

// メッセージを特定グループに送信
export async function sendToGroup(group: string, message: any) {
	await serviceClient.group(group).sendToAll(message);
}

// メッセージを特定ユーザーに送信
export async function sendToUser(userId: string, message: any) {
	await serviceClient.sendToUser(userId, message);
}
