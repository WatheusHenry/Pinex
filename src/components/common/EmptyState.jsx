import File from "/public/File.png";

const EmptyState = () => {
  return (
    <div className="empty-state">
      <img src={File} alt="" />
      <p
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          marginTop: "1rem",
          color: "#979797",
        }}
      >
        Arraste algo pra cá
      </p>
      <p
        style={{
          fontSize: "13px",
          opacity: 0.7,
          color: "#979797",
        }}
      >
        Ou só cole algo com ctrl + v{" "}
      </p>
    </div>
  );
};

export default EmptyState;
