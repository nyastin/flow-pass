import { RegistrationForm } from "@/components/registration-form"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-400">4DK</h1>
          <p className="text-xl text-slate-300 mt-2">Fundraising Dance Concert</p>
          <p className="text-sm text-slate-400 mt-1">Register now to secure your spot!</p>
        </div>
        <RegistrationForm />
      </div>
    </main>
  )
}
