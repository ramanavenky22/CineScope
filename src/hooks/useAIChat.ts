import { useMemo, useState } from 'react';
import type { Movie } from '../types/movie';
import type { DashboardFilters } from '@context/DashboardContext';
import { askInsights, type AIMessage } from '@services/aiService';

const stableId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type UseAIChatArgs = {
  filters: DashboardFilters;
  selectedMovie: Movie | null;
  visibleMoviesCount: number;
};

export const useAIChat = ({ filters, selectedMovie, visibleMoviesCount }: UseAIChatArgs) => {
  const [messages, setMessages] = useState<AIMessage[]>(() => [
    {
      id: stableId(),
      role: 'assistant',
      content:
        'Ask for insights about what you’re seeing. I’ll use your current filters and selected movie as context.\n\nTry: “Summarize trends in ratings” or “Recommend something based on my filters”.',
      createdAt: Date.now()
    }
  ]);
  const [pending, setPending] = useState(false);

  const context = useMemo(
    () => ({
      filters,
      selectedMovie,
      visibleMoviesCount
    }),
    [filters, selectedMovie, visibleMoviesCount]
  );

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);

    const userMsg: AIMessage = {
      id: stableId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const assistantMsg = await askInsights(trimmed, context);
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setPending(false);
    }
  };

  const clear = () => {
    setMessages((prev) => prev.slice(0, 1));
  };

  return { messages, pending, send, clear };
};

