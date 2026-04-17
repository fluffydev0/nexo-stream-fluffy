import { useEffect, useState } from 'react';

export function AutoReleaseCountdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(target).getTime() - Date.now()),
  );

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [target]);

  if (remaining <= 0) return <span className="font-mono text-primary">Releasing...</span>;

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return (
    <span className="font-mono text-amber">
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}
