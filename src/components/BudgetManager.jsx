import { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function BudgetManager() {
  const {
    categories,
    budgets,
    setBudget,
    removeBudget,
    budgetStatus,
    months,
    selectedMonth,
    selectedYear,
  } = useExpenses();

  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const [amount, setAmount] = useState("");

  const expenseCategories = categories.filter(
    (c) => !["salary", "freelance", "investment"].includes(c.id)
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedCat || !amount) return;
    setBudget(selectedCat, amount);
    setSelectedCat("");
    setAmount("");
    setOpen(false);
  };

  const totalBudget = budgetStatus.reduce((s, b) => s + b.budget, 0);
  const totalSpent = budgetStatus.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-4">
      {/* Budget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Budget Tracker
            <span className="text-sm font-normal text-muted-foreground">
              — {months[selectedMonth]} {selectedYear}
            </span>
          </h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCat} onValueChange={setSelectedCat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                        {budgets[cat.id] ? ` (₹${budgets[cat.id]})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Budget (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Budget</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgetStatus.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No budgets set yet</p>
            <p className="text-sm">Click &quot;Set Budget&quot; to add monthly spending limits per category.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Budget Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Budget</span>
                <span className="text-sm text-muted-foreground">
                  ₹{totalSpent.toLocaleString("en-IN")} / ₹{totalBudget.toLocaleString("en-IN")}
                </span>
              </div>
              <Progress
                value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}
                className="h-3"
              />
              {totalSpent > totalBudget && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Over budget by ₹{(totalSpent - totalBudget).toLocaleString("en-IN")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Per-Category Budget Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgetStatus.map((item) => (
              <Card key={item.id} className={item.overBudget ? "border-rose-500/50" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeBudget(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={item.overBudget ? "text-rose-500 font-medium" : "text-muted-foreground"}>
                        ₹{item.spent.toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground">
                        ₹{item.budget.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Progress
                      value={item.percentage}
                      className={`h-2 ${item.overBudget ? "[&>div]:bg-rose-500" : item.percentage > 80 ? "[&>div]:bg-amber-500" : ""}`}
                    />
                  </div>

                  <div className="text-xs">
                    {item.overBudget ? (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Over by ₹{Math.abs(item.remaining).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        ₹{item.remaining.toLocaleString("en-IN")} remaining
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
