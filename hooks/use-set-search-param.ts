import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebouncedCallback } from "./use-debounced-callback";

export function useSetSearchParam() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const debounced = useDebouncedCallback(
    (
      params: { key: string; value: string } | { key: string; value: string }[],
    ) => {
      const sp = new URLSearchParams(searchParams.toString());

      if (Array.isArray(params)) {
        // Handle array of updates
        params.forEach(({ key, value }) => {
          if (!value) {
            sp.delete(key);
          } else {
            sp.set(key, value);
          }
        });
      } else {
        // Handle single update
        const { key, value } = params;
        if (!value) {
          sp.delete(key);
        } else {
          sp.set(key, value);
        }
      }

      // Reset pagination if any parameter other than page/limit changes
      const isPageOrLimit = Array.isArray(params)
        ? params.every((p) => p.key === "page" || p.key === "limit")
        : params.key === "page" || params.key === "limit";

      if (!isPageOrLimit) {
        sp.set("page", "1");
        sp.set("limit", "25");
      }

      router.push(`${pathName}?${sp.toString()}`);
    },
    300,
  );

  return debounced;
}
