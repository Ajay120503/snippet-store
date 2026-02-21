import { useCallback, useEffect, useMemo, useState } from "react";
import { getSnippets, deleteSnippet } from "../services/api.js";
import SnippetCard from "../components/SnippetCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const [snippets, setSnippets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    const fetchSnippets = async () => {
      try {
        const data = await getSnippets({
          signal: controller.signal,
        });
        setSnippets(data);
        setFiltered(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch snippets:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();

    return () => controller.abort();
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const prev = snippets;

      setSnippets(prev.filter((s) => s._id !== id));

      try {
        await deleteSnippet(id);
      } catch (err) {
        setSnippets(prev);
        console.error("Delete failed:", err);
      }
    },
    [snippets]
  );

  const snippetList = useMemo(
    () =>
      filtered.map((snippet) => (
        <SnippetCard
          key={snippet._id}
          snippet={snippet}
          isAdmin={!!admin}
          onDelete={handleDelete}
        />
      )),
    [filtered, admin, handleDelete]
  );

  {
    loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-base-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 space-y-6">
      {/* 🔍 Search input */}
      <div className="">
        <SearchBar snippets={snippets} onFilter={setFiltered} />
      </div>

      {/* 🔁 Content */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-base-200 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippetList}
          </div>
        ) : (
          <p className="text-center text-gray-400">No snippets found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
