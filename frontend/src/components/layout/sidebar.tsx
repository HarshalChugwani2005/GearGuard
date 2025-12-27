import Link from "next/link";
import { useRouter } from "next/router";
import {
    LayoutDashboard,
    Kanban,
    CalendarDays,
    Wrench,
    Users,
    Settings,
    LogOut,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const Sidebar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Kanban Board", href: "/kanban", icon: Kanban },
        { name: "Calendar", href: "/calendar", icon: CalendarDays },
        { name: "Equipment", href: "/equipment", icon: Wrench },
        // { name: "Teams", href: "/teams", icon: Users }, // To be implemented
    ];

    // Add Admin Dashboard for admin users
    if (user && user.role === 'admin') {
        navItems.push({ name: "Admin Panel", href: "/admin", icon: ShieldCheck });
    }

    return (
        <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                    GearGuard
                </h1>
                <p className="text-xs text-slate-400 mt-1">Maintenance Management</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = router.pathname === item.href ||
                        (item.href !== '/' && router.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg w-full transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
