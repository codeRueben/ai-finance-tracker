'use client'

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AccountChart({ currentNetWorth }: { currentNetWorth: number }) {
  
  const data = []
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
  
  for (let i = 0; i < 7; i++) {
     const growthFactor = 0.8 + (i * 0.03) 
     const noise = (Math.random() - 0.5) * (currentNetWorth * 0.05)
     const val = (currentNetWorth * growthFactor) + noise
     
     data.push({
        name: months[i],
        value: i === 6 ? currentNetWorth : val
     })
  }

  if (currentNetWorth === 0) return <div className="h-64 flex items-center justify-center text-zinc-600">Add an account to see your growth curve</div>

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }} 
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
             // FIX: We specifically type 'value' as any to satisfy Recharts strict typing
             formatter={(value: any) => [`$${Number(value).toFixed(0)}`, "Net Worth"]}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}