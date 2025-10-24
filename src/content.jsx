import { createRoot } from "react-dom/client";
import Sidebar from "./components/Sidebar";
import { createFloatingViewer } from "./utils/floatingViewer";
import "./content.css";

const init = () => {
  const container = document.createElement("div");
  container.id = "chrome-sidebar-root";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<Sidebar />);

  window.createFloatingViewer = createFloatingViewer;
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
