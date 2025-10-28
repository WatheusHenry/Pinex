import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

export function useWindowPortal() {
  const [container, setContainer] = useState(null);
  const rootRef = useRef(null);

  const createContainer = (id) => {
    const div = document.createElement("div");
    div.id = id;
    document.body.appendChild(div);
    setContainer(div);
    return div;
  };

  const removeContainer = () => {
    if (container) {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      container.remove();
      setContainer(null);
    }
  };

  const renderInContainer = (component, containerId) => {
    const div = createContainer(containerId);
    rootRef.current = createRoot(div);
    rootRef.current.render(component);
  };

  useEffect(() => {
    return () => {
      removeContainer();
    };
  }, []);

  return { container, renderInContainer, removeContainer };
}
