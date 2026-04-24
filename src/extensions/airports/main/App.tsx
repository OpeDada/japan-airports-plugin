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
  } = useHooks();

  if (loading) return <p className="p-4 text-sm">Loading airports...</p>;
  if (error) return <p className="p-4 text-sm text-red-500">{error}</p>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Japan Airports</CardTitle>
        <p className="text-xs text-gray-400">
          Select a prefecture to explore airports. Click an airport to fly to it
          and view or add comments.
        </p>
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
                    <div key={airport.id}>
                      <Button
                        variant={
                          selectedAirport?.id === airport.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full justify-start text-sm font-normal"
                        onClick={() => handleSelectAirport(airport)}
                      >
                        ✈ {airport.name}
                      </Button>

                      {selectedAirport?.id === airport.id && (
                        <div className="ml-2 mt-1 mb-2 border-l-2 pl-2 space-y-2">
                          {loadingComments ? (
                            <p className="text-xs text-gray-400">
                              Loading comments...
                            </p>
                          ) : comments.length === 0 ? (
                            <p className="text-xs text-gray-400">
                              No comments yet
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {comments.map((c) => (
                                <div
                                  key={c.id}
                                  className="text-xs bg-gray-50 rounded p-2"
                                >
                                  <p className="text-gray-600">{c.content}</p>
                                  <p className="text-gray-400 mt-1">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {commentError && (
                            <p className="text-xs text-red-500">
                              {commentError}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handlePostComment()
                              }
                              placeholder="Add a comment..."
                              className="flex-1 text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <Button
                              size="sm"
                              onClick={handlePostComment}
                              disabled={postingComment || !newComment.trim()}
                            >
                              {postingComment ? "..." : "Post"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
