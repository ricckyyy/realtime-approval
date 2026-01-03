'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { WebPubSubClient } from '@azure/web-pubsub-client'
import type { PubSubMessage } from '@/lib/pubsub'

function isPubSubMessage(data: unknown): data is PubSubMessage {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  const obj = data as Record<string, unknown>
  return (
    (obj.type === 'new_request' || obj.type === 'status_update') &&
    typeof obj.data === 'object' &&
    obj.data !== null
  )
}

export function usePubSub(userId: string, groups: string[] = []) {
  const [client, setClient] = useState<WebPubSubClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<PubSubMessage[]>([])
  const groupsKey = useMemo(() => groups.join(','), [groups])

  useEffect(() => {
    let pubsubClient: WebPubSubClient | null = null

    async function connect() {
      try {
        // トークン取得
        const response = await fetch('/api/pubsub/negotiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        
        const { url } = await response.json()
        
        // WebSocket接続
        pubsubClient = new WebPubSubClient(url)
        
        pubsubClient.on('connected', () => {
          console.log('Connected to PubSub')
          setConnected(true)
          
          // グループに参加
          const groupList = groups
          groupList.forEach((group) => {
            pubsubClient?.joinGroup(group)
          })
        })
        
        pubsubClient.on('disconnected', () => {
          console.log('Disconnected from PubSub')
          setConnected(false)
        })
        
        pubsubClient.on('group-message', (e) => {
          console.log('Received message:', e.message.data)
          const data = e.message.data
          if (isPubSubMessage(data)) {
            setMessages((prev) => [...prev, data])
          } else {
            console.warn('Invalid message format:', data)
          }
        })
        
        await pubsubClient.start()
        setClient(pubsubClient)
      } catch (error) {
        console.error('Failed to connect:', error)
      }
    }

    connect()

    return () => {
      if (pubsubClient) {
        pubsubClient.stop()
      }
    }
  }, [userId, groupsKey, groups])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { client, connected, messages, clearMessages }
}
