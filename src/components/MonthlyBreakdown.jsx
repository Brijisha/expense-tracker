import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold mb-1">{label ? `Day ${label}` : payload[0]?.payload?.name}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function MonthlyBreakdown() {
  const {
    months,
    selectedMonth,
    selectedYear,
    monthTransactions,
    monthTotals,
    dailyBreakdown,
    getCategoryBreakdown,
    categories,
  } = useExpenses();

  const categoryData = useMemo(
    () => getCategoryBreakdown(monthTransactions),
    [monthTransactions, getCategoryBreakdown]
  );

  // Income categories breakdown
  const incomeCategories = useMemo(() => {
    const map = {};
    monthTransactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.category);
        if (!cat) return;
        if (!map[cat.id])
          map[cat.id] = { name: cat.label, icon: cat.icon, color: cat.color, value: 0 };
        map[cat.id].value += Number(t.amount);
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [monthTransactions, categories]);

  // Biggest single transactions
  const topExpense = useMemo(() => {
    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => Number(b.amount) - Number(a.amount));
    return expenses[0] || null;
  }, [monthTransactions]);

  const topIncome = useMemo(() => {
    const incomes = monthTransactions
      .filter((t) => t.type === "income")
      .sort((a, b) => Number(b.amount) - Number(a.amount));
    return incomes[0] || null;
  }, [monthTransactions]);

  const monthName = months[selectedMonth];
  const savingsRate =
    monthTotals.income > 0
      ? (((monthTotals.income - monthTotals.expense) / monthTotals.income) * 100).toFixed(1)
      : 0;

  const getCat = (id) =>
    categories.find((c) => c.id === id) || { icon: "📦", label: "Other" };

  return (
    <div className="space-y-4">
      {/* Month Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-base font-bold text-emerald-500">
                ₹{monthTotals.income.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-rose-500/10 p-2">
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-base font-bold text-rose-500">
                ₹{monthTotals.expense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className={`text-base font-bold ${monthTotals.balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {monthTotals.balance >= 0 ? "+" : ""}₹
                {Math.abs(monthTotals.balance).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Receipt className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Savings Rate</p>
              <p className={`text-base font-bold ${Number(savingsRate) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {savingsRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {monthTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-4xl mb-2">📭</p>
            <p className="font-medium">No transactions in {monthName} {selectedYear}</p>
            <p className="text-sm">Add some transactions to see the breakdown.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Daily Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Daily Spending — {monthName} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense Category Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expenses</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 w-full mt-2">
                      {categoryData.map((entry) => {
                        const pct =
                          monthTotals.expense > 0
                            ? ((entry.value / monthTotals.expense) * 100).toFixed(1)
                            : 0;
                        return (
                          <div key={entry.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>
                                {entry.icon} {entry.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground text-xs">{pct}%</span>
                              <span className="font-medium">
                                ₹{entry.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Month Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Income Sources */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Income Sources</p>
                  {incomeCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No income recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {incomeCategories.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between">
                          <span className="text-sm">
                            {cat.icon} {cat.name}
                          </span>
                          <span className="font-medium text-emerald-500 text-sm">
                            ₹{cat.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Biggest Transactions */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Biggest Transactions
                  </p>
                  <div className="space-y-2">
                    {topIncome && (
                      <div className="flex items-center justify-between rounded-lg bg-emerald-500/5 p-2.5">
                        <div className="flex items-center gap-2">
                          <span>{getCat(topIncome.category).icon}</span>
                          <div>
                            <p className="text-sm font-medium">
                              {topIncome.description || getCat(topIncome.category).label}
                            </p>
                            <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                              Highest Income
                            </Badge>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-500">
                          +₹{Number(topIncome.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {topExpense && (
                      <div className="flex items-center justify-between rounded-lg bg-rose-500/5 p-2.5">
                        <div className="flex items-center gap-2">
                          <span>{getCat(topExpense.category).icon}</span>
                          <div>
                            <p className="text-sm font-medium">
                              {topExpense.description || getCat(topExpense.category).label}
                            </p>
                            <Badge className="bg-rose-500/10 text-rose-600 text-[10px]">
                              Highest Expense
                            </Badge>
                          </div>
                        </div>
                        <span className="font-bold text-rose-500">
                          −₹{Number(topExpense.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Average */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Daily Avg Expense</p>
                    <p className="font-semibold text-rose-500">
                      ₹{dailyBreakdown.length > 0
                        ? (monthTotals.expense / dailyBreakdown.length).toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })
                        : "0"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Transactions</p>
                    <p className="font-semibold text-primary">{monthTransactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
