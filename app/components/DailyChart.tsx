'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Transaction {
  amount: number
  date: Date
}

export default function DailyChart({ transactions }: { transactions: Transaction[] }) {
  
  const dailyTotals = Array(32).fill(0) // Index 1 to 31
  
  transactions.forEach(t => {
    const day = new Date(t.date).getDate()
    dailyTotals[day] += t.amount
  })

  
  const data = dailyTotals.map((amount, day) => ({
    day: day,
    amount: amount
  })).filter(d => d.day > 0) 

  if (transactions.length === 0) return <div className="text-center text-zinc-500 py-10">No data to display</div>

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="day" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#27272a' }}
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.amount > 100 ? '#ef4444' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}