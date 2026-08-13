import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';
import { useQuery } from '@tanstack/react-query';

export interface DashboardData {
  doses: {
    total: number;
    taken: number;
    pending: number;
    nextDose: { id: string; time: string; label: string | null; medicineName: string } | null;
  };
  reminders: {
    overdue: number;
    upcoming: { id: string; title: string; dueDate: string; category: string | null; linkedEntityType: string }[];
  };
  appointments: { id: string; doctorName: string; date: string; time: string; purpose: string | null }[];
  expiringDocs: { id: string; name: string; category: string; expiryDate: string }[];
  expiringWarranties: { id: string; productName: string; expiryDate: string }[];
  vehicleAlerts: { id: string; name: string; type: string; insuranceExpiry: string | null; pucExpiry: string | null; nextServiceDate: string | null }[];
}

const fetchDashboard = () =>
  api.get<ApiResponse<DashboardData>>('/dashboard').then((r) => r.data.data);

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    staleTime: 2 * 60 * 1000,
  });
}
