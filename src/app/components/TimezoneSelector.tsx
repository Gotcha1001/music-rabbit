"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIMEZONE_LIST, getTimezoneAbbr } from "@/lib/timezoneUtils";

interface TimezoneSelectorProps {
  value?: string;
  onTimezoneChange: (timezone: string) => void;
  onCountryChange?: (country: string) => void;
  onStateChange?: (state: string) => void;
  showCountryState?: boolean;
}

export function TimezoneSelector({
  value,
  onTimezoneChange,
  onCountryChange,
  onStateChange,
  showCountryState = true,
}: TimezoneSelectorProps) {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const handleCountryChange = (val: string) => {
    setCountry(val);
    onCountryChange?.(val);
  };

  const handleStateChange = (val: string) => {
    setState(val);
    onStateChange?.(val);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-foreground font-serif">Your Timezone</Label>
        <Select value={value} onValueChange={onTimezoneChange}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border max-h-96">
            {Object.entries(
              TIMEZONE_LIST.reduce(
                (acc, tz) => {
                  if (!acc[tz.region]) acc[tz.region] = [];
                  acc[tz.region].push(tz);
                  return acc;
                },
                {} as Record<string, typeof TIMEZONE_LIST>
              )
            ).map(([region, timezones]) => (
              <div key={region}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {region}
                </div>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    <div className="flex items-center gap-2">
                      <span>{tz.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({getTimezoneAbbr(tz.value)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Your lessons will be scheduled according to this timezone
        </p>
      </div>

      {showCountryState && (
        <>
          <div>
            <Label className="text-foreground font-serif">Country</Label>
            <Input
              placeholder="e.g., United States"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          <div>
            <Label className="text-foreground font-serif">
              State/Province (Optional)
            </Label>
            <Input
              placeholder="e.g., New York"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
        </>
      )}
    </div>
  );
}