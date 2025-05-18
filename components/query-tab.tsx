"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  Variants,
  PanInfo,
} from "framer-motion";
import { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";
import { useQueryParams } from "@/hooks/use-query-param";

type TabItemProps<T extends string> = {
  text: T;
  label?: string;
  selected: boolean;
  // eslint-disable-next-line no-unused-vars
  onSelect: (tab: T) => void;
  "data-tab"?: string;
  isScrollMode: boolean;
};

const TabItem = <T extends string>({
  text,
  label,
  selected,
  onSelect,
  "data-tab": dataTab,
  isScrollMode,
}: TabItemProps<T>) => {
  return (
    <button
      className={cn("relative rounded-md px-3 py-1 text-sm transition-colors", {
        "text-gray-500 hover:text-foreground": !selected,
        "text-foreground": selected,
        "flex-1": !isScrollMode, // Spread evenly when not in scroll mode
        "min-w-[100px] flex-shrink-0": isScrollMode, // Fixed width when in scroll mode
      })}
      data-tab={dataTab}
      type="button"
      onClick={() => onSelect(text)}
    >
      <span className="relative truncate overflow-hidden text-ellipsis block w-full z-10">
        {label || text}
      </span>
      {selected && (
        <motion.span
          className="absolute border inset-0 z-0 rounded-md bg-background"
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
        ></motion.span>
      )}
    </button>
  );
};

type TabsProps<T extends string[]> = {
  defaultTab: T[number];
  tabContent: Record<T[number], ReactNode>;
  tabLabels?: Record<T[number], string>;
  tabs: T;
};

const MULTIPLIER = 300;

const variants: Variants = {
  initial: (dir: number) => ({
    width: "100%",
    position: "absolute",
    x: MULTIPLIER * dir,
    opacity: 0,
    filter: "blur(4px)",
  }),
  active: {
    width: "100%",
    position: "relative",
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    width: "100%",
    position: "absolute",
    x: -MULTIPLIER * dir,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

export const QueryTabs = <T extends string[]>({
  defaultTab,
  tabContent,
  tabLabels,
  tabs,
}: TabsProps<T>) => {
  const [currentTab, setCurrentTab] = useQueryParams("tab", defaultTab, {
    scroll: false,
    appendParams: false,
  });
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const tabIndex = tabs.indexOf(currentTab as string);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isScrollMode, setIsScrollMode] = useState(false);

  const checkForScrollOverflow = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Check if we need scroll mode (content wider than container)
    const needsScrollMode = scrollWidth > clientWidth;
    setIsScrollMode(needsScrollMode);

    // Only show scroll indicators in scroll mode
    if (needsScrollMode) {
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    } else {
      setShowLeftScroll(false);
      setShowRightScroll(false);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkForScrollOverflow();
      scrollContainer.addEventListener("scroll", checkForScrollOverflow);

      // Initial check and also check on resize
      window.addEventListener("resize", checkForScrollOverflow);

      return () => {
        scrollContainer.removeEventListener("scroll", checkForScrollOverflow);
        window.removeEventListener("resize", checkForScrollOverflow);
      };
    }
  }, []);

  // Check for overflow when tabs change
  useEffect(() => {
    checkForScrollOverflow();
  }, [tabs]);

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to make the selected tab visible (only in scroll mode)
    if (!scrollContainerRef.current || !isScrollMode) return;

    const selectedTabElement = scrollContainerRef.current.querySelector(
      `button[data-tab="${currentTab}"]`,
    ) as HTMLElement;

    if (selectedTabElement) {
      const container = scrollContainerRef.current;
      const tabLeft = selectedTabElement.offsetLeft;
      const tabRight = tabLeft + selectedTabElement.offsetWidth;

      if (tabLeft < container.scrollLeft) {
        container.scrollTo({
          left: tabLeft - 16,
          behavior: "smooth",
        });
      } else if (tabRight > container.scrollLeft + container.clientWidth) {
        container.scrollTo({
          left: tabRight - container.clientWidth + 16,
          behavior: "smooth",
        });
      }
    }
  }, [currentTab, isScrollMode]);

  const handleSwipeChange = (tab: T[number]) => {
    if (isAnimating) return;
    const newTabIndex = tabs.indexOf(tab);
    setDirection(newTabIndex > tabIndex ? 1 : -1);
    setCurrentTab(tab);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const swipeThreshold = 100; // Minimum distance to trigger tab change
    const { offset } = info;

    // If swipe distance exceeds threshold, change tab
    if (Math.abs(offset.x) > swipeThreshold) {
      // Swiping left (negative offset) means going to next tab
      if (offset.x < 0 && tabIndex < tabs.length - 1) {
        handleSwipeChange(tabs[tabIndex + 1]);
      }
      // Swiping right (positive offset) means going to previous tab
      else if (offset.x > 0 && tabIndex > 0) {
        handleSwipeChange(tabs[tabIndex - 1]);
      }
    }

    // Reset swipe progress
    setSwipeProgress(0);
  };

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Calculate and set the progress of the swipe (-1 to 1)
    const progress = Math.max(Math.min(info.offset.x / 200, 1), -1);
    setSwipeProgress(progress);
  };

  const canSwipeLeft = tabIndex < tabs.length - 1;
  const canSwipeRight = tabIndex > 0;

  return (
    <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
      <div className="mb-4 relative">
        {showLeftScroll && (
          <button
            aria-label="Scroll tabs left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-secondary p-1 rounded-full shadow-md border"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div
          className={cn(
            "flex items-center gap-2 bg-secondary p-1 border rounded-md",
            {
              "overflow-x-auto scrollbar-hide": isScrollMode,
              "overflow-hidden": !isScrollMode,
            },
          )}
          ref={scrollContainerRef}
          style={
            isScrollMode
              ? { scrollbarWidth: "none", msOverflowStyle: "none" }
              : undefined
          }
        >
          {isScrollMode && <div className="pl-1" />}
          {/* Spacing buffer for start (only in scroll mode) */}
          {tabs.map((tab) => (
            <TabItem
              data-tab={tab}
              isScrollMode={isScrollMode}
              key={tab}
              label={tabLabels?.[tab as T[number]]}
              selected={currentTab === tab}
              text={tab}
              onSelect={(tab) => {
                handleSwipeChange(tab);
              }}
            />
          ))}
          {isScrollMode && <div className="pr-1" />}
          {/* Spacing buffer for end (only in scroll mode) */}
        </div>

        {showRightScroll && (
          <button
            aria-label="Scroll tabs right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-secondary p-1 rounded-full shadow-md border"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative overflow-x-clip touch-pan-y">
        <AnimatePresence
          custom={direction}
          initial={false}
          onExitComplete={() => setIsAnimating(false)}
        >
          <motion.div
            animate="active"
            className="w-full rounded-lg"
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            exit="exit"
            initial="initial"
            key={currentTab}
            style={{
              x: swipeProgress * 50, // Apply a small movement during swipe for visual feedback
            }}
            variants={variants}
            dragDirectionLock
            dragSnapToOrigin
            onAnimationComplete={() => setIsAnimating(false)}
            onAnimationStart={() => setIsAnimating(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            {tabContent[currentTab]}
          </motion.div>
        </AnimatePresence>

        {/* Optional visual swipe indicators */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center transition-opacity duration-300",
            {
              "opacity-0": !canSwipeRight || swipeProgress <= 0,
              "opacity-70": canSwipeRight && swipeProgress > 0,
            },
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </div>

        <div
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center transition-opacity duration-300",
            {
              "opacity-0": !canSwipeLeft || swipeProgress >= 0,
              "opacity-70": canSwipeLeft && swipeProgress < 0,
            },
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </MotionConfig>
  );
};
