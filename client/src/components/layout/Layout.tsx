import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { LogOut, Camera } from "lucide-react"
import { useLocation } from "wouter"
import { useEffect, useState, createContext, useContext, useRef } from "react"

// Create an auth context to share auth state across components
export const AuthContext = createContext<{
  isLoggedIn: boolean;
  userName: string | null;
  login: (token: string, userId: string, name: string, email: string) => void;
  logout: () => void;
}>({
  isLoggedIn: false,
  userName: null,
  login: () => {},
  logout: () => {}
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  // Initialize state from localStorage immediately
  const initialToken = localStorage.getItem("auth_token");
  const initialName = localStorage.getItem("user_name");
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialToken);
  const [userName, setUserName] = useState<string | null>(initialName);
  const [, navigate] = useLocation();
  const initialized = useRef(false);

  // Check auth status on mount and when localStorage changes
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return; // Skip the first run since we already initialized from localStorage
    }
    
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const name = localStorage.getItem("user_name");
      
      if (token) {
        setIsLoggedIn(true);
        setUserName(name);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', checkAuth);

    // Create a custom event listener for auth changes within the same tab
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const login = (token: string, userId: string, name: string, email: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_id", userId);
    localStorage.setItem("user_name", name);
    localStorage.setItem("user_email", email);
    
    setIsLoggedIn(true);
    setUserName(name);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    
    setIsLoggedIn(false);
    setUserName(null);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
  };

  const authContextValue = {
    isLoggedIn,
    userName,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeProvider defaultTheme="dark" storageKey="snapvault-theme">
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b py-3 px-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                <Camera className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">SnapVault</span>
              </div>
              <div className="flex items-center gap-4">
                {isLoggedIn && (
                  <>
                    <span className="text-sm text-muted-foreground hidden md:inline">
                      Hello, {userName || 'User'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                      Dashboard
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
        </div>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
