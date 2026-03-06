import { useEffect, useMemo, useRef, useState } from 'react';
import './SubjectDropdown.css';

export type SubjectOption = { id: string; name: string; count: number };

type Props = {
  label?: string;
  value: string; // 'all' | subjectId
  onChange: (v: string) => void;
  options: SubjectOption[]; // expects that id 'all' may be passed by caller
  className?: string;
};

export default function SubjectDropdown({ label = 'Matéria', value, onChange, options, className }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const current = useMemo(() => options.find(o => o.id === value) || options[0], [options, value]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const btn = btnRef.current;
      const menu = menuRef.current;
      if (!btn) return;
      if (btn.contains(e.target as Node)) return;
      if (menu && menu.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={`sdwrap ${className || ''}`}>
      <div className="sd-label">{label}</div>
      <div className={`sd-combo ${open ? 'open' : ''}`}>
        <button
          ref={btnRef}
          type="button"
          className="sd-btn"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span className="sd-current">{current.name}{current.id !== 'all' ? ` (${current.count})` : ''}</span>
          <span className="sd-caret" aria-hidden>▾</span>
        </button>
        <ul ref={menuRef} className="sd-menu" role="listbox" style={{ display: open ? 'block' : 'none' }}>
          {options.map(opt => (
            <li
              key={opt.id}
              role="option"
              aria-selected={value === opt.id}
              className={`sd-item ${value === opt.id ? 'selected' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(opt.id); setOpen(false); }}
            >
              <span className="sd-name">{opt.name}</span>
              <span className="sd-count">{opt.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
