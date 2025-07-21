
import { StockMovementForm } from './StockMovementForm';

interface StockMovementModalProps {
  onClose: () => void;
}

export const StockMovementModal = ({ onClose }: StockMovementModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <StockMovementForm onClose={onClose} />
    </div>
  );
};
