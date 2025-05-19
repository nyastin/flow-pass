import { Suspense } from "react";
import { AdminPanel } from "./_components/admin-panel";

export default function AdminPage() {
  return (
    <Suspense>
      <AdminPanel />
    </Suspense>
  );
}
