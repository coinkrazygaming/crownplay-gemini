
import React from 'react';
import { Layout, Card, Badge, CurrencyBadge } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';

const WalletPage: React.FC = () => {
  const { currentUser, transactions } = useStore();

  if (!currentUser) return null;

  const myTransactions = transactions.filter(tx => tx.userId === currentUser.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-black mb-10">Wallet & Activity</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="p-8 bg-amber-500/5 border-amber-500/20">
             <div className="text-sm font-bold text-amber-500 uppercase mb-2">Gold Coins</div>
             <div className="text-4xl font-black mb-4">{currentUser.goldCoins.toLocaleString()} GC</div>
             <p className="text-zinc-500 text-sm">Use GC to play your favorite games for entertainment.</p>
          </Card>
          <Card className="p-8 bg-emerald-500/5 border-emerald-500/20">
             <div className="text-sm font-bold text-emerald-500 uppercase mb-2">Sweepstakes Coins</div>
             <div className="text-4xl font-black mb-4">{currentUser.sweepCoins.toLocaleString()} SC</div>
             <p className="text-zinc-500 text-sm">Winnings from SC play can be redeemed for prizes.</p>
          </Card>
        </div>

        <h3 className="text-2xl font-bold mb-6">Transaction History</h3>
        <Card className="overflow-hidden">
           {myTransactions.length === 0 ? (
             <div className="py-24 text-center text-zinc-600">No transactions recorded yet.</div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-zinc-950 text-zinc-500 text-xs font-bold uppercase">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                    {myTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-800/30">
                        <td className="px-6 py-4 text-sm text-zinc-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <Badge variant={tx.type === 'PURCHASE' ? 'success' : tx.type === 'REDEMPTION' ? 'error' : 'info'}>
                             {tx.type}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold">
                           {tx.type === 'PURCHASE' ? `$${tx.amount.toFixed(2)}` : `${tx.amount} ${tx.currency === CurrencyType.GC ? 'GC' : 'SC'}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">{tx.metadata || '-'}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           )}
        </Card>
      </div>
    </Layout>
  );
};

export default WalletPage;
