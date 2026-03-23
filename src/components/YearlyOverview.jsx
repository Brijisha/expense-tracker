import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function YearlyOverview() {
  const { monthlyBreakdown, yearTotals, selectedYear, yearTransactions, categories } =
    useExpenses();

  // Cumulative savings for the year
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return monthlyBreakdown.map((m) => {
      cumulative += m.income - m.expense;
      return { ...m, cumulative };
    });
  }, [monthlyBreakdown]);

  // Top spending categories for the year
  const topCategories = useMemo(() => {
    const map = {};
    yearTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.category);
        if (!cat) return;
        if (!map[cat.id])
          map[cat.id] = { name: cat.label, icon: cat.icon, color: cat.color, value: 0 };
        map[cat.id].value += Number(t.amount);
      });
    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [yearTransactions, categories]);

  const savingsRate =
    yearTotals.income > 0
      ? (((yearTotals.income - yearTotals.expense) / yearTotals.income) * 100).toFixed(1)
      : 0;

  const avgMonthlyExpense = yearTotals.expense / 12;
  const avgMonthlyIncome = yearTotals.income / 12;

  return (
    <div className="space-y-4">
      {/* Year Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Year Income</p>
            <p className="text-lg font-bold text-emerald-500">
              ₹{yearTotals.income.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Year Expenses</p>
            <p className="text-lg font-bold text-rose-500">
              ₹{yearTotals.expense.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Savings Rate</p>
            <p className={`text-lg font-bold ${Number(savingsRate) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {savingsRate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Transactions</p>
            <p className="text-lg font-bold text-primary">
              {yearTransactions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Income vs Expenses — {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {yearTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data for {selectedYear}</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cumulative Savings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cumulative Savings</CardTitle>
          </CardHeader>
          <CardContent>
            {yearTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Savings"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categories + Averages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Year Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Avg Monthly Income</p>
                <p className="font-semibold text-emerald-500">
                  ₹{avgMonthlyIncome.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Avg Monthly Expense</p>
                <p className="font-semibold text-rose-500">
                  ₹{avgMonthlyExpense.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Top Spending Categories</p>
              {topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expenses yet</p>
              ) : (
                <div className="space-y-2">
                  {topCategories.map((cat) => {
                    const pct = yearTotals.expense > 0 ? (cat.value / yearTotals.expense) * 100 : 0;
                    return (
                      <div key={cat.name} className="flex items-center gap-2">
                        <span className="text-sm">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="truncate">{cat.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium w-20 text-right">
                          ₹{cat.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month-by-Month Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Month-by-Month Breakdown — {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Month</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Income</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Expenses</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Balance</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Txns</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map((m) => (
                  <tr key={m.month} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-medium">{m.fullName}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-500">
                      {m.income > 0
                        ? `₹${m.income.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-500">
                      {m.expense > 0
                        ? `₹${m.expense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-medium ${
                        m.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {m.income > 0 || m.expense > 0
                        ? `${m.balance >= 0 ? "+" : ""}₹${m.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      {m.count > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {m.count}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-2.5 pr-4">Total</td>
                  <td className="py-2.5 px-4 text-right text-emerald-500">
                    ₹{yearTotals.income.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-500">
                    ₹{yearTotals.expense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right ${
                      yearTotals.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {yearTotals.balance >= 0 ? "+" : ""}₹
                    {yearTotals.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 pl-4 text-right">{yearTransactions.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
