import React, { useState } from 'react';
import {
  UserProfile,
  SubscriptionDetails,
  PlanType,
  PLANS,
  PlanDetails,
  BillingHistoryItem,
} from '../types';
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  Receipt,
  Shield,
  Zap,
  Crown,
  ChevronRight,
} from 'lucide-react';

interface SubscriptionPanelProps {
  userProfile: UserProfile;
  subscription: SubscriptionDetails;
  onChangePlan: (plan: PlanType) => void;
  onCancelSubscription: () => void;
  onReactivateSubscription: () => void;
  getNextBillingDate: () => string;
  canUpgrade: (plan: PlanType) => boolean;
  canDowngrade: (plan: PlanType) => boolean;
}

type ModalType = 'upgrade' | 'downgrade' | 'cancel' | null;

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({
  userProfile,
  subscription,
  onChangePlan,
  onCancelSubscription,
  onReactivateSubscription,
  getNextBillingDate,
  canUpgrade,
  canDowngrade,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  const currentPlanDetails = PLANS.find((p) => p.id === userProfile.plan);

  const handlePlanAction = (plan: PlanDetails) => {
    if (plan.id === userProfile.plan) return;

    setSelectedPlan(plan);
    if (canUpgrade(plan.id)) {
      setActiveModal('upgrade');
    } else if (canDowngrade(plan.id)) {
      setActiveModal('downgrade');
    }
  };

  const confirmPlanChange = () => {
    if (selectedPlan) {
      onChangePlan(selectedPlan.id);
    }
    setActiveModal(null);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = () => {
    setActiveModal('cancel');
  };

  const confirmCancel = () => {
    onCancelSubscription();
    setActiveModal(null);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
      past_due: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Past Due' },
      trialing: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Free Trial' },
    };
    const config = statusConfig[subscription.status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <CreditCard size={24} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Current Subscription</h3>
              <p className="text-slate-400 text-sm">Manage your plan and billing</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Plan */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Crown size={14} />
              <span>Plan</span>
            </div>
            <p className="text-xl font-bold text-white capitalize">{currentPlanDetails?.name}</p>
            <p className="text-indigo-400 font-semibold">{currentPlanDetails?.price}</p>
          </div>

          {/* Next Billing */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Calendar size={14} />
              <span>Next Billing</span>
            </div>
            <p className="text-xl font-bold text-white">
              {subscription.cancelAtPeriodEnd ? 'Ends on' : getNextBillingDate()}
            </p>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-yellow-400 text-sm">Subscription ending</p>
            )}
          </div>

          {/* Credits */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Zap size={14} />
              <span>Credits</span>
            </div>
            <p className="text-xl font-bold text-white">{userProfile.credits}</p>
            <p className="text-slate-500 text-sm">Available to use</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {subscription.cancelAtPeriodEnd ? (
            <button
              onClick={onReactivateSubscription}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw size={16} />
              Reactivate Subscription
            </button>
          ) : (
            userProfile.plan !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
              >
                <X size={16} />
                Cancel Subscription
              </button>
            )
          )}
          <button
            onClick={() => setShowBillingHistory(!showBillingHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
          >
            <Receipt size={16} />
            Billing History
            <ChevronRight
              size={16}
              className={`transition-transform ${showBillingHistory ? 'rotate-90' : ''}`}
            />
          </button>
        </div>

        {/* Billing History */}
        {showBillingHistory && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Recent Transactions
            </h4>
            {subscription.billingHistory.length > 0 ? (
              <div className="space-y-3">
                {subscription.billingHistory.map((item: BillingHistoryItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-medium">{item.description}</p>
                      <p className="text-slate-500 text-sm">{formatDate(item.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{item.amount}</p>
                      <span
                        className={`text-xs font-medium ${
                          item.status === 'paid'
                            ? 'text-green-400'
                            : item.status === 'pending'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No billing history yet</p>
            )}
          </div>
        )}
      </div>

      {/* Plan Selection */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield size={20} className="text-indigo-400" />
          Change Plan
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Upgrade or downgrade your subscription at any time
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = userProfile.plan === plan.id;
            const isUpgrade = canUpgrade(plan.id);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded">
                    Current
                  </div>
                )}

                {plan.id === 'creator' && !isCurrent && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded">
                    Popular
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white">{plan.price}</span>
                    {plan.price !== '$0' && <span className="text-slate-500 text-sm">/mo</span>}
                  </div>
                  <p className="text-indigo-300 text-sm mt-1">{plan.credits} credits/mo</p>
                </div>

                <div className="flex-1 space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePlanAction(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-700/50 text-slate-500 cursor-default'
                      : isUpgrade
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isCurrent ? (
                    'Current Plan'
                  ) : isUpgrade ? (
                    <>
                      <ArrowUp size={16} /> Upgrade
                    </>
                  ) : (
                    <>
                      <ArrowDown size={16} /> Downgrade
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            {activeModal === 'upgrade' && selectedPlan && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <ArrowUp size={24} className="text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Confirm Upgrade</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  You&apos;re upgrading to <strong className="text-white">{selectedPlan.name}</strong>{' '}
                  for <strong className="text-indigo-400">{selectedPlan.price}/mo</strong>.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-400 mb-2">You&apos;ll receive:</p>
                  <p className="text-lg font-bold text-indigo-400">
                    +{selectedPlan.credits} credits
                  </p>
                  <p className="text-sm text-slate-500">Added to your account immediately</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPlanChange}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirm Upgrade
                  </button>
                </div>
              </>
            )}

            {activeModal === 'downgrade' && selectedPlan && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <ArrowDown size={24} className="text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Confirm Downgrade</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  You&apos;re downgrading to{' '}
                  <strong className="text-white">{selectedPlan.name}</strong>.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
                        <li>Your current credits will remain</li>
                        <li>You&apos;ll receive fewer credits next billing cycle</li>
                        <li>Some features may become unavailable</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Keep Current Plan
                  </button>
                  <button
                    onClick={confirmPlanChange}
                    className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirm Downgrade
                  </button>
                </div>
              </>
            )}

            {activeModal === 'cancel' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertTriangle size={24} className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Cancel Subscription?</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Are you sure you want to cancel your subscription?
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-400 mb-2">What happens next:</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <span>Keep access until {getNextBillingDate()}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <span>Keep your remaining credits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <span>No more monthly credits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <span>Reactivate anytime before period ends</span>
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPanel;
