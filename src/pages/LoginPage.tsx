import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../core/api';
import { useStoreConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { pickVariantSet } from '../lib/utils/imageUrl';
import { isTemplateAuthEnabled } from '../core/templateAuth';
import { toast } from '../lib/utils/toast';

type Tab = 'login' | 'register';

export function LoginPage() {
  const cfg = useStoreConfig();
  const { isLoggedIn, isAdmin, login, refresh } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  usePageTitle('ورود و ثبت‌نام');

  const templateAuth = isTemplateAuthEnabled();
  const smsOtp = cfg.auth.smsOtpEnabled;
  const [tab, setTab] = useState<Tab>('login');

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regFname, setRegFname] = useState('');
  const [regLname, setRegLname] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const redirect = search.get('redirect') || (isAdmin ? '/admin' : '/');

  useEffect(() => {
    if (isLoggedIn) navigate(redirect, { replace: true });
  }, [isLoggedIn, navigate, redirect]);

  useEffect(() => {
    if (search.get('tab') === 'register' || location.hash === '#register') setTab('register');
  }, [search]);

  const redirectAfterAuth = (role?: string) => {
    refresh();
    const target = search.get('redirect') || (role === 'admin' ? '/admin' : '/');
    navigate(target, { replace: true });
  };

  const doLogin = async () => {
    setLoginError('');
    if (!loginPhone || !loginPassword) {
      setLoginError('شماره همراه و رمز عبور را وارد کنید');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginPhone, loginPassword);
      const user = api.auth.currentUser();
      toast('خوش آمدید', 'success', 1500);
      redirectAfterAuth(user?.role);
    } catch (e) {
      setLoginError((e as Error).message);
      setLoginLoading(false);
    }
  };

  const doRegister = async () => {
    setRegError('');
    if (!regFname) return setRegError('نام را وارد کنید');
    if (!regPhone) return setRegError('شماره همراه را وارد کنید');
    if (regPassword.length < 8) return setRegError('رمز عبور حداقل ۸ کاراکتر باشد');
    if (regPassword !== regConfirm) return setRegError('رمز عبور و تکرار آن یکسان نیستند');
    if (!regTerms) return setRegError('قوانین را تأیید کنید');
    setRegLoading(true);
    try {
      await api.auth.register({ name: `${regFname} ${regLname}`.trim(), phone: regPhone, password: regPassword });
      await refresh();
      toast('ثبت‌نام موفق بود', 'success', 1500);
      redirectAfterAuth();
    } catch (e) {
      setRegError((e as Error).message);
      setRegLoading(false);
    }
  };

  const logoSrc = pickVariantSet(cfg.logoVariants, 'thumb') || cfg.logo;

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <img src={logoSrc} alt={cfg.name} className="h-12 w-12 object-contain" />
            <span className="font-display text-2xl text-body tracking-[0.15em] font-bold" dir="ltr">{cfg.name}</span>
          </Link>
          <p className="text-muted text-sm">{cfg.texts.footer.tagline}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'login' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            >
              ورود
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'register' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            >
              ثبت‌نام
            </button>
          </div>

          {tab === 'login' ? (
            <div className="p-6 space-y-4 text-right">
              <div>
                <label className="block text-sm text-muted mb-1">{templateAuth ? 'نام کاربری' : 'شماره همراه'}</label>
                <input
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                  placeholder={templateAuth ? cfg.auth.templateAdmin.username : '۰۹۱۲۳۴۵۶۷۸۹'}
                  className="admin-input rounded-lg px-4 py-3 text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">رمز عبور</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                    placeholder="••••••••"
                    className="admin-input rounded-lg px-4 py-3 pl-16 text-sm w-full"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted px-2 py-1">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-sm text-accent">{loginError}</p>}
              <button onClick={doLogin} disabled={loginLoading} className="w-full py-3 bg-accent text-white rounded-lg font-bold hover:bg-accent-hover disabled:opacity-50">
                {loginLoading ? 'در حال ورود...' : 'ورود به حساب'}
              </button>
              {templateAuth && (
                <p className="text-xs text-muted text-center pt-2">
                  ورود نمایشی ادمین: <span dir="ltr" className="font-bold">admin / admin1234</span>
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-4 text-right">
              <div className="grid grid-cols-2 gap-3">
                <input value={regFname} onChange={(e) => setRegFname(e.target.value)} placeholder="نام" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
                <input value={regLname} onChange={(e) => setRegLname(e.target.value)} placeholder="نام خانوادگی" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
              </div>
              <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="شماره همراه" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="رمز عبور (حداقل ۸ کاراکتر)" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
              <input type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="تکرار رمز عبور" className="admin-input rounded-lg px-4 py-3 text-sm w-full" />
              <label className="flex items-center gap-3 flex-row-reverse cursor-pointer">
                <input type="checkbox" checked={regTerms} onChange={(e) => setRegTerms(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-muted"><Link to="/terms" className="text-accent hover:underline">قوانین و مقررات</Link> را می‌پذیرم</span>
              </label>
              {regError && <p className="text-sm text-accent">{regError}</p>}
              <button onClick={doRegister} disabled={regLoading} className="w-full py-3 bg-accent text-white rounded-lg font-bold hover:bg-accent-hover disabled:opacity-50">
                {regLoading ? 'در حال ثبت‌نام...' : (smsOtp ? cfg.texts.auth.sendCode : cfg.texts.auth.registerSubmit)}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted/60 mt-6">{cfg.texts.footer.copyright}</p>
      </div>
    </main>
  );
}

export default LoginPage;
