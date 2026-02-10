
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Badge, BadgeIcon, Button } from '../components';
import { useStore } from '../store';

const PublicProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useStore();
  
  // Find user by ID or by First Name (for ticker links)
  const user = users.find(u => u.id === id || u.name.split(' ')[0] === id);

  if (!user) return <Layout><div className="text-center py-20 uppercase font-black">Citizen Not Found in Archives</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col items-center text-center space-y-6">
           <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border-4 border-amber-500 flex items-center justify-center text-5xl font-black italic text-amber-500 shadow-2xl relative">
              {user.name[0]}
              <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-amber-500 text-zinc-950 text-[10px] font-black rounded-full border-2 border-zinc-950">LVL {user.level}</div>
           </div>
           <div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">{user.name}</h1>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Sovereign Citizen since {new Date(user.createdAt).getFullYear()}</p>
           </div>
           <div className="flex gap-2 justify-center flex-wrap">
              {user.badges.map(b => <BadgeIcon key={b} type={b} />)}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="p-8 border-amber-500/10 bg-zinc-900/40 text-center">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Progression Pool</h3>
              <div className="text-3xl font-black italic text-amber-500">{user.xp.toLocaleString()} XP</div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mt-2">Hierarchy Rank #---</p>
           </Card>
           <Card className="p-8 border-emerald-500/10 bg-zinc-900/40 text-center">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Royal Status</h3>
              <Badge variant={user.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>{user.kycStatus} IDENTITY</Badge>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mt-2">Verified Citizen</p>
           </Card>
        </div>

        <div className="pt-10 flex justify-center">
           <Button variant="outline" onClick={() => navigate('/lobby')}>RETURN TO LOBBY</Button>
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfilePage;
