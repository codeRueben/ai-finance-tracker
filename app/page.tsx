import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { deleteTransaction } from './actions'
import SpendingChart from './components/SpendingChart'
import SmartInsight from './components/SmartInsight'
import SubscriptionCard from './components/SubscriptionCard'
import MonthSelector from './components/MonthSelector'
import DailyChart from './components/DailyChart'
import MagicEntry from './components/MagicEntry'
import SavingsGrid from './components/SavingsGrid'
import CurrencyPopup from './components/CurrencyPopup'
import {
  Coffee, Car, ShoppingBag, Film, Activity,
  Wallet, TrendingUp, TrendingDown, Calendar, DollarSign, Trash2
} from 'lucide-react'

const prisma = new PrismaClient()

// Helper to get icons based on category
const getCategoryIcon = (category: string | null) => {
  const c = category?.toLowerCase() || ''
  if (c.includes('food') || c.includes('coffee') || c.includes('burger')) return <Coffee size={18} className="text-orange-400" />
  if (c.includes('transport') || c.includes('uber') || c.includes('gas')) return <Car size={18} className="text-blue-400" />
  if (c.includes('shop') || c.includes('clothing')) return <ShoppingBag size={18} className="text-pink-400" />
  if (c.includes('entertain') || c.includes('netflix') || c.includes('game')) return <Film size={18} className="text-purple-400" />
  if (c.includes('health') || c.includes('gym') || c.includes('doctor')) return <Activity size={18} className="text-red-400" />
  return <DollarSign size={18} className="text-zinc-400" />
}

// Helper for currency symbol
const getCurrencySymbol = (code: string) => {
  if (code === 'INR') return '₹'
  if (code === 'EUR') return '€'
  if (code === 'GBP') return '£'
  return '$'
}

