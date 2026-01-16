import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { updateSettings } from '../actions'
import { Save, Wallet } from 'lucide-react'

const prisma = new PrismaClient()

const getCurrencySymbol = (code: string) => {
  if (code === 'INR') return '₹'
  if (code === 'EUR') return '€'
  if (code === 'GBP') return '£'
  return '$'
}

export default async function BudgetPage() {
  const { userId } = await auth()
  if (!userId) return null // <--- THIS FIXES THE TYPE ERROR ✅

  const settings = await prisma.userSettings.findUnique({ where: { userId } })
  
  // Get correct symbol
  const currencyCode = (settings as any)?.currency || 'USD'
  const symbol = getCurrencySymbol(currencyCode)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Budget Settings</h1>
      <p className="text-zinc-500 mb-8">Set your monthly targets to track your progress.</p>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                <Wallet size={24} />
            </div>
            <h3 className="font-bold text-white text-lg">Monthly Goals</h3>
        </div>

        <form action={updateSettings} className="space-y-6">
          <input type="hidden" name="currency" value={currencyCode} />
          
          <div>
            <label className="block text-zinc-400 mb-2 font-medium">Monthly Income</label>
            <div className="relative">
                <span className="absolute left-4 top-3.5 text-zinc-500 font-bold">{symbol}</span>
                <input 
                    name="income" 
                    type="number" 
                    defaultValue={settings?.income || 4500} 
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-lg" 
                />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-2 font-medium">Monthly Budget Limit</label>
            <div className="relative">
                <span className="absolute left-4 top-3.5 text-zinc-500 font-bold">{symbol}</span>
                <input 
                    name="budget" 
                    type="number" 
                    defaultValue={settings?.budget || 2000} 
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-lg" 
                />
            </div>
          </div>

          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-4">
             <Save size={20} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}