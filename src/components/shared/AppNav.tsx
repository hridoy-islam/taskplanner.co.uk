import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Link } from 'react-router-dom';
import { usePathname } from '@/routes/hooks';
import { ChevronDown } from 'lucide-react';

interface MainNavProps {
  items: NavItem[];
}

export function AppNav({ items }: MainNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <div className="flex h-full items-center gap-1">
      {items.map((item, index) => {
        const isActive = path === item.href;
        
        return (
          item.href && (
            <Link
              key={index}
              to={item.disabled ? '#' : item.href}
              className={cn(
                // Layout & Spacing
                "group flex h-full items-center gap-1 px-3 text-xs font-semibold transition-all",
                
                "border-b-[3px] border-transparent text-gray-600",
                "hover:border-taskplanner hover:text-taskplanner hover:bg-gray-50",
                
                // isActive && "text-gray-900 font-semibold",
                  
                // Disabled State
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              <span>{item.title}</span>
              
            </Link>
          )
        );
      })}
    </div>
  );
}