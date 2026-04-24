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

type NewAirportForm = {
  name: string;
  prefecture: string;
  latitude: string;
  longitude: string;
};

const CMS_BASE_URL = import.meta.env.VITE_CMS_BASE_URL;
const API_URL = CMS_BASE_URL.replace(/\/p\/[^/]+$/, "");
const WORKSPACE_ID = import.meta.env.VITE_CMS_WORKSPACE_ID;
const PROJECT_ID = import.meta.env.VITE_CMS_PROJECT_ID;
const PROJECT_ID_INTERNAL = import.meta.env.VITE_CMS_PROJECT_ID_INTERNAL;
const MODEL_ID = import.meta.env.VITE_CMS_MODEL_ID;
const MODEL_ID_INTERNAL = import.meta.env.VITE_CMS_MODEL_ID_INTERNAL;
const TOKEN = import.meta.env.VITE_CMS_TOKEN;

const ITEMS_URL = `${API_URL}/${WORKSPACE_ID}/projects/${PROJECT_ID_INTERNAL}/models/${MODEL_ID_INTERNAL}/items`;

export default () => {
  const [grouped, setGrouped] = useState<GroupedAirports>({});
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [form, setForm] = useState<NewAirportForm>({
    name: "",
    prefecture: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await fetch(`${CMS_BASE_URL}/${PROJECT_ID}/${MODEL_ID}`, {
          headers: { "X-Reearth-API-Key": TOKEN },
        });
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
    setSelectedAirport(null);
  }, []);

  const handleSelectAirport = useCallback((airport: Airport) => {
    setSelectedAirport(airport);
    postMsg("flyToAirport", {
      latitude: airport.latitude,
      longitude: airport.longitude,
    });
  }, []);

  const handleAddAirport = useCallback(async () => {
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!form.name.trim() || !form.prefecture.trim() || isNaN(lat) || isNaN(lng)) return;

    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch(ITEMS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: [
            { key: "name", type: "text", value: form.name.trim() },
            { key: "prefecture", type: "text", value: form.prefecture.trim() },
            { key: "latitude", type: "number", value: lat },
            { key: "longitude", type: "number", value: lng },
          ],
        }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const created: Airport = await res.json();
      setGrouped((prev) => {
        const updated = { ...prev };
        const pref = created.prefecture;
        if (!updated[pref]) updated[pref] = [];
        updated[pref] = [...updated[pref], created];
        return updated;
      });
      setForm({ name: "", prefecture: "", latitude: "", longitude: "" });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add airport");
    } finally {
      setAdding(false);
    }
  }, [form]);

  return {
    grouped,
    selectedPrefecture,
    selectedAirport,
    loading,
    error,
    adding,
    addError,
    form,
    setForm,
    handleSelectPrefecture,
    handleSelectAirport,
    handleAddAirport,
  };
};
