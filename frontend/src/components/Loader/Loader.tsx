import './Loader.scss';
import { Loader2 } from 'lucide-react';

export const Loader = () => {
  return (
    <div className="loader">
      <Loader2 size={70} className='loader__icon' />
    </div>
  );
}