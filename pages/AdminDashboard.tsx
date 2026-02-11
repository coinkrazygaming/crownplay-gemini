
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Layout, Card, Badge, Button, Input, TransactionAuditor, CrownLogo } from '../components';
import { UserRole, CurrencyType, AuditAction, Game, SecurityAlert, TransactionType, User, EmailLog, KYCStatus, IngestionLog, AppSettings } from '../types';
import { generateGeminiResponse, generateStudioGameSpec } from '../aiService';
import { IngestionEngine } from '../ingestionService';

const AdminDashboard: React.FC = () => {
  const { 
    currentUser, users, transactions, games, securityAlerts, auditLogs, emailLogs, ingestionLogs, settings, dbStatus,
    adminAdjustBalance, adminAddGame, adminUpdateGame, adminDeleteGame, adminResolveAlert, adminUpdateSettings, adminSendEmail, adminUpdateUserStatus, adminAddIngestionLog, adminUpsertGames, syncToNeon
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'insight' | 'players' | 'forge' | 'pipeline' | 'retention' | 'bonuses' | 'jackpot' | 'settings'>('insight');
  
  // Sorting for players
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Local state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [playerSearch, setPlayerSearch] = useState('');
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [manualIngestUrl, setManualIngestUrl] = useState('');
  const [isManualIngesting, setIsManualIngesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Forge state
  const [forgePrompt, setForgePrompt] = useState('');
  const [isForging, setIsForging] = useState(false);
  const [forgedGame, setForgedGame] = useState<any>(null);

  // Email state
  const [emailTarget, setEmailTarget] = useState<string>('ALL');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Settings Draft State
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    adminUpdateSettings(draftSettings);
    await syncToNeon();
    setIsSyncing(false);
    alert("Sovereign Database Synchronized.");
  };

  const handleForge = async () => {
    if (!forgePrompt.trim()) return;
    setIsForging(true);
    try {
      const spec = await generateStudioGameSpec('CROWNPLAY_AI_ENGINE', forgePrompt);
      setForgedGame(spec);
    } catch (e) {
      alert("AI Forge error: " + e);
    } finally {
      setIsForging(false);
    }
  };

  const handleDeployForged = () => {
    if (!forgedGame) return;
    const newGame: Game = {
      id: 'ai-' + Math.random().toString(36).substr(2, 5),
      ...forgedGame,
      categoryId: 'cat-featured',
      provider: 'CrownPlay AI Forge',
      image: `https://picsum.photos/seed/${forgedGame.name}/400/500`,
      lastIngestedAt: new Date().toISOString()
    };
    adminAddGame(newGame);
    setForgedGame(null);
    setForgePrompt('');
    alert("AI Game Deployed to Registry.");
  };

  const startPipelineSync = async () => {
    setIsPipelineRunning(true);
    await IngestionEngine.runNightlySync(
      games,
      (newGames) => adminUpsertGames(newGames),
      (log) => adminAddIngestionLog(log)
    );
    setIsPipelineRunning(false);
    alert("Pipeline Sync Complete.");
  };

  const handleManualIngest = async () => {
    if (!manualIngestUrl.trim()) return;
    setIsManualIngesting(true);
    try {
      const game = await IngestionEngine.triggerManualIngest(manualIngestUrl);
      adminAddGame(game);
      setManualIngestUrl('');
      alert("External Game Ingested Successfully.");
    } catch (e) {
      alert("Ingestion error: " + e);
    } finally {
      setIsManualIngesting(false);
    }
  };

  const setCampaignTemplate = (type: 'WELCOME' | 'BONUS' | 'RE-ENGAGE') => {
    const templates = {
      WELCOME: {
        subject: "Welcome to the Kingdom, Monarch!",
        body: "Your royal journey begins today. We've added a special starter bounty to your vault. Explore the Reel Treasury now!"
      },
      BONUS: {
        subject: "A Tribute from the Royal Treasury awaits...",
        body: "Your Majesty's presence is requested in the lobby. A special 10 SC bonus has been prepared for your next play session."
      },
      'RE-ENGAGE': {
        subject: "Your Throne Sits Empty...",
        body: "The kingdom misses its ruler. Return today to claim a special 'Comeback Bonus' and spin the reels of destiny."
      }
    };
    setEmailSubject(templates[type].subject);
    setEmailBody(templates[type].body);
  };

  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) return alert("Enter subject and body.");
    adminSendEmail(emailTarget, emailSubject, emailBody, 'PROMO');
    setEmailSubject('');
    setEmailBody('');
    alert("Communication dispatched to citizens.");
  };

  const displayedUsers = useMemo(() => {
    let filtered = users.filter(u => 
      u.name.toLowerCase().includes(playerSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(playerSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(playerSearch.toLowerCase())
    );

    return filtered.sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, playerSearch, sortField, sortOrder]);

  const toggleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (currentUser?.role !== UserRole.ADMIN) return <Layout hideSidebar><div className="py-20 text-center font-black uppercase tracking-widest text-red-500">ACCESS RESTRICTED: MONARCHS ONLY</div></Layout>;

  return (
    <Layout>
      <div className="space-y-12 pb-24 max-w-7xl mx-auto">
        {/* Status Header */}
        <header className="flex flex-col lg:flex-row justify-between items-center bg-zinc-900/40 p-10 rounded-[48px] border-2 border-zinc-800 gap-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute -inset-20 bg-amber-500/5 blur-[100px] pointer-events-none" />
           <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-amber-500 rounded-[28px] flex items-center justify-center text-zinc-950 text-4xl font-black shadow-[0_20px_50px_rgba(245,158,11,0.4)]">👑</div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Monarch Nexus</h1>
                <div className="flex items-center gap-3 mt-2">
                   <Badge variant="success">System Online</Badge>
                   <span className="text-zinc-600 font-bold uppercase tracking-[0.4em] text-[10px]">Security Clear: Level 9</span>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="hidden lg:flex flex-col items-end mr-6">
                 <span className={`text-[11px] font-black uppercase tracking-widest ${dbStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                   Neon Database: {dbStatus.toUpperCase()}
                 </span>
                 <span className="text-[10px] text-zinc-600 font-bold italic">Last Backup: 5m ago</span>
              </div>
              <Button variant="primary" className="px-10 py-5" onClick={handleGlobalSync} disabled={isSyncing}>
                 {isSyncing ? 'SYNCING...' : 'GLOBAL SAVE & UPDATE'}
              </Button>
           </div>
        </header>

        <nav className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {[
            { id: 'insight', label: 'Overview', icon: '📊' },
            { id: 'players', label: 'Citizens', icon: '👥' },
            { id: 'forge', label: 'AI Forge', icon: '✨' },
            { id: 'pipeline', label: 'Pipeline', icon: '🏗️' },
            { id: 'retention', label: 'Retention', icon: '🔁' },
            { id: 'bonuses', label: 'Rewards', icon: '🎁' },
            { id: 'jackpot', label: 'Jackpots', icon: '💰' },
            { id: 'settings', label: 'Core', icon: '⚙️' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all border-2 flex items-center gap-4 whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-2xl scale-105' : 'bg-zinc-900/60 text-zinc-500 border-zinc-800/50 hover:border-zinc-700 hover:text-white'}`}>
              <span className="text-2xl">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {activeTab === 'insight' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               <StatCard label="Total Citizens" val={users.length} icon="👤" />
               <StatCard label="Live Library" val={games.length} icon="🎰" color="text-amber-500" />
               <StatCard label="Unresolved Flags" val={securityAlerts.filter(a => !a.resolved).length} icon="⚠️" color="text-red-500" />
               <StatCard label="Treasury Flow" val={`$${users.reduce((acc, u) => acc + u.totalDeposited, 0).toLocaleString()}`} icon="💳" color="text-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 p-10">
                  <h3 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-4">
                     <span className="text-3xl">📝</span> Sovereign Audit Logs
                  </h3>
                  <div className="space-y-6">
                     {auditLogs.slice(0, 8).map(log => (
                       <div key={log.id} className="p-6 bg-zinc-950/80 rounded-[32px] border border-zinc-900 flex justify-between items-center group hover:border-amber-500/20 transition-all">
                          <div className="flex items-center gap-6">
                             <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-amber-500 border border-zinc-800 italic">CP</div>
                             <div>
                                <div className="flex items-center gap-3">
                                   <span className="font-black text-white text-xs uppercase italic">{log.action}</span>
                                   <Badge variant="info" className="text-[8px]">{log.targetUserName}</Badge>
                                </div>
                                <p className="text-[10px] text-zinc-600 font-bold mt-1 italic">"{log.metadata}"</p>
                             </div>
                          </div>
                          <span className="text-[9px] text-zinc-700 font-mono font-bold">{new Date(log.createdAt).toLocaleTimeString()}</span>
                       </div>
                     ))}
                  </div>
               </Card>
               
               <Card className="p-10 bg-zinc-900/20">
                  <h3 className="text-2xl font-black uppercase italic mb-8">System Health</h3>
                  <div className="space-y-6">
                     <HealthBar label="Memory Utilization" val={42} />
                     <HealthBar label="API Throughput" val={88} />
                     <HealthBar label="DB Sync State" val={100} color="bg-emerald-500" />
                     <HealthBar label="AI Oracle Latency" val={12} color="bg-amber-500" />
                  </div>
               </Card>
            </div>
          </div>
        )}

        {activeTab === 'forge' && (
          <div className="space-y-10">
            <Card className="p-14 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-20 text-[20rem] opacity-5 select-none pointer-events-none grayscale italic font-black">AI</div>
               <div className="relative z-10 max-w-3xl">
                  <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter mb-4 flex items-center gap-6">
                     AI Game Forge <span className="text-2xl italic font-light opacity-40">Gemini 3 Pro</span>
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-10 border-l-4 border-amber-500 pl-8 italic">
                     Describe your royal vision. The Forge will engineer the math models, paytables, and asset manifests instantly.
                  </p>
                  
                  <textarea 
                    className="w-full bg-zinc-950 border-4 border-zinc-800 p-8 rounded-[40px] text-xl font-medium outline-none focus:border-amber-500 transition-all text-white placeholder:text-zinc-800 min-h-[150px] mb-8"
                    placeholder="E.g., High volatility slot themed around Nordic mythology with expanding wild scepters and a 5000x jackpot..."
                    value={forgePrompt}
                    onChange={e => setForgePrompt(e.target.value)}
                  />
                  
                  <Button variant="ai" className="px-20 py-8 text-2xl" onClick={handleForge} disabled={isForging || !forgePrompt.trim()}>
                    {isForging ? 'ENGAGING MATH ENGINE...' : 'COMMENCE FORGING'}
                  </Button>
               </div>
            </Card>

            {forgedGame && (
              <Card className="p-14 animate-in slide-in-from-top-12 duration-700">
                 <div className="flex justify-between items-start mb-12">
                    <div>
                       <Badge variant="success" className="mb-4">DRAFT SPEC READY</Badge>
                       <h4 className="text-5xl font-black uppercase italic tracking-tighter text-white">{forgedGame.name}</h4>
                       <p className="text-zinc-500 mt-2 italic">{forgedGame.description}</p>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="ghost" onClick={() => setForgedGame(null)}>SCRAP</Button>
                       <Button variant="primary" className="px-12 py-5" onClick={handleDeployForged}>DEPLOY TO KINGDOM</Button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-zinc-950 rounded-[32px] border border-zinc-900">
                       <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Math Parameters</h5>
                       <div className="space-y-4">
                          <DataPoint label="RTP" val={`${(forgedGame.rtp * 100).toFixed(2)}%`} />
                          <DataPoint label="Volatility" val={forgedGame.volatility} />
                          <DataPoint label="Max Multiplier" val={`${forgedGame.mathModel?.maxWinMultiplier}x`} />
                       </div>
                    </div>
                    <div className="p-8 bg-zinc-950 rounded-[32px] border border-zinc-900">
                       <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Feature Set</h5>
                       <div className="flex flex-wrap gap-2">
                          {forgedGame.featureSet?.map((f: string) => <Badge key={f} variant="info" className="text-[9px]">{f}</Badge>)}
                       </div>
                    </div>
                    <div className="p-8 bg-zinc-950 rounded-[32px] border border-zinc-900">
                       <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Visual Identity</h5>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl shadow-inner border border-white/10" style={{ backgroundColor: forgedGame.themeColor }} />
                          <span className="text-sm font-mono text-white">{forgedGame.themeColor}</span>
                       </div>
                    </div>
                 </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-10 border-indigo-500/20 bg-indigo-500/5">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Automatic Ingestion</h3>
                  <Badge variant="info">BGaming / Pragmatic</Badge>
                </div>
                <p className="text-zinc-400 text-sm mb-10 leading-relaxed">
                  Trigger the nightly synchronization cycle to fetch the latest assets and math models from integrated provider catalogs.
                </p>
                <Button 
                  variant="primary" 
                  className="w-full py-6 text-xl bg-indigo-600 hover:bg-indigo-500 border-indigo-900 shadow-indigo-500/20"
                  onClick={startPipelineSync}
                  disabled={isPipelineRunning}
                >
                  {isPipelineRunning ? 'PIPELINE ACTIVE...' : 'TRIGGER FULL PROVIDER SYNC'}
                </Button>
              </Card>

              <Card className="p-10 border-amber-500/20 bg-amber-500/5">
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter mb-8">Manual Asset Ingest</h3>
                <p className="text-zinc-400 text-sm mb-10 leading-relaxed">
                  Provide an external provider URL to perform a targeted sovereign ingestion and math extraction.
                </p>
                <div className="space-y-6">
                  <Input 
                    placeholder="https://provider-api.com/v1/game/123" 
                    value={manualIngestUrl} 
                    onChange={e => setManualIngestUrl(e.target.value)} 
                  />
                  <Button 
                    variant="secondary" 
                    className="w-full py-6 text-xl" 
                    onClick={handleManualIngest}
                    disabled={isManualIngesting || !manualIngestUrl.trim()}
                  >
                    {isManualIngesting ? 'EXTRACTING...' : 'DISPATCH INGESTION REQUEST'}
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-10">
              <h3 className="text-2xl font-black uppercase italic mb-8">Ingestion Activity Hub</h3>
              <div className="space-y-4">
                {ingestionLogs.length === 0 ? (
                  <div className="text-center py-10 text-zinc-600 uppercase tracking-widest font-black text-xs italic">No sync activity recorded.</div>
                ) : (
                  ingestionLogs.map(log => (
                    <div key={log.id} className="p-6 bg-zinc-950 rounded-[32px] border border-zinc-900 flex flex-col md:flex-row justify-between md:items-center gap-4">
                       <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {log.status === 'SUCCESS' ? '✓' : '!'}
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <span className="font-black text-white text-sm uppercase italic">{log.provider} Sync</span>
                                <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'}>{log.status}</Badge>
                             </div>
                             <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                       </div>
                       <div className="flex gap-10">
                          <div className="text-center">
                             <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">Processed</div>
                             <div className="text-xl font-black text-white italic">{log.gamesProcessed}</div>
                          </div>
                          <div className="text-center">
                             <div className="text-[9px] font-black text-emerald-600 uppercase mb-1">New</div>
                             <div className="text-xl font-black text-emerald-500 italic">+{log.newGames.length}</div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'retention' && (
          <div className="space-y-10">
            <Card className="p-14">
               <div className="flex justify-between items-center mb-12">
                  <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter">Citizen Dispatch Hub</h3>
                  <Badge variant="info">Global Communications Online</Badge>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1 space-y-6">
                     <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-6">Campaign Presets</h4>
                     <button onClick={() => setCampaignTemplate('WELCOME')} className="w-full p-6 bg-zinc-950 rounded-3xl border border-zinc-900 text-left hover:border-amber-500/50 transition-all group">
                        <div className="text-lg font-black text-white italic group-hover:text-amber-500">Welcome Bounty</div>
                        <p className="text-[10px] text-zinc-600 uppercase mt-1">For newly enlisted citizens</p>
                     </button>
                     <button onClick={() => setCampaignTemplate('BONUS')} className="w-full p-6 bg-zinc-950 rounded-3xl border border-zinc-900 text-left hover:border-amber-500/50 transition-all group">
                        <div className="text-lg font-black text-white italic group-hover:text-amber-500">Treasury Tribute</div>
                        <p className="text-[10px] text-zinc-600 uppercase mt-1">High-value SC bonus offer</p>
                     </button>
                     <button onClick={() => setCampaignTemplate('RE-ENGAGE')} className="w-full p-6 bg-zinc-950 rounded-3xl border border-zinc-900 text-left hover:border-amber-500/50 transition-all group">
                        <div className="text-lg font-black text-white italic group-hover:text-amber-500">Royal Recall</div>
                        <p className="text-[10px] text-zinc-600 uppercase mt-1">Target inactive monarchs</p>
                     </button>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest ml-4">Target Audience</label>
                           <select 
                              className="w-full bg-zinc-950 border-2 border-zinc-800 p-6 rounded-[28px] text-sm font-bold text-white outline-none focus:border-amber-500 transition-all"
                              value={emailTarget}
                              onChange={(e) => setEmailTarget(e.target.value)}
                           >
                              <option value="ALL">ALL CITIZENS ({users.length})</option>
                              {users.slice(0, 5).map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                           </select>
                        </div>
                        <Input label="Subject Dispatch" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="E.g., Your Royal Bonus Awaits..." />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest ml-4">Royal Decree Body</label>
                        <textarea 
                           className="w-full bg-zinc-950 border-2 border-zinc-800 p-8 rounded-[40px] text-sm outline-none min-h-[250px] focus:border-amber-500 transition-all text-white font-medium"
                           placeholder="Enter the royal decree message..."
                           value={emailBody}
                           onChange={e => setEmailBody(e.target.value)}
                        />
                     </div>
                     <Button variant="primary" className="w-full py-8 text-2xl shadow-amber-500/20" onClick={handleSendEmail}>DISPATCH TO KINGDOM</Button>
                  </div>
               </div>
            </Card>

            <Card className="p-10">
               <h3 className="text-2xl font-black uppercase italic mb-8">Communication Archives</h3>
               <div className="space-y-4">
                  {emailLogs.slice(0, 8).map(log => (
                    <div key={log.id} className="p-6 bg-zinc-950 rounded-[32px] border border-zinc-900 group hover:border-zinc-700 transition-all">
                       <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">{log.type} DISPATCH</span>
                            <Badge variant="info" className="text-[8px]">ID: {log.userId.slice(0,5)}</Badge>
                          </div>
                          <span className="text-[10px] text-zinc-600 font-mono">{new Date(log.sentAt).toLocaleString()}</span>
                       </div>
                       <div className="text-lg font-black text-white italic mb-2 uppercase">{log.subject}</div>
                       <p className="text-xs text-zinc-500 italic border-l-2 border-zinc-800 pl-4 py-1">"{log.body.slice(0, 150)}..."</p>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'bonuses' && (
          <div className="space-y-10">
            <Card className="p-14">
               <h3 className="text-4xl font-black uppercase italic mb-12 text-white tracking-tighter flex items-center gap-6">
                  <span className="text-3xl">💎</span> Reward Engine Configuration
               </h3>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
                  <div className="space-y-10">
                     <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] ml-4">ENLISTMENT & SOCIAL</h4>
                     <div className="grid grid-cols-2 gap-8">
                        <ConfigInput label="Signup GC" value={draftSettings.newUserBonusGC} onChange={v => setDraftSettings({...draftSettings, newUserBonusGC: Number(v)})} />
                        <ConfigInput label="Signup SC" value={draftSettings.newUserBonusSC} onChange={v => setDraftSettings({...draftSettings, newUserBonusSC: Number(v)})} />
                        <ConfigInput label="Social Link GC" value={draftSettings.socialBonusGC} onChange={v => setDraftSettings({...draftSettings, socialBonusGC: Number(v)})} />
                        <ConfigInput label="Social Link SC" value={draftSettings.socialBonusSC} onChange={v => setDraftSettings({...draftSettings, socialBonusSC: Number(v)})} />
                        <ConfigInput label="Promo Task GC" value={draftSettings.socialTaskBonusGC} onChange={v => setDraftSettings({...draftSettings, socialTaskBonusGC: Number(v)})} />
                        <ConfigInput label="Promo Task SC" value={draftSettings.socialTaskBonusSC} onChange={v => setDraftSettings({...draftSettings, socialTaskBonusSC: Number(v)})} />
                     </div>
                  </div>

                  <div className="space-y-10">
                     <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-4">LOYALTY & ACTIVITY</h4>
                     <div className="grid grid-cols-2 gap-8">
                        <ConfigInput label="Daily Base GC" value={draftSettings.dailyRewardGC} onChange={v => setDraftSettings({...draftSettings, dailyRewardGC: Number(v)})} />
                        <ConfigInput label="Daily Base SC" value={draftSettings.dailyRewardSC} onChange={v => setDraftSettings({...draftSettings, dailyRewardSC: Number(v)})} />
                        <ConfigInput label="Elite Prize SC" value={draftSettings.leaderboardWeeklyPrizeSC} onChange={v => setDraftSettings({...draftSettings, leaderboardWeeklyPrizeSC: Number(v)})} />
                        <ConfigInput label="XP Multiplier" value={draftSettings.gamePlayBonusRate} onChange={v => setDraftSettings({...draftSettings, gamePlayBonusRate: Number(v)})} />
                     </div>
                  </div>
               </div>
               
               <div className="mt-14 pt-14 border-t border-zinc-900 text-center">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] italic">
                     *Note: Daily rewards scale with citizen login streaks. Multiplier is applied to the base value configured above.
                  </p>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-10">
            <Card className="p-10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Citizen Registry</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <input className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-sm w-full sm:w-80 outline-none focus:border-amber-500 transition-all" placeholder="Search by name, ID or email..." value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto rounded-[32px] border border-zinc-900">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-900/50 text-zinc-600 font-black uppercase tracking-widest text-[10px] cursor-pointer">
                      <th className="p-6" onClick={() => toggleSort('name')}>Identity</th>
                      <th className="p-6" onClick={() => toggleSort('goldCoins')}>Balances</th>
                      <th className="p-6">KYC Status</th>
                      <th className="p-6">Account Status</th>
                      <th className="p-6 text-right">Auditor Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-950">
                    {displayedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="p-6">
                             <div className="font-black text-white uppercase italic group-hover:text-amber-500 transition-colors">{u.name}</div>
                             <div className="text-[9px] text-zinc-600 uppercase mt-1">ID: {u.id} • {u.email}</div>
                          </td>
                          <td className="p-6">
                             <div className="text-amber-500 font-black">{u.goldCoins.toLocaleString()} GC</div>
                             <div className="text-emerald-500 font-bold">{u.sweepCoins.toLocaleString()} SC</div>
                          </td>
                          <td className="p-6">
                             <Badge variant={u.kycStatus === KYCStatus.VERIFIED ? 'success' : 'warning'}>{u.kycStatus}</Badge>
                          </td>
                          <td className="p-6">
                             <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>{u.status}</Badge>
                          </td>
                          <td className="p-6 text-right">
                             <Button variant="ghost" className="text-[9px] py-2 px-4" onClick={() => setSelectedUser(u)}>MANAGE</Button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Selected User Management Modal */}
            {selectedUser && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-zinc-950/98 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
                 <Card className="w-full max-w-3xl p-14 border-amber-500/40 shadow-[0_50px_200px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 grayscale select-none pointer-events-none text-9xl">👤</div>
                    <div className="flex justify-between items-start mb-12">
                       <div>
                          <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter">Monarch Audit</h3>
                          <p className="text-zinc-500 font-black uppercase tracking-widest text-[11px] mt-1">{selectedUser.name} • CITIZEN {selectedUser.id}</p>
                       </div>
                       <button onClick={() => setSelectedUser(null)} className="text-zinc-600 hover:text-white text-3xl transition-transform active:scale-90">✕</button>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-12">
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Adjust GC Portfolio</label>
                          <div className="flex gap-4">
                             <Button className="flex-1 text-[10px]" variant="secondary" onClick={() => adminAdjustBalance(selectedUser.id, CurrencyType.GC, 50000, "Loyalty Grant")}>+50k GC</Button>
                             <Button className="flex-1 text-[10px]" variant="outline" onClick={() => adminAdjustBalance(selectedUser.id, CurrencyType.GC, -50000, "Correction")}>-50k GC</Button>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Adjust SC Portfolio</label>
                          <div className="flex gap-4">
                             <Button className="flex-1 text-[10px]" variant="secondary" onClick={() => adminAdjustBalance(selectedUser.id, CurrencyType.SC, 25, "Compensation")}>+25 SC</Button>
                             <Button className="flex-1 text-[10px]" variant="outline" onClick={() => adminAdjustBalance(selectedUser.id, CurrencyType.SC, -25, "Correction")}>-25 SC</Button>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-12 pt-12 border-t border-zinc-900">
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Citizen Status</label>
                          <select 
                             className="w-full bg-zinc-950 border-2 border-zinc-800 p-5 rounded-2xl text-xs outline-none focus:border-amber-500 transition-all font-bold text-white"
                             value={selectedUser.status}
                             onChange={(e) => adminUpdateUserStatus(selectedUser.id, e.target.value as any, selectedUser.kycStatus)}
                          >
                             <option value="ACTIVE">ACTIVE</option>
                             <option value="LOCKED">LOCKED / BANNED</option>
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Identity Status</label>
                          <select 
                             className="w-full bg-zinc-950 border-2 border-zinc-800 p-5 rounded-2xl text-xs outline-none focus:border-amber-500 transition-all font-bold text-white"
                             value={selectedUser.kycStatus}
                             onChange={(e) => adminUpdateUserStatus(selectedUser.id, selectedUser.status, e.target.value as any)}
                          >
                             <option value={KYCStatus.UNVERIFIED}>UNVERIFIED</option>
                             <option value={KYCStatus.PENDING}>PENDING REVIEW</option>
                             <option value={KYCStatus.VERIFIED}>VERIFIED CITIZEN</option>
                          </select>
                       </div>
                    </div>

                    <Button variant="primary" className="w-full py-6 text-xl" onClick={() => { setSelectedUser(null); syncToNeon(); }}>COMMIT CHANGES</Button>
                 </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jackpot' && (
          <div className="space-y-10">
            <Card className="p-14 border-amber-500/30 bg-amber-500/5">
               <div className="flex items-center gap-8 mb-14">
                  <div className="text-7xl">💰</div>
                  <div>
                    <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-none">Jackpot Hub</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[11px] mt-2">Treasury Progressive Pool Management</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mb-14">
                  <div className="p-10 bg-zinc-950 rounded-[40px] border border-zinc-900 shadow-inner">
                     <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-10 text-center">GC PROGESSIVE POOL</h4>
                     <div className="space-y-8">
                        <ConfigInput label="Current GC Jackpot" value={draftSettings.jackpotGC} onChange={v => setDraftSettings({...draftSettings, jackpotGC: Number(v)})} />
                        <ConfigInput label="GC Seed (Reset Value)" value={draftSettings.jackpotSeedGC} onChange={v => setDraftSettings({...draftSettings, jackpotSeedGC: Number(v)})} />
                     </div>
                  </div>
                  <div className="p-10 bg-zinc-950 rounded-[40px] border border-zinc-900 shadow-inner">
                     <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-10 text-center">SC PROGRESSIVE POOL</h4>
                     <div className="space-y-8">
                        <ConfigInput label="Current SC Jackpot" value={draftSettings.jackpotSC} onChange={v => setDraftSettings({...draftSettings, jackpotSC: Number(v)})} />
                        <ConfigInput label="SC Seed (Reset Value)" value={draftSettings.jackpotSeedSC} onChange={v => setDraftSettings({...draftSettings, jackpotSeedSC: Number(v)})} />
                     </div>
                  </div>
               </div>
               <div className="pt-14 border-t border-zinc-900">
                  <ConfigInput label="Global Contribution Rate (e.g. 0.01 = 1% of Wagers)" value={draftSettings.jackpotContributionRate} onChange={v => setDraftSettings({...draftSettings, jackpotContributionRate: Number(v)})} />
                  <p className="mt-6 text-[11px] text-zinc-600 font-bold uppercase tracking-widest italic text-center">Every spin contributes this percentage of the bet to the respective pool.</p>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-10">
            <Card className="p-14">
               <h3 className="text-4xl font-black uppercase italic mb-12 text-white tracking-tighter flex items-center gap-6">
                  <span className="text-3xl">⚙️</span> Core App Controller
               </h3>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
                  <div className="space-y-10">
                     <ToggleOption label="Maintenance Mode (Global Lockdown)" active={draftSettings.maintenanceMode} onToggle={() => setDraftSettings({...draftSettings, maintenanceMode: !draftSettings.maintenanceMode})} />
                     <ToggleOption label="Elite Leaderboard (Public/Private)" active={draftSettings.leaderboardVisible} onToggle={() => setDraftSettings({...draftSettings, leaderboardVisible: !draftSettings.leaderboardVisible})} />
                     <ToggleOption label="Google Pay In-App Purchasing" active={draftSettings.globalGPayEnabled} onToggle={() => setDraftSettings({...draftSettings, globalGPayEnabled: !draftSettings.globalGPayEnabled})} />
                  </div>
                  <div className="space-y-8">
                     <div className="p-8 bg-zinc-950 rounded-[32px] border border-zinc-900">
                        <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-6">Financial Thresholds</h4>
                        <ConfigInput label="Minimum SC Redemption" value={draftSettings.minRedemption} onChange={v => setDraftSettings({...draftSettings, minRedemption: Number(v)})} />
                     </div>
                     <div className="p-8 bg-zinc-950 rounded-[32px] border border-zinc-900">
                        <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-6">Social Ticker Config</h4>
                        <div className="grid grid-cols-2 gap-6">
                           <ConfigInput label="Max History Items" value={draftSettings.tickerMaxItems} onChange={v => setDraftSettings({...draftSettings, tickerMaxItems: Number(v)})} />
                           <ConfigInput label="Scroll Speed (Sec)" value={draftSettings.tickerScrollSpeed} onChange={v => setDraftSettings({...draftSettings, tickerScrollSpeed: Number(v)})} />
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="pt-14 mt-14 border-t border-zinc-900 space-y-10">
                  <h4 className="text-2xl font-black uppercase italic text-white">Merchant Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <Input label="Google Pay Merchant ID" value={draftSettings.gpayMerchantId} onChange={e => setDraftSettings({...draftSettings, gpayMerchantId: e.target.value})} />
                     <Input label="Square API App ID" value={draftSettings.squareApplicationId} onChange={e => setDraftSettings({...draftSettings, squareApplicationId: e.target.value})} />
                     <Input label="Square Location ID" value={draftSettings.squareLocationId} onChange={e => setDraftSettings({...draftSettings, squareLocationId: e.target.value})} />
                  </div>
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
  <Card className="p-10 flex flex-col items-center text-center hover:scale-[1.05] transition-all duration-500 group shadow-lg border-2 border-zinc-800 hover:border-amber-500/20">
    <div className="text-4xl mb-6 p-6 bg-zinc-950 rounded-[32px] border border-zinc-800 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{icon}</div>
    <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 italic">{label}</div>
    <div className={`text-5xl font-black italic tracking-tighter ${color} drop-shadow-lg`}>{val}</div>
  </Card>
);

const HealthBar = ({ label, val, color = "bg-indigo-500" }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <span>{label}</span>
        <span>{val}%</span>
     </div>
     <div className="h-2.5 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
        <div className={`h-full ${color} shadow-[0_0_10px_currentColor] transition-all duration-1000`} style={{ width: `${val}%` }} />
     </div>
  </div>
);

const DataPoint = ({ label, val }: any) => (
  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
     <span className="text-xs font-black text-white italic">{val}</span>
  </div>
);

const ConfigInput = ({ label, value, onChange }: any) => (
  <div className="space-y-3">
     <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest ml-4">{label}</label>
     <input 
        className="w-full bg-zinc-950 border-2 border-zinc-800 p-6 rounded-[28px] text-sm font-black text-amber-500 outline-none focus:border-amber-500 transition-all shadow-inner"
        value={value}
        type="number"
        onChange={(e) => onChange(e.target.value)}
     />
  </div>
);

const ToggleOption = ({ label, active, onToggle }: any) => (
  <button 
    onClick={onToggle}
    className="w-full flex justify-between items-center p-8 bg-zinc-950 rounded-[32px] border-2 border-zinc-900 hover:border-zinc-700 transition-all active:scale-95 group"
  >
     <span className="text-sm font-black uppercase italic tracking-widest group-hover:text-white transition-colors">{label}</span>
     <div className={`w-16 h-10 rounded-full p-1.5 transition-colors border-2 ${active ? 'bg-emerald-500 border-emerald-300' : 'bg-zinc-800 border-zinc-700'}`}>
        <div className={`w-6 h-6 bg-white rounded-full transition-transform shadow-lg ${active ? 'translate-x-6' : 'translate-x-0'}`} />
     </div>
  </button>
);

export default AdminDashboard;
