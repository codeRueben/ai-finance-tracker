'use client'

import { Zap, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  description: string
  amount: number
  date: Date
}

export default function SubscriptionCard({ transactions }: { transactions: Transaction[] }) {
  
  const subKeywords = ['netflix', 'spotify', 'apple', 'icloud', 'prime', 'hulu', 'disney', 'gym', 'fitness', 'youtube', 'adobe', 'chatgpt', 'playstation', 'xbox']

  const subsMap = new Map<string, Transaction>()

  transactions.forEach(t => {
    const desc = t.description.toLowerCase()
    if (subKeywords.some(keyword => desc.includes(keyword))) {
      const existing = subsMap.get(desc)
      if (!existing || new Date(t.date) > new Date(existing.date)) {
        subsMap.set(desc, t)
      }
    }
  })

  const subscriptions = Array.from(subsMap.values())
  const totalMonthly = subscriptions.reduce((sum, t) => sum + t.amount, 0)

  if (subscriptions.length === 0) return null 

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-white font-semibold flex items-center gap-2">
             <Zap size={18} className="text-yellow-400 fill-yellow-400" />
             Recurring Subs
           </h3>
           <p className="text-zinc-500 text-xs">Detected from your history</p>
        </div>
        <div className="text-right">
           <span className="block text-2xl font-bold text-white">${totalMonthly.toFixed(2)}</span>
           <span className="text-xs text-zinc-500">/ month</span>
        </div>
      </div>

      <ul className="space-y-3">
        {subscriptions.map((sub, i) => (
          <li key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800/50">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 uppercase">
                    {sub.description.substring(0, 2)}
                </div>
                <span className="text-sm text-zinc-200 capitalize">{sub.description}</span>
             </div>
             <span className="font-mono font-bold text-white">${sub.amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 pt-4 border-t border-zinc-800">
         <Link href="/subscriptions" className="w-full text-xs text-zinc-500 hover:text-white transition flex items-center justify-center gap-1">
            Manage Subscriptions <ExternalLink size={12}/>
         </Link>
      </div>
    </div>
  )
}