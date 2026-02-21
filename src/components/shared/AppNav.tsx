import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Link } from 'react-router-dom';
import { usePathname } from '@/routes/hooks';
import { ChevronDown } from 'lucide-react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  UserCircle, 
  Users2, 
  StickyNote, 
  Star, 
  Calendar ,CalendarCheck2
} from 'lucide-react';
interface MainNavProps {
  items: NavItem[];
}
const IconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  company: Building2,
  users: Users,
  'subscription-plans': CreditCard,
  user: UserCircle,
  group: Users2,
  notes: StickyNote,
  important: Star,
  planner: Calendar,
  'schedule-task': CalendarCheck2,
};
export function AppNav({ items }: MainNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <div className="flex h-full items-center gap-1">
      {items.map((item, index) => {
        const isActive = path === item.href;
        const Icon = item.icon ? IconMap[item.icon] : null;
        return (
          item.href && (
            <Link
              key={index}
              to={item.disabled ? '#' : item.href}
              className={cn(
                // Layout & Spacing
                "group flex h-full items-center gap-1 px-3 text-xs font-semibold transition-all",
                
                "border-b-[3px] border-transparent text-taskplanner",
                "hover:border-taskplanner hover:text-taskplanner hover:bg-gray-50",
                
                // isActive && "text-gray-900 font-semibold",
                  
                // Disabled State
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.title}</span>
              
            </Link>
          )
        );
      })}
    </div>
  );
}