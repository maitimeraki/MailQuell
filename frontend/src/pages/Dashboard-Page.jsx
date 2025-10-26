import { Suspense, useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Navbar } from "@/components/Navbar";
import { navGroups } from "../utils/navGroups";
import { NavLink, Outlet } from "react-router";
import { useAutoLogin } from "../hooks/useAutoLogin";

export function Dashboard() {
  // const [noTagsPage, setNoTagsPage] = useState(0);
  const groups = navGroups();
  const centerStyle = {
    display: "grid",
    placeItems: "center",
    minHeight: "100vh",
    fontFamily: "system-ui",
  };
  const asideStyle = {
    width: 250,
    borderRight: "1px solid #e5e7eb",
    padding: "18px 14px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    background: "#fafafa",
    overflowY: "auto",
  };
  const groupLabel = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: ".08em",
    color: "#64748b",
    margin: "0 0 8px 4px",
  };
  const navItem = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    border: "1px solid",
    borderRadius: 10,
    transition: "background .16s, color .16s, border .16s",
  };
  const center = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Adjust height as needed
  };

  const { profile, loading, error } = useProfile();

  async function handleSignOut() {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/log-out`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-hide-scrollbar", "true");
    styleEl.innerHTML = `
      body {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      body::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  if (loading) return <div style={center}>Loading...</div>;
  if (error) return <div style={center}>Error: {error}</div>;
  if (!profile) return <div style={center}>No profile</div>;

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}
    >
      <Navbar profile={profile} onSignOut={() => handleSignOut()} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <aside style={asideStyle}>
          {groups.map((g) => (
            <div key={g.label}>
              <div style={groupLabel}>{g.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {g.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={({ isActive }) => ({
                      ...navItem,
                      background: isActive ? "#2563eb" : "transparent",
                      color: isActive ? "#fff" : "#1f2937",
                      borderColor: isActive ? "#2563eb" : "#e2e8f0",
                    })}
                  >
                    <i className={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <main style={{ flex: 1, overflowY: "auto" }}>
          <Suspense fallback={<div style={centerStyle}>Loading page…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
