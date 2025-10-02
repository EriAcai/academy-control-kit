import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, LogOut, Users } from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <GraduationCap className="h-6 w-6" />
            Sistema Acadêmico
          </Link>
          
          {user && (
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button 
                  variant={location.pathname === "/" ? "default" : "ghost"}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Alunos
                </Button>
              </Link>
              
              <Button onClick={signOut} variant="ghost" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </nav>
      
      <main className="container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};
