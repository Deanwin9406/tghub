
// Import from sonner directly instead of our custom toast
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return <SonnerToaster position="bottom-right" closeButton theme="light" />;
}
