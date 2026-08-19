"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Compass,
  Globe,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge, EmptyState, Panel, Spinner, fmtNum } from "@/components/admin/ui";
import type { GeoAnalytics, GeoCell } from "@/lib/adminApi";
import "leaflet/dist/leaflet.css";

interface UserLocationMapProps {
  data?: GeoAnalytics | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Approximate Tanzania & East Africa region resolver from coordinates
function guessRegionName(lat: number, lng: number): string {
  // Tanzania bounds roughly: lat -1 to -12, lng 29 to 41
  if (lat >= -7.2 && lat <= -6.6 && lng >= 39.0 && lng <= 39.6) return "Dar es Salaam & Coast";
  if (lat >= -3.6 && lat <= -3.1 && lng >= 36.4 && lng <= 37.0) return "Arusha & Meru Region";
  if (lat >= -3.5 && lat <= -3.0 && lng >= 37.1 && lng <= 37.8) return "Kilimanjaro / Moshi";
  if (lat >= -6.4 && lat <= -5.8 && lng >= 35.4 && lng <= 36.1) return "Dodoma Central";
  if (lat >= -2.8 && lat <= -2.2 && lng >= 32.6 && lng <= 33.2) return "Mwanza / Lake Zone";
  if (lat >= -9.2 && lat <= -8.6 && lng >= 33.2 && lng <= 33.7) return "Mbeya / Southern Highlands";
  if (lat >= -8.0 && lat <= -7.5 && lng >= 35.5 && lng <= 36.0) return "Iringa Region";
  if (lat >= -5.3 && lat <= -4.8 && lng >= 38.8 && lng <= 39.3) return "Tanga Region";
  if (lat >= -5.2 && lat <= -4.7 && lng >= 29.4 && lng <= 30.0) return "Kigoma Region";
  if (lat >= -1.5 && lat <= -1.0 && lng >= 31.6 && lng <= 32.0) return "Kagera / Bukoba";
  if (lat >= -11.0 && lat <= -10.0 && lng >= 35.0 && lng <= 36.0) return "Ruvuma / Songea";
  if (lat >= -10.5 && lat <= -10.0 && lng >= 39.8 && lng <= 40.3) return "Mtwara Coast";
  if (lat >= -12.0 && lat <= -1.0 && lng >= 29.0 && lng <= 41.0) return "Tanzania Region";
  if (lat >= -5.0 && lat <= 5.0 && lng >= 33.0 && lng <= 42.0) return "East Africa Region";
  return `Geo Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
}

export function UserLocationMap({
  data,
  loading = false,
  error = null,
  onRetry,
}: UserLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCell, setSelectedCell] = useState<GeoCell | null>(null);
  const [mapStyle, setMapStyle] = useState<"osm" | "voyager">("voyager");

  const cells = useMemo(() => {
    const rawCells = data?.cells ?? [];
    return rawCells
      .map((c) => {
        let lat = c.lat;
        let lng = c.lng;
        if (lat === undefined || lng === undefined) {
          const parts = c.cell.split(",");
          lat = Number(parts[0]);
          lng = Number(parts[1]);
        }
        return {
          ...c,
          lat,
          lng,
          region: guessRegionName(lat, lng),
        };
      })
      .filter((c) => !isNaN(c.lat) && !isNaN(c.lng));
  }, [data]);

  const totalSessions = useMemo(() => {
    return cells.reduce((sum, c) => sum + c.count, 0);
  }, [cells]);

  const filteredCells = useMemo(() => {
    if (!searchTerm.trim()) return cells;
    const term = searchTerm.toLowerCase().trim();
    return cells.filter(
      (c) =>
        c.cell.toLowerCase().includes(term) ||
        (c.region && c.region.toLowerCase().includes(term)),
    );
  }, [cells, searchTerm]);

  // Initialize and update Leaflet OpenStreetMap
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import leaflet to prevent SSR issues
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous map instance if any
      if (!mapInstanceRef.current) {
        // Default center on Tanzania
        const map = L.map(mapContainerRef.current, {
          center: [-6.369028, 34.888822],
          zoom: 6,
          zoomControl: true,
          attributionControl: true,
        });

        const tileUrl =
          mapStyle === "voyager"
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

        L.tileLayer(tileUrl, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        markersLayerRef.current = markersLayer;
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      if (!map || !markersLayer) return;

      // Clear existing markers
      markersLayer.clearLayers();

      const maxCount = cells.length > 0 ? Math.max(...cells.map((c) => c.count)) : 1;
      const bounds = L.latLngBounds([]);

      cells.forEach((c) => {
        const radius = Math.min(32, Math.max(9, Math.round((c.count / maxCount) * 26) + 7));
        const pct = totalSessions > 0 ? ((c.count / totalSessions) * 100).toFixed(1) : "0";

        // Circle marker for user heat concentration
        const circle = L.circleMarker([c.lat, c.lng], {
          radius,
          fillColor: c.count > 10 ? "#4f9405" : "#0ea5e9",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        });

        circle.bindTooltip(
          `<strong>${c.region || "User Location"}</strong><br/>${fmtNum(c.count)} session${
            c.count > 1 ? "s" : ""
          } (${pct}%)`,
          { direction: "top", offset: [0, -radius] },
        );

        circle.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
              📍 ${c.region || "Active User Region"}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              Coordinates: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}
            </div>
            <div style="display: flex; gap: 8px; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <div><strong>${fmtNum(c.count)}</strong> sessions</div>
              <div style="color: #4f9405; font-weight: bold;">${pct}% of total</div>
            </div>
          </div>
        `);

