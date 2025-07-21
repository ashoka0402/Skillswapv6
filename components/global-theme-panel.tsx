"use client"

import { useTheme } from "next-themes"

export default function GlobalThemePanel() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="fixed top-20 right-6 z-[200] flex items-end">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-2 flex flex-row gap-2 items-center">
        <button
          className={`px-4 py-2 rounded text-sm font-medium border transition-colors duration-150 ${theme === 'light' ? 'bg-blue-600 text-white border-blue-600' : 'bg-background text-foreground border-border'}`}
          onClick={() => setTheme('light')}
        >
          Light Mode
        </button>
        <button
          className={`px-4 py-2 rounded text-sm font-medium border transition-colors duration-150 ${theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-background text-foreground border-border'}`}
          onClick={() => setTheme('dark')}
        >
          Dark Mode
        </button>
      </div>
    </div>
  );
} 