import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/stores/appStore'
import { Send, Brain, User, Loader2, Key } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Research() {
  const { apiKeys, companies, financials } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome to Grapevine AI Research. I can help you analyze companies, compare valuations, explore market trends, and generate investment insights.\n\nTry asking:\n- "What are the highest-growth technology companies?"\n- "Compare Stripe and Databricks"\n- "Which companies have the best capital efficiency?"\n- "Generate an investment thesis for Anthropic"\n\n${!apiKeys.openai ? '**Note:** Configure your OpenAI API key in Settings to enable live AI responses. Currently using demo mode.' : ''}`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    if (apiKeys.openai) {
      try {
        // Build context from company data
        const companyContext = companies.slice(0, 10).map((c) => {
          const fins = financials.filter((f) => f.company_id === c.id)
          const latest = fins[fins.length - 1]
          return `${c.name} (${c.sector}, ${c.stage}): Revenue ${latest ? `$${(latest.revenue / 1e6).toFixed(0)}M` : 'N/A'}, EBITDA ${latest ? `$${(latest.ebitda / 1e6).toFixed(0)}M` : 'N/A'}`
        }).join('\n')

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeys.openai}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a private market intelligence analyst for Grapevine. You have access to the following company data:\n\n${companyContext}\n\nProvide concise, data-driven analysis. Use specific numbers when available. Format responses with markdown.`,
              },
              ...messages.filter((m) => m.role === 'user').slice(-5).map((m) => ({ role: 'user' as const, content: m.content })),
              { role: 'user', content: userMsg },
            ],
            max_tokens: 1000,
          }),
        })

        const data = await res.json()
        const reply = data.choices?.[0]?.message?.content || 'Unable to generate response.'
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      } catch (err) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to AI service. Please check your API key in Settings.' }])
      }
    } else {
      // Demo mode: generate a contextual response
      const demoResponse = generateDemoResponse(userMsg, companies, financials)
      await new Promise((r) => setTimeout(r, 800))
      setMessages((prev) => [...prev, { role: 'assistant', content: demoResponse }])
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Research Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about companies, markets, and investment opportunities
          {!apiKeys.openai && ' (Demo Mode — add OpenAI key in Settings for live AI)'}
        </p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-220px)]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">Analyzing...</div>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about companies, valuations, market trends..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

function generateDemoResponse(query: string, companies: typeof import('@/lib/seedData').companies, financials: typeof import('@/lib/seedData').financials): string {
  const q = query.toLowerCase()

  if (q.includes('growth') || q.includes('fastest')) {
    return `## Highest-Growth Companies\n\nBased on our data, the fastest-growing companies by revenue CAGR:\n\n| Company | Sector | Growth |\n|---------|--------|--------|\n| Anthropic | Technology | ~150% |\n| Wiz | Technology | ~100% |\n| Cerebras | Technology | ~90% |\n| Rippling | Technology | ~80% |\n| Anduril | Industrial | ~60% |\n\n**Key Insight:** AI infrastructure and cybersecurity are driving the highest growth rates in the portfolio. Anthropic's growth is exceptional but comes with significant burn.`
  }

  if (q.includes('compare') || q.includes('vs')) {
    return `## Comparative Analysis\n\nBoth companies show strong fundamentals but differ in maturity and capital efficiency:\n\n- **Scale:** Both are in the multi-billion ARR category\n- **Growth:** Comparable growth trajectories\n- **Margins:** Depends on business model maturity\n- **Valuation:** Sector-relative multiples suggest both are fairly valued\n\n*For detailed comparisons, use the Valuation Suite to run side-by-side DCF and comp analysis.*`
  }

  if (q.includes('thesis') || q.includes('memo')) {
    return `## Investment Thesis\n\n### Summary\nThe company represents a compelling growth equity opportunity in a large, expanding market.\n\n### Bull Case\n- Market leadership in a critical technology category\n- Strong revenue growth with improving unit economics\n- Significant TAM with multiple expansion vectors\n\n### Bear Case\n- Intense competition from well-funded incumbents\n- Elevated burn rate requiring additional capital\n- Regulatory uncertainty\n\n### Recommendation\n**BUY** — The risk/reward profile is attractive at current valuation levels.\n\n*Configure your OpenAI API key in Settings for AI-generated memos with full financial analysis.*`
  }

  return `Based on our database of 20 tracked private companies:\n\n- **Technology** dominates with 14 companies\n- Average last-round valuation: ~$30B\n- Growth-stage companies show 20-150% CAGR\n- AI and cybersecurity sectors show strongest momentum\n\nFor deeper analysis, try:\n- "Which companies have the best margins?"\n- "Show me distressed opportunities"\n- "Compare growth vs efficiency scores"\n\n*Live AI analysis available when OpenAI API key is configured in Settings.*`
}
