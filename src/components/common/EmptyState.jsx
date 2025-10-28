import File from "/public/File.png";

const EmptyState = () => {
  return (
    <div className="empty-state">
      <img src={File} alt="" />
      <p style={{ fontSize: "16px", fontWeight:"bold", marginTop: "1rem"  }}>
        Arraste algo pra cá
      </p>
      <p style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>
        Ou só cole algo com ctrl + v{" "}
      </p>
    </div>
  );
};

export default EmptyState;
