import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { generateClientToken } from '@/lib/pubsub'

export const runtime = 'nodejs'

const app = new Hono().basePath('/api/pubsub')

// WebSocket接続用のトークンを取得
app.post('/negotiate', async (c) => {
  try {
    const body = await c.req.json()
    const userId = body.userId || `user-${Date.now()}`
    
    const token = await generateClientToken(userId)
    
    return c.json({
      url: token.url,
      userId,
    })
  } catch (error) {
    console.error('PubSub negotiate error:', error)
    return c.json({ error: 'Failed to generate token' }, 500)
  }
})

export const POST = handle(app)
