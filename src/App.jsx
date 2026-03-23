import { useState } from "react";
import { ExpenseProvider } from "@/context/ExpenseContext";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import MonthYearPicker from "@/components/MonthYearPicker";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExpenseCharts from "@/components/ExpenseCharts";
import RecentActivity from "@/components/RecentActivity";
import MonthlyBreakdown from "@/components/MonthlyBreakdown";
import YearlyOverview from "@/components/YearlyOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  List,
  CalendarDays,
  CalendarRange,
  BarChart3,
} from "lucide-react";

function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
          {/* Top Bar — Month/Year Picker + Add Transaction */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Welcome back 👋
                </h2>
                <p className="text-muted-foreground text-sm">
                  Here&apos;s an overview of your finances
                </p>
              </div>
              <MonthYearPicker />
            </div>
            <TransactionForm />
          </div>

          {/* Summary Cards (filtered by month) */}
          <Dashboard />

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Monthly</span>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="gap-2">
                <CalendarRange className="h-4 w-4" />
                <span className="hidden sm:inline">Yearly</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <ExpenseCharts />
                </div>
                <RecentActivity />
              </div>
            </TabsContent>

            <TabsContent value="monthly">
              <MonthlyBreakdown />
            </TabsContent>

            <TabsContent value="yearly">
              <YearlyOverview />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionList />
            </TabsContent>

            <TabsContent value="charts">
              <ExpenseCharts />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ExpenseProvider>
  );
}

export default App;
