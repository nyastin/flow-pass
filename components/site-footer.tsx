import { Instagram, Facebook } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-10 pt-6 border-t border-slate-800 text-slate-400 text-center text-xs">
      <div className="flex justify-center space-x-4 mb-4">
        <Link
          href="https://www.instagram.com/4dkofficialph/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-teal-400 transition-colors"
        >
          <Instagram className="h-5 w-5" />
          <span className="sr-only">Instagram</span>
        </Link>
        <Link
          href="https://www.facebook.com/4DK.philippines"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-teal-400 transition-colors"
        >
          <Facebook className="h-5 w-5" />
          <span className="sr-only">Facebook</span>
        </Link>
      </div>
      <p className="mb-1">© 2025 4DK The Chase 3.0. All rights reserved.</p>
      <p>Flowpass by Justin Valencia</p>
    </footer>
  );
}

