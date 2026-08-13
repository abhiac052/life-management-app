import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorsService, CreateDoctorPayload } from '../services/doctors.service';

const KEYS = { all: ['doctors'] as const, one: (id: string) => ['doctors', id] as const };

export function useDoctors() {
  return useQuery({ queryKey: KEYS.all, queryFn: doctorsService.getAll });
}

export function useDoctorDetail(id: string) {
  return useQuery({ queryKey: KEYS.one(id), queryFn: () => doctorsService.getOne(id), enabled: !!id });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDoctorPayload) => doctorsService.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDoctor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateDoctorPayload>) => doctorsService.update(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.all }); void qc.invalidateQueries({ queryKey: KEYS.one(id) }); },
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
