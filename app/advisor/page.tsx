'use client'

import { useState } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { getFinancialAdvice } from '../actions' // Import the REAL AI action

export default function AdvisorPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I have access to your recent transactions. Ask me anything about your spending!' }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // 1. Add User Message immediately
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('') // Clear input
    setIsLoading(true)

    // 2. Call the Server Action (Real GPT-4)
    try {
        const aiResponse = await getFinancialAdvice(currentInput)
        
        // 3. Add AI Message
        setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
    } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to the brain right now." }])
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl flex items-center gap-4 z-10">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Sparkles className="text-white" size={24} />
        </div>
        <div>
            <h1 className="font-bold text-white text-xl">AI Financial Genius</h1>
            <p className="text-zinc-500 text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
                Powered by GPT-4
            </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
              ${m.role === 'ai' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white text-black'}`}>
              {m.role === 'ai' ? <Bot size={20} className="text-purple-400"/> : <User size={20}/>}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl max-w-[80%] leading-relaxed shadow-sm
              ${m.role === 'ai' 
                ? 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 rounded-tl-none' 
                : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <Bot size={20} className="text-purple-400"/>
             </div>
             <div className="bg-zinc-800/80 border border-zinc-700/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 z-10">
        <form onSubmit={handleSend} className="flex gap-3 relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: How much did I spend on Uber this month?"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-zinc-500 transition shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white p-4 rounded-xl transition shadow-lg shadow-purple-900/20"
          >
            <Send size={24} />
          </button>
        </form>
      </div>

    </div>
  )
}
