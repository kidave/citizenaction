import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../src/context/AuthContext"; 
import UploadProject from "../components/shared/image/UploadProject";
import ProjectTab from "../components/ward/tabs/ProjectTab";
import useWardProjects from "../src/hooks/useWardProjects";
import Spinner from '../components/shared/ui/Spinner';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, profile } = useAuth();

  const [wardCode, setWardCode] = useState("KE");
  const { projects, loading, error } = useWardProjects(wardCode);

  useEffect(() => {
    // Redirect if not authenticated after loading is complete
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Optional: Add a check for admin role if you have one
  // useEffect(() => {
  //   if (!authLoading && profile && !profile.is_admin) {
  //     router.push("/"); // Redirect if not an admin
  //   }
  // }, [profile, authLoading, router]);

  if (authLoading || !user) {
    // Show a loading spinner while checking auth
    return (
      <div className="loading-container">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {profile?.first_name || user.email}</p>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Create New Project</h2>
        <UploadProject wardCode={wardCode} />
      </section>

      <section>
        <h2>Existing Projects for Ward: {wardCode}</h2>
        {loading && <p>Loading projects…</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {projects?.length === 0 && <p>No projects found yet.</p>}
        {projects?.length > 0 && <ProjectTab projects={projects} />}
      </section>
    </div>
  );
}