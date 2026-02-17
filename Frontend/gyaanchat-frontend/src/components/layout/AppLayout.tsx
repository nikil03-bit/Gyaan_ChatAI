import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/layout.css";

export default function AppLayout() {
  return (
    <div className="appLayout">
      <Sidebar />
      <div className="appMain">
        <Topbar />
        <main className="appContent">
          <div className="maxWidthContainer">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
