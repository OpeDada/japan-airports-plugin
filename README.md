# Japan Airports Plugin

A Re:Earth Visualizer plugin that displays Japan's airports on a 3D map, grouped by prefecture. Users can select an airport to fly the camera to its location and read or post comments via the Re:Earth CMS API.

## Features

- Lists all airports in Japan grouped by prefecture
- Clicking an airport flies the map camera to its location
- Displays comments for each airport (fetched from Re:Earth CMS)
- Allows users to post new comments on any airport

## Tech Stack

- **React 19.1.0** with **TypeScript 5.7.2**
- **Vite 6.0.3** for build tooling
- **TailwindCSS 4.1.10** for styling
- **Radix UI** components with **ShadCN/UI**
- **Re:Earth CMS Integration API** for airport data and comments

## CMS API Usage

All data is fetched from the Re:Earth CMS internal API using Bearer token authentication.

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| GET | `/items` | Fetch all airports (paginated) |
| GET | `/items/{id}/comments` | Fetch comments for an airport |
| POST | `/items/{id}/comments` | Post a new comment on an airport |

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_CMS_API_URL=https://api.cms.reearth.io/api
VITE_CMS_WORKSPACE_ID=your_workspace_id
VITE_CMS_PROJECT_ID=your_project_id
VITE_CMS_MODEL_ID=your_model_id
VITE_CMS_TOKEN=your_integration_token
```

All IDs should be the internal ULIDs found in your CMS dashboard URL, not slugs.

## Plugin Structure

```
src/
├── extensions/
│   └── airports/
│       ├── airports.ts       # Extension script — handles camera and map markers
│       └── main/
│           ├── App.tsx       # UI component
│           ├── hooks.ts      # Data fetching and state management
│           ├── main.tsx
│           └── index.html
└── shared/
    ├── components/ui/        # ShadCN UI components
    ├── reearthTypes/         # Re:Earth API type definitions
    └── utils.ts
```

## Scripts

```zsh
yarn dev:airports:main    # Start development server for the UI
yarn build:airports       # Build the airports extension
yarn build                # Build everything and generate zip
yarn preview              # Preview built app on port 5005
```

## Development Workflow

1. Run Re:Earth Visualizer locally
2. Run `yarn dev-build` — starts the dev server, watches for changes, and serves the built plugin at `http://localhost:5005`
3. Set `REEARTH_WEB_DEV_PLUGIN_URLS='["http://localhost:5005"]'` in your Re:Earth Visualizer environment
4. Use **Install Dev Plugins** in the Re:Earth editor to install the plugin
5. After any code change, click **Reload Dev Plugin Extensions** to reload without a full page refresh
