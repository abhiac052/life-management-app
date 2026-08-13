import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicinesService, CreateMedicinePayload } from '../services/medicines.service';

const KEYS = {
  all: ['medicines'] as const,
  today: ['medicines', 'today'] as const,
  one: (id: string) => ['medicines', id] as const,
  adherence: (id: string) => ['medicines', id, 'adherence'] as const,
};

export function useMedicines(isActive?: boolean) {
  return useQuery({
    queryKey: [...KEYS.all, { isActive }],
    queryFn: () => medicinesService.getAll(isActive),
  });
}

export function useTodayDoses() {
  return useQuery({
    queryKey: KEYS.today,
    queryFn: medicinesService.getToday,
    refetchInterval: 60_000, // refresh every minute
  });
}

export function useMedicineDetail(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn: () => medicinesService.getOne(id),
    enabled: !!id,
  });
}

export function useMedicineAdherence(id: string, from?: string, to?: string) {
  return useQuery({
    queryKey: [...KEYS.adherence(id), { from, to }],
    queryFn: () => medicinesService.getAdherence(id, from, to),
    enabled: !!id,
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicinePayload) => medicinesService.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
      void qc.invalidateQueries({ queryKey: KEYS.today });
    },
  });
}

export function useUpdateMedicine(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateMedicinePayload>) => medicinesService.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
      void qc.invalidateQueries({ queryKey: KEYS.one(id) });
      void qc.invalidateQueries({ queryKey: KEYS.today });
    },
  });
}

export function useDeleteMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicinesService.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
      void qc.invalidateQueries({ queryKey: KEYS.today });
    },
  });
}

export function useDeactivateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicinesService.deactivate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
      void qc.invalidateQueries({ queryKey: KEYS.today });
    },
  });
}

export function useLogDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { scheduleId: string; scheduledAt: string; action: 'taken' | 'skipped'; note?: string }) =>
      medicinesService.logDose(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.today });
    },
  });
}

export function useUpsertStock(medicineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { currentQty: number; unitsPerDose?: number; dosesPerDay?: number; refillThreshold?: number }) =>
      medicinesService.upsertStock(medicineId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.one(medicineId) });
      void qc.invalidateQueries({ queryKey: KEYS.today });
    },
  });
}
