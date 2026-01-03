import { Hono } from "hono";
import { handle } from "hono/vercel";
import { prisma } from "@/lib/prisma";
import { sendToGroup } from "@/lib/pubsub";
import { z } from "zod";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// バリデーションスキーマ
const createRequestSchema = z.object({
	name: z.string().min(1),
	message: z.string().min(1),
});

const updateStatusSchema = z.object({
	status: z.enum(["approved", "rejected"]),
});

// リクエスト作成
app.post("/requests", async (c) => {
	try {
		const body = await c.req.json();
		const data = createRequestSchema.parse(body);

		const request = await prisma.request.create({
			data: {
				name: data.name,
				message: data.message,
			},
		});

		// Azure PubSubで承認者に通知
		await sendToGroup("admins", {
			type: "new_request",
			data: request,
		});

		return c.json(request, 201);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return c.json({ error: "Invalid input", details: error.issues }, 400);
		}
		console.error("Error creating request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// リクエスト一覧取得
app.get("/requests", async (c) => {
	try {
		const requests = await prisma.request.findMany({
			orderBy: { createdAt: "desc" },
		});
		return c.json(requests);
	} catch (error) {
		return c.json({ error: "Internal server error" }, 500);
	}
});

// 特定リクエスト取得
app.get("/requests/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const request = await prisma.request.findUnique({
			where: { id },
		});

		if (!request) {
			return c.json({ error: "Request not found" }, 404);
		}

		return c.json(request);
	} catch (error) {
		return c.json({ error: "Internal server error" }, 500);
	}
});

// リクエストステータス更新（承認/拒否）
app.patch("/requests/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const data = updateStatusSchema.parse(body);

		const request = await prisma.request.update({
			where: { id },
			data: { status: data.status },
		});

		// Azure PubSubでリクエスト者に通知
		await sendToGroup("users", {
			type: "status_update",
			data: request,
		});

		return c.json(request);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return c.json({ error: "Invalid input", details: error.issues }, 400);
		}
		console.error("Error updating request:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
