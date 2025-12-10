// hooks/useProfile.js
import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";

export default function useProfile() {
  const { user, getAccessToken } = useAuth();
  
  // Safely access localStorage only on client-side
  const getStoredProfile = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("profile");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  };

  const [profile, setProfile] = useState(getStoredProfile());
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("profile");
      }
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/profile/getProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        setProfile(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("profile", JSON.stringify(data));
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, getAccessToken]);

  return { profile, loading, error };
}