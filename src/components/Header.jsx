import { Wallet } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ExpenseTracker</h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Track your income & expenses
        </p>
      </div>
    </header>
  );
}
