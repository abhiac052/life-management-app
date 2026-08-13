import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prescriptionsService, CreatePrescriptionPayload } from '../services/prescriptions.service';

const KEYS = { all: ['prescriptions'] as const, one: (id: string) => ['prescriptions', id] as const };

export function usePrescriptions() {
  return useQuery({ queryKey: KEYS.all, queryFn: prescriptionsService.getAll });
}

export function usePrescriptionDetail(id: string) {
  return useQuery({ queryKey: KEYS.one(id), queryFn: () => prescriptionsService.getOne(id), enabled: !!id });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePrescriptionPayload) => prescriptionsService.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeletePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionsService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
