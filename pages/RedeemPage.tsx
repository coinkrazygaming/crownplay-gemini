
import React, { useState } from 'react';
import { Layout, Card, Button, Input, Badge } from '../components';
import { useStore } from '../store';
import { KYCStatus, RedemptionStatus } from '../types';

const RedeemPage: React.FC = () => {
  const { currentUser, requestRedemption, redemptions, settings } = useStore();
  const [amount, setAmount] = useState(100);

  if (!currentUser) return null;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const error = requestRedemption(amount);
    if (error) alert(error);
    else alert("Audit dispatched to the Sovereign Treasury.");
  };

  const myRedemptions = redemptions.filter(r => r.userId === currentUser.id);

  const docs = currentUser.kycDocuments;
  const vaultIncomplete = !docs.idFront || !docs.proofOfAddress || !docs.paymentProof;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 space-y-12">
        <header className="border-b border-zinc-900 pb-10 flex justify-between items-end">
           <div>
             <h1 className="text-6xl font-black uppercase italic tracking-tighter">Treasury Redemption</h1>
             <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Convert Sovereign Credits to Digital Prizes</p>
           </div>
           <div className="flex gap-4">
              <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>Status: {currentUser.kycStatus}</Badge>
           </div>
        </header>

        {vaultIncomplete && (
          <Card className="p-10 bg-red-500/5 border-2 border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.1)]">
            <div className="flex gap-10 items-center">
              <div className="w-24 h-24 bg-red-500 rounded-[40px] flex items-center justify-center text-5xl shadow-2xl shrink-0">🛡️</div>
              <div className="flex-1">
                <h3 className="text-3xl font-black uppercase italic text-white mb-2">Identity Vault Secured</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                  Treasury protocols require a complete identity profile. Please upload your <span className="text-white font-bold">Government ID</span>, <span className="text-white font-bold">Proof of Address</span>, and <span className="text-white font-bold">Payment Card</span> proof in the Identity Vault to unlock redemptions.
                </p>
              </div>
              <Button className="px-10 py-5" onClick={() => window.location.hash = '#/profile'}>ENTER VAULT</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="p-10 border-emerald-500/20 bg-emerald-500/5">
            <h3 className="text-2xl font-black uppercase italic mb-8">Prize Request</h3>
            
            <div className="p-8 bg-zinc-950 rounded-[40px] border border-zinc-800 mb-10 text-center shadow-inner">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Available for Redemption</p>
               <div className="text-6xl font-black text-emerald-400 italic tracking-tighter">
                  {currentUser.sweepCoins.toLocaleString()} <span className="text-2xl uppercase tracking-widest text-zinc-700">SC</span>
               </div>
            </div>

            <form onSubmit={handleRedeem} className="space-y-8">
              <Input 
                label={`Amount (Min: ${settings.minRedemption} SC)`}
                type="number" 
                min={settings.minRedemption} 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-600 px-2">
                 <span>1 SC = $1.00 USD VALUE</span>
                 <span>PROCESSING FEE: $0.00</span>
              </div>
              <Button 
                variant="primary" 
                className="w-full py-6 text-xl shadow-emerald-500/20 shadow-xl" 
                disabled={vaultIncomplete || currentUser.kycStatus !== KYCStatus.VERIFIED || currentUser.sweepCoins < settings.minRedemption}
              >
                {vaultIncomplete ? 'VAULT INCOMPLETE' : currentUser.kycStatus !== KYCStatus.VERIFIED ? 'AWAITING VERIFICATION' : 'DISPATCH REQUEST'}
              </Button>
            </form>
          </Card>

          <Card className="p-10">
            <h3 className="text-2xl font-black uppercase italic mb-8">Disbursement History</h3>
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
