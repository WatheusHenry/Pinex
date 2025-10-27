const TabMenu = ({ tabs, currentTab, onTabSwitch }) => {
  return (
    <>
      {Object.entries(tabs).map(([tabId, tab]) => (
        <button
          key={tabId}
          className={`menu-item tab-menu-item ${currentTab === tabId ? "active" : ""}`}
          onClick={() => onTabSwitch(tabId)}
          title={tab.name}
        >
          <span style={{ fontSize: "20px" }}>{tab.name.split(" ")[0]}</span>
        </button>
      ))}
    </>
  );
};

export default TabMenu;
