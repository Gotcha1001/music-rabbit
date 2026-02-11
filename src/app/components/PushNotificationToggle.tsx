// components/PushNotificationToggle.tsx
"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PushNotificationToggleProps {
  variant?: "button" | "switch" | "compact";
  className?: string;
}

export function PushNotificationToggle({
  variant = "switch",
  className,
}: PushNotificationToggleProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // Hide if not supported
  if (!isSupported) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className={cn("text-sm text-red-500", className)}>
        {error}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Updating...</span>
      </div>
    );
  }

  // Permission denied
  if (permission === "denied") {
    return (
      <div className={cn("text-sm text-amber-600", className)}>
        Notifications blocked — enable in browser settings
      </div>
    );
  }

  // Variant: switch (label + toggle)
  if (variant === "switch") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Switch
          id="push-reminders"
          checked={isSubscribed}
          onCheckedChange={(checked) => (checked ? subscribe() : unsubscribe())}
          disabled={isLoading}
        />
        <label
          htmlFor="push-reminders"
          className="text-sm font-medium cursor-pointer flex items-center gap-2"
        >
          {isSubscribed ? (
            <>
              <Bell className="h-4 w-4 text-green-600" />
              Reminders enabled
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              Enable reminders
            </>
          )}
        </label>
      </div>
    );
  }

  // Variant: button
  if (variant === "button") {
    return (
      <Button
        variant={isSubscribed ? "default" : "outline"}
        size="sm"
        onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2",
          isSubscribed && "bg-green-600 hover:bg-green-700 text-white",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          <>
            <Bell className="h-4 w-4" />
            Reminders On
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4" />
            Enable Reminders
          </>
        )}
      </Button>
    );
  }

  // Variant: compact (icon only)
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
      disabled={isLoading}
      title={isSubscribed ? "Disable reminders" : "Enable reminders"}
      className={cn(className)}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="h-5 w-5 text-green-600" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </Button>
  );
}