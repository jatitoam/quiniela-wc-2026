import { useQuery } from '@tanstack/react-query';
import type { ParticipantDetailDto } from '@quiniela/types';
import { api } from './client';

export const userKeys = {
  participant: (alias: string) => ['users', alias] as const,
};

export function useParticipant(alias: string) {
  return useQuery({
    queryKey: userKeys.participant(alias),
    queryFn: () => api.get<ParticipantDetailDto>(`/users/${alias}`),
    enabled: !!alias,
  });
}
