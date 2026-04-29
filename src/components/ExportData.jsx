import { useExpenses } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";

function escapeCSV(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportData() {
  const {
    transactions,
    monthTransactions,
    yearTransactions,
    categories,
    months,
    selectedMonth,
    selectedYear,
  } = useExpenses();

  const getCat = (id) =>
    categories.find((c) => c.id === id) || { label: "Other", icon: "📦" };

  const exportCSV = (txList, filename) => {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = txList
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((tx) => [
        format(new Date(tx.date), "yyyy-MM-dd"),
        tx.type,
        getCat(tx.category).label,
        tx.amount,
        tx.description || "",
      ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = (txList, filename) => {
    const data = txList
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((tx) => ({
        date: format(new Date(tx.date), "yyyy-MM-dd"),
        type: tx.type,
        category: getCat(tx.category).label,
        amount: Number(tx.amount),
        description: tx.description || "",
      }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white backdrop-blur">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() =>
            exportCSV(
              monthTransactions,
              `expenses-${months[selectedMonth]}-${selectedYear}`
            )
          }
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          This Month (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            exportCSV(yearTransactions, `expenses-${selectedYear}`)
          }
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          This Year (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportCSV(transactions, "expenses-all")}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          All Data (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportJSON(transactions, "expenses-all")}
        >
          <FileText className="mr-2 h-4 w-4" />
          All Data (JSON)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
