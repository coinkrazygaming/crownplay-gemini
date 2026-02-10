
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button } from '../components';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout hideSidebar>
      <div className="relative -mt-8 -mx-8">
        {/* Hero Section */}
        <div className="relative h-[600px] overflow-hidden flex items-center justify-center">
          <img 
            src="https://picsum.photos/seed/casino/1920/1080" 
            className="absolute inset-0 w-full h-full object-cover brightness-50"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
          
          <div className="relative z-10 text-center max-w-3xl px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
              ✨ Experience Royalty ✨
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Where Every Play <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">Is a Crowning Achievement</span>
            </h1>
            <p className="text-xl text-zinc-300 mb-10 leading-relaxed">
              Join the world's most premium social casino. Play your favorite slots and tables with 
              Gold Coins or Sweepstakes Coins for a chance at amazing rewards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" className="w-full sm:w-auto px-12 py-4 text-lg" onClick={() => navigate('/auth')}>
                JOIN NOW FOR FREE
              </Button>
              <Button variant="outline" className="w-full sm:w-auto px-12 py-4 text-lg" onClick={() => navigate('/lobby')}>
                BROWSE GAMES
              </Button>
            </div>
            <p className="mt-8 text-sm text-zinc-500 italic">
              New players get 10,000 GC + 2 SC welcome bonus instantly!
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 transition-colors">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🎰</div>
            <h3 className="text-2xl font-bold mb-4">500+ Premium Games</h3>
            <p className="text-zinc-500 leading-relaxed">From classic fruit machines to modern 3D video slots and high-stakes table games.</p>
          </div>
          <div className="text-center p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 transition-colors">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">💎</div>
            <h3 className="text-2xl font-bold mb-4">Real Reward System</h3>
            <p className="text-zinc-500 leading-relaxed">Redeem your Sweepstakes Coins for incredible gift cards and digital prizes once verified.</p>
          </div>
          <div className="text-center p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 transition-colors">
            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🛡️</div>
            <h3 className="text-2xl font-bold mb-4">Safe & Secure</h3>
            <p className="text-zinc-500 leading-relaxed">State-of-the-art encryption ensures your data and transactions are always protected.</p>
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-gradient-to-r from-zinc-900 to-amber-900/20 rounded-[40px] p-8 md:p-16 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6">The Royal Treasury is Open!</h2>
              <p className="text-xl text-zinc-400 mb-8">Grab our exclusive $9.99 Starter Bundle today and get a massive boost to your Gold Coin balance plus a bonus of 10 SC.</p>
              <Button variant="primary" className="px-10 py-4 font-bold" onClick={() => navigate('/auth')}>CLAIM THIS OFFER</Button>
            </div>
            <div className="relative w-full md:w-1/2 flex justify-center">
              <div className="w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] absolute" />
              <img src="https://picsum.photos/seed/coins/400/400" className="w-full max-w-[400px] object-contain rotate-6 animate-pulse" alt="Coins" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
