import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecentActivity() {
  const { transactions, categories } = useExpenses();

  const recent = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const getCat = (id) =>
    categories.find((c) => c.id === id) || { icon: "📦", label: "Other" };

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
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
