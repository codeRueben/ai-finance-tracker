import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { addAccount, deleteAccount } from '../actions'
import { Plus, TrendingUp, Building2, CreditCard, Landmark } from 'lucide-react'
import AccountChart from '../components/AccountChart'

const prisma = new PrismaClient()

// Helper for currency
const getCurrencySymbol = (code: string) => {
  if (code === 'INR') return '₹'
  if (code === 'EUR') return '€'
  if (code === 'GBP') return '£'
  return '$'
}

export default async function AccountsPage() {
  const { userId } = await auth()

  const [accounts, settings] = await Promise.all([
     userId ? prisma.account.findMany({ where: { userId }, orderBy: { balance: 'desc' } }) : [],
     userId ? prisma.userSettings.findUnique({ where: { userId } }) : null
  ])

  // Get Currency
  const currencyCode = (settings as any)?.currency || 'USD'
  const symbol = getCurrencySymbol(currencyCode)

  const assets = accounts.filter(a => a.type === "Asset").reduce((sum, a) => sum + a.balance, 0)
  const liabilities = accounts.filter(a => a.type === "Liability").reduce((sum, a) => sum + a.balance, 0)
  const netWorth = assets - liabilities

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-white">Accounts & Net Worth</h1>
           <p className="text-zinc-500 mt-1">Track your total wealth across all banks.</p>
        </div>
        <div className="text-right">
           <span className="text-sm text-zinc-500">Total Net Worth</span>
           <h2 className={`text-4xl font-bold ${netWorth >= 0 ? 'text-white' : 'text-red-500'}`}>
              {symbol}{netWorth.toLocaleString()}
           </h2>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
         <h3 className="text-sm font-semibold text-zinc-400 mb-6 flex items-center gap-2">
            <TrendingUp size={16} /> Net Worth Growth (6 Months)
         </h3>
         <AccountChart currentNetWorth={netWorth} />
      </div>

      {/* ASSETS & LIABILITIES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ASSETS COLUMN */}
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Assets
                </h3>
                <span className="text-green-500 font-mono">{symbol}{assets.toLocaleString()}</span>
            </div>
            
            {accounts.filter(a => a.type === "Asset").map(account => (
                <div key={account.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center group hover:border-zinc-700 transition">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-green-400">
                         {account.category === 'Investment' ? <TrendingUp size={20}/> : <Building2 size={20}/>}
                      </div>
                      <div>
                         <p className="font-bold text-white">{account.name}</p>
                         <p className="text-xs text-zinc-500">{account.category}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-mono text-white text-lg">{symbol}{account.balance.toLocaleString()}</span>
                      <form action={deleteAccount}>
                          <input type="hidden" name="id" value={account.id} />
                          <button className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2">✕</button>
                      </form>
                   </div>
                </div>
            ))}
        </div>

        {/* LIABILITIES COLUMN */}
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div> Liabilities
                </h3>
                <span className="text-red-500 font-mono">{symbol}{liabilities.toLocaleString()}</span>
            </div>
            
            {accounts.filter(a => a.type === "Liability").map(account => (
                <div key={account.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center group hover:border-zinc-700 transition">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-red-400">
                         {account.category === 'Loan' ? <Landmark size={20}/> : <CreditCard size={20}/>}
                      </div>
                      <div>
                         <p className="font-bold text-white">{account.name}</p>
                         <p className="text-xs text-zinc-500">{account.category}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-mono text-white text-lg">{symbol}{account.balance.toLocaleString()}</span>
                      <form action={deleteAccount}>
                          <input type="hidden" name="id" value={account.id} />
                          <button className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2">✕</button>
                      </form>
                   </div>
                </div>
            ))}
        </div>

      </div>

      {/* ADD NEW ACCOUNT FORM */}
      <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 mt-8">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-500" /> Add New Account
        </h3>
        <form action={addAccount} className="flex flex-col md:flex-row gap-4">
            <input name="name" placeholder="Account Name (e.g. Robinhood)" required className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
            <select name="category" className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option value="Cash">Cash / Checking</option>
                <option value="Investment">Investment</option>
                <option value="Credit">Credit Card</option>
                <option value="Loan">Loan / Debt</option>
            </select>
            <input name="balance" type="number" step="0.01" placeholder="Current Balance" required className="w-40 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition">
                Add Account
            </button>
        </form>
      </div>

    </div>
  )
}