import React from 'react';

export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hoverLift?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hoverLift = false, className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs
          ${paddingClasses[padding]}
          ${hoverLift ? 'transition hover:-translate-y-0.5 hover:shadow-sm' : ''}
          ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;