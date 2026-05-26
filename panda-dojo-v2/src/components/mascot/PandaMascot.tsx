import { useEffect, useState } from 'react';
import styles from './PandaMascot.module.css';

type MascotState = 'idle' | 'success' | 'error' | 'record';

interface Props {
  size?: number;
  className?: string;
}

export function PandaMascot({ size = 80, className = '' }: Props) {
  const [state, setState] = useState<MascotState>('idle');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function reset() {
      timeout = setTimeout(() => setState('idle'), 800);
    }

    const onSuccess = () => { setState('success'); reset(); };
    const onError   = () => { setState('error');   reset(); };
    const onRecord  = () => { setState('record');  reset(); };

    document.addEventListener('dojo:typing-success', onSuccess);
    document.addEventListener('dojo:typing-error',   onError);
    document.addEventListener('dojo:record',         onRecord);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('dojo:typing-success', onSuccess);
      document.removeEventListener('dojo:typing-error',   onError);
      document.removeEventListener('dojo:record',         onRecord);
    };
  }, []);

  const stateClass = state !== 'idle' ? styles[state === 'record' ? 'success' : state] : '';
  const cls = [styles.mascot, stateClass, className].filter(Boolean).join(' ');

  return (
    <span
      className={cls}
      style={{ fontSize: size }}
      role="img"
      aria-label="Mascote Panda"
    >
      🐼
    </span>
  );
}
