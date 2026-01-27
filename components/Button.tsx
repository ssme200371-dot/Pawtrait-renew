import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30",
    secondary: "bg-secondary-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/30",
    outline: "border-2 border-brand-500 text-brand-500 hover:bg-brand-50"
  };

  const sizes = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};