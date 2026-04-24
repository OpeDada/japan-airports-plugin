import { useCallback, useEffect, useState } from "react";

import { postMsg } from "@/shared/utils";

type Airport = {
  id: string;
  name: string;
  prefecture: string;
  latitude: number;
  longitude: number;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
};

type GroupedAirports = Record<string, Airport[]>;

const API_URL = import.meta.env.VITE_CMS_API_URL;
const WORKSPACE_ID = import.meta.env.VITE_CMS_WORKSPACE_ID;
const PROJECT_ID = import.meta.env.VITE_CMS_PROJECT_ID;
const MODEL_ID = import.meta.env.VITE_CMS_MODEL_ID;
const TOKEN = import.meta.env.VITE_CMS_TOKEN;

const ITEMS_URL = `${API_URL}/${WORKSPACE_ID}/projects/${PROJECT_ID}/models/${MODEL_ID}/items`;

type RawItem = {
  id: string;
  fields: { key: string; value: unknown }[];
};

function toAirport(item: RawItem): Airport {
  const f: Record<string, unknown> = {};
  for (const field of item.fields) f[field.key] = field.value;
  return {
    id: item.id,
    name: f.name as string,
    prefecture: f.prefecture as string,
    latitude: f.latitude as number,
    longitude: f.longitude as number,
  };
}

export default () => {
  const [grouped, setGrouped] = useState<GroupedAirports>({});
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const allItems: RawItem[] = [];
        let page = 1;
        while (true) {
          const res = await fetch(`${ITEMS_URL}?page=${page}&perPage=100`, {
            headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
          }
          const data = await res.json();
          allItems.push(...(data.items as RawItem[]));
          if (allItems.length >= data.totalCount) break;
          page++;
        }
        const items: Airport[] = allItems.map(toAirport);

        const groups: GroupedAirports = {};
        for (const item of items) {
          if (!groups[item.prefecture]) groups[item.prefecture] = [];
          groups[item.prefecture].push(item);
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

  const fetchComments = useCallback(async (airportId: string) => {
    setLoadingComments(true);
    setComments([]);
    try {
      const res = await fetch(`${ITEMS_URL}/${airportId}/comments`, {
        headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const handleSelectPrefecture = useCallback((prefecture: string) => {
    setSelectedPrefecture((prev) => (prev === prefecture ? null : prefecture));
    setSelectedAirport(null);
    setComments([]);
  }, []);

  const handleSelectAirport = useCallback(
    (airport: Airport) => {
      setSelectedAirport(airport);
      postMsg("flyToAirport", {
        latitude: airport.latitude,
        longitude: airport.longitude,
      });
      fetchComments(airport.id);
    },
    [fetchComments],
  );

  const handlePostComment = useCallback(async () => {
    if (!selectedAirport || !newComment.trim()) return;
    setPostingComment(true);
    setCommentError(null);
    try {
      const res = await fetch(`${ITEMS_URL}/${selectedAirport.id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      setNewComment("");
      await fetchComments(selectedAirport.id);
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  }, [selectedAirport, newComment, fetchComments]);

  return {
    grouped,
    selectedPrefecture,
    selectedAirport,
    comments,
    newComment,
    loadingComments,
    postingComment,
    commentError,
    loading,
    error,
    setNewComment,
    handleSelectPrefecture,
    handleSelectAirport,
    handlePostComment,
  };
};
