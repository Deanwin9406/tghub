
// Re-export the toast from our UI components
import { toast } from "@/components/ui/toast";

// Create a useToast hook that returns an object with toast
export const useToast = () => {
  return { toast };
};

// Also export toast directly for convenience
export { toast };
