import { createContext, useContext, useReducer, useEffect } from "react";

const ExpenseContext = createContext();

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

function saveToStorage(transactions) {
  localStorage.setItem("expense-tracker-data", JSON.stringify(transactions));
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

  useEffect(() => {
    saveToStorage(transactions);
  }, [transactions]);

  const addTransaction = (transaction) => {
    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    });
  };

  const deleteTransaction = (id) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const editTransaction = (transaction) => {
    dispatch({ type: "EDIT_TRANSACTION", payload: transaction });
  };

  const totals = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount);
      if (t.type === "income") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories: CATEGORIES,
        totals,
        addTransaction,
        deleteTransaction,
        editTransaction,
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
