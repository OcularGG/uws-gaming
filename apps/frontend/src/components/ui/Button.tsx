import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

    const variantClasses = {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground border-gray-300 hover:bg-gray-50',
      secondary: 'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200',
      ghost: 'hover:bg-accent hover:text-accent-foreground hover:bg-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline',
    };

    const sizeClasses = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    };

    const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        ...props,
        className: combinedClassName,
      });
    }

    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
