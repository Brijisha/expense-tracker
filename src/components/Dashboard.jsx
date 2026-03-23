import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

function StatCard({ title, amount, icon: Icon, variant }) {
  const colorMap = {
    balance: "text-primary",
    income: "text-emerald-500",
    expense: "text-rose-500",
  };

  const bgMap = {
    balance: "bg-primary/10",
    income: "bg-emerald-500/10",
    expense: "bg-rose-500/10",
  };

  return (
    <Card className="flex-1 min-w-[200px]">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-xl p-3 ${bgMap[variant]}`}>
          <Icon className={`h-6 w-6 ${colorMap[variant]}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold tracking-tight ${colorMap[variant]}`}>
            ₹{Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { totals } = useExpenses();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Total Balance"
        amount={totals.balance}
        icon={Wallet}
        variant="balance"
      />
      <StatCard
        title="Total Income"
        amount={totals.income}
        icon={TrendingUp}
        variant="income"
      />
      <StatCard
        title="Total Expenses"
        amount={totals.expense}
        icon={TrendingDown}
        variant="expense"
      />
    </div>
  );
}
