type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export function emitWarning(message: string) {
  for (const l of Array.from(listeners)) {
    try {
      l(message);
    } catch {}
  }
}

export function onWarning(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
