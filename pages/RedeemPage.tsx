
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
    else alert("Redemption request submitted successfully!");
  };

  const myRedemptions = redemptions.filter(r => r.userId === currentUser.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-black mb-10">Redeem Prizes</h1>

        {currentUser.kycStatus !== KYCStatus.VERIFIED && (
          <Card className="p-8 mb-10 bg-amber-500/5 border-amber-500/20">
            <div className="flex gap-6 items-center">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Verification Required</h3>
                <p className="text-zinc-400">To redeem Sweepstakes Coins for prizes, you must first complete our identity verification process.</p>
              </div>
              <Button onClick={() => window.location.hash = '#/profile'}>Complete KYC</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8">
            <h3 className="text-xl font-bold mb-6">Request Redemption</h3>
            <div className="flex items-center gap-4 mb-8 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
               <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl">💎</div>
               <div>
                  <div className="text-xs font-bold text-zinc-500 uppercase">Available SC Balance</div>
                  <div className="text-2xl font-black text-emerald-400">{currentUser.sweepCoins.toLocaleString()} SC</div>
               </div>
            </div>

            <form onSubmit={handleRedeem} className="space-y-6">
              <Input 
                label="Amount to Redeem (Min: 100)" 
                type="number" 
                min={100} 
                max={currentUser.sweepCoins}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <p className="text-xs text-zinc-500">1 SC = $1.00 USD (equivalent in prizes/cards)</p>
              <Button className="w-full py-4" disabled={currentUser.kycStatus !== KYCStatus.VERIFIED || currentUser.sweepCoins < 100}>
                SUBMIT REQUEST
              </Button>
            </form>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-bold mb-6">Recent Requests</h3>
            <div className="space-y-4">
              {myRedemptions.length === 0 ? (
                <div className="text-center py-12 text-zinc-600">No redemption history yet.</div>
              ) : (
                myRedemptions.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div>
                      <div className="font-bold">{req.amount} SC</div>
                      <div className="text-xs text-zinc-500">{new Date(req.createdAt).toLocaleDateString()}</div>
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
