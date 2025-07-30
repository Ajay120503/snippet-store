import { useEffect, useState } from "react";
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
    const fetchSnippets = async () => {
      try {
        const data = await getSnippets();
        setSnippets(data);
        setFiltered(data);
      } catch (error) {
        console.error("Failed to fetch snippets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteSnippet(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      setFiltered((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 space-y-6">
      {/* 🔍 Search input */}
      <div className="">
        <SearchBar snippets={snippets} onFilter={setFiltered} />
      </div>

      {/* 🔁 Content */}
      <div>
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Loading snippets...</p>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((snippet) => (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                isAdmin={!!admin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No snippets found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
