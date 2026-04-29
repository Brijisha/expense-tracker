import { Wallet } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ExportData from "@/components/ExportData";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-linear-to-r from-violet-700 via-indigo-600 to-purple-700 dark:from-violet-950 dark:via-indigo-950 dark:to-purple-950 shadow-lg">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2 shadow-inner backdrop-blur">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white drop-shadow">ExpenseTracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <ExportData />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
