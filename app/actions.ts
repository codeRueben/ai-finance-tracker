'use server'

import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- 1. THE LOCAL AI BRAIN 🧠 ---
export async function getFinancialAdvice(userQuestion: string) {
  const { userId } = await auth()
  if (!userId) return "Please sign in to get advice."

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 50
  })

  const settings = await prisma.userSettings.findUnique({ where: { userId } })
  const budget = settings?.budget || 2000
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  const question = userQuestion.toLowerCase()
  let response = "I'm not sure about that specific detail, but I can tell you that you're tracking your finances well!"

  if (question.match(/spent on (food|coffee|transport|uber|shopping|entertainment|bills)/)) {
    const categoryMatch = question.match(/spent on (food|coffee|transport|uber|shopping|entertainment|bills)/)
    const category = categoryMatch ? categoryMatch[1] : ""
    const catTotal = transactions
      .filter(t => t.description.toLowerCase().includes(category) || (t.category && t.category.toLowerCase().includes(category)))
      .reduce((sum, t) => sum + t.amount, 0)
    
    response = `You have spent ${catTotal.toFixed(2)} on ${category} recently. `
    if (catTotal > 300) response += "That is quite a bit! 😅 Maybe try to cut back next week?"
    else response += "That is a healthy amount. Keep it up! 👍"
  }
  else if (question.includes("budget") || question.includes("limit") || question.includes("over")) {
    const remaining = budget - totalSpent
    if (remaining < 0) {
      response = `⚠️ Alert: You are over budget by ${Math.abs(remaining).toFixed(0)}. You have spent ${totalSpent.toFixed(0)} of your ${budget} limit.`
    } else {
      response = `✅ You are safe! You have spent ${totalSpent.toFixed(0)} of your ${budget} limit. You have ${remaining.toFixed(0)} left to spend.`
    }
  }
  else if (question.includes("how") && question.includes("doing") || question.includes("status")) {
    const highestTx = transactions.sort((a, b) => b.amount - a.amount)[0]
    response = `You have spent ${totalSpent.toFixed(0)} in total. Your biggest expense recently was ${highestTx?.description} for ${highestTx?.amount}.`
  }
  else if (question.includes("save") || question.includes("advice") || question.includes("help")) {
    response = "My best advice: Try to follow the 50/30/20 rule. 50% on needs, 30% on wants, and 20% to your savings jars! 🍯"
  }

  await new Promise(resolve => setTimeout(resolve, 1000))
  return response
}

// --- 2. SMART ADD TRANSACTION (UPDATED FOR CLEAN SMS) ---
function parseTransaction(input: string) {
  const amountMatch = input.match(/(\$|Rs|INR|₹)?\s?[\d,]+(\.\d{1,2})?/)
  const amount = amountMatch ? parseFloat(amountMatch[0].replace(/[^0-9.]/g, '')) : 0

  let description = input
  
  const merchantMatch = input.match(/(?:To|At|Paid)\s+([A-Z\s]+?)(?=\s+(?:on|for|via|Ref|UPI|from|Bank|A\/C|Credit|Debit|Act|Avbl)|$)/i)
  
  if (merchantMatch && merchantMatch[1]) {
    description = merchantMatch[1].trim()
  } else {
    description = description.replace(amountMatch ? amountMatch[0] : '', '')
    description = description.replace(/(Paid to|Debited from|Sent to|VPA|Ref|UPI|Transaction|on|at|for|Rs\.|INR)/gi, '')
    description = description.replace(/\b\d{6,}\b/g, '')
    description = description.replace(/(HDFC|ICICI|SBI|AXIS|Bank|A\/C)/gi, '')
  }

  description = description.trim().replace(/\s+/g, ' ')
  
  if (description.length > 20) {
      description = description.substring(0, 20) + "..."
  }

  if (description.length > 2) {
      description = description.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
  }

  const lowerDesc = description.toLowerCase()
  let category = 'Uncategorized'
  
  if (lowerDesc.match(/(coffee|starbucks|dunkin|latte|food|burger|pizza|lunch|dinner|mcdonalds|zomato|swiggy|zepto|blinkit)/)) category = 'Food & Drink'
  else if (lowerDesc.match(/(uber|lyft|ola|rapido|gas|fuel|parking|train|bus|metro)/)) category = 'Transport'
  else if (lowerDesc.match(/(netflix|spotify|hulu|prime|movie|cinema|game|xbox|ps5)/)) category = 'Entertainment'
  else if (lowerDesc.match(/(grocery|walmart|target|whole|trader|market|basket)/)) category = 'Groceries'
  else if (lowerDesc.match(/(gym|fitness|health|doctor|pharmacy|cvs|1mg)/)) category = 'Health'
  else if (lowerDesc.match(/(amazon|shop|clothing|nike|zara|myntra|flipkart)/)) category = 'Shopping'
  else if (lowerDesc.match(/(rent|internet|wifi|bill|electric|water)/)) category = 'Bills'

  if (lowerDesc.includes('zepto') || lowerDesc.includes('blinkit')) category = 'Groceries'
  if (lowerDesc.includes('zomato') || lowerDesc.includes('swiggy')) category = 'Food & Drink'

  return { amount, description, category }
}

