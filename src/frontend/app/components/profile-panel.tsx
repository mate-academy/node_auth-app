import { surfaceCardClass } from '@/app/lib/form-styles';

export function ProfilePanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`${surfaceCardClass} p-5 text-left sm:p-6`}>
      <h3 className="text-lg font-semibold text-rose-50">{title}</h3>
      <p className="mt-1 mb-4 text-sm text-rose-100/70">{description}</p>
      {children}
    </article>
  );
}
