// components/auth/ProtectedButton.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/context/AuthContext";

export function ProtectedButton({ 
  children, 
  onClick, 
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  loginMessage = "You need to be signed in to perform this action"
}) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLogin(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
        variant={variant}
        size={size}
        disabled={disabled}
      >
        {children}
      </Button>
      
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath={typeof window !== 'undefined' ? window.location.pathname : '/'}
        message={loginMessage}
      />
    </>
  );
}