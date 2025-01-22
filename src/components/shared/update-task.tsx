import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal'; // Assuming you have a Modal component
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import moment from 'moment';
import { Textarea } from '../ui/textarea';

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
