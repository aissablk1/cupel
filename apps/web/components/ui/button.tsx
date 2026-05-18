/**
 * Button — Cupel UI
 * Direction : Editorial Premium
 * Author: Aïssa BELKOUSSA
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] font-medium transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-terracotta)] text-[var(--color-ivory)] hover:bg-[#B84A30]',
        secondary:
          'bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]',
        ghost:
          'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-mist)]',
        link:
          'bg-transparent text-[var(--color-ink)] underline underline-offset-[0.25em] decoration-1 hover:text-[var(--color-terracotta)] px-0 h-auto',
        destructive:
          'bg-[var(--color-carmine)] text-[var(--color-ivory)] hover:bg-[#7A2424]',
      },
      size: {
        sm: 'h-9 px-4 text-[0.8rem]',
        md: 'h-10 px-5 text-base',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
