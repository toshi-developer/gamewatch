"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapConfig, Player, MapBlip } from "@/lib/providers/types";
import { Card } from "../card";

function buildCRS(config: MapConfig): L.CRS {
  if (config.crs.type === "simple") {
    return L.CRS.Simple;
  }

  if (config.crs.type === "transformation") {
    const [a, b, c, d] = config.crs.params;
    return L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(a, b, c, d),
    });
  }

  if (config.crs.type === "sdtd") {
    const maxZoom = config.crs.maxZoom;
    const SDTD_Projection: L.Projection = {
      project(latlng: L.LatLng): L.Point {
        return new L.Point(
          latlng.lat / Math.pow(2, maxZoom),
          latlng.lng / Math.pow(2, maxZoom),
        );
      },
      unproject(point: L.Point): L.LatLng {
        return new L.LatLng(
          point.x * Math.pow(2, maxZoom),
          point.y * Math.pow(2, maxZoom),
        );
      },
      bounds: L.bounds([-1, -1], [1, 1]),
    };
    return L.extend({}, L.CRS.Simple, {
      projection: SDTD_Projection,
      transformation: new L.Transformation(1, 0, -1, 0),
      scale(zoom: number) {
        return Math.pow(2, zoom);
      },
    });
  }

  return L.CRS.Simple;
}

export function MapView({
  serverId,
  mapConfig,
}: {
  serverId: string;
  mapConfig: MapConfig;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const blipsLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const crs = buildCRS(mapConfig);
    const opts = mapConfig.tileOptions;

    const map = L.map(mapRef.current, {
      crs,
      zoomControl: true,
      attributionControl: false,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom + 1,
      zoomSnap: 1,
      zoomDelta: 1,
      preferCanvas: true,
    });

    map.setView(mapConfig.defaultCenter, mapConfig.defaultZoom);

    // Tile layer
    const tileLayer = L.tileLayer(mapConfig.tileUrl, {
      maxZoom: opts.maxZoom + 1,
      maxNativeZoom: opts.maxNativeZoom ?? opts.maxZoom,
      minNativeZoom: opts.minNativeZoom ?? opts.minZoom,
      minZoom: opts.minZoom,
      tileSize: opts.tileSize,
      noWrap: true,
      tms: opts.tms ?? false,
      errorTileUrl: "",
    });

    // Y-flip override for 7DTD-style maps
    if (opts.flipY) {
      const origGetTileUrl = tileLayer.getTileUrl.bind(tileLayer);
      tileLayer.getTileUrl = function (coords: L.Coords): string {
        const flipped = L.point(coords.x, -coords.y - 1) as unknown as L.Coords;
        (flipped as L.Coords).z = coords.z;
        return origGetTileUrl(flipped);
      };
    }

    tileLayer.addTo(map);

    blipsLayer.current = L.layerGroup().addTo(map);
    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    // Polling
    const playersUrl = `/api/servers/${serverId}/players-location`;
    const blipsUrl = `/api/servers/${serverId}/blips`;

    const fetchPlayers = async () => {
      try {
        const res = await fetch(playersUrl);
        if (!res.ok) return;
        const players: Player[] = await res.json();
        if (!markersLayer.current) return;
        markersLayer.current.clearLayers();
        players.forEach((p) => {
          if (!p.position) return;
          // 7DTD uses [position.x, position.z], FiveM uses [position.y, position.x]
          const latLng: L.LatLngExpression =
            mapConfig.crs.type === "sdtd"
              ? [p.position.x, p.position.z]
              : [p.position.y, p.position.x];
          const marker = L.circleMarker(latLng, {
            radius: 8,
            fillColor: "#f97316",
            color: "#fff",
            weight: 2,
            fillOpacity: 0.9,
          });
          marker.bindTooltip(p.name, {
            permanent: true,
            direction: "top",
            offset: [0, -8],
            className: "gw-player-tooltip",
          });
          markersLayer.current!.addLayer(marker);
        });
      } catch { /* silent */ }
    };

    const fetchBlips = async () => {
      try {
        const res = await fetch(blipsUrl);
        if (!res.ok) return;
        const blips: MapBlip[] = await res.json();
        if (!blipsLayer.current || blips.length === 0) return;
        blipsLayer.current.clearLayers();
        blips.forEach((b) => {
          const marker = L.circleMarker([b.y, b.x], {
            radius: b.radius ?? 4,
            fillColor: b.color,
            color: b.color,
            weight: 1,
            fillOpacity: 0.7,
            opacity: 0.9,
          });
          marker.bindTooltip(b.label, {
            direction: "top",
            offset: [0, -6],
            className: "gw-blip-tooltip",
          });
          blipsLayer.current!.addLayer(marker);
        });
      } catch { /* silent */ }
    };

    fetchPlayers();
    fetchBlips();
    const playerInterval = setInterval(fetchPlayers, 15000);
    const blipInterval = setInterval(fetchBlips, 60000);

    return () => {
      clearInterval(playerInterval);
      clearInterval(blipInterval);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [serverId, mapConfig]);

  return (
    <Card title="World Map">
      <div
        ref={mapRef}
        className="h-80 w-full rounded-lg sm:h-[28rem]"
        style={{ background: "#1a1a2e" }}
      />
      <style>{`
        .gw-player-tooltip {
          background: rgba(0,0,0,0.8);
          border: 1px solid #f97316;
          color: #fff;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .gw-player-tooltip::before { border-top-color: #f97316; }
        .gw-blip-tooltip {
          background: rgba(0,0,0,0.75);
          border: 1px solid #555;
          color: #ddd;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 3px;
        }
      `}</style>
    </Card>
  );
}