export async function addSmartTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const rawInput = formData.get('input') as string
  const { amount, description, category } = parseTransaction(rawInput)

  if (amount > 0 && description) {
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        description,
        category,
        date: new Date(),
      },
    })
    revalidatePath('/')
  }
}

// --- 3. STANDARD ACTIONS ---
export async function addTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const text = formData.get('text') as string
  const amount = parseFloat(formData.get('amount') as string)
  if (!text || !amount) return

  await prisma.transaction.create({
    data: {
      userId,
      description: text,
      amount,
      category: 'Uncategorized',
      date: new Date()
    }
  })
  revalidatePath('/')
}

export async function deleteTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const id = formData.get('id') as string
  await prisma.transaction.deleteMany({
    where: { id, userId }
  })
  revalidatePath('/')
}

export async function updateSettings(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const budget = parseFloat(formData.get('budget') as string)
  const income = parseFloat(formData.get('income') as string)
  const rawCurrency = formData.get('currency') as string

  const existingSettings = await prisma.userSettings.findUnique({ where: { userId } })
  const currency = rawCurrency || (existingSettings as any)?.currency || 'USD'

  // @ts-ignore
  await prisma.userSettings.upsert({
    where: { userId },
    // @ts-ignore
    update: { budget, income, currency },
    // @ts-ignore
    create: { userId, budget, income, currency },
  })

  revalidatePath('/')
  revalidatePath('/settings')
  revalidatePath('/budget')
}

export async function addSavingsGoal(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const target = parseFloat(formData.get('target') as string)
  const emoji = formData.get('emoji') as string || '💰'

  if (name && target > 0) {
    await prisma.savingsGoal.create({
      data: { userId, name, target, current: 0, emoji }
    })
    revalidatePath('/')
  }
}

export async function updateSavingsProgress(formData: FormData) {
  const { userId } = await auth()
  const id = formData.get('id') as string
  const amount = parseFloat(formData.get('amount') as string)

  const goal = await prisma.savingsGoal.findUnique({ where: { id } })
  
  if (goal && userId === goal.userId) {
    await prisma.savingsGoal.update({
      where: { id },
      data: { current: goal.current + amount }
    })
    revalidatePath('/')
  }
}

export async function addAccount(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const balance = parseFloat(formData.get('balance') as string)
  const category = formData.get('category') as string 
  
  const type = (category === "Cash" || category === "Investment") ? "Asset" : "Liability"

  await prisma.account.create({
    data: { userId, name, balance, category, type }
  })
  revalidatePath('/accounts')
}

export async function deleteAccount(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const id = formData.get('id') as string
  
  await prisma.account.deleteMany({ where: { id, userId } })
  revalidatePath('/accounts')
}

// --- 4. THE NEW CURRENCY ACTION (FIXED) ---
export async function updateCurrency(currencyCode: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // @ts-ignore
  await prisma.userSettings.upsert({
    where: { userId },
    // @ts-ignore
    update: { currency: currencyCode },
    // @ts-ignore
    create: { 
      userId, 
      currency: currencyCode,
      budget: 2000, 
      income: 4500 
    }
  })

  revalidatePath('/')
  revalidatePath('/settings')
}
// ... keep all existing code ...

// --- ADD THIS TO THE BOTTOM ---
export async function deleteSavingsGoal(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const id = formData.get('id') as string
  await prisma.savingsGoal.deleteMany({ where: { id, userId } })
  revalidatePath('/')
}