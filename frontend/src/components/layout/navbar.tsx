import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                {/* Mobile menu trigger could go here */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 text-slate-500 group-hover:text-primary-600 transition-colors" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white animate-pulse" />
                </Button>

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-3 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">John Technician</p>
                        <p className="text-xs text-slate-500">Maintenance Lead</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                        <User className="h-5 w-5 text-primary-600" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
