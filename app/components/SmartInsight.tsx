'use client'

import { Lightbulb } from 'lucide-react'

// Accept 'symbol' as prop
export default function SmartInsight({ transactions, budget, symbol }: { transactions: any[], budget: number, symbol: string }) {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const spentPercentage = (totalSpent / budget) * 100

  // Find highest category
  const categories: Record<string, number> = {}
  transactions.forEach(t => {
    const cat = t.category || 'Uncategorized'
    categories[cat] = (categories[cat] || 0) + t.amount
  })
  
  const topCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0]
  const topAmount = categories[topCategory] || 0

  if (transactions.length === 0) return null

  // CASE 1: High Spending Alert
  if (spentPercentage > 80) {
    return (
      <div className="bg-gradient-to-r from-red-900/40 to-red-900/10 border border-red-900/50 p-5 rounded-3xl flex items-start gap-4">
        <div className="bg-red-500/20 p-3 rounded-full text-red-400 shrink-0">
          <Lightbulb size={24} />
        </div>
        <div>
          <h3 className="text-red-200 font-bold text-lg mb-1">High Spending Detected</h3>
          <p className="text-red-300/80 text-sm leading-relaxed">
            You have spent <span className="text-white font-bold">{symbol}{topAmount.toFixed(0)}</span> on {topCategory} this month. 
            That is {((topAmount / totalSpent) * 100).toFixed(0)}% of your total spending!
          </p>
        </div>
      </div>
    )
  }

  // CASE 2: Good Job
  if (spentPercentage < 50 && new Date().getDate() > 15) {
    return (
      <div className="bg-gradient-to-r from-green-900/40 to-green-900/10 border border-green-900/50 p-5 rounded-3xl flex items-start gap-4">
        <div className="bg-green-500/20 p-3 rounded-full text-green-400 shrink-0">
          <Lightbulb size={24} />
        </div>
        <div>
          <h3 className="text-green-200 font-bold text-lg mb-1">Excellent Budgeting!</h3>
          <p className="text-green-300/80 text-sm leading-relaxed">
             We are halfway through the month and you have only spent {spentPercentage.toFixed(0)}% of your budget. 
             You are on track to save <span className="text-white font-bold">{symbol}{(budget - totalSpent).toFixed(0)}</span>.
          </p>
        </div>
      </div>
    )
  }

  return null
}