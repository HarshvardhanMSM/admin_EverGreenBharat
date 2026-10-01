"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Crosshair,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Sparkles,
  Key,
  X,
  Compass,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export interface AddressSearchResult {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface GoogleAddressSearchProps {
  onAddressSelect: (result: AddressSearchResult) => void;
  currentLat?: number | string;
  currentLng?: number | string;
  currentAddress?: string;
  className?: string;
}

export function GoogleAddressSearch({
  onAddressSelect,
  currentLat,
  currentLng,
  currentAddress,
  className = "",
}: GoogleAddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [lastAutoFilled, setLastAutoFilled] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load custom API key from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("google_maps_api_key") || "";
      setCustomApiKey(storedKey);
    }
  }, []);

  // Initialize Google Maps Places script if API key is provided
  useEffect(() => {
    const apiKey =
      customApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    if (!apiKey) {
      setGoogleMapsReady(false);
      return;
    }

    if (typeof window === "undefined") return;

    // Check if Google Maps script is already loaded
    if ((window as any).google?.maps?.places) {
      setGoogleMapsReady(true);
      initGoogleAutocomplete();
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsReady(true);
        initGoogleAutocomplete();
      };
      script.onerror = () => {
        console.warn("Failed to load Google Maps script with provided key.");
        setGoogleMapsReady(false);
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => {
        setGoogleMapsReady(true);
        initGoogleAutocomplete();
      });
    }
  }, [customApiKey]);

  const initGoogleAutocomplete = () => {
    if (
      typeof window === "undefined" ||
      !(window as any).google?.maps?.places ||
      !inputRef.current
    ) {
      return;
    }

    try {
      const google = (window as any).google;
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["address_components", "geometry", "formatted_address", "name"],
          types: ["geocode", "establishment"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry?.location) return;

        let streetNumber = "";
        let route = "";
        let locality = "";
        let sublocality = "";
        let state = "";
        let postalCode = "";
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        for (const comp of place.address_components || []) {
          const types = comp.types || [];
          if (types.includes("street_number")) streetNumber = comp.long_name;
          if (types.includes("route")) route = comp.long_name;
          if (
            types.includes("sublocality") ||
            types.includes("sublocality_level_1")
          ) {
            sublocality = comp.long_name;
          }
          if (types.includes("locality")) locality = comp.long_name;
          if (types.includes("administrative_area_level_1"))
            state = comp.long_name;
          if (types.includes("postal_code")) postalCode = comp.long_name;
        }

        const rawStreet = [
          place.name && place.name !== locality ? place.name : "",
          streetNumber,
          route,
          sublocality,
        ]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ");

        const cleanStreet =
          rawStreet || place.formatted_address?.split(",")[0] || "";
        const cleanCity = locality || sublocality || "";
        const cleanState = state || "";
        const cleanPostalCode = postalCode || "";
        const cleanAddress = place.formatted_address || cleanStreet;

        const result: AddressSearchResult = {
          street: cleanStreet,
          city: cleanCity,
          state: cleanState,
          postalCode: cleanPostalCode,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          formattedAddress: cleanAddress,
        };

        setQuery(cleanAddress);
        setLastAutoFilled(cleanAddress);
        setShowDropdown(false);
        onAddressSelect(result);
        toast.success("Google Address auto-filled successfully!");
      });

      autocompleteRef.current = autocomplete;
    } catch (err) {
      console.warn("Could not bind Google Autocomplete:", err);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Search places using high-accuracy Geocoding API (Works with 0 configuration)
  useEffect(() => {
    // If Google Autocomplete is active, let Google handle popup predictions
    if (googleMapsReady) {
      return;
    }

    if (!query.trim() || query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query.trim()
        )}&format=json&addressdetails=1&limit=6`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en-IN,en;q=0.9",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Geocoding search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, googleMapsReady]);

  // Handle selection from dropdown
  const handleSelectSuggestion = (item: any) => {
    const addr = item.address || {};
    const streetParts = [
      item.name !== addr.city ? item.name : "",
      addr.road,
      addr.suburb || addr.neighbourhood,
    ].filter(Boolean);

    const street =
      streetParts.filter((v, i, a) => a.indexOf(v) === i).join(", ") ||
      item.display_name.split(",")[0];
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.suburb ||
      "";
    const state = addr.state || "";
    const postalCode = addr.postcode || "";
    const latitude = Number(parseFloat(item.lat).toFixed(6));
    const longitude = Number(parseFloat(item.lon).toFixed(6));
    const formattedAddress = item.display_name;

    const result: AddressSearchResult = {
      street,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      formattedAddress,
    };

    setQuery(item.name || formattedAddress.split(",")[0]);
    setLastAutoFilled(formattedAddress);
    setShowDropdown(false);
    onAddressSelect(result);
    toast.success("Location auto-filled successfully!");
  };

  // Detect Current Device Location (GPS)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          // Reverse geocode to get street, city, state, postal code
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const streetParts = [
              data.name !== addr.city ? data.name : "",
              addr.road,
              addr.suburb || addr.neighbourhood,
            ].filter(Boolean);

            const street =
              streetParts.join(", ") ||
              data.display_name?.split(",")[0] ||
              "Current Location";
            const city =
              addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const postalCode = addr.postcode || "";

            const result: AddressSearchResult = {
              street,
              city,
              state,
              postalCode,
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              formattedAddress: data.display_name || `${lat}, ${lng}`,
            };

            setQuery(street || `${lat}, ${lng}`);
            setLastAutoFilled(data.display_name || `${lat}, ${lng}`);
            onAddressSelect(result);
            toast.success("Current GPS location and address auto-filled!");
          } else {
            // Still fill lat and lng
            onAddressSelect({
              street: "Current Location",
              city: "",
              state: "",
              postalCode: "",
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              formattedAddress: `${lat}, ${lng}`,
            });
            toast.success("GPS Coordinates retrieved!");
          }
        } catch (e) {
          toast.error("Failed to reverse-geocode current coordinates");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast.error(`Location detection failed: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasCoordinates =
    Boolean(currentLat) &&
    Boolean(currentLng) &&
    !isNaN(Number(currentLat)) &&
    !isNaN(Number(currentLng));

  const openGoogleMaps = () => {
    let url = "";
    if (hasCoordinates) {
      url = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;
    } else if (currentAddress) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        currentAddress
      )}`;
    } else {
      url = "https://www.google.com/maps";
    }
    window.open(url, "_blank");
  };

  const handleSaveApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("google_maps_api_key", customApiKey.trim());
      setShowKeyConfig(false);
      toast.success("Google Maps API Key saved! Refreshing places...");
      window.location.reload();
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Top Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input Container */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search location or nursery address on Google Maps (e.g. Vaishali Nagar Jaipur)..."
            className="w-full pl-10 pr-20 py-2.5 text-sm rounded-xl border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 text-foreground placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 focus:outline-hidden transition-all shadow-2xs"
          />

          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                googleMapsReady
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
              }`}
              title={
                googleMapsReady
                  ? "Powered by Google Maps Places API"
                  : "Live High-Precision Geocoding Active"
              }
            >
              <Sparkles className="w-3 h-3" />
              {googleMapsReady ? "Google Maps" : "Live Search"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Auto-detect current GPS coordinates & address"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Current GPS</span>
          </button>

          {/* View on Google Maps Button */}
          <button
            type="button"
            onClick={openGoogleMaps}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
            title="Open coordinates or address in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>View Maps</span>
          </button>

          {/* Optional Google API Key Config Toggle */}
          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showKeyConfig || customApiKey
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                : "border-border bg-background hover:bg-muted text-muted-foreground"
            }`}
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Google Maps API Key Config Box */}
      {showKeyConfig && (
        <div className="p-3 bg-muted/60 border border-border rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              Google Maps API Key (Optional)
            </span>
            <button
              type="button"
              onClick={() => setShowKeyConfig(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-muted-foreground text-[11px]">
            If provided, Google Places Autocomplete dropdown will be loaded directly from Google. Otherwise, high-precision live geocoding works automatically with zero key required.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Auto-filled notification banner */}
      {lastAutoFilled && (
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              <strong>Auto-filled:</strong> {lastAutoFilled}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLastAutoFilled(null)}
            className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Geocoding Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && !googleMapsReady && (
        <div
          ref={dropdownRef}
          className="relative z-50 w-full"
        >
          <div className="absolute top-1 left-0 right-0 bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground flex items-center justify-between">
              <span>LOCATION SEARCH RESULTS</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Click any result to auto-fill all fields
              </span>
            </div>
            {suggestions.map((item, idx) => {
              const addr = item.address || {};
              const mainTitle =
                item.name ||
                addr.road ||
                addr.suburb ||
                item.display_name.split(",")[0];
              const subTitle = [
                addr.suburb,
                addr.city || addr.town || addr.village,
                addr.state,
                addr.postcode,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={item.place_id || idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-500/10 border-b border-border/40 last:border-0 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-foreground truncate group-hover:text-emerald-600 transition-colors">
                      {mainTitle}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {subTitle || item.display_name}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-2 mt-0.5">
                      <span>Lat: {parseFloat(item.lat).toFixed(4)}</span>
                      <span>Lng: {parseFloat(item.lon).toFixed(4)}</span>
                      {addr.postcode && (
                        <span className="bg-muted px-1.5 py-0.2 rounded font-semibold text-foreground">
                          PIN: {addr.postcode}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
