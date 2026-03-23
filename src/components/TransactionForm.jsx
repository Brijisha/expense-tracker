import { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const initialForm = {
  type: "expense",
  category: "",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export default function TransactionForm({ editData, onClose }) {
  const { addTransaction, editTransaction, categories } = useExpenses();
  const [form, setForm] = useState(editData || initialForm);
  const [open, setOpen] = useState(false);

  const isEdit = !!editData;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date) return;

    if (isEdit) {
      editTransaction(form);
      onClose?.();
    } else {
      addTransaction(form);
      setForm(initialForm);
      setOpen(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const filteredCategories =
    form.type === "income"
      ? categories.filter((c) =>
          ["salary", "freelance", "investment", "gift", "other"].includes(c.id)
        )
      : categories.filter(
          (c) =>
            !["salary", "freelance", "investment"].includes(c.id)
        );

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={form.type}
            onValueChange={(v) => {
              handleChange("type", v);
              handleChange("category", "");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => handleChange("category", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="What was this for?"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
        />
      </div>

      {isEdit ? (
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      ) : (
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Add Transaction</Button>
        </DialogFooter>
      )}
    </form>
  );

  if (isEdit) return formContent;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
