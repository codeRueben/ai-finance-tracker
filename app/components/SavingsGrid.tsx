'use client'

import { Target, Trash2, Plus, Save } from 'lucide-react'
import { updateSavingsProgress, deleteSavingsGoal, addSavingsGoal } from '../actions'
import { useState } from 'react'

export default function SavingsGrid({ goals, symbol }: { goals: any[], symbol: string }) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-zinc-400 text-sm font-semibold">Savings Goals</h3>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-2"
        >
            <Plus size={14} /> New Goal
        </button>
      </div>

      {/* NEW GOAL FORM (Collapsible) */}
      {isAdding && (
        <form action={async (formData) => {
            await addSavingsGoal(formData)
            setIsAdding(false)
        }} className="bg-zinc-900 border border-green-900/50 p-5 rounded-3xl animate-in fade-in slide-in-from-top-4 mb-4">
            <h4 className="text-green-400 text-sm font-bold mb-3">Create New Target</h4>
            <div className="flex gap-3 mb-3">
                <input name="emoji" placeholder="💰" className="w-12 bg-black border border-zinc-800 rounded-xl text-center text-xl focus:outline-none text-white h-10" />
                <input name="name" placeholder="Goal Name (e.g. New Laptop)" required className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-white focus:outline-none focus:border-green-600 h-10" />
            </div>
            <div className="flex gap-3">
                <input name="target" type="number" placeholder="Target Amount" required className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-white focus:outline-none focus:border-green-600 h-10" />
                <button className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 rounded-xl h-10">Save</button>
            </div>
        </form>
      )}

      {/* GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Empty State */}
        {goals.length === 0 && !isAdding && (
           <div className="col-span-full py-10 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-3xl">
              <p>No goals yet. Click "New Goal" to start saving!</p>
           </div>
        )}

        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100)
          
          return (
            <div key={goal.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative group">
              
              {/* Header with Delete Button */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div>
                    <h4 className="font-bold text-white">{goal.name}</h4>
                    <p className="text-xs text-zinc-500">Target: {symbol}{goal.target.toLocaleString()}</p>
                  </div>
                </div>
                {/* DELETE ACTION */}
                <form action={deleteSavingsGoal}>
                    <input type="hidden" name="id" value={goal.id} />
                    <button className="text-zinc-600 hover:text-red-500 transition p-1 rounded-md hover:bg-red-500/10">
                        <Trash2 size={16} />
                    </button>
                </form>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black h-2 rounded-full mb-2 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs mb-4">
                 <span className="text-white font-mono">{symbol}{goal.current.toLocaleString()}</span>
                 <span className="text-green-500 font-bold">{progress.toFixed(0)}%</span>
              </div>

              {/* CUSTOM ADD FORM (Type any amount) */}
              <form action={updateSavingsProgress} className="flex gap-2">
                 <input type="hidden" name="id" value={goal.id} />
                 <input 
                    type="number" 
                    name="amount" 
                    placeholder="Add amount..." 
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-600 transition"
                    required
                 />
                 <button className="bg-zinc-800 hover:bg-green-600 text-white p-2 rounded-lg transition shrink-0">
                    <Plus size={16} />
                 </button>
              </form>

            </div>
          )
        })}
      </div>
    </div>
  )
}