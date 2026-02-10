
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Input, Card, CrownLogo } from '../components';
import { useStore } from '../store';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) navigate('/lobby');
        else setError('Invalid credentials for your royal account.');
      } else {
        await signup(email, name, referralCode);
        navigate('/lobby');
      }
    } catch (err: any) {
      setError(err.message || 'The crown encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideSidebar>
      <div className="max-w-2xl mx-auto py-12 px-6">
        <Card className="p-10 md:p-16 border-t-8 border-amber-500 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
          {!isLogin && (
            <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-[32px] p-6 mb-12 flex items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-zinc-950 text-2xl font-black shadow-xl shrink-0">🎁</div>
                  <div>
                     <h3 className="text-lg font-black tracking-tight leading-none mb-1">WELCOME REWARD</h3>
                     <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">A gift from the Crown for new citizens</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-black text-amber-500 leading-none">10,000 GC</div>
                  <div className="text-lg font-black text-emerald-500">+ 10 SC</div>
               </div>
            </div>
          )}

          <div className="text-center mb-12">
            <div className="flex justify-center mb-8 scale-150"><CrownLogo /></div>
            <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">{isLogin ? 'ENTER THE KINGDOM' : 'JOIN THE ROYALTY'}</h2>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em]">{isLogin ? 'Log in to your private vault' : 'Start your winning journey with 10 SC bonus'}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/20 text-red-500 p-6 rounded-[24px] mb-8 text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-pulse">
              <span className="text-2xl">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <Input label="Your Name (As it appears on ID)" placeholder="Crown Citizen" required value={name} onChange={e => setName(e.target.value)} />
            )}
            <Input label="Monarch Email" type="email" placeholder="sovereign@crownplay.com" required value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Private Key (Password)" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            
            {!isLogin && (
              <Input label="Ambassador Code (Optional)" placeholder="ROYAL-777" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
            )}

            <div className="flex flex-col gap-6 pt-6">
              <Button disabled={loading} className="w-full py-5 text-lg font-black shadow-2xl">
                {loading ? 'AUTHENTICATING...' : (isLogin ? 'GRANT ACCESS' : 'ENLIST NOW')}
              </Button>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black text-zinc-600 hover:text-amber-500 transition-colors uppercase tracking-[0.3em] py-2">
                {isLogin ? "NEW TO THE KINGDOM? JOIN NOW" : "ALREADY A CITIZEN? ENTER HERE"}
              </button>
            </div>
          </form>

          <div className="mt-16 pt-8 border-t border-zinc-800/50 text-center">
            <p className="text-[8px] text-zinc-700 leading-relaxed uppercase tracking-[0.2em] font-black max-w-sm mx-auto">
              By enlisting, you confirm you are of legal age (18+) and agree to the Crown's full Terms and Sovereign Privacy Charter.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AuthPage;
