import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal'; // Assuming you have a Modal component
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Textarea } from '../ui/textarea';

const UpdateNote = ({
  selectNote,
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
    }
  });

  useEffect(() => {
    if (selectNote) {
      reset({
        title: selectNote.title
      });
    }
  }, [selectNote, reset]);

  const handleConfirm = async (data) => {
    await onConfirm({ ...data, _id: selectNote._id } );
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
            {...register('title', { required: true })}
            className="mb-4 h-10 resize-none"
            placeholder="Task Name"
          />

         

          <div className="mt-4 flex justify-end space-x-2">
            {/* <Button variant="default" onClick={onClose}>
              Cancel
            </Button> */}
            <Button variant="outline" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateNote;
