import { Modal, Typography, Button } from "antd";

interface TaskConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const TaskConsentModal: React.FC<TaskConsentModalProps> = ({
  open,
  onAccept,
  onDecline,
  onClose,
}) => (
  <Modal open={open} onCancel={onClose} footer={null} centered>
    <Typography.Title level={4}>Save Your Daily Plan</Typography.Title>
    <Typography.Paragraph type="secondary">
      We can store your task list on this device so your notes remain after a
      refresh. Would you like us to remember it?
    </Typography.Paragraph>
    <div className="mt-4 flex justify-end gap-2">
      <Button onClick={onDecline}>Not now</Button>
      <Button type="primary" onClick={onAccept}>
        Yes, keep my tasks
      </Button>
    </div>
  </Modal>
);

export default TaskConsentModal;
