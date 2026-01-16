# 💰 AI Finance Pro

**AI Finance Pro** is a comprehensive personal finance dashboard built to solve the manual drudgery of expense tracking. It uses intelligent parsing logic to convert raw SMS transaction texts (e.g., from UPI or Bank alerts) into categorized financial records automatically.

## ✨ Key Features

- **🤖 Smart SMS Parser:** Paste raw transaction strings (e.g., *"Sent Rs 250 to Zomato..."*), and the system automatically extracts the Merchant, Amount, and Category using advanced Regex patterns.
- **🌍 Multi-Currency Support:** Global state management allows users to toggle between **USD ($)**, **INR (₹)**, **EUR (€)**, and **GBP (£)** seamlessly across the entire application.
- **📊 Interactive Data Visualization:** Real-time charts for Net Worth tracking, Monthly Spending Breakdown, and Daily Trends using Recharts.
- **🎯 Smart Budgeting:** Set monthly income/budget limits and get visual alerts when approaching spending caps.
- **🔐 Secure Authentication:** Enterprise-grade security using **Clerk** for user management and data protection.
- **📱 Responsive Design:** Fully responsive sidebar and layout optimized for desktop and mobile views.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via [Neon](https://neon.tech/))
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Auth:** Clerk
- **Components:** Lucide React, Recharts

## 💡 How it Works (The "Magic" Logic)

The core feature is the `parseTransaction` engine. It handles messy SMS data by:
1. **Sanitizing:** Removing bank headers, reference numbers, and junk words (e.g., "Ref", "UPI", "Debited").
2. **Extraction:** identifying the merchant name using lookahead regex patterns.
3. **Categorization:** Mapping keywords (e.g., "Swiggy", "Uber") to predefined categories like *Food* or *Transport*.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
