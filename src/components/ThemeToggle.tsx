'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-fit"
      onClick={() => setTheme(theme === 'dark' || resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' || resolvedTheme === 'dark' ? (
        <div className='flex gap-3 justify-center items-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2'>
          {/* <span className='md:hidden'>Switch to Light Mode</span> */}
          <Sun className="h-4 w-4" />
        </div>
      ) : (
        <div className='flex gap-3 justify-center items-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2'>
          {/* <span className='md:hidden'>Switch to Dark Mode</span> */}
          <Moon className="h-4 w-4 text-foreground" />
        </div>
      )}
    </Button>
  );
}