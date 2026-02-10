
import React from 'react';
import { Layout, Card, Badge, BadgeIcon } from '../components';
import { useStore } from '../store';

const LeaderboardPage: React.FC = () => {
  const { users, settings } = useStore();
  const sortedUsers = [...users].sort((a, b) => b.xp - a.xp).slice(0, 50);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
           <h1 className="text-6xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Elite Hierarchy</h1>
           <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">Top 50 Sovereign Citizens • Updated Real-Time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <Card className="p-8 border-amber-500/20 bg-amber-500/5 text-center flex flex-col items-center">
              <div className="text-4xl mb-4 italic">🥇</div>
              <h3 className="text-lg font-black uppercase text-amber-500 mb-2">{sortedUsers[0]?.name || '---'}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Supreme Monarch</p>
           </Card>
           <Card className="p-8 border-zinc-400/20 bg-zinc-400/5 text-center flex flex-col items-center">
              <div className="text-4xl mb-4 italic">🥈</div>
              <h3 className="text-lg font-black uppercase text-zinc-300 mb-2">{sortedUsers[1]?.name || '---'}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Grand Prince</p>
           </Card>
           <Card className="p-8 border-amber-900/20 bg-amber-900/5 text-center flex flex-col items-center">
              <div className="text-4xl mb-4 italic">🥉</div>
              <h3 className="text-lg font-black uppercase text-amber-900 mb-2">{sortedUsers[2]?.name || '---'}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Noble Knight</p>
           </Card>
        </div>

        <Card className="p-8">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-zinc-600 font-black uppercase tracking-widest border-b border-zinc-900 text-[10px]">
                       <th className="p-6">Rank</th>
                       <th className="p-6">Citizen</th>
                       <th className="p-6">Level</th>
                       <th className="p-6">XP Pool</th>
                       <th className="p-6 text-right">Badges</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-950">
                    {sortedUsers.map((u, i) => (
                       <tr key={u.id} className={`hover:bg-zinc-900/30 transition-colors ${i < 3 ? 'bg-amber-500/5' : ''}`}>
                          <td className="p-6 font-black italic text-xl text-zinc-600">#{i + 1}</td>
                          <td className="p-6">
                             <div className="font-black text-white uppercase italic">{u.name}</div>
                          </td>
                          <td className="p-6 font-black text-amber-500 italic">LVL {u.level}</td>
                          <td className="p-6 font-mono text-zinc-400">{u.xp.toLocaleString()}</td>
                          <td className="p-6 text-right flex justify-end gap-1">
                             {u.badges.slice(0, 3).map(b => <BadgeIcon key={b} type={b} />)}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>

        <div className="text-center p-12 bg-zinc-900/50 rounded-[48px] border border-zinc-800">
           <h3 className="text-2xl font-black uppercase italic mb-4">Weekly Hierarchy Reward</h3>
           <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed mb-8">The top citizen at the end of every week is awarded a <span className="text-emerald-400 font-bold">{settings.leaderboardWeeklyPrizeSC} SC</span> Treasury Bounty.</p>
           <Badge variant="info">Next Payout: Sunday 00:00 UTC</Badge>
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
