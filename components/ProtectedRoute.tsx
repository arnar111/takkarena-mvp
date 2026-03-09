import React from 'react';
import { User } from '../types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  user: User | null;
  requireRole?: 'agent' | 'manager';
  children: React.ReactNode;
  isLoading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  user, 
  requireRole, 
  children, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">
          Staðfesti aðgangsheimildir...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="p-6 bg-rose-500/10 rounded-full text-rose-500">
          <ShieldAlert size={48} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Aðgangi hafnað</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto font-medium">
            Þú verður að vera skráð(ur) inn til að sjá þetta efni.
          </p>
        </div>
      </div>
    );
  }

  if (requireRole && user.role !== requireRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="p-6 bg-amber-500/10 rounded-full text-amber-500">
          <ShieldAlert size={48} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Stjórnandaaðgangur krafist</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto font-medium">
            Þessi síða er aðeins ætluð stjórnendum TAKK.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;