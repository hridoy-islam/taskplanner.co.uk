'use client';

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
import { CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddReminderDialog } from './components/add-reminder';

type Reminder = {
  id: string;
  title: string;
  dueDate: Date;
  recurrence:
    | 'none'
    | 'daily'
    | 'monthly'
    | 'quarterly'
    | 'biannually'
    | 'annually';
  monthlyDate?: number;
  completed: boolean;
};

export default function Reminder() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Pay Internet Bill',
      dueDate: new Date(2024, 4, 5),
      recurrence: 'monthly',
      monthlyDate: 5,
      completed: false
    },
    {
      id: '2',
      title: 'Car Insurance Renewal',
      dueDate: new Date(2024, 11, 15),
      recurrence: 'annually',
      completed: false
    },
    {
      id: '3',
      title: 'Quarterly Tax Payment',
      dueDate: new Date(2024, 5, 30),
      recurrence: 'quarterly',
      completed: true
    },
    {
      id: '4',
      title: 'Dental Checkup',
      dueDate: new Date(2024, 6, 10),
      recurrence: 'biannually',
      completed: false
    },
    {
      id: '5',
      title: 'Gym Membership Renewal',
      dueDate: new Date(2024, 7, 1),
      recurrence: 'annually',
      completed: false
    }
  ]);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all' as 'all' | 'completed' | 'pending'
  });

  const handleAddReminder = (
    newReminder: Omit<Reminder, 'id' | 'completed'>
  ) => {
    const reminder: Reminder = {
      ...newReminder,
      id: Date.now().toString(),
      completed: false
    };
    setReminders([...reminders, reminder]);
  };

  const handleCompleteReminder = (id: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: true } : reminder
      )
    );
  };

  const filteredReminders = reminders.filter((reminder) => {
    const isInDateRange =
      (!filters.startDate || reminder.dueDate >= new Date(filters.startDate)) &&
      (!filters.endDate || reminder.dueDate <= new Date(filters.endDate));
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'completed' && reminder.completed) ||
      (filters.status === 'pending' && !reminder.completed);
    return isInDateRange && matchesStatus;
  });

  const upcomingReminders = filteredReminders.filter(
    (r) => !r.completed && r.dueDate >= new Date()
  );
  const pastReminders = filteredReminders.filter(
    (r) => r.completed || r.dueDate < new Date()
  );

  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reminder</h1>
        <AddReminderDialog onAddReminder={handleAddReminder} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex space-x-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <ul className="space-y-4">
                {upcomingReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                  >
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm text-gray-500">
                        <CalendarIcon className="mr-1 inline-block h-4 w-4" />
                        {reminder.dueDate.toLocaleDateString()} -{' '}
                        {reminder.recurrence}
                        {reminder.recurrence === 'monthly' &&
                          ` (Day ${reminder.monthlyDate})`}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleCompleteReminder(reminder.id)}
                      variant="outline"
                    >
                      Mark Complete
                    </Button>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="history">
              <ul className="space-y-4">
                {pastReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      <p className="text-sm text-gray-500">
                        <CalendarIcon className="mr-1 inline-block h-4 w-4" />
                        {reminder.dueDate.toLocaleDateString()} -{' '}
                        {reminder.recurrence}
                        {reminder.recurrence === 'monthly' &&
                          ` (Day ${reminder.monthlyDate})`}
                      </p>
                    </div>
                    {reminder.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    )}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
