'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MonthSelector({ currentMonth, currentYear }: { currentMonth: number, currentYear: number }) {
  const router = useRouter()

  const changeMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth + (direction === 'next' ? 1 : -1)
    let newYear = currentYear

    if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    } else if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    }

    
    router.push(`/?month=${newMonth}&year=${newYear}`)
  }

  const dateName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-2">
      <button 
        onClick={() => changeMonth('prev')}
        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
      >
        <ChevronLeft size={18} />
      </button>
      
      <span className="font-bold text-white min-w-[140px] text-center select-none">
        {dateName}
      </span>

      <button 
        onClick={() => changeMonth('next')}
        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}