import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  UserProfile,
  PlanType,
  QualityLevel,
  CREDIT_COSTS,
  SubscriptionDetails,
  BillingHistoryItem,
  DEFAULT_SUBSCRIPTION,
} from '../types';
import { STORAGE_KEYS, PLANS } from '../constants';

const DEFAULT_USER_PROFILE: UserProfile = {
  credits: 10,
  plan: 'free',
  totalGenerations: 0,
};

/**
 * Calculate credit cost based on quality level
 */
export function getCreditCost(quality: QualityLevel): number {
  switch (quality) {
    case 'ultra':
      return CREDIT_COSTS.THUMBNAIL_ULTRA;
    case 'high':
      return CREDIT_COSTS.THUMBNAIL_HIGH;
    default:
      return CREDIT_COSTS.THUMBNAIL_STANDARD;
  }
}

export interface UseUserProfileReturn {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  hasCredits: (cost: number) => boolean;
  deductCredits: (cost: number) => boolean;
  addCredits: (amount: number) => void;
  upgradePlan: (plan: PlanType, credits: number) => void;
  incrementGenerations: () => void;
  // Subscription management
  subscription: SubscriptionDetails;
  changePlan: (newPlan: PlanType) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
  getNextBillingDate: () => string;
  canDowngrade: (targetPlan: PlanType) => boolean;
  canUpgrade: (targetPlan: PlanType) => boolean;
}

/**
 * Get plan priority for comparison (higher = better plan)
 */
function getPlanPriority(plan: PlanType): number {
  const priorities: Record<PlanType, number> = {
    free: 0,
    creator: 1,
    agency: 2,
  };
  return priorities[plan];
}

/**
 * Custom hook for managing user profile state with localStorage persistence
 */
export function useUserProfile(): UseUserProfileReturn {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(
    STORAGE_KEYS.USER,
    DEFAULT_USER_PROFILE
  );

  const [subscription, setSubscription] = useLocalStorage<SubscriptionDetails>(
    STORAGE_KEYS.SUBSCRIPTION,
    DEFAULT_SUBSCRIPTION
  );

  /**
   * Check if user has enough credits
   */
  const hasCredits = useCallback(
    (cost: number): boolean => {
      return userProfile.credits >= cost;
    },
    [userProfile.credits]
  );

  /**
   * Deduct credits from user profile
   * @returns true if deduction was successful, false if insufficient credits
   */
  const deductCredits = useCallback(
    (cost: number): boolean => {
      if (userProfile.credits < cost) {
        return false;
      }
      setUserProfile((prev) => ({
        ...prev,
        credits: prev.credits - cost,
      }));
      return true;
    },
    [userProfile.credits, setUserProfile]
  );

  /**
   * Add credits to user profile
   */
  const addCredits = useCallback(
    (amount: number): void => {
      setUserProfile((prev) => ({
        ...prev,
        credits: prev.credits + amount,
      }));
    },
    [setUserProfile]
  );

  /**
   * Upgrade user plan and add credits
   */
  const upgradePlan = useCallback(
    (plan: PlanType, credits: number): void => {
      setUserProfile((prev) => ({
        ...prev,
        plan,
        credits: prev.credits + credits,
      }));
    },
    [setUserProfile]
  );

  /**
   * Increment generation count
   */
  const incrementGenerations = useCallback((): void => {
    setUserProfile((prev) => ({
      ...prev,
      totalGenerations: prev.totalGenerations + 1,
    }));
  }, [setUserProfile]);

  /**
   * Check if user can upgrade to target plan
   */
  const canUpgrade = useCallback(
    (targetPlan: PlanType): boolean => {
      return getPlanPriority(targetPlan) > getPlanPriority(userProfile.plan);
    },
    [userProfile.plan]
  );

  /**
   * Check if user can downgrade to target plan
   */
  const canDowngrade = useCallback(
    (targetPlan: PlanType): boolean => {
      return getPlanPriority(targetPlan) < getPlanPriority(userProfile.plan);
    },
    [userProfile.plan]
  );

  /**
   * Change subscription plan (upgrade or downgrade)
   */
  const changePlan = useCallback(
    (newPlan: PlanType): void => {
      const planDetails = PLANS.find((p) => p.id === newPlan);
      if (!planDetails) return;

      const isUpgrade = canUpgrade(newPlan);
      const now = Date.now();

      // Create billing history entry
      const billingEntry: BillingHistoryItem = {
        id: `bill_${now}`,
        date: now,
        amount: planDetails.price,
        description: isUpgrade
          ? `Upgrade to ${planDetails.name}`
          : `Downgrade to ${planDetails.name}`,
        status: 'paid',
      };

      // Update subscription
      setSubscription((prev) => ({
        ...prev,
        status: newPlan === 'free' ? 'trialing' : 'active',
        currentPlan: newPlan,
        startDate: now,
        currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        cancelAtPeriodEnd: false,
        billingHistory: [billingEntry, ...prev.billingHistory].slice(0, 10), // Keep last 10
      }));

      // Update user profile
      setUserProfile((prev) => ({
        ...prev,
        plan: newPlan,
        credits: isUpgrade ? prev.credits + planDetails.credits : prev.credits,
      }));
    },
    [canUpgrade, setSubscription, setUserProfile]
  );

  /**
   * Cancel subscription (will end at period end)
   */
  const cancelSubscription = useCallback((): void => {
    setSubscription((prev) => ({
      ...prev,
      cancelAtPeriodEnd: true,
    }));
  }, [setSubscription]);

  /**
   * Reactivate a cancelled subscription
   */
  const reactivateSubscription = useCallback((): void => {
    setSubscription((prev) => ({
      ...prev,
      cancelAtPeriodEnd: false,
    }));
  }, [setSubscription]);

  /**
   * Get formatted next billing date
   */
  const getNextBillingDate = useCallback((): string => {
    const date = new Date(subscription.currentPeriodEnd);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [subscription.currentPeriodEnd]);

  return {
    userProfile,
    setUserProfile,
    hasCredits,
    deductCredits,
    addCredits,
    upgradePlan,
    incrementGenerations,
    // Subscription management
    subscription,
    changePlan,
    cancelSubscription,
    reactivateSubscription,
    getNextBillingDate,
    canDowngrade,
    canUpgrade,
  };
}

export default useUserProfile;
