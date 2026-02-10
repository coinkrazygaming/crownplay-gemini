
import React, { useState } from 'react';
import { Layout, Card, Badge, TransactionAuditor, Button } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';
import { getWalletInsight } from '../aiService';

const WalletPage: React.FC = () => {
  const { currentUser, transactions } = useStore();
  const [insight, setInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  if (!currentUser) return null;

  const myTransactions = transactions.filter(tx => tx.userId === currentUser.id);

  const handleGetInsight = async () => {
    setIsLoadingInsight(true);
    const text = await getWalletInsight(myTransactions);
    setInsight(text);
    setIsLoadingInsight(false);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-10">
           <div>
             <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Sovereign Ledger</h1>
             <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em]">Detailed Transaction Audit History</p>
           </div>
           <div className="flex gap-4">
              <Badge variant="success">Sync Status: Active</Badge>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="p-10 bg-amber-500/5 border-amber-500/20">
             <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Gold Coin Repository</div>
             <div className="text-5xl font-black mb-6 italic tracking-tighter">{currentUser.goldCoins.toLocaleString()} GC</div>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Secured for social play and community exploration.</p>
          </Card>
          <Card className="p-10 bg-emerald-500/5 border-emerald-500/20">
             <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Sweepstakes Credit Vault</div>
             <div className="text-5xl font-black mb-6 italic tracking-tighter">{currentUser.sweepCoins.toLocaleString()} SC</div>
             <p className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest leading-relaxed">Promotional credits with prize redemption potential.</p>
          </Card>
        </div>

        {/* AI Insight Section */}
        <Card className="p-8 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-amber-500 flex items-center gap-3">
                    <span className="text-2xl">✨</span> Oracle Treasury Insights
                 </h3>
                 <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                    {insight || "Allow the Royal Treasury Oracle to analyze your recent activity and provide a private financial summary."}
                 </p>
              </div>
              <Button variant="ai" onClick={handleGetInsight} disabled={isLoadingInsight}>
                 {isLoadingInsight ? 'ANALYZING LEDGER...' : (insight ? 'REFRESH INSIGHT' : 'CONSULT ORACLE')}
              </Button>
           </div>
           {insight && <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 select-none pointer-events-none grayscale">📊</div>}
        </Card>

        <Card className="p-4 bg-zinc-900/50 backdrop-blur-xl border-zinc-800">
          <h3 className="text-xl font-black mb-8 p-4 uppercase italic">Event Audit History</h3>
          <TransactionAuditor transactions={myTransactions} />
          {myTransactions.length === 0 && (
            <div className="py-24 text-center text-zinc-600 font-black uppercase tracking-widest text-xs italic">
               No ledger events recorded.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default WalletPage;
