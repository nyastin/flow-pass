import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function usePreventNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      const confirmed = window.confirm(
        "Are you sure you want to leave? Your payment information will be lost.",
      );
      if (!confirmed) {
        window.history.pushState(null, "", pathname);
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push initial state
    window.history.pushState(null, "", pathname);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);
}
