
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Layout, Card, Badge, Button, Input, TransactionAuditor, CrownLogo } from '../components';
import { UserRole, CurrencyType, AuditAction, Game, SecurityAlert, TransactionType, User, EmailLog, KYCStatus } from '../types';
import { generateGeminiResponse, getSecurityReport, getGameSimulationInsight } from '../aiService';

const AdminDashboard: React.FC = () => {
  const { 
    currentUser, users, transactions, games, securityAlerts, auditLogs, emailLogs, settings,
    adminAdjustBalance, adminAddGame, adminUpdateGame, adminDeleteGame, adminResolveAlert, adminUpdateSettings, adminSendEmail, adminUpdateUserStatus
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'insight' | 'players' | 'bonuses' | 'jackpot' | 'editor' | 'security' | 'settings' | 'social' | 'maintenance'>('insight');
  
  // Local state for forms
  const [emailTarget, setEmailTarget] = useState<string>('ALL');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // AI Maintenance state
  const [maintPrompt, setMaintPrompt] = useState('');
  const [maintLogs, setMaintLogs] = useState<{role: 'admin'|'oracle', text: string}[]>([
    { role: 'oracle', text: "Monarch Oracle online. Describe the site adjustments you require, and I will draft the protocols." }
  ]);
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  // AI Editor state
  const [editorPrompt, setEditorPrompt] = useState('');
  const [isEditorWorking, setIsEditorWorking] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [configGame, setConfigGame] = useState<Game | null>(null);

  // Settings Draft State
  const [draftSettings, setDraftSettings] = useState(settings);

  const syncSettings = () => {
    adminUpdateSettings(draftSettings);
    alert("Sovereign Database Updated Successfully.");
  };

  const handleMaintenanceOracle = async () => {
    if (!maintPrompt.trim()) return;
    const p = maintPrompt;
    setMaintPrompt('');
    setMaintLogs(prev => [...prev, { role: 'admin', text: p }]);
    setIsOracleThinking(true);
    
    const context = `Current Site Settings: ${JSON.stringify(settings)}. Request: ${p}`;
    const res = await generateGeminiResponse(context, "You are the Monarch Site Maintenance Oracle. You propose specific site changes. Be technical and precise.");
    
    setMaintLogs(prev => [...prev, { role: 'oracle', text: res }]);
    setIsOracleThinking(false);
  };

  // AI Game Creator
  const handleAiGameEditor = async () => {
    setIsEditorWorking(true);
    try {
      const modePrompt = editingGameId ? `UPDATE game ${editingGameId} with: ${editorPrompt}` : `CREATE new game: ${editorPrompt}`;
      const prompt = `JSON ONLY. Social casino slot. fields: name, description, categoryId (cat-slots), rtp (0.95), volatility (MEDIUM), reelsConfig (9 icons). Action: ${modePrompt}.`;
      const res = await generateGeminiResponse(prompt, "Game Logic Designer mode.");
      const gameData = JSON.parse(res.replace(/```json/g, '').replace(/```/g, ''));
      if (editingGameId) adminUpdateGame(editingGameId, gameData);
      else adminAddGame({ id: Math.random().toString(36).substr(2, 9), image: `https://picsum.photos/seed/${gameData.name}/400/500`, minBet: 100, maxBet: 1000000, themeColor: '#f59e0b', ...gameData, provider: 'CrownPlay Studios' });
      setEditorPrompt(''); setEditingGameId(null); syncSettings();
    } catch (e) { alert("AI synthesis failed."); } finally { setIsEditorWorking(false); }
  };

  const [playerSearch, setPlayerSearch] = useState('');
  const displayedUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(playerSearch.toLowerCase()) || u.email.toLowerCase().includes(playerSearch.toLowerCase()));
  }, [users, playerSearch]);

  if (currentUser?.role !== UserRole.ADMIN) return <Layout hideSidebar><div className="py-20 text-center">ACCESS RESTRICTED</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8 pb-24">
        <header className="flex justify-between items-center bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-zinc-950 text-3xl font-black shadow-2xl">C</div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Monarch Console</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[8px] mt-1">Sovereign Management Nexus Level 9</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Badge variant="success">DB Connected: Neon v4</Badge>
              <Button variant="outline" onClick={() => window.location.reload()}>RELOAD SYSTEMS</Button>
           </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'insight', label: 'Overview', icon: '📊' },
            { id: 'players', label: 'Citizens', icon: '👥' },
            { id: 'bonuses', label: 'Bonuses', icon: '🎁' },
            { id: 'jackpot', label: 'Jackpot', icon: '🏆' },
            { id: 'social', label: 'Social', icon: '📢' },
            { id: 'editor', label: 'Studio', icon: '🎰' },
            { id: 'maintenance', label: 'Oracle Maintenance', icon: '✨' },
            { id: 'settings', label: 'Banking', icon: '⚙️' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center gap-3 whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-xl' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        <div className="animate-in fade-in duration-500">
        {activeTab === 'insight' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <StatCard label="Total Citizens" val={users.length} icon="👤" />
             <StatCard label="Treasury SC" val={settings.jackpotSC.toLocaleString()} icon="💎" color="text-emerald-500" />
             <StatCard label="Vault GC" val={settings.jackpotGC.toLocaleString()} icon="💰" color="text-amber-500" />
             <StatCard label="Security Flags" val={securityAlerts.filter(a => !a.resolved).length} icon="⚠️" color="text-red-500" />
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-8">
            <Card className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase italic">Citizen Registry</h3>
                <div className="flex gap-4">
                  <input className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs w-64 outline-none focus:border-amber-500" placeholder="Search..." value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} />
                  <Button variant="primary" className="px-6 py-2 text-[10px]" onClick={() => alert("Registry Snapshot Saved.")}>SAVE REGISTRY</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-600 font-black uppercase tracking-widest border-b border-zinc-800">
                      <th className="p-4">Citizen</th>
                      <th className="p-4">Finances</th>
                      <th className="p-4">Last Visit</th>
                      <th className="p-4">KYC Vault</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {displayedUsers.map(u => {
                      const daysAgo = Math.floor((Date.now() - new Date(u.lastLoginAt).getTime()) / 86400000);
                      return (
                        <tr key={u.id} className="hover:bg-zinc-900/50">
                          <td className="p-4">
                             <div className="font-bold text-white uppercase italic tracking-tighter">{u.name}</div>
                             <div className="text-[9px] text-zinc-500 uppercase">{u.email}</div>
                          </td>
                          <td className="p-4">
                             <div className="text-amber-500 font-black">{u.goldCoins.toLocaleString()} GC</div>
                             <div className="text-emerald-500 font-bold">{u.sweepCoins.toLocaleString()} SC</div>
                          </td>
                          <td className="p-4 text-zinc-400 font-mono">{daysAgo === 0 ? 'TODAY' : `${daysAgo}D AGO`}</td>
                          <td className="p-4">
                             <div className="flex gap-1">
                                <span className={`w-3 h-3 rounded-full ${u.kycDocuments.idFront ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} title="ID Front" />
                                <span className={`w-3 h-3 rounded-full ${u.kycDocuments.proofOfAddress ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} title="Address" />
                                <span className={`w-3 h-3 rounded-full ${u.kycDocuments.paymentProof ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} title="Payment" />
                             </div>
                          </td>
                          <td className="p-4">
                             <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>{u.status}</Badge>
                          </td>
                          <td className="p-4 text-right">
                             <Button variant="ghost" className="text-[10px] p-2" onClick={() => setSelectedUser(u)}>MANAGE</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 border-t border-zinc-800 pt-6 flex justify-end">
                <Button variant="primary" className="px-12 py-4" onClick={() => alert("Registry State Persisted to Neon.")}>SAVE & UPDATE REGISTRY</Button>
              </div>
            </Card>

            {selectedUser && (
               <Card className="p-10 border-amber-500/30 bg-amber-500/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">{selectedUser.name} Profiles</h3>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Direct Vault Modification Authorized</p>
                     </div>
                     <button onClick={() => setSelectedUser(null)} className="text-zinc-500 hover:text-white text-2xl">✕</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     <div className="space-y-6">
                        <Input label="Manual GC Adjustment" type="number" onBlur={(e) => {
                           const val = Number(e.target.value);
                           if(val) {
                             adminAdjustBalance(selectedUser.id, CurrencyType.GC, val, 'Admin Tool');
                             e.target.value = '';
                           }
                        }} placeholder="Enter amount..." />
                        <Input label="Manual SC Adjustment" type="number" onBlur={(e) => {
                           const val = Number(e.target.value);
                           if(val) {
                             adminAdjustBalance(selectedUser.id, CurrencyType.SC, val, 'Admin Tool');
                             e.target.value = '';
                           }
                        }} placeholder="Enter amount..." />
                     </div>
                     <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sovereign Status</label>
                           <select 
                             className="bg-zinc-950 border-2 border-zinc-800 p-4 rounded-xl text-xs text-white outline-none focus:border-amber-500/50"
                             value={selectedUser.status}
                             onChange={e => adminUpdateUserStatus(selectedUser.id, e.target.value as any, selectedUser.kycStatus)}
                           >
                              <option value="ACTIVE">ACTIVE CITIZEN</option>
                              <option value="LOCKED">BANISH / LOCK ACCOUNT</option>
                           </select>
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">KYC Verification</label>
                           <select 
                             className="bg-zinc-950 border-2 border-zinc-800 p-4 rounded-xl text-xs text-white outline-none focus:border-amber-500/50"
                             value={selectedUser.kycStatus}
                             onChange={e => adminUpdateUserStatus(selectedUser.id, selectedUser.status, e.target.value as any)}
                           >
                              <option value={KYCStatus.UNVERIFIED}>UNVERIFIED</option>
                              <option value={KYCStatus.PENDING}>PENDING REVIEW</option>
                              <option value={KYCStatus.VERIFIED}>VERIFIED MONARCH</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="p-6 bg-zinc-950 rounded-[32px] border-2 border-zinc-800">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic">Identity Docs</p>
                           {selectedUser.kycDocuments.idFront ? (
                             <div className="grid grid-cols-2 gap-2">
                                <img src={selectedUser.kycDocuments.idFront} className="w-full h-24 object-cover rounded-xl border border-zinc-800" alt="ID" />
                                <img src={selectedUser.kycDocuments.proofOfAddress} className="w-full h-24 object-cover rounded-xl border border-zinc-800" alt="POA" />
                             </div>
                           ) : <p className="text-[10px] text-zinc-700 italic uppercase py-8 text-center">Vault is currently empty.</p>}
                        </div>
                     </div>
                  </div>
                  <div className="mt-10 border-t border-zinc-800 pt-8 flex justify-end gap-4">
                     <Button variant="secondary" className="px-8" onClick={() => adminSendEmail(selectedUser.id, 'Identity Required', 'Upload docs to vault.', 'KYC_REMINDER')}>DISPATCH REMINDER</Button>
                     <Button variant="primary" className="px-12 py-4" onClick={() => { setSelectedUser(null); alert("Citizen Profile Saved."); }}>SAVE & CLOSE PROFILE</Button>
                  </div>
               </Card>
            )}
          </div>
        )}

        {(activeTab === 'bonuses' || activeTab === 'jackpot' || activeTab === 'social' || activeTab === 'settings') && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-10 space-y-8">
                 <h3 className="text-xl font-black uppercase italic border-b border-zinc-800 pb-4">
                   {activeTab === 'bonuses' ? 'Bonus Configuration' : activeTab === 'jackpot' ? 'Jackpot Algorithms' : activeTab === 'social' ? 'Community Settings' : 'Banking Gateways'}
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTab === 'bonuses' && (
                       <>
                          <Input label="New User GC" type="number" value={draftSettings.newUserBonusGC} onChange={e => setDraftSettings({...draftSettings, newUserBonusGC: Number(e.target.value)})} />
                          <Input label="New User SC" type="number" value={draftSettings.newUserBonusSC} onChange={e => setDraftSettings({...draftSettings, newUserBonusSC: Number(e.target.value)})} />
                          <Input label="Daily GC" type="number" value={draftSettings.dailyRewardGC} onChange={e => setDraftSettings({...draftSettings, dailyRewardGC: Number(e.target.value)})} />
                          <Input label="Daily SC" type="number" value={draftSettings.dailyRewardSC} onChange={e => setDraftSettings({...draftSettings, dailyRewardSC: Number(e.target.value)})} />
                          <Input label="Social GC" type="number" value={draftSettings.socialBonusGC} onChange={e => setDraftSettings({...draftSettings, socialBonusGC: Number(e.target.value)})} />
                          <Input label="Social SC" type="number" value={draftSettings.socialBonusSC} onChange={e => setDraftSettings({...draftSettings, socialBonusSC: Number(e.target.value)})} />
                       </>
                    )}
                    {activeTab === 'jackpot' && (
                       <>
                          <Input label="Contribution %" type="number" step="0.001" value={draftSettings.jackpotContributionRate} onChange={e => setDraftSettings({...draftSettings, jackpotContributionRate: Number(e.target.value)})} />
                          <Input label="GC Seed" type="number" value={draftSettings.jackpotSeedGC} onChange={e => setDraftSettings({...draftSettings, jackpotSeedGC: Number(e.target.value)})} />
                          <Input label="SC Seed" type="number" value={draftSettings.jackpotSeedSC} onChange={e => setDraftSettings({...draftSettings, jackpotSeedSC: Number(e.target.value)})} />
                       </>
                    )}
                    {activeTab === 'social' && (
                       <>
                          <Input label="Max Ticker Items" type="number" value={draftSettings.tickerMaxItems} onChange={e => setDraftSettings({...draftSettings, tickerMaxItems: Number(e.target.value)})} />
                          <Input label="Scroll Speed (Sec)" type="number" value={draftSettings.tickerScrollSpeed} onChange={e => setDraftSettings({...draftSettings, tickerScrollSpeed: Number(e.target.value)})} />
                       </>
                    )}
                    {activeTab === 'settings' && (
                       <>
                          <Input label="Square App ID" value={draftSettings.squareApplicationId} onChange={e => setDraftSettings({...draftSettings, squareApplicationId: e.target.value})} />
                          <Input label="Square Loc ID" value={draftSettings.squareLocationId} onChange={e => setDraftSettings({...draftSettings, squareLocationId: e.target.value})} />
                          <Input label="GPay Merchant ID" value={draftSettings.gpayMerchantId} onChange={e => setDraftSettings({...draftSettings, gpayMerchantId: e.target.value})} />
                          <Input label="Min Redemption" type="number" value={draftSettings.minRedemption} onChange={e => setDraftSettings({...draftSettings, minRedemption: Number(e.target.value)})} />
                       </>
                    )}
                 </div>
                 <div className="pt-8 border-t border-zinc-800 flex justify-end">
                    <Button variant="primary" className="px-12 py-4" onClick={syncSettings}>SAVE & UPDATE DATABASE</Button>
                 </div>
              </Card>

              <Card className="p-10 bg-zinc-950/40 border-zinc-800 flex flex-col justify-center text-center">
                 <div className="text-6xl mb-6">🏛️</div>
                 <h4 className="text-xl font-black uppercase italic mb-2">Neon Database Audit</h4>
                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">All changes are signed with your private monarch key and persisted to the royal cloud archives instantly.</p>
              </Card>
           </div>
        )}

        {activeTab === 'maintenance' && (
           <div className="space-y-8">
              <Card className="h-[600px] flex flex-col border-amber-500/20 bg-amber-500/5">
                <div className="p-6 bg-amber-500 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-4 text-zinc-950">
                      <span className="text-2xl">✨</span>
                      <span className="font-black text-xs uppercase tracking-widest">Maintenance Oracle Chat</span>
                  </div>
                  <Badge variant="success">Admin Exclusive</Badge>
                </div>
                <div className="flex-1 overflow-auto p-8 space-y-6">
                  {maintLogs.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-6 rounded-[32px] text-sm leading-relaxed ${m.role === 'admin' ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-950 border border-amber-500/20 text-amber-100 italic shadow-xl'}`}>
                            {m.text}
                        </div>
                      </div>
                  ))}
                  {isOracleThinking && <div className="text-[10px] font-black text-amber-500 uppercase animate-pulse">Oracle is drafting protocols...</div>}
                </div>
                <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex gap-4 shrink-0">
                  <input className="flex-1 bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 text-xs focus:border-amber-500 outline-none transition-all" placeholder="Describe requested site adjustments..." value={maintPrompt} onChange={e => setMaintPrompt(e.target.value)} onKeyPress={k => k.key === 'Enter' && handleMaintenanceOracle()} />
                  <Button className="px-10" onClick={handleMaintenanceOracle}>DISPATCH</Button>
                </div>
              </Card>
              <div className="flex justify-end">
                <Button variant="primary" className="px-12 py-4" onClick={() => alert("Oracle Decrees Persisted.")}>PERSIST ALL ORACLE DECREES</Button>
              </div>
           </div>
        )}

        {activeTab === 'editor' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-10 bg-amber-500/5 border-amber-500/20">
                 <h3 className="text-2xl font-black uppercase italic mb-8">AI Studio</h3>
                 <textarea className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 text-xs h-48 mb-8 outline-none focus:border-amber-500 transition-all" placeholder="A royal slot with diamond crowns and golden multipliers..." value={editorPrompt} onChange={e => setEditorPrompt(e.target.value)} />
                 <Button variant="ai" className="w-full py-5 text-lg" onClick={handleAiGameEditor} disabled={isEditorWorking}>MANIFEST NEW ORIGINAL</Button>
              </Card>
              <Card className="p-10 overflow-auto max-h-[500px]">
                 <h3 className="text-xl font-black uppercase italic mb-8">Game Assets</h3>
                 <div className="space-y-4">
                    {games.map(g => (
                       <div key={g.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                             <img src={g.image} className="w-10 h-10 object-cover rounded-lg border border-zinc-800" alt={g.name} />
                             <span className="text-xs font-black uppercase text-white group-hover:text-amber-500 transition-colors">{g.name}</span>
                          </div>
                          <div className="flex gap-2">
                             <Button variant="ghost" className="text-[9px] p-2" onClick={() => { setEditingGameId(g.id); setEditorPrompt(`Update ${g.name}...`); }}>EDIT</Button>
                             <button onClick={() => adminDeleteGame(g.id)} className="text-red-500 font-black text-[10px] uppercase p-2 hover:bg-red-500/10 rounded-lg">DELETE</button>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                    <Button variant="primary" className="px-10 py-4" onClick={() => alert("Asset Library Synchronized.")}>SAVE & UPDATE ASSETS</Button>
                 </div>
              </Card>
           </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ label, val, icon, color = "text-white" }: any) => (
  <Card className="p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 cursor-default group">
    <div className="text-3xl mb-4 p-4 bg-zinc-950 rounded-3xl border border-zinc-800 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">{icon}</div>
    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">{label}</div>
    <div className={`text-4xl font-black italic tracking-tighter ${color}`}>{val}</div>
  </Card>
);

export default AdminDashboard;
