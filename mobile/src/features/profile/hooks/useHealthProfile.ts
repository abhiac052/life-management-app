import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface HealthProfile {
  id: string;
  userId: string;
  bloodGroup: string | null;
  allergies: string[];
  heightCm: number | null;
  weightKg: number | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  medicalNotes: string | null;
  updatedAt: string;
}

export interface UpsertHealthProfilePayload {
  bloodGroup?: string;
  allergies?: string[];
  heightCm?: number;
  weightKg?: number;
  emergencyName?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
}

const KEY = ['health-profile'];

const fetchHealthProfile = () =>
  api.get<ApiResponse<HealthProfile>>('/health-profile').then((r) => r.data.data);

export function useHealthProfile() {
  return useQuery({ queryKey: KEY, queryFn: fetchHealthProfile });
}

export function useUpsertHealthProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertHealthProfilePayload) =>
      api.patch<ApiResponse<HealthProfile>>('/health-profile', data).then((r) => r.data.data),
    onSuccess: (data) => qc.setQueryData(KEY, data),
  });
}
