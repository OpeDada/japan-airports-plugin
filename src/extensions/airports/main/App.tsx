import useHooks from "./hooks";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

function App() {
  const {
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
  } = useHooks();

  if (loading) return <p className="p-4 text-sm">Loading airports...</p>;
  if (error) return <p className="p-4 text-sm text-red-500">{error}</p>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Japan Airports</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2 overflow-y-auto max-h-[80vh]">
        <div className="space-y-1 border rounded p-2">
          <p className="text-xs font-semibold text-gray-500">Add Airport</p>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Prefecture"
            value={form.prefecture}
            onChange={(e) => setForm((f) => ({ ...f, prefecture: e.target.value }))}
            className="w-full text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex gap-1">
            <input
              type="number"
              placeholder="Latitude"
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              className="flex-1 text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              className="flex-1 text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <Button
            size="sm"
            className="w-full"
            disabled={adding || !form.name.trim() || !form.prefecture.trim() || !form.latitude || !form.longitude}
            onClick={handleAddAirport}
          >
            {adding ? "Adding..." : "Add Airport"}
          </Button>
        </div>

        {Object.keys(grouped)
          .sort()
          .map((prefecture) => (
            <div key={prefecture}>
              <Button
                variant="ghost"
                className="w-full justify-start font-semibold"
                onClick={() => handleSelectPrefecture(prefecture)}
              >
                {selectedPrefecture === prefecture ? "▼" : "▶"} {prefecture}
              </Button>

              {selectedPrefecture === prefecture && (
                <div className="ml-4 space-y-1">
                  {grouped[prefecture].map((airport) => (
                    <Button
                      key={airport.id}
                      variant={selectedAirport?.id === airport.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm font-normal"
                      onClick={() => handleSelectAirport(airport)}
                    >
                      ✈ {airport.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export default App;
