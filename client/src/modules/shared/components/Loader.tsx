interface Props {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<Props> = ({
  size = 'sm',
  fullScreen = true,
  text = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <svg
        className={`${sizeClasses[size]} animate-spin border-none`}
        viewBox="0 0 50 50"
      >
        <circle
          cx={25}
          cy={25}
          r={20}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          className={`stroke-slate-400 animate-google-dash `}
        />
      </svg>
      <span className="text-sm font-small text-slate-300">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className=" fixed inset-0 h-min-screen w-full flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};
