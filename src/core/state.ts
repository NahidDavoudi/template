type Listener = (value: unknown) => void;

const _data: Record<string, unknown> = {};
const _subs: Record<string, Listener[]> = {};

export const state = {
  get<T = unknown>(key: string): T {
    return _data[key] as T;
  },
  set(key: string, value: unknown): void {
    _data[key] = value;
    (_subs[key] || []).forEach((cb) => {
      try {
        cb(value);
      } catch {
        /* noop */
      }
    });
  },
  on(key: string, callback: Listener): () => void {
    if (!_subs[key]) _subs[key] = [];
    _subs[key].push(callback);
    return () => {
      _subs[key] = (_subs[key] || []).filter((cb) => cb !== callback);
    };
  },
};

export default state;
