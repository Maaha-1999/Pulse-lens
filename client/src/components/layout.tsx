import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@assets/generated_images/a_modern_abstract_logo_for_a_data_dashboard_named_pulselens.png";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-secondary/30 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-3">
             <img src={logoImage} alt="PulseLens Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
              PulseLens
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="glass-card p-3 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                JD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">John Doe</span>
                <span className="text-[10px] text-muted-foreground truncate">Admin</span>
              </div>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0">
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Log Out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background gradient blob */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

        <div className="flex-1 overflow-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}
