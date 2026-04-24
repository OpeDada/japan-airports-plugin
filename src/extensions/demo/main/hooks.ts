import { useCallback, useEffect, useState } from "react";

import { postMsg } from "@/shared/utils";

type Airport = {
  id: string;
  name: string;
  prefecture: string;
  latitude: number;
  longitude: number;
};

type GroupedAirports = Record<string, Airport[]>;

const CMS_BASE_URL = import.meta.env.VITE_CMS_BASE_URL;
const PROJECT_ID = import.meta.env.VITE_CMS_PROJECT_ID;
const MODEL_ID = import.meta.env.VITE_CMS_MODEL_ID;
const TOKEN = import.meta.env.VITE_CMS_TOKEN;

export default () => {
  const [grouped, setGrouped] = useState<GroupedAirports>({});
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await fetch(
          `${CMS_BASE_URL}/${PROJECT_ID}/${MODEL_ID}`,
          {
            headers: {
              "X-Reearth-API-Key": TOKEN,
            },
          },
        );

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        const items: Airport[] = data.results ?? [];

        const groups: GroupedAirports = {};
        for (const item of items) {
          const prefecture = item.prefecture;
          if (!groups[prefecture]) groups[prefecture] = [];
          groups[prefecture].push(item);
        }

        setGrouped(groups);
        postMsg("addMarkers", items);
      } catch (err) {
        setError("Failed to load airports");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAirports();
  }, []);

  const handleSelectPrefecture = useCallback((prefecture: string) => {
    setSelectedPrefecture((prev) => (prev === prefecture ? null : prefecture));
  }, []);

  const handleSelectAirport = useCallback((airport: Airport) => {
    postMsg("flyToAirport", {
      latitude: airport.latitude,
      longitude: airport.longitude,
    });
  }, []);

  return {
    grouped,
    selectedPrefecture,
    loading,
    error,
    handleSelectPrefecture,
    handleSelectAirport,
  };
};
