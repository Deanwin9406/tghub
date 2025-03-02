// Add the PropertyAssignments link to the Layout navigation menu
// Import and update the necessary imports and navigation items
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Building, 
  Home, 
  MessageSquare, 
  Menu, 
  X, 
  LogOut, 
  User,
  Heart, 
  SquareEqual, 
  Wrench, 
  CreditCard, 
  FileText,
  Users,
  Store,
  UserCog,
  Shield
} from "lucide-react";
import { ToggleTheme } from "./ToggleTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, roles } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const mainMenuItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Properties", path: "/search", icon: <Building className="w-5 h-5" /> },
    { name: "Agents", path: "/agents", icon: <Users className="w-5 h-5" /> },
    { name: "Vendors", path: "/vendors", icon: <Store className="w-5 h-5" /> },
    { name: "Communities", path: "/communities", icon: <Users className="w-5 h-5" /> },
  ];

  // Updated userMenuItems with the PropertyAssignments link
  const userMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Property Management", path: "/property-management", icon: <Building className="w-5 h-5" />, requiredRoles: ['landlord'] },
    { name: "Property Assignments", path: "/property-assignments", icon: <UserCog className="w-5 h-5" />, requiredRoles: ['landlord', 'manager', 'agent'] },
    { name: "Maintenance", path: "/maintenance", icon: <Wrench className="w-5 h-5" /> },
    { name: "Messages", path: "/messages", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Payments", path: "/payments", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Leases", path: "/leases", icon: <FileText className="w-5 h-5" /> },
    { name: "Favorites", path: "/favorites", icon: <Heart className="w-5 h-5" /> },
    { name: "Comparison", path: "/comparison", icon: <SquareEqual className="w-5 h-5" /> },
    { name: "Verification", path: "/kyc", icon: <Shield className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const renderMenuItems = (items: any[]) => {
    return items.map((item, index) => {
      if (item.requiredRoles && !item.requiredRoles.some(role => roles.includes(role))) {
        return null;
      }
      
      const isActive = location.pathname === item.path;
      return (
        <li key={index}>
          <Link
            to={item.path}
            className={`flex items-center gap-2 py-3 px-4 rounded-md hover:bg-secondary ${
              isActive ? "bg-secondary text-secondary-foreground font-medium" : ""
            }`}
            onClick={closeMenu}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        </li>
      );
    }).filter(Boolean);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className="md:hidden absolute top-4 left-4 z-50"
        onClick={toggleMenu}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Sidebar */}
      <aside
        className={`bg-secondary text-secondary-foreground w-64 flex-shrink-0 md:flex flex-col transition-transform duration-300 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static top-0 left-0 h-full z-40`}
      >
        <div className="sticky top-0 py-4 px-6 flex items-center justify-between bg-secondary z-50">
          <Link to="/" className="font-bold text-lg flex items-center gap-2" onClick={closeMenu}>
            <Building className="w-6 h-6" />
            <span>Real Estate</span>
          </Link>
          {/* Close button for mobile menu */}
          <Button variant="ghost" className="md:hidden" onClick={toggleMenu}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <nav className="flex-grow p-6 pt-0 overflow-y-auto">
          <ul className="space-y-2">
            {renderMenuItems(mainMenuItems)}
          </ul>
          <hr className="my-4" />
          <ul className="space-y-2">
            {user && renderMenuItems(userMenuItems)}
          </ul>
        </nav>

        {/* User Info and Theme Toggle */}
        {user && profile && (
          <div className="sticky bottom-0 p-4 bg-secondary border-t border-secondary-foreground/10 z-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name} />
                  <AvatarFallback>{getInitials(profile.first_name, profile.last_name)}</AvatarFallback>
                </Avatar>
                <div className="line-clamp-1">
                  {profile.first_name} {profile.last_name}
                </div>
              </div>
              <ToggleTheme />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
