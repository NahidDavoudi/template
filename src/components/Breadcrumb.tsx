import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export interface BreadcrumbItem {
  to?: string;
  label: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted flex-wrap">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {item.to && !last ? (
              <Link to={item.to} className="hover:text-body transition-colors">{item.label}</Link>
            ) : (
              <span className={last ? 'text-body' : ''}>{item.label}</span>
            )}
            {!last && <ChevronLeft className="w-3 h-3 text-black/20" />}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
