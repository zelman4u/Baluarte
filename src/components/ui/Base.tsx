import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-brand-primary text-slate-950 hover:opacity-90',
    secondary: 'bg-brand-surface text-brand-text hover:bg-brand-card border border-brand-border',
    ghost: 'bg-transparent hover:bg-brand-card text-brand-muted hover:text-brand-text',
    danger: 'bg-brand-danger text-white hover:opacity-90',
    outline: 'border border-brand-border hover:bg-brand-card text-brand-text'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button 
      className={cn(
        'font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props} 
    />
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => (
  <div id={id} className={cn('bg-brand-card border border-brand-border rounded-xl shadow-lg', className)}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input 
    className={cn(
      'w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-brand-muted/50',
      className
    )}
    {...props}
  />
);
