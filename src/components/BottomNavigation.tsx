import { Home, RotateCcw, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Accueil", icon: Home },
    { path: "/historique", label: "Historique", icon: RotateCcw },
    { path: "/profils", label: "Profils", icon: Users }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                active 
                  ? "text-nav-active" 
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? "text-nav-active" : ""}`} />
              <span className={active ? "text-nav-active font-medium" : ""}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;