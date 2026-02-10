
import React, { useState } from 'react';
import { Layout, Card, Button } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';

const ShopPage: React.FC = () => {
  const { purchasePackage, packages } = useStore();
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartPurchase = (pkg: any) => {
    setSelectedPkg(pkg);
  };

  const handleFinalize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      purchasePackage(selectedPkg.id);
      setIsProcessing(false);
      setSelectedPkg(null);
      alert(`The Royal Treasury has been updated! Your coins are ready, Majesty.`);
    }, 2500);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-amber-500/20">
            ✨ Secure Royal Transactions ✨
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tighter uppercase italic">The Crown Store</h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">Boost your Gold Coin balance and receive promotional Sweepstakes Coins as a royal gift with every purchase.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.filter(p => p.isActive).map((pkg) => (
            <Card key={pkg.id} className={`group relative p-10 flex flex-col items-center border-2 transition-all hover:scale-105 ${pkg.tag ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.15)] bg-zinc-900' : 'border-zinc-800'}`}>
              {pkg.tag && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="bg-amber-500 text-zinc-950 text-[10px] font-black px-6 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em]">{pkg.tag}</div>
                </div>
              )}
              
              <div className="text-6xl mb-8 group-hover:rotate-12 transition-transform duration-500">💰</div>
              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase italic">{pkg.name}</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10">Premium Credit Bundle</p>
              
              <div className="space-y-4 w-full mb-12">
                 <div className="flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Gold Coins</span>
                     <span className="text-2xl font-black text-amber-400 leading-none">{pkg.goldAmount.toLocaleString()}</span>
                   </div>
                   <div className="text-xl opacity-50">🪙</div>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg">
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Bonus Sweep Coins</span>
                     <span className="text-2xl font-black text-emerald-400 leading-none">{pkg.sweepAmount.toLocaleString()} SC</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl border border-emerald-500/20 shadow-inner">✨</div>
                 </div>
              </div>

              <div className="mt-auto w-full">
                <Button className="w-full py-5 text-xl font-black rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:shadow-amber-500/40" onClick={() => handleStartPurchase(pkg)}>
                  ${(pkg.priceCents / 100).toFixed(2)}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedPkg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
             <Card className="w-full max-w-md p-8 border-amber-500/40 relative">
                <button onClick={() => setSelectedPkg(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-xl">✕</button>
                <h3 className="text-2xl font-black mb-6 uppercase italic">Checkout</h3>
                
                <div className="mb-8 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{selectedPkg.name}</span>
                    <span className="font-black">${(selectedPkg.priceCents/100).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-600 font-medium">Order ID: CP-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>

                <div className="space-y-4 mb-8">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Select Payment Method</p>
                   {['Visa / Mastercard', 'American Express', 'Crypto Pay', 'Digital Wallet'].map((method, i) => (
                     <button key={i} className={`w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition-all text-sm font-bold ${i === 0 ? 'ring-2 ring-amber-500 bg-zinc-900' : ''}`}>
                        <span className="text-xl opacity-50">{['💳', '🏦', '🪙', '📱'][i]}</span>
                        {method}
                     </button>
                   ))}
                </div>

                <Button disabled={isProcessing} onClick={handleFinalize} className="w-full py-5 text-lg font-black uppercase tracking-widest shadow-2xl">
                   {isProcessing ? 'PROCESSING ROYAL TRANSFER...' : `PAY ${(selectedPkg.priceCents/100).toFixed(2)} USD`}
                </Button>
                
                <p className="mt-6 text-[10px] text-zinc-600 text-center font-bold uppercase tracking-widest">
                  🔒 Encrypted 256-bit Secure Checkout
                </p>
             </Card>
          </div>
        )}

        <div className="mt-32 p-16 bg-gradient-to-b from-zinc-900/50 to-transparent rounded-[64px] border border-zinc-900 text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 blur-[100px] rounded-full" />
           <h3 className="text-3xl font-black mb-6 uppercase italic tracking-tight">Social Gaming Disclaimer</h3>
           <p className="text-zinc-500 max-w-3xl mx-auto leading-relaxed text-sm font-medium">
             CrownPlay is strictly for entertainment. You can always get free coins via our Daily Login bonus, mail-in requests, and social giveaways. 
             Purchasing coins is optional and for entertainment purposes only. No real money gambling is conducted on this platform. Virtual currencies have no cash value outside our promotional sweepstakes model.
           </p>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
