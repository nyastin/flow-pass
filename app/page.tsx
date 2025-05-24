import { RegistrationForm } from "@/components/registration-form";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-950 to-slate-900 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/4DK ON GRADIENT.png"
              alt="4DK Logo"
              width={160}
              height={160}
              className="h-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold italic text-teal-400">
            THE CHASE 3.0
          </h1>
          <p className="text-xl text-slate-300 mt-2">
            A Fundraising Dance Concert
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Pushing us forward to the 2025 World Hip Hop Dance Championship
          </p>
          <p className="text-sm text-slate-400 mt-3">
            Register now to secure your spot!
          </p>
        </div>
        <RegistrationForm />
        <SiteFooter />
      </div>
    </main>
  );
}
