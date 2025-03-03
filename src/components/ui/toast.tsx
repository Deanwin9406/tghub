
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
  const style = variant === "destructive" ? { style: "destructive" } : {};
  
  return toastFunction({
    ...style,
    ...rest,
    // If we have a title and description, use both, otherwise just use description
    ...(title 
      ? { 
          title: title,
          description: description 
        } 
      : { description: description || "" })
  });
};
