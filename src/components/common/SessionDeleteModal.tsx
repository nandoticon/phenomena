import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface SessionDeleteModalProps {
  open: boolean;
  titleId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SessionDeleteModal({ open, titleId, onConfirm, onCancel }: SessionDeleteModalProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      title="Delete Session?"
      description="This action cannot be undone. This session will be permanently removed from your history."
      titleId={titleId}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
