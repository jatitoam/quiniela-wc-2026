import { useQuery } from '@tanstack/react-query';
import type { LeaderboardAllDto, LeaderboardDto } from '@quiniela/types';
import { api } from './client';

export const leaderboardKeys = {
  top10: ['leaderboard', 'top10'] as const,
  all: ['leaderboard', 'all'] as const,
};

export function useLeaderboard() {
  return useQuery({
    queryKey: leaderboardKeys.top10,
    queryFn: () => api.get<LeaderboardDto>('/leaderboard'),
  });
}

export function useLeaderboardAll() {
  return useQuery({
    queryKey: leaderboardKeys.all,
    queryFn: () => api.get<LeaderboardAllDto>('/leaderboard/all'),
    enabled: false,
  });
}
