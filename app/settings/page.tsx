import { UserProfile } from '@clerk/nextjs'

export default function SettingsPage() {
  return (
    <div className="flex justify-center py-10">
      <UserProfile 
        routing="hash" // <--- THIS ONE LINE FIXES THE ERROR 🛠️
        appearance={{
          elements: {
            rootBox: "w-full max-w-4xl",
            card: "bg-zinc-900 border border-zinc-800 shadow-xl",
            navbar: "hidden",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            formFieldLabel: "text-zinc-300",
            formFieldInput: "bg-black border-zinc-800 text-white",
            footer: "hidden"
          }
        }}
      />
    </div>
  )
}