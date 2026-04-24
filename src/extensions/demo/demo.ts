import html from "@distui/demo/main/index.html?raw";

import { GlobalThis } from "@/shared/reearthTypes";

const reearth = (globalThis as unknown as GlobalThis).reearth;
reearth.ui.show(html);

reearth.extension.on("message", (message: unknown) => {
  const msg = message as { action: string; payload?: any };
  if (!msg || typeof msg !== "object" || !("action" in msg)) return;

  if (msg.action === "flyToAirport") {
    reearth.camera.lookAt(
      {
        lat: msg.payload.latitude,
        lng: msg.payload.longitude,
        height: 0,
        range: 1500,
        pitch: -0.5,
      },
      { duration: 2 },
    );
  }

  if (msg.action === "addMarkers") {
    const airports = msg.payload as {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
    }[];

    reearth.layers.add({
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "FeatureCollection",
          features: airports.map((a) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [a.longitude, a.latitude],
            },
            properties: { name: a.name },
          })),
        },
      },
      marker: {
        pointColor: "#4a90e2",
        pointSize: 12,
      },
    });
  }
});
