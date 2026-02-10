
import React from 'react';
import { Layout, Card, Badge, Button } from '../components';
import { useStore } from '../store';

const BonusGuidePage: React.FC = () => {
  const { settings } = useStore();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center">
           <h1 className="text-6xl font-black italic uppercase tracking-tighter">Bounty Charter</h1>
           <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">Official CrownPlay Reward Protocols</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <BonusCard 
             title="Citizen Enlistment" 
             gc={settings.newUserBonusGC} 
             sc={settings.newUserBonusSC} 
             desc="Granted immediately upon successful identity creation in the kingdom."
           />
           <BonusCard 
             title="Daily Royal Bounty" 
             gc={settings.dailyRewardGC} 
             sc={settings.dailyRewardSC} 
             desc="A recurring gift from the treasury. Available every 24 hours via the lobby."
           />
           <BonusCard 
             title="Social Synergy" 
             gc={settings.socialBonusGC} 
             sc={settings.socialBonusSC} 
             desc="Link your external social identities (FB, Twitter) to sync with the kingdom."
           />
           <BonusCard 
             title="Promotional Decree" 
             gc={settings.socialTaskBonusGC} 
             sc={settings.socialTaskBonusSC} 
             desc="One-time reward for sharing our promotional charter on your public timeline."
           />
        </div>

        <Card className="p-10 border-emerald-500/20 bg-emerald-500/5">
           <h3 className="text-2xl font-black uppercase italic mb-6">Ambassador Program</h3>
           <p className="text-zinc-400 leading-relaxed mb-8">Refer new citizens using your unique Ambassador Code. Both you and the new citizen will receive the Ambassador Bounty instantly upon their successful enlistment.</p>
           <div className="flex gap-4">
              <Badge variant="success">Unlimited Referrals</Badge>
              <Badge variant="success">Instant Credit</Badge>
           </div>
        </Card>

        <Card className="p-10">
           <h3 className="text-2xl font-black uppercase italic mb-6">Game Play Synergy</h3>
           <p className="text-zinc-400 leading-relaxed">Every coin wagered in the kingdom generates XP at a rate of <span className="text-amber-500 font-bold">{settings.gamePlayBonusRate} XP / Coin</span>. High level citizens unlock exclusive badges and priority redemption handling.</p>
        </Card>
      </div>
    </Layout>
  );
};

const BonusCard = ({ title, gc, sc, desc }: any) => (
  <Card className="p-10 flex flex-col h-full">
     <h3 className="text-xl font-black uppercase italic mb-4 text-white">{title}</h3>
     <div className="flex gap-4 mb-6">
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl font-black text-amber-500 text-sm">{gc.toLocaleString()} GC</div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-black text-emerald-400 text-sm">{sc.toLocaleString()} SC</div>
     </div>
     <p className="text-zinc-500 text-sm leading-relaxed mb-6">{desc}</p>
     <div className="mt-auto">
        <Badge variant="info">Status: ACTIVE</Badge>
     </div>
  </Card>
);

export default BonusGuidePage;
