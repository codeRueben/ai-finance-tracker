import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { Zap } from 'lucide-react'

const prisma = new PrismaClient()

const getCurrencySymbol = (code: string) => {
  if (code === 'INR') return '₹'
  if (code === 'EUR') return '€'
  if (code === 'GBP') return '£'
  return '$'
}

export default async function SubscriptionsPage() {
  const { userId } = await auth()
  if (!userId) return null // <--- FIXES THE TYPE ERROR ✅

  const [transactions, settings] = await Promise.all([
    prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
    }),
    prisma.userSettings.findUnique({ where: { userId } })
  ])

  // Logic to find recurring payments
  const recurring = transactions.filter(t => 
    t.description.toLowerCase().match(/(netflix|spotify|hulu|prime|youtube|apple|gym|cloud|adobe|chatgpt)/)
  )

  const totalMonthly = recurring.reduce((sum, t) => sum + t.amount, 0)
  const symbol = getCurrencySymbol((settings as any)?.currency || 'USD')

  return (
    <div className="p-8 max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
            <p className="text-zinc-500 mt-1">Manage your recurring expenses here.</p>
          </div>
          <div className="text-right">
             <span className="text-sm text-zinc-500">Total Monthly Cost</span>
             <h2 className="text-3xl font-bold text-white">{symbol}{totalMonthly.toFixed(2)}</h2>
          </div>
       </div>

       <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-1 min-h-[300px]">
          {recurring.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
                <p>No active subscriptions detected.</p>
             </div>
          ) : (
             <ul className="divide-y divide-zinc-800">
                {recurring.map(sub => (
                   <li key={sub.id} className="p-6 flex justify-between items-center hover:bg-zinc-800/50 transition rounded-2xl">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Zap size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold text-white text-lg">{sub.description}</h4>
                            <p className="text-zinc-500 text-sm">Detected from transaction history</p>
                         </div>
                      </div>
                      <span className="font-mono text-xl font-bold text-white">
                         {symbol}{sub.amount.toFixed(2)}
                      </span>
                   </li>
                ))}
             </ul>
          )}
       </div>
    </div>
  )
}