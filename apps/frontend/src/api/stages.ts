import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { StageDto, TeamDto } from '@quiniela/types';
import { api } from './client';

export const stageKeys = {
  all: ['stages'] as const,
  one: (id: string) => ['stages', id] as const,
};

export function useStages() {
  return useQuery({
    queryKey: stageKeys.all,
    queryFn: () => api.get<StageDto[]>('/stages'),
  });
}

export function useStage(id: string) {
  return useQuery({
    queryKey: stageKeys.one(id),
    queryFn: () => api.get<StageDto>(`/stages/${id}`),
    enabled: !!id,
  });
}

export function useTeams(): TeamDto[] {
  const { data: stages } = useStages();
  return useMemo(() => {
    if (!stages) return [];
    const map = new Map<string, TeamDto>();
    for (const stage of stages) {
      for (const match of stage.matches) {
        map.set(match.homeTeam.id, match.homeTeam);
        map.set(match.awayTeam.id, match.awayTeam);
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [stages]);
}
