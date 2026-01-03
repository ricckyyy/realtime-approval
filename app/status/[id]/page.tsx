"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePubSub } from "@/hooks/usePubSub";
import type { SerializedRequest } from "@/lib/pubsub";

export default function StatusPage() {
	const params = useParams();
	const id = params.id as string;
	const [request, setRequest] = useState<SerializedRequest | null>(null);
	const [loading, setLoading] = useState(true);
	const { connected, messages } = usePubSub(`user-${id}`, ["users"]);

	const fetchRequest = async () => {
		try {
			const response = await fetch(`/api/requests/${id}`);
			if (response.ok) {
				const data = await response.json();
				setRequest(data);
			}
		} catch (error) {
			console.error("Failed to fetch request:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRequest();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	useEffect(() => {
		messages.forEach((msg) => {
			if (msg.type === "status_update" && msg.data.id === id) {
				setRequest(msg.data);
			}
		});
	}, [messages, id]);

	const getStatusDisplay = (status: string) => {
		const config = {
			pending: {
				color: "bg-yellow-100 border-yellow-300 text-yellow-800",
				icon: (
					<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
							clipRule="evenodd"
						/>
					</svg>
				),
				label: "承認待ち",
				description: "承認者が確認中です。しばらくお待ちください。",
			},
			approved: {
				color: "bg-green-100 border-green-300 text-green-800",
				icon: (
					<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				),
				label: "承認されました",
				description: "リクエストが承認されました！",
			},
			rejected: {
				color: "bg-red-100 border-red-300 text-red-800",
				icon: (
					<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
				),
				label: "拒否されました",
				description: "リクエストは拒否されました。",
			},
		};
		return config[status as keyof typeof config];
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	if (!request) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
					<p className="text-gray-600 mb-4">リクエストが見つかりません</p>
					<Link
						href="/"
						className="text-purple-600 hover:text-purple-800 font-semibold"
					>
						ホームに戻る
					</Link>
				</div>
			</div>
		);
	}

	const statusDisplay = getStatusDisplay(request.status);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
			<div className="max-w-2xl mx-auto pt-12">
				<div className="mb-6 flex justify-between items-center">
					<Link
						href="/"
						className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						戻る
					</Link>

					<div className="flex items-center gap-2">
						<div
							className={`w-3 h-3 rounded-full ${
								connected ? "bg-green-500" : "bg-red-500"
							}`}
						/>
						<span className="text-sm text-gray-600">
							{connected ? "接続済み" : "未接続"}
						</span>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">
						リクエストステータス
					</h1>

					<div
						className={`border-2 rounded-lg p-8 mb-6 ${statusDisplay.color}`}
					>
						<div className="flex flex-col items-center text-center">
							{statusDisplay.icon}
							<h2 className="text-2xl font-bold mt-4 mb-2">
								{statusDisplay.label}
							</h2>
							<p>{statusDisplay.description}</p>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<h3 className="text-sm font-semibold text-gray-500 mb-1">名前</h3>
							<p className="text-gray-900">{request.name}</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-gray-500 mb-1">
								メッセージ
							</h3>
							<p className="text-gray-900 whitespace-pre-wrap">
								{request.message}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-gray-500 mb-1">
								送信日時
							</h3>
							<p className="text-gray-900">
								{new Date(request.createdAt).toLocaleString("ja-JP")}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
