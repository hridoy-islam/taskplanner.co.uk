import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

type AddReminderDialogProps = {
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
};

export function AddReminderDialog({ onAddReminder }: AddReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    dueDate: '',
    recurrence: 'none' as const,
    monthlyDate: '1'
  });

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReminder({
      title: newReminder.title,
      dueDate: new Date(newReminder.dueDate),
      recurrence: newReminder.recurrence,
      monthlyDate: parseInt(newReminder.monthlyDate)
    });
    setNewReminder({
      title: '',
      dueDate: '',
      recurrence: 'none',
      monthlyDate: '1'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Reminder</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddReminder} className="space-y-4">
          <div>
            <Label htmlFor="title">Reminder Title</Label>
            <Input
              id="title"
              value={newReminder.title}
              onChange={(e) =>
                setNewReminder({ ...newReminder, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={newReminder.dueDate}
              onChange={(e) =>
                setNewReminder({ ...newReminder, dueDate: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={newReminder.recurrence}
              onValueChange={(value) =>
                setNewReminder({ ...newReminder, recurrence: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="biannually">Biannually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newReminder.recurrence === 'monthly' && (
            <div>
              <Label htmlFor="monthlyDate">Day of Month</Label>
              <Select
                value={newReminder.monthlyDate}
                onValueChange={(value) =>
                  setNewReminder({ ...newReminder, monthlyDate: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day of month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full">
            Add Reminder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