        circle.on("click", () => {
          setSelectedCell(c);
        });

        markersLayer.addLayer(circle);
        bounds.extend([c.lat, c.lng]);
      });

      if (cells.length > 0 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cells, totalSessions, mapStyle]);

  const flyToLocation = (c: GeoCell) => {
    setSelectedCell(c);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([c.lat, c.lng], 11, {
        duration: 1.2,
      });
    }
  };

  const resetView = () => {
    setSelectedCell(null);
    if (mapInstanceRef.current) {
      if (cells.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        import("leaflet").then((L: any) => {
          const bounds = L.latLngBounds(cells.map((c) => [c.lat, c.lng]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
        });
      } else {
        mapInstanceRef.current.setView([-6.369028, 34.888822], 6);
      }
    }
  };

  return (
    <Panel
      title="User Geolocation & Audience Map (Open Source)"
      action={
        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMapStyle("voyager")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                mapStyle === "voyager"
                  ? "bg-white text-forest-moss-700 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Clean Style
            </button>
            <button
              type="button"
              onClick={() => setMapStyle("osm")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                mapStyle === "osm"
                  ? "bg-white text-forest-moss-700 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              OSM Standard
            </button>
          </div>

          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
            title="Reset Map View"
          >
            <Compass className="h-3.5 w-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>
      }
    >
      {loading ? (
        <Spinner label="Loading geolocation data & map…" />
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary Metric Pills */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Geocoded Sessions
              </p>
              <p className="mt-0.5 text-lg font-bold text-forest-moss-700 tabular-nums">
                {fmtNum(data?.sessionsWithLocation ?? totalSessions)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Unique Regions / Hotspots
              </p>
              <p className="mt-0.5 text-lg font-bold text-zinc-900 tabular-nums">
                {fmtNum(cells.length)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Top User Hub
              </p>
              <p className="mt-0.5 truncate text-lg font-bold text-teal-700" title={cells[0]?.region}>
                {cells[0]?.region ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Peak Concentration
              </p>
              <p className="mt-0.5 text-lg font-bold text-amber-700 tabular-nums">
                {cells[0] ? `${fmtNum(cells[0].count)} users` : "—"}
              </p>
            </div>
          </div>

          {/* Map + Sidebar Layout */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* 1. Open Source Leaflet Map Container */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-2xs lg:col-span-2 min-h-[380px] sm:min-h-[440px]">
              <div
                ref={mapContainerRef}
                className="h-full w-full min-h-[380px] sm:min-h-[440px] z-0"
              />

              {/* Map Floating Overlay Badge */}
              <div className="absolute bottom-3 left-3 z-1000 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-xs">
                <span className="flex h-2.5 w-2.5 rounded-full bg-forest-moss-500 animate-ping" />
                <span>Live OpenStreetMap Feed</span>
              </div>
            </div>

            {/* 2. Top Locations Ranked Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-forest-moss-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Top User Locations
                  </h4>
                </div>
                <span className="text-[11px] text-zinc-400">{cells.length} recorded</span>
              </div>

              {/* Search filter for locations */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter region or coords…"
                  aria-label="Filter user locations"
                  className="h-8 w-full rounded-lg border border-zinc-200 bg-white py-1 pl-8 pr-3 text-xs outline-none focus:border-forest-moss-500 focus:ring-1 focus:ring-forest-moss-500"
                />
              </div>

              {/* Locations List */}
              <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1">
                {filteredCells.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    {cells.length === 0
                      ? "No user location data recorded yet."
                      : "No locations match your filter."}
                  </div>
                ) : (
                  filteredCells.map((c, idx) => {
                    const isSelected = selectedCell?.cell === c.cell;
                    const pct = totalSessions > 0 ? ((c.count / totalSessions) * 100).toFixed(1) : "0";

                    return (
                      <div
                        key={c.cell}
                        onClick={() => flyToLocation(c)}
                        className={`group flex items-center justify-between gap-2 rounded-xl border p-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-forest-moss-500 bg-forest-moss-50/70 shadow-xs ring-2 ring-forest-moss-200"
                            : "border-zinc-200/80 bg-white hover:border-forest-moss-300 hover:bg-zinc-50"
                        }`}
                      >
                        {/* Serial Number & Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
                              idx === 0
                                ? "bg-amber-100 text-amber-800"
                                : idx === 1
                                ? "bg-slate-200 text-slate-700"
                                : idx === 2
                                ? "bg-amber-700/15 text-amber-900"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {idx + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-zinc-900 group-hover:text-forest-moss-700 transition-colors">
                              {c.region}
                            </p>
                            <p className="truncate text-[10px] text-zinc-400">
                              {c.lat.toFixed(3)}, {c.lng.toFixed(3)}
                            </p>
                          </div>
                        </div>

                        {/* Counts & Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-bold text-zinc-900 tabular-nums">
                              {fmtNum(c.count)}
                            </p>
                            <p className="text-[10px] font-semibold text-forest-moss-700 tabular-nums">
                              {pct}%
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              flyToLocation(c);
                            }}
                            title="Fly to pin on map"
                            aria-label={`Fly to ${c.region} on map`}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-forest-moss-100 hover:text-forest-moss-700 transition-colors"
                          >
                            <Navigation className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
