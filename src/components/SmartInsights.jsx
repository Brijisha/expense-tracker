import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Flame,
  PiggyBank,
  CalendarClock,
} from "lucide-react";

export default function SmartInsights() {
  const {
    monthTransactions,
    monthTotals,
    prevMonthData,
    budgetStatus,
    categories,
    months,
    selectedMonth,
    selectedYear,
    yearTotals,
    yearTransactions,
  } = useExpenses();

  const insights = useMemo(() => {
    const tips = [];

    // 1. Spending trend
    if (prevMonthData.expense > 0 && monthTotals.expense > 0) {
      const change = ((monthTotals.expense - prevMonthData.expense) / prevMonthData.expense) * 100;
      if (change > 20) {
        tips.push({
          icon: TrendingUp,
          type: "warning",
          text: `Spending is up ${change.toFixed(0)}% compared to ${prevMonthData.label}. Keep an eye on your budget!`,
        });
      } else if (change < -10) {
        tips.push({
          icon: TrendingDown,
          type: "success",
          text: `Great! You spent ${Math.abs(change).toFixed(0)}% less than ${prevMonthData.label}. Keep it up! 🎉`,
        });
      }
    }

    // 2. Budget warnings
    const overBudgetItems = budgetStatus.filter((b) => b.overBudget);
    if (overBudgetItems.length > 0) {
      const names = overBudgetItems.map((b) => b.label).join(", ");
      tips.push({
        icon: AlertTriangle,
        type: "destructive",
        text: `Over budget in: ${names}. Consider cutting back in these areas.`,
      });
    }

    const nearBudgetItems = budgetStatus.filter(
      (b) => !b.overBudget && b.percentage > 80
    );
    if (nearBudgetItems.length > 0) {
      tips.push({
        icon: AlertTriangle,
        type: "warning",
        text: `Almost at budget limit for: ${nearBudgetItems.map((b) => b.label).join(", ")}`,
      });
    }

    // 3. Savings rate
    if (monthTotals.income > 0) {
      const rate = ((monthTotals.income - monthTotals.expense) / monthTotals.income) * 100;
      if (rate >= 30) {
        tips.push({
          icon: PiggyBank,
          type: "success",
          text: `Amazing! You're saving ${rate.toFixed(0)}% of your income this month. 💪`,
        });
      } else if (rate >= 10) {
        tips.push({
          icon: CheckCircle2,
          type: "default",
          text: `Saving ${rate.toFixed(0)}% of income. Aim for 20-30% for better financial health.`,
        });
      } else if (rate > 0) {
        tips.push({
          icon: Lightbulb,
          type: "warning",
          text: `Only saving ${rate.toFixed(0)}% of income. Try to reduce discretionary spending.`,
        });
      } else {
        tips.push({
          icon: AlertTriangle,
          type: "destructive",
          text: "You're spending more than you earn this month. Review your expenses!",
        });
      }
    }

    // 4. Top spending category
    const expenseByCategory = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseByCategory[t.category] =
          (expenseByCategory[t.category] || 0) + Number(t.amount);
      });
    const topCatId = Object.entries(expenseByCategory).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (topCatId && monthTotals.expense > 0) {
      const cat = categories.find((c) => c.id === topCatId[0]);
      const pct = ((topCatId[1] / monthTotals.expense) * 100).toFixed(0);
      if (cat && Number(pct) > 40) {
        tips.push({
          icon: Flame,
          type: "warning",
          text: `${cat.icon} ${cat.label} makes up ${pct}% of your spending. Diversify your budget.`,
        });
      }
    }

    // 5. No income warning
    if (monthTotals.income === 0 && monthTransactions.length > 0) {
      tips.push({
        icon: Lightbulb,
        type: "default",
        text: "No income recorded this month. Don't forget to log your salary or freelance income!",
      });
    }

    // 6. Year-end projection
    if (selectedMonth >= 3 && yearTotals.income > 0) {
      const monthsElapsed = selectedMonth + 1;
      const projectedYearExpense = (yearTotals.expense / monthsElapsed) * 12;
      const projectedYearIncome = (yearTotals.income / monthsElapsed) * 12;
      tips.push({
        icon: CalendarClock,
        type: "default",
        text: `Year-end projection: ₹${projectedYearIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })} income, ₹${projectedYearExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })} expenses.`,
      });
    }

    return tips;
  }, [
    monthTransactions,
    monthTotals,
    prevMonthData,
    budgetStatus,
    categories,
    selectedMonth,
    yearTotals,
  ]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          const colorMap = {
            success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
            warning: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
            destructive: "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400",
            default: "border-primary/20 bg-primary/5 text-foreground",
          };
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 ${colorMap[insight.type]}`}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{insight.text}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
