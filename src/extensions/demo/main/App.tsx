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
    loading,
    error,
    handleSelectPrefecture,
    handleSelectAirport,
  } = useHooks();

  if (loading) return <p className="p-4 text-sm">Loading airports...</p>;
  if (error) return <p className="p-4 text-sm text-red-500">{error}</p>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Japan Airports</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-1 overflow-y-auto max-h-[80vh]">
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
                      variant="ghost"
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
