import { WebPubSubServiceClient } from "@azure/web-pubsub";
import type { Request } from "@prisma/client";

// シリアライズされたRequest型（JSON経由で送受信される場合）
export type SerializedRequest = Omit<Request, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
};

// PubSubメッセージの型定義
export interface PubSubMessage {
	type: "new_request" | "status_update";
	data: SerializedRequest;
}

// PrismaのRequestをシリアライズ形式に変換
export function serializeRequest(request: Request): SerializedRequest {
	return {
		...request,
		createdAt: request.createdAt.toISOString(),
		updatedAt: request.updatedAt.toISOString(),
	};
}

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
export async function sendToGroup(group: string, message: PubSubMessage) {
	await serviceClient.group(group).sendToAll(message);
}

// メッセージを特定ユーザーに送信
export async function sendToUser(userId: string, message: PubSubMessage) {
	await serviceClient.sendToUser(userId, message);
}
