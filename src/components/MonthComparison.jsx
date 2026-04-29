import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

function ComparisonRow({ label, current, previous, invert = false }) {
  const diff = current - previous;
  const pctChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : current > 0 ? 100 : 0;
  const isUp = diff > 0;
  const isGood = invert ? !isUp : isUp;

  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">
            ₹{current.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground">
            vs ₹{previous.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        {diff === 0 ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-1">
            <Minus className="h-3 w-3" />
            0%
          </div>
        ) : (
          <div
            className={`flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
              isGood
                ? "text-emerald-600 bg-emerald-500/10"
                : "text-rose-600 bg-rose-500/10"
            }`}
          >
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(pctChange)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonthComparison() {
  const { monthTotals, prevMonthData, months, selectedMonth, selectedYear } =
    useExpenses();

  const currentLabel = `${months[selectedMonth].slice(0, 3)} ${selectedYear}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Month vs Month
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {currentLabel} vs {prevMonthData.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComparisonRow
          label="Income"
          current={monthTotals.income}
          previous={prevMonthData.income}
        />
        <ComparisonRow
          label="Expenses"
          current={monthTotals.expense}
          previous={prevMonthData.expense}
          invert
        />
        <ComparisonRow
          label="Balance"
          current={monthTotals.balance}
          previous={prevMonthData.balance}
        />
      </CardContent>
    </Card>
  );
}
