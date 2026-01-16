'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { addSmartTransaction } from '../actions'

export default function MagicEntry({ placeholder = "Try 'Coffee $5' or 'Uber $20'..." }: { placeholder?: string }) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    await addSmartTransaction(formData)
    setInput('')
    setLoading(false)
    setIsTyping(false)
  }

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 p-1 rounded-3xl shadow-xl border border-zinc-800 relative group">
      <div className={`absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-xl rounded-3xl transition duration-500 ${isTyping ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="bg-zinc-950 rounded-[22px] p-2 flex items-center gap-3 relative z-10">
        
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isTyping ? 'bg-gradient-to-tr from-green-400 to-blue-500 text-white scale-110' : 'bg-zinc-800 text-zinc-400'}`}>
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className={isTyping ? 'animate-pulse' : ''} />}
        </div>

        <form action={handleSubmit} className="flex-1 flex gap-2">
            <input 
              name="input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              placeholder={placeholder}
              className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-lg h-12"
              autoComplete="off"
            />
            
            <button 
                type="submit"
                disabled={!input || loading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${input ? 'bg-white text-black translate-x-0 opacity-100 hover:scale-105' : 'bg-transparent text-transparent translate-x-4 opacity-0 pointer-events-none'}`}
            >
                <ArrowRight size={20} />
            </button>
        </form>
      </div>
    </div>
  )
}