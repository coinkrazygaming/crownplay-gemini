
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
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between border-b border-zinc-900 pb-10">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 rounded-3xl bg-zinc-900 border-2 border-amber-500/50 flex flex-col items-center justify-center shadow-xl">
                <span className="text-3xl font-black italic text-amber-500 leading-none">{currentUser.level}</span>
                <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mt-1">LVL</span>
             </div>
             <div>
               <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Identity Vault</h1>
               <div className="flex gap-2">
                  <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{currentUser.kycStatus} CITIZEN</Badge>
                  {currentUser.badges.map(b => <BadgeIcon key={b} type={b} />)}
               </div>
             </div>
           </div>
           <Button variant="primary" onClick={handleUpdateProfile}>SAVE ALL CHANGES</Button>
        </header>

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
                 <div className="mb-8 p-6 bg-zinc-950 border border-amber-500/30 rounded-3xl animate-in slide-in-from-top duration-500">
                    <p className="text-xs italic text-amber-100 leading-relaxed">"{aiVerdict}"</p>
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
               <h3 className="text-2xl font-black mb-8 uppercase italic">Sovereign Profile</h3>
               <form className="space-y-8" onSubmit={handleUpdateProfile}>
                 <Input label="Full Legal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                   <Input label="Residential Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
                 <div className="pt-6 border-t border-zinc-800 flex justify-end">
                   <Button variant="primary" className="px-12 py-4">SYNCHRONIZE IDENTITY</Button>
                 </div>
               </form>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-zinc-900/50">
               <h3 className="text-lg font-black mb-6 uppercase italic tracking-tighter">Citizen Stats</h3>
               <div className="space-y-4 text-xs font-bold uppercase tracking-widest">
                  <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                     <span className="text-zinc-500">Citizen ID</span>
                     <span className="text-white font-mono">CP-{currentUser.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                     <span className="text-zinc-500">Ambassador Referral Code</span>
                     <span className="text-amber-500 font-black">{currentUser.referralCode}</span>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const KycBox = ({ label, uploaded, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[32px] border-2 flex flex-col items-center justify-center text-center transition-all group ${uploaded ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-lg' : 'bg-zinc-950 border-dashed border-zinc-800 text-zinc-600 hover:border-amber-500/50 hover:bg-zinc-900'}`}
  >
     <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{uploaded ? '✅' : '📤'}</div>
     <div className="text-[9px] font-black uppercase tracking-widest">{label}</div>
     <div className="text-[8px] mt-2 opacity-50 uppercase">{uploaded ? 'SECURED IN ARCHIVES' : 'TAP TO UPLOAD'}</div>
  </button>
);

export default ProfilePage;
