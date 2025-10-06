import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
      <FileQuestion className="w-16 h-16 mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default EmptyState;