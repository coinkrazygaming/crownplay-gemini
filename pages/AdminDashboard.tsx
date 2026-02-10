
import React, { useState } from 'react';
import { useStore } from '../store';
import { Layout, Card, Badge, Button, Input } from '../components';
import { UserRole, RedemptionStatus, KYCStatus, CurrencyType, SocialComment } from '../types';
import { generateGeminiResponse } from '../aiService';

const AdminDashboard: React.FC = () => {
  const { 
    currentUser, users, transactions, redemptions, games, packages, socialComments,
    adminUpdateUser, adminAddSocialComment, adminRemoveSocialComment
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'insight' | 'players' | 'social' | 'games' | 'banking'>('insight');
  const [aiSocialPrompt, setAiSocialPrompt] = useState('');
  const [isAiSocialWorking, setIsAiSocialWorking] = useState(false);
  const [emailPrompt, setEmailPrompt] = useState('');
  const [isEmailWorking, setIsEmailWorking] = useState(false);
  const [emailResult, setEmailResult] = useState('');

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <Layout hideSidebar>
        <div className="text-center py-24"><h1 className="text-4xl font-black uppercase tracking-tighter italic">Restricted Zone</h1></div>
      </Layout>
    );
  }

  const handleAiSocial = async () => {
    setIsAiSocialWorking(true);
    try {
      const res = await generateGeminiResponse(
        "Generate 3 short, enthusiastic social media comments from different 'users' praising CrownPlay social casino. Format as AUTHOR:COMMENT per line.",
        "You are the Social Architect for CrownPlay. Generate realistic community engagement text."
      );
      const lines = res.split('\n').filter(l => l.includes(':'));
      lines.forEach(line => {
        const [author, text] = line.split(':');
        adminAddSocialComment({
          id: Math.random().toString(36).substr(2, 9),
          author: author.trim(),
          text: text.trim().replace(/"/g, ''),
          source: 'PLATFORM',
          createdAt: new Date().toISOString()
        });
      });
      alert("Social archives updated with fresh community sentiment.");
    } catch (e) {
      alert("The Oracle failed to conjure social proof.");
    } finally {
      setIsAiSocialWorking(false);
    }
  };

  const handleEmailForge = async () => {
    setIsEmailWorking(true);
    try {
      const res = await generateGeminiResponse(
        `Craft a high-converting re-engagement email for inactive players. Goal: ${emailPrompt || 'Bring them back with a 5,000 GC bonus'}.`,
        "You are the Royal Outreach AI. You write elegant, persuasive marketing emails for CrownPlay VIPs."
      );
      setEmailResult(res);
    } catch (e) {
      alert(" Outreach Forge failed.");
    } finally {
      setIsEmailWorking(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-10">
           <div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Monarch Dashboard</h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Sovereign Control Node</p>
           </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {['insight', 'players', 'social', 'games', 'banking'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === tab ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-xl' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
             <div className="space-y-8">
                <Card className="p-8 border-amber-500/20 bg-amber-500/5">
                   <h3 className="text-xl font-black uppercase italic mb-6">AI Social Architect</h3>
                   <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Let the Oracle generate realistic social buzz for your global tickers and community feeds.</p>
                   <Button variant="ai" className="w-full py-4" onClick={handleAiSocial} disabled={isAiSocialWorking}>
                     {isAiSocialWorking ? 'ARCHITECTING BUZZ...' : 'GENERATE COMMUNITY BUZZ'}
                   </Button>
                </Card>

                <Card className="p-8">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black uppercase italic">Current Comments</h3>
                      <Badge variant="info">{socialComments.length} ENTRIES</Badge>
                   </div>
                   <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                      {socialComments.map(c => (
                        <div key={c.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-start gap-4">
                           <div>
                              <div className="text-[10px] font-black text-amber-500 uppercase mb-1">@{c.author} • {c.source}</div>
                              <p className="text-xs text-zinc-300 italic">"{c.text}"</p>
                           </div>
                           <button onClick={() => adminRemoveSocialComment(c.id)} className="text-red-500 hover:text-red-400 font-black">✕</button>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>

             <div className="space-y-8">
                <Card className="p-8">
                   <h3 className="text-xl font-black uppercase italic mb-6">Royal Outreach Forge</h3>
                   <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Describe a campaign to bring players back or incentivize social sharing.</p>
                   <textarea 
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 text-xs h-32 mb-6 focus:outline-none focus:border-amber-500/50" 
                    placeholder="e.g. Bring back players who haven't logged in for 7 days with a 10 SC gift..."
                    value={emailPrompt}
                    onChange={e => setEmailPrompt(e.target.value)}
                   />
                   <Button variant="ai" className="w-full py-4" onClick={handleEmailForge} disabled={isEmailWorking}>
                      {isEmailWorking ? 'FORGING CAMPAIGN...' : 'CRAFT OUTREACH EMAIL'}
                   </Button>
                </Card>

                {emailResult && (
                  <Card className="p-8 animate-in slide-in-from-right duration-500">
                     <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4">FORGED CONTENT:</h3>
                     <div className="text-xs text-zinc-400 whitespace-pre-wrap italic font-serif leading-relaxed bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                        {emailResult}
                     </div>
                     <div className="mt-6 flex gap-4">
                        <Button className="flex-1" onClick={() => { alert("Campaign dispatched to royal mailing list!"); setEmailResult(''); }}>DISPATCH NOW</Button>
                        <Button variant="ghost" onClick={() => setEmailResult('')}>DISCARD</Button>
                     </div>
                  </Card>
                )}
             </div>
          </div>
        )}

        {/* Other existing tabs logic... */}
        {activeTab === 'insight' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="KINGDOM POPULATION" val={users.length} icon="👥" />
              <StatCard label="WINNER CIRCLE" val={transactions.filter(t => t.type === 'GAME_WIN').length} icon="🏆" color="text-emerald-500" />
              <StatCard label="SOCIAL BUZZ" val={socialComments.length} icon="💬" color="text-amber-500" />
           </div>
        )}
      </div>
    </Layout>
  );
};

const StatCard = ({ label, val, icon, color = "text-white" }: any) => (
  <Card className="p-10 flex flex-col items-center text-center hover:scale-105 transition-transform duration-500">
    <div className="text-4xl mb-4 opacity-50">{icon}</div>
    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">{label}</div>
    <div className={`text-4xl font-black italic tracking-tighter ${color}`}>{val}</div>
  </Card>
);

export default AdminDashboard;
