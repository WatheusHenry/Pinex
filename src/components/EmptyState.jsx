import React from "react";

const EmptyState = () => {
  return (
    <div className="empty-state">
      <svg
        className="empty-state-icon"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path
          d="M21 15L16 10L5 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 21L17 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p>Arraste imagens, vídeos ou GIFs aqui</p>
    </div>
  );
};

export default EmptyState;
