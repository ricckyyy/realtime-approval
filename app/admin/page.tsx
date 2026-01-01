'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePubSub } from '@/hooks/usePubSub'

interface Request {
  id: string
  name: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const { connected, messages } = usePubSub('admin', ['admins'])

  // 初回ロード
  useEffect(() => {
    fetchRequests()
  }, [])

  // リアルタイム更新
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.type === 'new_request') {
        setRequests((prev) => [msg.data, ...prev])
      } else if (msg.type === 'status_update') {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === msg.data.id ? msg.data : req
          )
        )
      }
    })
  }, [messages])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: 'approved' } : req
        )
      )
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: 'rejected' } : req
        )
      )
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: '待機中',
      approved: '承認済み',
      rejected: '拒否',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto pt-12">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-green-600 hover:text-green-800 flex items-center gap-2"
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
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {connected ? '接続済み' : '未接続'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            承認者ダッシュボード
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              リクエストはありません
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {request.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {request.message}
                  </p>

                  {request.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        拒否
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