export default async function Home({ searchParams }: { searchParams: { month?: string, year?: string } }) {
  const { userId } = await auth()

  const now = new Date()
  const resolvedParams = await searchParams

  const currentMonth = resolvedParams?.month ? parseInt(resolvedParams.month) : now.getMonth()
  const currentYear = resolvedParams?.year ? parseInt(resolvedParams.year) : now.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1)

  const [userSettings, transactions, savingsGoals] = await Promise.all([
    userId ? prisma.userSettings.findUnique({ where: { userId } }) : null,
    userId ? prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfMonth,
          lt: nextMonthDate
        }
      },
      orderBy: { date: 'desc' }
    }) : [],
    userId ? prisma.savingsGoal.findMany({ where: { userId } }) : []
  ])

  const budget = userSettings?.budget || 2000
  const income = userSettings?.income || 4500
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const balance = income - totalSpent
  const budgetProgress = Math.min((totalSpent / budget) * 100, 100)

  // FIX: Force TS to accept currency property
  const currencyCode = (userSettings as any)?.currency || 'USD'
  const symbol = getCurrencySymbol(currencyCode)

  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  // --- AI PREDICTION LOGIC ---
  const dayOfMonth = new Date().getDate()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dailyAverage = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0
  const predictedTotal = dailyAverage * daysInMonth
  const status = predictedTotal > budget ? "Danger" : "Safe"

  return (
    <div className="p-6 lg:p-10 min-h-full">
      <SignedIn>
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>

            {(() => {
              const hour = new Date().getHours()
              let greeting = "Good evening"
              if (hour < 12) greeting = "Good morning"
              else if (hour < 18) greeting = "Good afternoon"

              return (
                <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {greeting}, here is your {currentMonthName} overview.
                </p>
              )
            })()}
          </div>

          <div className="flex items-center gap-3">
            {/* CURRENCY POPUP BUTTON */}
            <CurrencyPopup currentCurrency={currencyCode} />

            <MonthSelector currentMonth={currentMonth} currentYear={currentYear} />
            
            <div className="bg-zinc-900 p-1.5 rounded-full border border-zinc-800">
              <UserButton />
            </div>
          </div>
        </header>

        {/* AI PREDICTION CARD */}
        <div className={`mb-8 p-6 rounded-3xl border flex items-center justify-between relative overflow-hidden ${status === 'Danger' ? 'bg-red-900/20 border-red-900/50' : 'bg-green-900/20 border-green-900/50'}`}>
           <div className="relative z-10">
              <h3 className={`font-bold text-lg mb-1 ${status === 'Danger' ? 'text-red-400' : 'text-green-400'}`}>
                 {status === 'Danger' ? '⚠️ High Spending Detected' : '✅ On Track'}
              </h3>
              <p className="text-zinc-400 text-sm">
                 Based on your current habits, you are projected to spend <span className="text-white font-bold">{symbol}{predictedTotal.toFixed(0)}</span> by month end.
              </p>
           </div>
           <div className="hidden md:block text-right z-10">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Projected Savings</span>
              <p className="text-2xl font-bold text-white">{symbol}{(income - predictedTotal).toFixed(0)}</p>
           </div>
        </div>

        {/* SMART INSIGHTS (Fixed: Now accepts symbol) */}
        <div className="mb-8">
          <SmartInsight transactions={transactions} budget={budget} symbol={symbol} />
        </div>

        {/* SAVINGS GOALS (Fixed: Now accepts symbol) */}
        <div className="mb-8">
          <SavingsGrid goals={savingsGoals} symbol={symbol} />
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition"></div>
            <p className="text-zinc-400 font-medium text-sm mb-1 flex items-center gap-2">
              <Wallet size={14} /> {currentMonthName} Balance
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">{symbol}{balance.toFixed(2)}</h2>
            <div className="flex gap-2 mt-auto">
              <span className="text-xs bg-zinc-950/50 px-2 py-1 rounded text-zinc-500 font-mono">Real-time</span>
              <span className={`text-xs px-2 py-1 rounded ${balance > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {balance > 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-900/30 rounded-full text-green-400"><TrendingUp size={18} /></div>
                <span className="text-zinc-400 text-sm">Income</span>
              </div>
              <p className="text-2xl font-bold text-white ml-1">{symbol}{income.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-900/30 rounded-full text-red-400"><TrendingDown size={18} /></div>
                <span className="text-zinc-400 text-sm">Spent</span>
              </div>
              <p className="text-2xl font-bold text-white ml-1">{symbol}{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* BUDGET BAR */}
        <div className="bg-zinc-900/30 p-6 rounded-3xl border border-zinc-800 mb-8 relative group">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-white font-semibold">Monthly Budget</h3>
              <p className="text-zinc-500 text-xs">Target: {symbol}{budget}</p>
            </div>
            <span className="text-white font-mono text-sm bg-zinc-800 px-3 py-1 rounded-lg">
              {symbol}{totalSpent.toFixed(0)} / {symbol}{budget}
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${budgetProgress > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${budgetProgress}%` }}
            ></div>
          </div>
          <a href="/budget" className="absolute top-4 right-4 text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition hover:text-white">
            Edit Limit →
          </a>
        </div>

        {/* MAGIC ENTRY (Quick Add) */}
        <div className="mb-8">
          <h3 className="text-zinc-400 text-sm font-semibold mb-3 ml-2">Quick Add</h3>
          <MagicEntry placeholder={`Paste UPI SMS or type "Coffee ${symbol}5"`} />
        </div>

        {/* DAILY TREND CHART */}
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 mb-8">
          <h3 className="text-zinc-400 text-sm font-semibold mb-6 flex items-center gap-2">
            <Activity size={16} /> Daily Spending Trend
          </h3>
          <DailyChart transactions={transactions} />
        </div>

        {/* BOTTOM SECTION (Breakdown & List) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="w-full text-left text-zinc-400 text-sm font-semibold mb-4 flex items-center gap-2">
                <Calendar size={14} /> Breakdown
              </h3>
              <div className="relative w-full h-64">
                <SpendingChart data={transactions} />
              </div>
            </div>
            <SubscriptionCard transactions={transactions} />
          </div>

          <div className="lg:col-span-2 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-zinc-200 font-semibold">Recent Transactions</h3>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                {currentMonthName}
              </span>
            </div>
            <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.map((t) => (
                <li key={t.id} className="group flex justify-between items-center bg-black/40 border border-zinc-800/50 p-4 rounded-2xl hover:bg-zinc-800/50 hover:border-zinc-700 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100">{t.description}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-2">
                        {t.date.toLocaleDateString()} • {t.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-white text-lg">-{symbol}{t.amount.toFixed(2)}</span>
                    <form action={deleteTransaction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-zinc-600 hover:text-red-500 p-2 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </form>
                  </div>
                </li>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-20 text-zinc-600">
                  <p>No transactions in {currentMonthName}.</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Sign In Required</h1>
          <SignInButton mode="modal"><button className="bg-white text-black font-bold px-10 py-4 rounded-full">Sign In</button></SignInButton>
        </div>
      </SignedOut>
    </div>
  )
}