import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "navLink active" : "navLink";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandLogo">G</div>
        <div>
          <div className="brandName">GyaanChat</div>
          <div className="brandSub">Tenant Dashboard</div>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/app" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/app/documents" className={linkClass}>Documents</NavLink>
        <NavLink to="/app/test-chat" className={linkClass}>Test Chat</NavLink>
        <NavLink to="/app/settings" className={linkClass}>Settings</NavLink>
        <NavLink to="/app/install" className={linkClass}>Install</NavLink>
        <NavLink to="/app/profile" className={linkClass}>Profile</NavLink>
      </nav>
    </aside>
  );
}
