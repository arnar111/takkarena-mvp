import { useState, useEffect } from 'react';
import { Goals, WageSettings } from '../types';
import { DEFAULT_WAGE_SETTINGS } from '../constants';
import { subscribeUserConfig, updateUserConfig, UserConfig } from '../services/userService';

interface UseUserConfigReturn {
    goals: Goals;
    wageSettings: WageSettings;
    requireOFCheck: boolean;
    autoPausesEnabled: boolean;
    coachPersonality: string;
    updateGoals: (goals: Goals) => Promise<void>;
    updateWageSettings: (settings: WageSettings) => Promise<void>;
    updateRequireOFCheck: (value: boolean) => Promise<void>;
    updateAutoPausesEnabled: (value: boolean) => Promise<void>;
    updateCoachPersonality: (personality: string) => Promise<void>;
}

const DEFAULT_GOALS: Goals = {
    daily: 25000,
    weekly: 100000,
    monthly: 800000
};

/**
 * Hook for managing user configuration and preferences
 */
export const useUserConfig = (staffId: string | undefined): UseUserConfigReturn => {
    const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
    const [wageSettings, setWageSettings] = useState<WageSettings>(DEFAULT_WAGE_SETTINGS);
    const [requireOFCheck, setRequireOFCheck] = useState(false);
    const [autoPausesEnabled, setAutoPausesEnabled] = useState(false);
    const [coachPersonality, setCoachPersonality] = useState('standard');

    // Subscribe to user config changes
    useEffect(() => {
        if (!staffId) return;

        const unsubscribe = subscribeUserConfig(staffId, (config: UserConfig) => {
            if (config.goals) setGoals(config.goals);
            if (config.wageSettings) setWageSettings(config.wageSettings);
            if (config.requireOFCheck !== undefined) setRequireOFCheck(config.requireOFCheck);
            if (config.autoPausesEnabled !== undefined) setAutoPausesEnabled(config.autoPausesEnabled);
            if (config.coachPersonality) setCoachPersonality(config.coachPersonality);
        });

        return () => unsubscribe();
    }, [staffId]);

    // Update functions
    const updateGoals = async (newGoals: Goals): Promise<void> => {
        if (!staffId) return;
        setGoals(newGoals);
        await updateUserConfig(staffId, { goals: newGoals });
    };

    const updateWageSettings = async (settings: WageSettings): Promise<void> => {
        if (!staffId) return;
        setWageSettings(settings);
        await updateUserConfig(staffId, { wageSettings: settings });
    };

    const updateRequireOFCheck = async (value: boolean): Promise<void> => {
        if (!staffId) return;
        setRequireOFCheck(value);
        await updateUserConfig(staffId, { requireOFCheck: value });
    };

    const updateAutoPausesEnabled = async (value: boolean): Promise<void> => {
        if (!staffId) return;
        setAutoPausesEnabled(value);
        await updateUserConfig(staffId, { autoPausesEnabled: value });
    };

    const updateCoachPersonality = async (personality: string): Promise<void> => {
        if (!staffId) return;
        setCoachPersonality(personality);
        await updateUserConfig(staffId, { coachPersonality: personality });
    };

    return {
        goals,
        wageSettings,
        requireOFCheck,
        autoPausesEnabled,
        coachPersonality,
        updateGoals,
        updateWageSettings,
        updateRequireOFCheck,
        updateAutoPausesEnabled,
        updateCoachPersonality
    };
};

export default useUserConfig;
