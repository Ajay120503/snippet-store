import { useCallback, useEffect, useMemo, useState } from "react";
import { getSnippets, deleteSnippet } from "../services/api.js";
import SnippetCard from "../components/SnippetCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const [snippets, setSnippets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const { admin } = useAuth();

  /* ================= FETCH SNIPPETS ================= */
 useEffect(() => {
  let timer;

  const fetchSnippets = async () => {
    setLoading(true);

    // show skeleton only if loading > 150ms
    timer = setTimeout(() => setShowSkeleton(true), 150);

    try {
      const data = await getSnippets();
      setSnippets(data);
      setFiltered(data);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setShowSkeleton(false);
    }
  };

  fetchSnippets();

  return () => clearTimeout(timer);
}, []);

  /* ================= DELETE SNIPPET ================= */
  const handleDelete = useCallback(async (id) => {
    // optimistic UI update
    setSnippets((prev) => {
      const updated = prev.filter((s) => s._id !== id);
      setFiltered(updated);
      return updated;
    });

    try {
      await deleteSnippet(id);
    } catch (err) {
      console.error("Delete failed:", err);

      // refetch fallback (safer rollback)
      const data = await getSnippets();
      setSnippets(data);
      setFiltered(data);
    }
  }, []);

  /* ================= MEMOIZED CARDS ================= */
  const snippetList = useMemo(() => {
    return filtered.map((snippet) => (
      <SnippetCard
        key={snippet._id}
        snippet={snippet}
        isAdmin={!!admin}
        onDelete={handleDelete}
      />
    ));
  }, [filtered, admin, handleDelete]);

  /* ================= LOADING SKELETON ================= */
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-60 rounded-2xl bg-base-200 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 pt-24 pb-10 space-y-8">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Code Snippets
        </h1>

        <div className="w-full sm:w-96">
          <SearchBar snippets={snippets} onFilter={setFiltered} />
        </div>
      </div>

      {/* ===== Content ===== */}
      {showSkeleton ? (
        <SkeletonGrid />
      ) : filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippetList}
        </div>
      ) : (
        <div className="text-center py-16 space-y-2">
          <p className="text-lg text-gray-400">No snippets found</p>
          <p className="text-sm text-gray-500">
            Try searching with a different keyword.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
