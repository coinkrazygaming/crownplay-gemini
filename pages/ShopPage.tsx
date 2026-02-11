
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Badge, GooglePayButton, CrownLogo } from '../components';
import { useStore } from '../store';
import { CurrencyType, Package } from '../types';

const ShopPage: React.FC = () => {
  const { purchasePackage, packages, currentUser } = useStore();
  const navigate = useNavigate();
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'processing' | 'success'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<string>('Google Pay');

  const handleStartPurchase = (pkg: Package, method: string = paymentMethod) => {
    setSelectedPkg(pkg);
    setPaymentMethod(method);
    
    // For Direct Card, we still use the simulated delay for the prototype
    if (method === 'Direct Card') {
      setCheckoutStep('processing');
      setTimeout(() => {
        purchasePackage(pkg.id, method);
        setCheckoutStep('success');
      }, 2500);
    }
  };

  const handleGPaySuccess = (paymentData: any) => {
    if (!selectedPkg) return;
    setCheckoutStep('processing');
    
    // In a real production app, we would send 'paymentData.paymentMethodData.tokenizationData.token' to our backend.
    // For this MVP, we verify it locally and complete the purchase.
    setTimeout(() => {
      purchasePackage(selectedPkg.id, 'Google Pay', paymentData);
      setCheckoutStep('success');
    }, 1500);
  };

  const handleCloseModal = () => {
    setSelectedPkg(null);
    setCheckoutStep('selection');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-amber-500/20 shadow-2xl">
            👑 CrownPlay Verified Payments 👑
          </div>
          <h1 className="text-7xl font-black mb-6 tracking-tighter uppercase italic bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">The Sovereign Store</h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-black uppercase tracking-widest text-xs opacity-60">
            Gold Coin Repositories • Gifted Sweepstakes Credit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {packages.filter(p => p.isActive).map((pkg) => (
            <Card key={pkg.id} className={`group relative p-12 flex flex-col items-center border-2 transition-all hover:scale-[1.03] hover:-translate-y-4 duration-700 ${pkg.tag ? 'border-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.15)] bg-zinc-900/50' : 'border-zinc-800 hover:border-amber-500/20 bg-zinc-900/20'}`}>
              {pkg.tag && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                   <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 text-[10px] font-black px-8 py-2.5 rounded-full shadow-[0_15px_40px_rgba(245,158,11,0.5)] uppercase tracking-[0.3em] whitespace-nowrap italic">
                     {pkg.tag}
                   </div>
                </div>
              )}
              
              <div className="text-7xl mb-12 group-hover:scale-125 transition-transform duration-700 filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]">
                {pkg.priceCents > 5000 ? '🏛️' : pkg.priceCents > 2000 ? '🏰' : '🛡️'}
              </div>
              
              <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase italic text-white group-hover:text-amber-500 transition-colors">{pkg.name}</h3>
              <div className="h-px w-20 bg-zinc-800 mb-10 group-hover:w-32 transition-all duration-700" />
              
              <div className="space-y-5 w-full mb-14">
                 <div className="flex flex-col items-center p-6 bg-zinc-950/80 rounded-3xl border border-zinc-800 shadow-inner group-hover:border-amber-500/10 transition-all text-center">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Gold Reserve</span>
                    <span className="text-3xl font-black text-amber-500 italic tracking-tighter">{pkg.goldAmount.toLocaleString()}</span>
                 </div>
                 
                 <div className="flex flex-col items-center p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 shadow-lg group-hover:bg-emerald-500/10 transition-all text-center">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Gifted Sweep Credit</span>
                    <span className="text-3xl font-black text-emerald-400 italic tracking-tighter">{pkg.sweepAmount.toLocaleString()} SC</span>
                 </div>
              </div>

              <div className="mt-auto w-full">
                <Button 
                  className="w-full py-6 text-2xl font-black italic rounded-3xl shadow-[0_15px_40px_rgba(245,158,11,0.15)] hover:shadow-amber-500/30 transition-all" 
                  onClick={() => setSelectedPkg(pkg)}
                >
                  ${(pkg.priceCents / 100).toFixed(2)}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {selectedPkg && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
             <Card className="w-full max-w-xl p-12 border-amber-500/30 relative shadow-[0_50px_150px_rgba(0,0,0,0.8)]">
                {checkoutStep === 'processing' && (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-10 shadow-[0_0_50px_rgba(245,158,11,0.2)]"></div>
                    <h3 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Securing Transaction...</h3>
                    <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] max-w-xs mx-auto">
                      Authorized by Royal Encryption Service v3.2
                    </p>
                  </div>
                )}

                {checkoutStep === 'success' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-700">
                    <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-7xl mb-12 shadow-[0_0_80px_rgba(245,158,11,0.4)] animate-bounce italic">👑</div>
                    <h3 className="text-5xl font-black mb-6 uppercase italic text-white tracking-tighter">Vault Refilled!</h3>
                    <div className="p-8 bg-zinc-950 rounded-[32px] border border-zinc-800 mb-12 w-full">
                       <div className="text-3xl font-black text-amber-500 italic mb-2">+{selectedPkg.goldAmount.toLocaleString()} GC</div>
                       <div className="text-3xl font-black text-emerald-400 italic">+{selectedPkg.sweepAmount.toLocaleString()} SC</div>
                    </div>
                    <Button variant="primary" className="w-full py-6 text-xl font-black italic tracking-tighter" onClick={handleCloseModal}>
                      RETURN TO KINGDOM
                    </Button>
                  </div>
                )}

                {checkoutStep === 'selection' && (
                  <>
                    <button onClick={handleCloseModal} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors text-3xl">✕</button>
                    <div className="flex items-center gap-4 mb-12">
                       <CrownLogo />
                       <h3 className="text-4xl font-black uppercase italic tracking-tighter">Checkout</h3>
                    </div>
                    
                    <div className="mb-12 p-8 bg-zinc-950 rounded-[32px] border border-zinc-800 shadow-inner">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Treasury Package</span>
                          <span className="text-2xl font-black text-white italic">{selectedPkg.name}</span>
                        </div>
                        <div className="text-3xl font-black text-amber-500 italic">${(selectedPkg.priceCents/100).toFixed(2)}</div>
                      </div>
                      <div className="h-px bg-zinc-800/50 w-full mb-6" />
                      <div className="flex items-center justify-between text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                        <span>TX ID: CP-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                        <span>Secured by Google Pay</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                       <GooglePayButton onPaymentSuccess={handleGPaySuccess} amount={selectedPkg.priceCents/100} />
                       <div className="flex items-center gap-6 text-zinc-800 py-4">
                          <div className="h-px flex-1 bg-zinc-800/50" />
                          <span className="text-[10px] font-black uppercase tracking-widest">or legacy pay</span>
                          <div className="h-px flex-1 bg-zinc-800/50" />
                       </div>
                       <Button variant="outline" className="w-full py-5 text-sm" onClick={() => handleStartPurchase(selectedPkg, 'Direct Card')}>
                          PAY WITH SECURE CARD
                       </Button>
                    </div>
                    
                    <p className="mt-12 text-[9px] text-zinc-600 text-center font-black uppercase tracking-[0.4em] opacity-50">
                      Zero Friction • Instant Credit • Crown Assurance
                    </p>
                  </>
                )}
             </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShopPage;
