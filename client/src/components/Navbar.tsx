import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b shadow-sm">
      <div className="flex items-center gap-4">
        <img src="logo.png" alt="Logo" className="h-10 w-auto" />
        <h1
          className="text-xl font-semibold text-[#e51c26]"
          style={{ fontFamily: '"Bodoni Moda", serif' }}
        >
          Log Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-sm">
              <span className="text-gray-600">Welcome, </span>
              <span className="font-semibold">
                {user.firstname} {user.lastname}
              </span>
              <span className="text-gray-500 ml-2">({user.level})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
