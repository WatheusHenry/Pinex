import React from "react";

const ResizeHandle = ({ onMouseDown }) => {
  return <div className="resize-handle" onMouseDown={onMouseDown} />;
};

export default ResizeHandle;
