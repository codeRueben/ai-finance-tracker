'use client'

import { useState } from 'react'
import { Settings, X, Check } from 'lucide-react'
import { updateCurrency } from '../actions' 

const currencies = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
]

export default function CurrencyPopup({ currentCurrency }: { currentCurrency: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSelect = async (code: string) => {
    setLoading(true)
    await updateCurrency(code)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition flex items-center gap-2"
        title="Change Currency"
      >
        <Settings size={18} />
        <span className="text-sm font-medium">{currentCurrency}</span>
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Select Currency</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="p-4 space-y-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
                    currentCurrency === c.code
                      ? 'bg-green-600/10 border-green-600 text-green-500'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm border border-zinc-800">
                      {c.symbol}
                    </span>
                    <div className="text-left">
                      <p className="font-bold">{c.code}</p>
                      <p className="text-xs text-zinc-500">{c.label}</p>
                    </div>
                  </div>
                  {currentCurrency === c.code && <Check size={18} />}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}