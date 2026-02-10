
import React, { useState } from 'react';
import { Layout, Card, Button, Input, Badge, CrownLogo } from '../components';
import { useStore } from '../store';
import { KYCStatus, KYCDocuments } from '../types';

const ProfilePage: React.FC = () => {
  const { currentUser, updateKYC, uploadDocument } = useStore();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    dob: currentUser?.dob || '',
    address: currentUser?.address || ''
  });

  if (!currentUser) return null;

  const handleFile = (type: keyof KYCDocuments) => {
    // Simulated upload
    const mockUrl = `https://storage.crownplay.com/vault/${Math.random().toString(36).substr(2, 9)}.pdf`;
    uploadDocument(type, mockUrl);
    alert(`Document "${type}" uploaded to the secure vault!`);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-10">
           <div>
             <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Monarch Identity</h1>
             <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em]">Vault & Security Credentials</p>
           </div>
           <Badge variant={currentUser.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{currentUser.kycStatus}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-12">
            <Card className="p-10">
               <h3 className="text-2xl font-black mb-8 uppercase italic tracking-tight flex items-center gap-3">
                 <span className="text-amber-500">🛡️</span> Sovereign Information
               </h3>
               <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); updateKYC(formData); alert("Saved to kingdom archives!"); }}>
                 <Input label="Full Legal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                   <Input label="Residential Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
                 <div className="pt-6 border-t border-zinc-800 flex justify-end">
                   <Button variant="primary" className="px-12 py-4">Save Profile</Button>
                 </div>
               </form>
            </Card>

            {/* Verification Vault */}
            <Card className="p-10 border-amber-500/20 bg-amber-500/5">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">Verification Vault</h3>
                  <div className="px-4 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Required for Redemptions</div>
               </div>
               
               <div className="space-y-6">
                  <KYCItem label="Proof of Identity" desc="Valid Passport or Driver's License" type="idFront" uploaded={!!currentUser.kycDocuments.idFront} onUpload={() => handleFile('idFront')} />
                  <KYCItem label="Proof of Address" desc="Utility bill or Bank statement (last 3 months)" type="proofOfAddress" uploaded={!!currentUser.kycDocuments.proofOfAddress} onUpload={() => handleFile('proofOfAddress')} />
                  <KYCItem label="Proof of Payment" desc="Photo of card used (hide middle digits)" type="paymentProof" uploaded={!!currentUser.kycDocuments.paymentProof} onUpload={() => handleFile('paymentProof')} />
               </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-zinc-900 shadow-amber-500/5 border-zinc-800">
               <h3 className="text-lg font-black mb-6 uppercase italic tracking-tighter">Security Overview</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-zinc-500 font-bold uppercase tracking-widest">Account ID</span>
                     <span className="font-mono text-zinc-300">CP-{currentUser.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-zinc-500 font-bold uppercase tracking-widest">Two-Factor</span>
                     <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-zinc-500 font-bold uppercase tracking-widest">Verification Status</span>
                     <span className="text-white font-black">{currentUser.kycStatus}</span>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const KYCItem = ({ label, desc, uploaded, onUpload }: any) => (
  <div className="p-6 bg-zinc-950 rounded-[24px] border border-zinc-800 flex items-center justify-between gap-6 hover:border-amber-500/30 transition-all">
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border ${uploaded ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}>
        {uploaded ? '✓' : '📁'}
      </div>
      <div>
        <p className="text-sm font-black text-white leading-none mb-1">{label}</p>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{desc}</p>
      </div>
    </div>
    <Button variant={uploaded ? 'secondary' : 'primary'} className="px-6 py-2 text-[10px]" onClick={onUpload}>
       {uploaded ? 'Replace' : 'Upload'}
    </Button>
  </div>
);

export default ProfilePage;
