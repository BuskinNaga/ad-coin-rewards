import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useReward() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.ads.reward.path, {
        method: api.ads.reward.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.ads.reward.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to process reward");
      }
      return api.ads.reward.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate user and history to reflect new balance
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Reward Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}
