import { Suspense } from "react";
import { AdminPanel } from "./_components/admin-panel";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="flex-1">
        <Suspense>
          <AdminPanel />
        </Suspense>
      </div>
      <div className="container mx-auto px-4">
        <footer className="mt-10 pt-6 border-t border-slate-800 text-slate-400 text-center text-xs">
          <div className="flex justify-center space-x-4 mb-4">
            <p>Flowpass by Justin Valencia</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
