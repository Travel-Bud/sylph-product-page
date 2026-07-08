import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SylphBirdLogo } from "@/components/custom/sylph-identity";

export default function TermsPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0c0e14] px-6 py-16">
      <div className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-[10px] border border-white/10 bg-white px-10 py-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="space-y-2 text-center">
          <SylphBirdLogo size={28} className="mx-auto" />
          <h1 className="text-xl font-semibold text-slate-900">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">Coming Soon</p>
        </div>
        <p className="text-center text-sm text-slate-500">
          Our terms of service are being prepared and will be available shortly.
        </p>
        <Link
          href="https://app.sylph-product.com/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#0d9488] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </main>
  );
}
