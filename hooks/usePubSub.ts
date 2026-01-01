'use client'

import { useEffect, useState, useCallback } from 'react'
import { WebPubSubClient } from '@azure/web-pubsub-client'

interface PubSubMessage {
  type: string
  data: any
}

export function usePubSub(userId: string, groups: string[] = []) {
  const [client, setClient] = useState<WebPubSubClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<PubSubMessage[]>([])

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
          groups.forEach((group) => {
            pubsubClient?.joinGroup(group)
          })
        })
        
        pubsubClient.on('disconnected', () => {
          console.log('Disconnected from PubSub')
          setConnected(false)
        })
        
        pubsubClient.on('group-message', (e) => {
          console.log('Received message:', e.message.data)
          const message = e.message.data as PubSubMessage
          setMessages((prev) => [...prev, message])
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
  }, [userId, groups.join(',')])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { client, connected, messages, clearMessages }
}
