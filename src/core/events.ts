type Handler = (data?: unknown) => void;

const _handlers: Record<string, Handler[]> = {};

export const events = {
  on(eventName: string, callback: Handler): () => void {
    if (!_handlers[eventName]) _handlers[eventName] = [];
    _handlers[eventName].push(callback);
    return () => events.off(eventName, callback);
  },
  off(eventName: string, callback: Handler): void {
    if (!_handlers[eventName]) return;
    _handlers[eventName] = _handlers[eventName].filter((cb) => cb !== callback);
  },
  emit(eventName: string, data?: unknown): void {
    (_handlers[eventName] || []).forEach((cb) => {
      try {
        cb(data);
      } catch {
        /* noop */
      }
    });
  },
};

export default events;
