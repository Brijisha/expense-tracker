import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecentActivity() {
  const { monthTransactions, categories, months, selectedMonth, selectedYear } = useExpenses();

  const recent = useMemo(
    () =>
      [...monthTransactions]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5),
    [monthTransactions]
  );

  const getCat = (id) =>
    categories.find((c) => c.id === id) || { icon: "📦", label: "Other" };

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <p className="text-2xl mb-1">📭</p>
          <p className="text-sm">No transactions in {months[selectedMonth].slice(0, 3)} {selectedYear}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Recent Activity
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {months[selectedMonth].slice(0, 3)} {selectedYear}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((tx) => {
          const cat = getCat(tx.category);
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <p className="font-medium text-sm leading-tight">
                    {tx.description || cat.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                </div>
              </div>
              <span
                className={`font-semibold text-sm whitespace-nowrap ${
                  tx.type === "income" ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {tx.type === "income" ? "+" : "−"}₹
                {Number(tx.amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
