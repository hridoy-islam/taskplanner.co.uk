import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal'; // Assuming you have a Modal component
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import moment from 'moment';
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
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      taskName: '',
      dueDate: ''
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        taskName: task.taskName,
        dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : ''
      });
    }
  }, [task, reset]);

  const handleConfirm = async (data) => {
    await onConfirm(data);
    onClose(); // Close the modal after confirmation
    reset(); // Reset the form after submission
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

          <Input
            type="date"
            {...register('dueDate', { required: true })}
            className="mb-4 "
          />

          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Schedule" />
            </SelectTrigger>
            <SelectContent className="w-full bg-primary text-black">
              <SelectItem
                value="daily"
                className="hover:bg-black hover:text-white"
              >
                Daily
              </SelectItem>
              <SelectItem
                value="weekdays"
                className="hover:bg-black hover:text-white"
              >
                Weekdays
              </SelectItem>
              <SelectItem
                value="weekly"
                className="hover:bg-black hover:text-white"
              >
                Weekly
              </SelectItem>
              <SelectItem
                value="monthly"
                className="hover:bg-black hover:text-white"
              >
                Monthly
              </SelectItem>
              <SelectItem
                value="yearly"
                className="hover:bg-black hover:text-white"
              >
                Yearly
              </SelectItem>
              <SelectItem
                value="custom"
                className="hover:bg-black hover:text-white"
              >
                Customize
              </SelectItem>
            </SelectContent>
          </Select>

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
