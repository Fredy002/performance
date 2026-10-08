import type { ReactNode } from 'react';

interface Props {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}

export function Card({ title, action, children, className = '', flush }: Props) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {action}
        </div>
      )}
      {flush ? children : <div className="card-body">{children}</div>}
    </section>
  );
}
