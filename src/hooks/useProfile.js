// hooks/useProfile.js
import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";

export default function useProfile() {
  const { user, getAccessToken } = useAuth();
  const [profile, setProfile] = useState(() => {
    return JSON.parse(localStorage.getItem("profile") || "null");
  });
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      localStorage.removeItem("profile");
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
        localStorage.setItem("profile", JSON.stringify(data));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
}
