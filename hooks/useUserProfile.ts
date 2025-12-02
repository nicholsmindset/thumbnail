import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { UserProfile, PlanType, QualityLevel, CREDIT_COSTS } from '../types';
import { STORAGE_KEYS } from '../constants';

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
}

/**
 * Custom hook for managing user profile state with localStorage persistence
 */
export function useUserProfile(): UseUserProfileReturn {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(
    STORAGE_KEYS.USER,
    DEFAULT_USER_PROFILE
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

  return {
    userProfile,
    setUserProfile,
    hasCredits,
    deductCredits,
    addCredits,
    upgradePlan,
    incrementGenerations,
  };
}

export default useUserProfile;
