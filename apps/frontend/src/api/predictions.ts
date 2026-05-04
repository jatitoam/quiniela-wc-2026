import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PredictionSummaryDto, UpsertPredictionDto } from '@quiniela/types';
import { api } from './client';

export const predictionKeys = {
  mine: (stageId?: string) => ['predictions', 'me', stageId] as const,
};

export function useMyPredictions(stageId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: predictionKeys.mine(stageId),
    queryFn: () =>
      api.get<PredictionSummaryDto[]>(
        `/predictions/me${stageId ? `?stageId=${stageId}` : ''}`,
      ),
    enabled: options?.enabled ?? true,
  });
}

export function useUpsertPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertPredictionDto) => api.put('/predictions', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['predictions'] }),
  });
}
