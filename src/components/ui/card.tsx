import { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={clsx('rounded-xl border bg-white p-6 shadow-sm', onClick && 'cursor-pointer hover:shadow-md transition', className)} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}
