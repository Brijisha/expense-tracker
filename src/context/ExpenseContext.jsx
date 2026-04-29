import { createContext, useContext, useReducer, useEffect, useState, useMemo } from "react";
import { parseISO, getYear, getMonth } from "date-fns";
import { toast } from "sonner";

const ExpenseContext = createContext();

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍔", color: "#f97316" },
  { id: "transport", label: "Transport", icon: "🚗", color: "#3b82f6" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#ec4899" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#8b5cf6" },
  { id: "bills", label: "Bills & Utilities", icon: "💡", color: "#eab308" },
  { id: "health", label: "Health", icon: "🏥", color: "#ef4444" },
  { id: "education", label: "Education", icon: "📚", color: "#06b6d4" },
  { id: "salary", label: "Salary", icon: "💰", color: "#22c55e" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "#14b8a6" },
  { id: "investment", label: "Investment", icon: "📈", color: "#a855f7" },
  { id: "gift", label: "Gift", icon: "🎁", color: "#f43f5e" },
  { id: "other", label: "Other", icon: "📦", color: "#6b7280" },
];

function loadFromStorage() {
  try {
    const data = localStorage.getItem("expense-tracker-data");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadBudgets() {
  try {
    const data = localStorage.getItem("expense-tracker-budgets");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveToStorage(transactions) {
  localStorage.setItem("expense-tracker-data", JSON.stringify(transactions));
}

function saveBudgets(budgets) {
  localStorage.setItem("expense-tracker-budgets", JSON.stringify(budgets));
}

function transactionReducer(state, action) {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return [action.payload, ...state];
    case "DELETE_TRANSACTION":
      return state.filter((t) => t.id !== action.payload);
    case "EDIT_TRANSACTION":
      return state.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [transactions, dispatch] = useReducer(
    transactionReducer,
    null,
    loadFromStorage
  );

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [budgets, setBudgetsState] = useState(loadBudgets);

  useEffect(() => {
    saveToStorage(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  const addTransaction = (transaction) => {
    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    });
    toast.success(`${transaction.type === "income" ? "Income" : "Expense"} added — ₹${Number(transaction.amount).toLocaleString("en-IN")}`);
  };

  const deleteTransaction = (id) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
    toast.success("Transaction deleted");
  };

  const editTransaction = (transaction) => {
    dispatch({ type: "EDIT_TRANSACTION", payload: transaction });
    toast.success("Transaction updated");
  };

  // All-time totals
  const totals = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount);
      if (t.type === "income") acc.income += amount;
      else acc.expense += amount;
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  // Available years from 2020 to current year
  const availableYears = useMemo(() => {
    const currentYear = now.getFullYear();
    const years = [];
    for (let y = currentYear; y >= 2020; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Transactions filtered by selected year
  const yearTransactions = useMemo(
    () => transactions.filter((t) => getYear(parseISO(t.date)) === selectedYear),
    [transactions, selectedYear]
  );

  // Transactions filtered by selected year + month
  const monthTransactions = useMemo(
    () =>
      yearTransactions.filter(
        (t) => getMonth(parseISO(t.date)) === selectedMonth
      ),
    [yearTransactions, selectedMonth]
  );

  // Year totals
  const yearTotals = useMemo(
    () =>
      yearTransactions.reduce(
        (acc, t) => {
          const amount = Number(t.amount);
          if (t.type === "income") acc.income += amount;
          else acc.expense += amount;
          acc.balance = acc.income - acc.expense;
          return acc;
        },
        { income: 0, expense: 0, balance: 0 }
      ),
    [yearTransactions]
  );

  // Month totals
  const monthTotals = useMemo(
    () =>
      monthTransactions.reduce(
        (acc, t) => {
          const amount = Number(t.amount);
          if (t.type === "income") acc.income += amount;
          else acc.expense += amount;
          acc.balance = acc.income - acc.expense;
          return acc;
        },
        { income: 0, expense: 0, balance: 0 }
      ),
    [monthTransactions]
  );

  // Monthly breakdown for the selected year (all 12 months)
  const monthlyBreakdown = useMemo(() => {
    const data = MONTHS.map((name, i) => ({
      month: i,
      name: name.slice(0, 3),
      fullName: name,
      income: 0,
      expense: 0,
      balance: 0,
      count: 0,
    }));
    yearTransactions.forEach((t) => {
      const m = getMonth(parseISO(t.date));
      const amount = Number(t.amount);
      if (t.type === "income") data[m].income += amount;
      else data[m].expense += amount;
      data[m].balance = data[m].income - data[m].expense;
      data[m].count += 1;
    });
    return data;
  }, [yearTransactions]);

  // Daily breakdown for the selected month
  const dailyBreakdown = useMemo(() => {
    const map = {};
    monthTransactions.forEach((t) => {
      const day = parseISO(t.date).getDate();
      if (!map[day]) map[day] = { day, income: 0, expense: 0 };
      if (t.type === "income") map[day].income += Number(t.amount);
      else map[day].expense += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => a.day - b.day);
  }, [monthTransactions]);

  // Category breakdown for filtered transactions
  const getCategoryBreakdown = (txList) => {
    const map = {};
    txList
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = CATEGORIES.find((c) => c.id === t.category);
        if (!cat) return;
        if (!map[cat.id])
          map[cat.id] = { id: cat.id, name: cat.label, value: 0, color: cat.color, icon: cat.icon };
        map[cat.id].value += Number(t.amount);
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  };

  // Budget management
  const setBudget = (categoryId, amount) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    setBudgetsState((prev) => ({
      ...prev,
      [categoryId]: Number(amount),
    }));
    toast.success(`Budget set for ${cat?.label || categoryId} — ₹${Number(amount).toLocaleString("en-IN")}`);
  };

  const removeBudget = (categoryId) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    setBudgetsState((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    toast.success(`Budget removed for ${cat?.label || categoryId}`);
  };

  // Budget vs actual for current month
  const budgetStatus = useMemo(() => {
    const expenseCategories = CATEGORIES.filter(
      (c) => !["salary", "freelance", "investment"].includes(c.id)
    );
    return expenseCategories
      .filter((cat) => budgets[cat.id] > 0)
      .map((cat) => {
        const spent = monthTransactions
          .filter((t) => t.type === "expense" && t.category === cat.id)
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const budget = budgets[cat.id];
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        return {
          ...cat,
          budget,
          spent,
          remaining: budget - spent,
          percentage: Math.min(percentage, 100),
          overBudget: spent > budget,
        };
      });
  }, [budgets, monthTransactions]);

  // Previous month data for comparison
  const prevMonthData = useMemo(() => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const prevTx = transactions.filter(
      (t) =>
        getYear(parseISO(t.date)) === prevYear &&
        getMonth(parseISO(t.date)) === prevMonth
    );
    const income = prevTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = prevTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return {
      month: prevMonth,
      year: prevYear,
      label: `${MONTHS[prevMonth].slice(0, 3)} ${prevYear}`,
      income,
      expense,
      balance: income - expense,
      count: prevTx.length,
    };
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories: CATEGORIES,
        months: MONTHS,
        totals,
        addTransaction,
        deleteTransaction,
        editTransaction,
        // Year/Month selection
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        availableYears,
        // Filtered data
        yearTransactions,
        monthTransactions,
        yearTotals,
        monthTotals,
        monthlyBreakdown,
        dailyBreakdown,
        getCategoryBreakdown,
        // Budget system
        budgets,
        setBudget,
        removeBudget,
        budgetStatus,
        // Comparison
        prevMonthData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpenseProvider");
  }
  return context;
}
