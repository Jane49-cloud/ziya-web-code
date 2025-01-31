interface TabProps {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: TabProps[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`mr-4 pb-2 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 border-b-2 border-transparent hover:text-blue-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
