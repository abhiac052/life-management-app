import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicalReportsService, CreateMedicalReportPayload } from '../services/medical-reports.service';

const KEYS = { all: ['medical-reports'] as const, one: (id: string) => ['medical-reports', id] as const };

export function useMedicalReports(type?: string) {
  return useQuery({ queryKey: [...KEYS.all, { type }], queryFn: () => medicalReportsService.getAll(type) });
}

export function useCreateMedicalReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicalReportPayload) => medicalReportsService.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteMedicalReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalReportsService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMedicalReportDownloadUrl(id: string) {
  return useQuery({
    queryKey: [...KEYS.one(id), 'download-url'],
    queryFn: () => medicalReportsService.getDownloadUrl(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
