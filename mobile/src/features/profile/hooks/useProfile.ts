import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService, UserPreferences, UserProfile } from '../services/profile.service';

export const PROFILE_KEY = ['profile'];
export const PREFS_KEY = ['preferences'];

export function useProfile() {
  return useQuery({ queryKey: PROFILE_KEY, queryFn: profileService.getProfile });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data: UserProfile) => qc.setQueryData(PROFILE_KEY, data),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: profileService.changePassword });
}

export function usePreferences() {
  return useQuery({ queryKey: PREFS_KEY, queryFn: profileService.getPreferences });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileService.updatePreferences,
    onSuccess: (data: UserPreferences) => qc.setQueryData(PREFS_KEY, data),
  });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: profileService.deleteAccount });
}
