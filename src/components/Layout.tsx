import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useComparison } from '@/contexts/ComparisonContext';
import { ShoppingBag, Home, User, Settings, Plus, LogOut, LayoutDashboard, ChevronsUpDown, Scale, X } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { comparisonList, clearComparison } = useComparison();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r flex-shrink-0 hidden md:block">
        <div className="h-full px-3 py-4 overflow-y-auto bg-background">
          <Link to="/" className="flex items-center pl-6 py-3">
            <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TogoPropConnect</span>
          </Link>
          <ul className="space-y-2 font-medium">
            <li>
              <Link to="/" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <Home className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            {session && (
              <>
                <li>
                  <Link to="/property-assignments" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <LayoutDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                    <span className="ml-3">Assignments</span>
                  </Link>
                </li>
                <li>
                  <Link to="/leases" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <ChevronsUpDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                    <span className="ml-3">Leases</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                    <span className="ml-3">Profile</span>
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                    <span className="ml-3">Settings</span>
                  </Link>
                </li>
                {user?.user_metadata?.role === 'admin' && (
                  <li>
                    <Link to="/admin" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                      <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                      <span className="ml-3">Admin</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </aside>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="z-40 py-4 border-b">
          <div className="px-6 w-full flex items-center justify-between">
            <Link to="/" className="md:hidden flex items-center">
              <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TogoPropConnect</span>
            </Link>
            <div className="flex items-center gap-4">
              <ModeToggle />
              {comparisonList.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Compare <Badge className="ml-2">{comparisonList.length}</Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end">
                    <DropdownMenuLabel>Comparison List</DropdownMenuLabel>
                    <ScrollArea className="h-64">
                      {comparisonList.map((property) => (
                        <DropdownMenuItem key={property.id} onClick={() => navigate(`/property/${property.id}`)}>
                          {property.title}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearComparison}>
                      Clear Comparison
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url as string} alt={user?.user_metadata?.full_name as string} />
                        <AvatarFallback>{getInitials(user?.user_metadata?.full_name as string)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/auth')}>Sign In</Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
