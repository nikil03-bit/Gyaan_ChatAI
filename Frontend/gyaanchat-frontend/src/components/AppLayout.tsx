import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  return (
    <div className="appShell">
      <Sidebar />
      <main className="mainArea">
        <Outlet />
      </main>
    </div>
  );
}
