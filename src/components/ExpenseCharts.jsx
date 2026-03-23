import { useMemo } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium">{d.name || d.payload?.name}</p>
      <p className="text-muted-foreground">
        ₹{Number(d.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function ExpenseCharts() {
  const { transactions, categories } = useExpenses();

  const categoryData = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.category);
        if (!cat) return;
        if (!map[cat.id]) {
          map[cat.id] = { name: cat.label, value: 0, color: cat.color, icon: cat.icon };
        }
        map[cat.id].value += Number(t.amount);
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const monthKey = format(startOfMonth(parseISO(t.date)), "yyyy-MM");
      if (!map[monthKey]) {
        map[monthKey] = { month: format(parseISO(t.date), "MMM yyyy"), income: 0, expense: 0 };
      }
      if (t.type === "income") {
        map[monthKey].income += Number(t.amount);
      } else {
        map[monthKey].expense += Number(t.amount);
      }
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">📊</p>
          <p>Add some transactions to see your charts!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Expense by Category - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses recorded yet
            </p>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">
                      {entry.icon} {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Income vs Expenses - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No data to display
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
