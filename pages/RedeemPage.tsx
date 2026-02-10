
import React, { useState } from 'react';
import { Layout, Card, Button, Input, Badge } from '../components';
import { useStore } from '../store';
import { KYCStatus, RedemptionStatus } from '../types';

const RedeemPage: React.FC = () => {
  const { currentUser, requestRedemption, redemptions } = useStore();
  const [amount, setAmount] = useState(100);

  if (!currentUser) return null;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const error = requestRedemption(amount);
    if (error) alert(error);
    else alert("Request dispatched to the Sovereign Treasury for audit.");
  };

  const myRedemptions = redemptions.filter(r => r.userId === currentUser.id);

  const vaultIncomplete = !currentUser.kycDocuments.idFront || !currentUser.kycDocuments.proofOfAddress || !currentUser.kycDocuments.paymentProof;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 space-y-12">
        <header className="border-b border-zinc-900 pb-10 flex justify-between items-end">
           <div>
             <h1 className="text-6xl font-black uppercase italic tracking-tighter">Treasury Redemption</h1>
             <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Convert Sovereign Credits to Digital Prizes</p>
           </div>
           <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>KYC: {currentUser.kycStatus}</Badge>
        </header>

        {vaultIncomplete && (
          <Card className="p-8 bg-red-500/5 border-red-500/20">
            <div className="flex gap-8 items-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-4xl shadow-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase italic text-red-500">Vault Security Locked</h3>
                <p className="text-zinc-400 text-sm mt-2">Treasury protocols require ID Front, Proof of Address, and Payment Proof uploads before any redemption can be processed.</p>
              </div>
              <Button onClick={() => window.location.hash = '#/profile'}>GO TO VAULT</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="p-10 border-emerald-500/20 bg-emerald-500/5">
            <h3 className="text-2xl font-black uppercase italic mb-8">Request Audit</h3>
            
            <div className="p-8 bg-zinc-950 rounded-[40px] border border-zinc-800 mb-10 shadow-inner text-center">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Available for Redemption</p>
               <div className="text-6xl font-black text-emerald-400 italic tracking-tighter">
                  {currentUser.sweepCoins.toLocaleString()} <span className="text-2xl uppercase tracking-widest text-zinc-700">SC</span>
               </div>
            </div>

            <form onSubmit={handleRedeem} className="space-y-8">
              <Input 
                label="Amount (Min: 100 SC)" 
                type="number" 
                min={100} 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-600 px-2">
                 <span>1 SC = $1.00 USD PRIZE VALUE</span>
                 <span>FEE: $0.00</span>
              </div>
              <Button variant="primary" className="w-full py-6 text-xl shadow-emerald-500/20 shadow-xl" disabled={vaultIncomplete || currentUser.kycStatus !== KYCStatus.VERIFIED || currentUser.sweepCoins < 100}>
                INITIATE REDEMPTION
              </Button>
            </form>
          </Card>

          <Card className="p-10">
            <h3 className="text-2xl font-black uppercase italic mb-8">Audit History</h3>
            <div className="space-y-4">
              {myRedemptions.length === 0 ? (
                <div className="text-center py-20 text-zinc-700 font-black uppercase italic tracking-widest text-xs">No pending audits.</div>
              ) : (
                myRedemptions.map(req => (
                  <div key={req.id} className="p-6 bg-zinc-950 rounded-3xl border border-zinc-900 flex justify-between items-center group hover:border-zinc-700 transition-all">
                    <div>
                      <div className="text-xl font-black text-white italic">{req.amount} SC</div>
                      <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{new Date(req.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Badge variant={req.status === RedemptionStatus.APPROVED ? 'success' : req.status === RedemptionStatus.PENDING ? 'warning' : 'error'}>
                      {req.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RedeemPage;
