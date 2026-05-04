import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminEnterScoreDto, MatchDto } from '@quiniela/types';
import { api } from './client';

export const adminKeys = {
  pending: ['admin', 'registrations', 'pending'] as const,
  participants: ['admin', 'participants'] as const,
};

export function usePendingRegistrations() {
  return useQuery({
    queryKey: adminKeys.pending,
    queryFn: () => api.get<{ user: { id: string; name: string; email: string; alias: string } }[]>('/admin/registrations/pending'),
  });
}

export function useConfirmRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.patch(`/admin/registrations/${userId}/confirm`),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.pending }),
  });
}

export function useEnterScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AdminEnterScoreDto) => api.put('/scores', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stages'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof api.post>[1]) => api.post<MatchDto>('/admin/matches', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages'] }),
  });
}
