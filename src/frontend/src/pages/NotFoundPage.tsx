import { CircleAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found">
      <CircleAlert size={50} color="red"/>
      <h3>Not found</h3>
    </div>
  );
};
