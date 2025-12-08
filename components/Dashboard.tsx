import React, { useState } from 'react';
import { UserProfile, PLANS, PlanDetails, PlanType, CREDIT_COSTS } from '../types';
import { Check, X, Zap, Crown, LayoutDashboard, Loader2, ExternalLink } from 'lucide-react';
import { redirectToCheckout } from '../services/stripeService';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpgrade: (plan: PlanDetails) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isOpen, onClose, userProfile, onUpgrade }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStripeCheckout = async (planId: 'creator' | 'agency') => {
    setIsLoading(planId);
    setError(null);
    try {
      await redirectToCheckout(planId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-5xl h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <p className="text-slate-400 text-sm">Manage your plan and credits</p>
                </div>
            </div>
            <button
                onClick={onClose}
                aria-label="Close dashboard"
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
                <X size={24} />
            </button>
        </div>

        <div className="p-8 space-y-10">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={100} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Available Credits</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{userProfile.credits}</span>
                        <span className="text-slate-500">tokens</span>
                    </div>
                    <div className="mt-4 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (userProfile.credits / 1000) * 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                     <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Current Plan</p>
                     <div className="flex items-center gap-3">
                        <span className={`text-3xl font-bold capitalize ${
                            userProfile.plan === 'agency' ? 'text-purple-400' : 
                            userProfile.plan === 'creator' ? 'text-indigo-400' : 'text-slate-200'
                        }`}>
                            {userProfile.plan}
                        </span>
                        {userProfile.plan === 'free' && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded uppercase">Trial</span>
                        )}
                     </div>
                     <p className="mt-2 text-slate-500 text-sm">
                        {userProfile.plan === 'free' ? 'Upgrade to unlock more generations.' : 'Active subscription.'}
                     </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Generations</p>
                    <span className="text-4xl font-black text-white">{userProfile.totalGenerations}</span>
                    <p className="mt-2 text-slate-500 text-sm">Thumbnails & Videos created</p>
                </div>
            </div>

            {/* Cost Table */}
             <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-center text-sm text-indigo-200">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> 1 Thumbnail (Standard) = {CREDIT_COSTS.THUMBNAIL_STANDARD} Credits</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> 1 Video = {CREDIT_COSTS.VIDEO} Credits</span>
            </div>


            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Pricing Plans */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Crown size={20} className="text-yellow-400"/> Upgrade Membership
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                        const isCurrent = userProfile.plan === plan.id;
                        const isPaidPlan = plan.id === 'creator' || plan.id === 'agency';
                        const isLoadingThis = isLoading === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                                    isCurrent
                                    ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500 shadow-xl shadow-indigo-500/10'
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                                }`}
                            >
                                {plan.id === 'creator' && !isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                        Best Value
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">{plan.price}</span>
                                        {plan.price !== '$0' && <span className="text-slate-500 text-sm">/mo</span>}
                                    </div>
                                    <div className="mt-2 text-indigo-300 font-semibold text-sm">
                                        {plan.credits} Credits
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        if (isPaidPlan && !isCurrent) {
                                            handleStripeCheckout(plan.id as 'creator' | 'agency');
                                        } else if (plan.id === 'free') {
                                            onUpgrade(plan);
                                        }
                                    }}
                                    disabled={isCurrent || isLoading !== null}
                                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                        isCurrent
                                        ? 'bg-slate-700 text-slate-400 cursor-default'
                                        : isLoading !== null
                                        ? 'bg-slate-600 text-slate-300 cursor-wait'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40'
                                    }`}
                                >
                                    {isLoadingThis ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Redirecting to Checkout...
                                        </>
                                    ) : isCurrent ? (
                                        'Current Plan'
                                    ) : plan.id === 'free' ? (
                                        'Downgrade'
                                    ) : (
                                        <>
                                            Upgrade <ExternalLink size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;