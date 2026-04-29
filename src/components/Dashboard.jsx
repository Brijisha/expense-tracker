import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";

function StatCard({ title, amount, icon: Icon, variant, subtitle }) {
  const linearMap = {
    balance: "from-violet-500 to-indigo-600",
    income: "from-emerald-400 to-teal-600",
    expense: "from-rose-400 to-red-600",
  };

  const textColorMap = {
    balance: "text-violet-600 dark:text-violet-300",
    income: "text-emerald-600 dark:text-emerald-300",
    expense: "text-rose-600 dark:text-rose-300",
  };

  return (
    <Card className="flex-1 min-w-50 overflow-hidden border-0 shadow-md">
      <div className={`h-1.5 w-full bg-linear-to-r ${linearMap[variant]}`} />
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-xl bg-linear-to-br ${linearMap[variant]} p-3 shadow-md`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={`text-2xl font-bold tracking-tight ${textColorMap[variant]}`}>
            ₹{Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { monthTotals, months, selectedMonth, selectedYear } = useExpenses();
  const label = `${months[selectedMonth].slice(0, 3)} ${selectedYear}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Balance"
        amount={monthTotals.balance}
        icon={Wallet}
        variant="balance"
        subtitle={label}
      />
      <StatCard
        title="Income"
        amount={monthTotals.income}
        icon={TrendingUp}
        variant="income"
        subtitle={label}
      />
      <StatCard
        title="Expenses"
        amount={monthTotals.expense}
        icon={TrendingDown}
        variant="expense"
        subtitle={label}
      />
    </div>
  );
}
