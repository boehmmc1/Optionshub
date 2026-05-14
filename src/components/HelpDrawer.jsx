import { useState, useEffect } from 'react';

function HelpSection({ section, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-800/60 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-slate-800/30 -mx-2 px-2 rounded transition-colors"
      >
        <span className="text-sm font-semibold text-slate-200">{section.title}</span>
        <span className={`text-cyan-500/70 text-xs transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-slate-400 leading-relaxed">
          {section.content}
        </div>
      )}
    </div>
  );
}

export default function HelpDrawer({ isOpen, onClose, sections, title, subtitle }) {
  const firstSectionId = sections[0]?.id;
  const [openSections, setOpenSections] = useState(() => firstSectionId ? { [firstSectionId]: true } : {});

  // Reset accordion when sections change (e.g., tab switch)
  useEffect(() => {
    setOpenSections(firstSectionId ? { [firstSectionId]: true } : {});
  }, [firstSectionId]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const toggleSection = (id) => {
    setOpenSections(s => ({ ...s, [id]: !s[id] }));
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-md border-l border-cyan-800/40 z-50 transition-transform duration-300 flex flex-col shadow-2xl shadow-black/50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!isOpen}
        aria-label={title}
      >
        <header className="flex items-start justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-lg shrink-0"
            aria-label="Anleitung schließen"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {sections.map(section => (
            <HelpSection
              key={section.id}
              section={section}
              isOpen={!!openSections[section.id]}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-mono text-center mt-6 mb-2 pb-2">
            Esc oder Klick außerhalb schließt
          </div>
        </div>
      </aside>
    </>
  );
}
