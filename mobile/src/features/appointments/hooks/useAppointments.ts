import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentsService, CreateAppointmentPayload } from '../services/appointments.service';

const KEYS = { all: ['appointments'] as const, one: (id: string) => ['appointments', id] as const };

export function useAppointments(status?: string) {
  return useQuery({ queryKey: [...KEYS.all, { status }], queryFn: () => appointmentsService.getAll(status) });
}

export function useAppointmentDetail(id: string) {
  return useQuery({ queryKey: KEYS.one(id), queryFn: () => appointmentsService.getOne(id), enabled: !!id });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentPayload) => appointmentsService.create(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateAppointmentPayload> & { status?: string }) => appointmentsService.update(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.all }); void qc.invalidateQueries({ queryKey: KEYS.one(id) }); },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
