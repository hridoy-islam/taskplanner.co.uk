import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal'; // Assuming you have a Modal component
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const UpdateTask = ({
  task,
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description
}) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      taskName: '',
      dueDate: '',
      schedule: ''
    }
  });

  const [scheduleType, setScheduleType] = useState('');

  useEffect(() => {
    if (task) {
      reset({
        taskName: task.taskName,
        dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : '',
        schedule: task.schedule || ''
      });
      setScheduleType(task.schedule || '');
    }
  }, [task, reset]);

  const handleConfirm = async (data) => {
    await onConfirm(data);
    onClose();
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="md:p-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mb-4">{description}</p>
        <form onSubmit={handleSubmit(handleConfirm)}>
          <Textarea
            {...register('taskName', { required: true })}
            className="mb-4 h-24 resize-none"
            placeholder="Task Name"
          />

          <p>Due Date</p>
          <Input
            type="date"
            {...register('dueDate', { required: true })}
            className="mb-4"
          />
          <p>Repeat</p>

          <Select
            value={scheduleType}
            onValueChange={(value) => {
              setScheduleType(value);
              setValue('schedule', value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Schedule" />
            </SelectTrigger>
            <SelectContent className="w-full bg-primary text-black">
              <SelectItem value="daily" className="hover:bg-black hover:text-white">
                Daily
              </SelectItem>
              <SelectItem value="weekdays" className="hover:bg-black hover:text-white">
                Weekdays
              </SelectItem>
              <SelectItem value="weekly" className="hover:bg-black hover:text-white">
                Weekly
              </SelectItem>
              <SelectItem value="monthly" className="hover:bg-black hover:text-white">
                Monthly
              </SelectItem>
              <SelectItem value="yearly" className="hover:bg-black hover:text-white">
                Yearly
              </SelectItem>
              <SelectItem value="custom" className="hover:bg-black hover:text-white">
                Customize
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Show date-time picker when "Customize" is selected */}
          {scheduleType === 'custom' && (
            <Input
              type="datetime-local"
              {...register('schedule', { required: true })}
              className="mt-4"
            />
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateTask;
