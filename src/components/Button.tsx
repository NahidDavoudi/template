import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'aluminum' | 'glass' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  title?: string;
  ariaLabel?: string;
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  icon: 'btn-icon',
};

export function Button({
  variant = 'aluminum',
  size = 'md',
  href,
  to,
  type = 'button',
  disabled,
  className = '',
  icon,
  children,
  onClick,
  title,
  ariaLabel,
}: ButtonProps) {
  const variantClass = variant === 'glass' ? 'btn-glass' : variant === 'accent' ? 'btn-accent' : 'btn-aluminum';
  const classes = `btn ${variantClass} ${SIZE_CLASS[size]} ${className}`.trim();
  const content = icon ? (
    <span className="btn-inner flex items-center justify-center gap-2">
      {icon}
      <span>{children}</span>
    </span>
  ) : (
    <span className="btn-inner">{children}</span>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} title={title} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
        onClick={onClick}
        title={title}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} title={title} aria-label={ariaLabel}>
      {content}
    </button>
  );
}

export default Button;
