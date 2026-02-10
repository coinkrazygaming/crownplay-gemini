
import React, { useState, useRef } from 'react';
import { Layout, Card, Button, Input, Badge, BadgeIcon } from '../components';
import { useStore } from '../store';
import { KYCStatus, KYCDocuments } from '../types';
import { auditIdentityVault } from '../aiService';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUser, uploadKycDoc, syncToNeon } = useStore();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    dob: currentUser?.dob || '',
    address: currentUser?.address || ''
  });

  const [aiVerdict, setAiVerdict] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<keyof KYCDocuments | null>(null);

  if (!currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadType) {
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadKycDoc(uploadType, event.target?.result as string);
        alert(`${uploadType.toUpperCase()} dispatched to the Royal Identity Vault.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAudit = async () => {
    setIsAuditing(true);
    const verdict = await auditIdentityVault(currentUser.kycDocuments);
    setAiVerdict(verdict);
    setIsAuditing(false);
  };

  const triggerUpload = (type: keyof KYCDocuments) => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    await syncToNeon();
    alert("Identity Profile Synchronized.");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-10 gap-6">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border-2 border-amber-500/50 flex flex-col items-center justify-center shadow-2xl relative group">
                <span className="text-4xl font-black italic text-amber-500 leading-none group-hover:scale-110 transition-transform">{currentUser.level}</span>
                <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mt-1">LVL</span>
                <div className="absolute -inset-1 bg-amber-500/10 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div>
               <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Identity Vault</h1>
               <div className="flex gap-2 flex-wrap">
                  <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{currentUser.kycStatus} CITIZEN</Badge>
                  {currentUser.badges.map(b => <BadgeIcon key={b} type={b} />)}
               </div>
             </div>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => window.location.hash = '#/wallet'}>LEDGER</Button>
              <Button variant="primary" onClick={handleUpdateProfile}>SYNCHRONIZE ALL</Button>
           </div>
        </header>

        {/* Financial Highlights Row - Detailed Deposit and Withdrawal Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="p-8 bg-amber-500/5 border-amber-500/20 group hover:border-amber-500/40 transition-all">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Total Contributed</p>
                    <h3 className="text-5xl font-black italic tracking-tighter text-white">
                       ${(currentUser.totalDeposited || 0).toLocaleString()}
                    </h3>
                 </div>
                 <div className="text-3xl opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">💰</div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Lifetime Deposits</span>
                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Sovereign Asset</span>
              </div>
           </Card>

           <Card className="p-8 bg-emerald-500/5 border-emerald-500/20 group hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Total Redeemed</p>
                    <h3 className="text-5xl font-black italic tracking-tighter text-white">
                       ${(currentUser.totalWithdrawn || 0).toLocaleString()}
                    </h3>
                 </div>
                 <div className="text-3xl opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">🏛️</div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Lifetime Withdrawals</span>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Treasury Payout</span>
              </div>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {/* KYC Uploads */}
            <Card className="p-10 border-amber-500/20 bg-amber-500/5">
               <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🛡️</span> Sovereign Security Protocol
                  </div>
                  <Button variant="ai" className="text-[10px] py-2 px-4" onClick={handleAiAudit} disabled={isAuditing}>
                    {isAuditing ? 'AUDITING...' : 'AI IDENTITY AUDIT ✨'}
                  </Button>
               </h3>
               
               {aiVerdict && (
                 <div className="mb-8 p-8 bg-zinc-950 border border-amber-500/30 rounded-[32px] animate-in slide-in-from-top duration-500">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2 italic">Oracle Verdict</div>
                    <p className="text-sm italic text-amber-100 leading-relaxed">"{aiVerdict}"</p>
                 </div>
               )}

               <p className="text-sm text-zinc-400 mb-10 leading-relaxed border-l-2 border-amber-500/30 pl-6 max-w-2xl">
                 To maintain a secure kingdom and process redemptions, you must verify your identity. All data is end-to-end encrypted in the Monarch's private archives.
               </p>
               
               <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KycBox 
                    label="Government ID Front" 
                    uploaded={!!currentUser.kycDocuments.idFront} 
                    onClick={() => triggerUpload('idFront')} 
                  />
                  <KycBox 
                    label="Proof of Address" 
                    uploaded={!!currentUser.kycDocuments.proofOfAddress} 
                    onClick={() => triggerUpload('proofOfAddress')} 
                  />
                  <KycBox 
                    label="Payment Card Verification" 
                    uploaded={!!currentUser.kycDocuments.paymentProof} 
                    onClick={() => triggerUpload('paymentProof')} 
                  />
               </div>
            </Card>

            <Card className="p-10">
               <h3 className="text-2xl font-black mb-8 uppercase italic">Identity Profile</h3>
               <form className="space-y-8" onSubmit={handleUpdateProfile}>
                 <Input label="Full Legal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                   <Input label="Residential Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
                 <div className="pt-8 border-t border-zinc-800 flex justify-end">
                   <Button variant="primary" className="px-12 py-5 text-sm font-black italic">SYNCHRONIZE DATA</Button>
                 </div>
               </form>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-zinc-900/30 backdrop-blur-xl">
               <h3 className="text-lg font-black mb-6 uppercase italic tracking-tighter">Citizen Intelligence</h3>
               <div className="space-y-4">
                  <StatRow label="Citizen ID" val={`CP-${currentUser.id.toUpperCase()}`} isMono />
                  <StatRow label="Ambassador Code" val={currentUser.referralCode} isAmber />
                  <StatRow label="Kingdom XP" val={currentUser.xp.toLocaleString()} />
                  <StatRow label="Current Status" val={currentUser.status} />
               </div>
            </Card>

            <Card className="p-8 bg-zinc-950/50 border-dashed border-zinc-800 flex flex-col items-center text-center">
               <div className="text-4xl mb-4">👑</div>
               <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Crown Assurance</h4>
               <p className="text-[10px] text-zinc-600 uppercase font-bold leading-relaxed">
                 Your identity is verified via Sovereign Encryption protocols. Redemptions are processed within 24 royal hours of verification.
               </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatRow = ({ label, val, isMono, isAmber }: any) => (
  <div className="flex justify-between items-center p-5 bg-zinc-950/80 rounded-[24px] border border-zinc-900 shadow-inner group hover:border-zinc-800 transition-colors">
     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
     <span className={`text-[11px] font-black uppercase ${isMono ? 'font-mono' : ''} ${isAmber ? 'text-amber-500' : 'text-white'}`}>{val}</span>
  </div>
);

const KycBox = ({ label, uploaded, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-[40px] border-2 flex flex-col items-center justify-center text-center transition-all group ${uploaded ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' : 'bg-zinc-950 border-dashed border-zinc-800 text-zinc-600 hover:border-amber-500/50 hover:bg-zinc-900'}`}
  >
     <div className="text-4xl mb-4 group-hover:scale-110 transition-transform group-hover:rotate-6">{uploaded ? '✅' : '📤'}</div>
     <div className="text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
     <div className="text-[8px] opacity-40 uppercase font-bold">{uploaded ? 'SECURED IN ARCHIVES' : 'TAP TO DISPATCH'}</div>
  </button>
);

export default ProfilePage;
