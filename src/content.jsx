import { createRoot } from "react-dom/client";
import Sidebar from "./components/sidebar/Sidebar";
import "./styles/index.css";

const init = () => {
  const container = document.createElement("div");
  container.id = "chrome-sidebar-root";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<Sidebar />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
