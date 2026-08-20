interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>{children}</div>
  );
};
