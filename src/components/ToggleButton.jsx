import React from "react";

const ToggleButton = ({ show, onClick }) => {
  return (
    <button className={`sidebar-toggle ${show ? "show" : ""}`} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ToggleButton;
