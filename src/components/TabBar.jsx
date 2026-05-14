/**
 * Horizontal tab bar. On mobile it can horizontally scroll if the labels
 * don't fit. Tabs are large enough for thumb taps (>= 44px height).
 */
export default function TabBar({ tabs, active, onChange }) {
  return (
    <div
      className="flex overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0"
      style={{ scrollbarWidth: 'none' }}
      role="tablist"
    >
      <style>{`.tabbar-scroll::-webkit-scrollbar { display: none; }`}</style>
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            className={`relative py-3 px-4 md:px-5 text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] flex items-center gap-2 ${
              isActive
                ? 'text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-700/30">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
