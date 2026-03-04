"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  /** Currently active tab value */
  value: string;
  /** Callback when active tab changes */
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible tabs component with keyboard navigation.
 * Supports arrow keys, Home, and End for tab navigation.
 *
 * @example
 * const [tab, setTab] = useState("account");
 *
 * <Tabs value={tab} onValueChange={setTab}>
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">Account content...</TabsContent>
 *   <TabsContent value="settings">Settings content...</TabsContent>
 * </Tabs>
 */
export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const idPrefix = React.useId();
  return (
    <div className={className} data-value={value} data-onvaluechange={undefined}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            _activeValue: value,
            _onValueChange: onValueChange,
            _idPrefix: idPrefix,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  _activeValue?: string;
  _onValueChange?: (value: string) => void;
  _idPrefix?: string;
}

export function TabsList({
  className,
  children,
  _activeValue,
  _onValueChange,
  _idPrefix,
  ...props
}: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});

  // Update sliding indicator position when active tab changes
  React.useEffect(() => {
    const list = listRef.current;
    if (!list || !_activeValue) return;

    const activeTab = list.querySelector<HTMLButtonElement>(
      `[role="tab"][data-value="${_activeValue}"]`
    );
    if (!activeTab) return;

    const listRect = list.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    setIndicatorStyle({
      left: tabRect.left - listRect.left,
      width: tabRect.width,
    });
  }, [_activeValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = listRef.current;
    if (!list) return;

    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    );
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      tabs[nextIndex].focus();
      const value = tabs[nextIndex].dataset.value;
      if (value) _onValueChange?.(value);
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Sliding active indicator */}
      <div
        className="absolute top-1 h-[calc(100%-0.5rem)] rounded-sm bg-background shadow-sm transition-all duration-200 ease-out"
        style={indicatorStyle}
        aria-hidden="true"
      />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            _activeValue,
            _onValueChange,
            _idPrefix,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  _activeValue?: string;
  _onValueChange?: (value: string) => void;
  _idPrefix?: string;
}

export function TabsTrigger({
  className,
  value,
  _activeValue,
  _onValueChange,
  _idPrefix,
  ...props
}: TabsTriggerProps) {
  const isActive = _activeValue === value;
  return (
    <button
      role="tab"
      id={_idPrefix ? `${_idPrefix}-tab-${value}` : undefined}
      aria-selected={isActive}
      aria-controls={_idPrefix ? `${_idPrefix}-panel-${value}` : undefined}
      tabIndex={isActive ? 0 : -1}
      data-value={value}
      className={cn(
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "text-foreground",
        className
      )}
      onClick={() => _onValueChange?.(value)}
      {...props}
    />
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  _activeValue?: string;
  _idPrefix?: string;
}

export function TabsContent({
  className,
  value,
  _activeValue,
  _idPrefix,
  ...props
}: TabsContentProps) {
  if (_activeValue !== value) return null;
  return (
    <div
      role="tabpanel"
      id={_idPrefix ? `${_idPrefix}-panel-${value}` : undefined}
      aria-labelledby={_idPrefix ? `${_idPrefix}-tab-${value}` : undefined}
      tabIndex={0}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    />
  );
}
