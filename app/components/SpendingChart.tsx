'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Transaction {
  amount: number
  category: string | null
}

export default function SpendingChart({ data }: { data: Transaction[] }) {
  // 1. Group data by category
  const categoryTotals: Record<string, number> = {}
  
  data.forEach(t => {
    const cat = t.category || 'Uncategorized'
    if (!categoryTotals[cat]) categoryTotals[cat] = 0
    categoryTotals[cat] += t.amount
  })

  // 2. Convert to format Recharts understands
  const chartData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  }))

  // 3. Define Cool Colors for the Chart
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

  if (chartData.length === 0) {
    return <div className="text-zinc-500 text-sm text-center py-10">Add data to see chart</div>
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60} // Makes it a Donut
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}