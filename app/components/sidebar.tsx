'use client'

import { LayoutDashboard, MessageSquareText, Wallet, Settings, LogOut, Zap, Landmark, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Accounts', icon: Landmark, path: '/accounts' },
    { name: 'AI Advisor', icon: MessageSquareText, path: '/advisor' },
    { name: 'My Budget', icon: Wallet, path: '/budget' },
    { name: 'Subscriptions', icon: Zap, path: '/subscriptions' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ]

  return (
    <>
      {/* SIDEBAR CONTAINER */}
      <div 
        className={`fixed left-0 top-0 z-50 h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col transition-all duration-300 ${
          isOpen ? 'w-80 shadow-2xl shadow-black' : 'w-20'
        }`}
      >
        
        {/* HEADER & TOGGLE BUTTON */}
        <div className="flex items-center gap-4 p-6 mb-4">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 bg-zinc-900 rounded-xl text-white hover:bg-zinc-800 transition shrink-0"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
             <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0">AI</div>
             <h1 className="text-2xl font-bold text-white tracking-tight whitespace-nowrap">Finance Pro</h1>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 space-y-3 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)} // Optional: Close on click (mobile feel)
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <item.icon size={26} className="shrink-0" />
                
                {/* Text hides when closed, shows when open */}
                <span className={`font-semibold text-lg transition-all duration-300 ${
                    isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 hidden'
                }`}>
                    {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 border-t border-zinc-900">
          <SignOutButton>
            <button className="flex items-center gap-4 px-4 py-4 rounded-2xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 w-full transition whitespace-nowrap">
              <LogOut size={26} className="shrink-0" />
              <span className={`font-semibold text-lg transition-all duration-300 ${
                  isOpen ? 'opacity-100' : 'opacity-0 hidden'
              }`}>
                  Sign Out
              </span>
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* BACKDROP (Click outside to close) */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}