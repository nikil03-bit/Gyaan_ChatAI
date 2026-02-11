import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandTitle">GyaanChat</div>
        <div className="brandSub">Admin Dashboard</div>
      </div>

      <nav className="nav">
        <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/app/bots">
          Bots
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/app/knowledge">
          Knowledge Upload
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/app/test-chat">
          Test Chat
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/app/logs">
          Logs
        </NavLink>
      </nav>

      <div className="sidebarFooter">
        <button
          className="button secondary"
          onClick={() => {
            localStorage.removeItem("gyaanchat_token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
