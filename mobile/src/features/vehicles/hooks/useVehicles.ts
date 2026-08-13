import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehiclesService, CreateVehiclePayload } from '../services/vehicles.service';

const KEYS = { all: ['vehicles'] as const, one: (id: string) => ['vehicles', id] as const };

export function useVehicles() {
  return useQuery({ queryKey: KEYS.all, queryFn: vehiclesService.getAll });
}

export function useVehicleDetail(id: string) {
  return useQuery({ queryKey: KEYS.one(id), queryFn: () => vehiclesService.getOne(id), enabled: !!id });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehiclesService.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateVehiclePayload>) => vehiclesService.update(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.all }); void qc.invalidateQueries({ queryKey: KEYS.one(id) }); },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
