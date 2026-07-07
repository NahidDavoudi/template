import { Link } from 'react-router-dom';
import { useStoreConfig } from '../context/ConfigContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';

export function NotFoundPage() {
  const cfg = useStoreConfig();
  usePageTitle(`صفحه یافت نشد | ${cfg.name}`);
  return (
    <main className="max-w-[800px] mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold text-accent mb-4">۴۰۴</p>
      <p className="text-xl text-muted mb-8">صفحه مورد نظر یافت نشد</p>
      <Link to="/" className="inline-block px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover">بازگشت به خانه</Link>
    </main>
  );
}

export default NotFoundPage;
