import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { warrantiesService, CreateWarrantyPayload } from '../services/warranties.service';

const KEYS = { all: ['warranties'] as const, one: (id: string) => ['warranties', id] as const };

export function useWarranties() {
  return useQuery({ queryKey: KEYS.all, queryFn: warrantiesService.getAll });
}

export function useWarrantyDetail(id: string) {
  return useQuery({ queryKey: KEYS.one(id), queryFn: () => warrantiesService.getOne(id), enabled: !!id });
}

export function useCreateWarranty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarrantyPayload) => warrantiesService.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateWarranty(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateWarrantyPayload>) => warrantiesService.update(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.all }); void qc.invalidateQueries({ queryKey: KEYS.one(id) }); },
  });
}

export function useDeleteWarranty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warrantiesService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
