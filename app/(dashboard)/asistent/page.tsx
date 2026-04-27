'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_QUESTIONS = [
  'Koľko som minul celkovo tento mesiac?',
  'Kde môžem šetriť peniaze?',
  'Aký je stav môjho rozpočtu?',
  'Kde najčastejšie nakupujem?',
  'Koľko som minul na jedlo?',
  'Aká je moja spotreba energie?',
]

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
    .replace(/•/g, '&bull;')
}

export default function AsistentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Ahoj! Som váš rodinný finančný asistent. Pýtajte sa ma na výdavky, rozpočet, energiu alebo kde môžete šetriť.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(query: string) {
    if (!query.trim() || loading) return

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/asistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer || data.error || 'Niečo sa pokazilo. Skúste znova.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: 'Chyba pripojenia. Skúste znova.', timestamp: new Date() },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function timeStr(date: Date): string {
    return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finančný asistent</h1>
            <p className="text-sm text-gray-500">Pýtajte sa otázky o vašich financiách a energii</p>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'bg-gray-200'
              }`}>
                {msg.role === 'assistant' ? (
                  <Bot size={14} className="text-white" />
                ) : (
                  <User size={14} className="text-gray-600" />
                )}
              </div>
              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-gray-50 text-gray-800 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
                <span className="text-[10px] text-gray-400 px-1">{timeStr(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Sparkles size={11} />
              Rýchle otázky:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Napíšte otázku..."
              className="input flex-1 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary px-4 flex items-center gap-2 text-sm"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-gray-400 text-center mt-3">
        Asistent analyzuje vaše skutočné dáta z databázy
      </p>
    </div>
  )
}
