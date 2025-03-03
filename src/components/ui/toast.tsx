
// Define the actual toast module
import { toast as toastFunction, Toaster as SonnerToaster } from "sonner";

export const Toaster = SonnerToaster;

// Create a wrapper for the toast function that accepts our custom properties
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

// Export the wrapped toast function
export const toast = (props: ToastProps) => {
  const { title, description, variant, ...rest } = props;
  
  // Map variant to sonner's style options
  const toastStyle = variant === "destructive" ? { style: { backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' } } : {};
  
  if (title) {
    return toastFunction(title, {
      description,
      ...toastStyle,
      ...rest,
    });
  } else {
    return toastFunction(description || "", {
      ...toastStyle,
      ...rest,
    });
  }
};
