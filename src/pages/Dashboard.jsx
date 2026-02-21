import { useEffect, useMemo, useState } from "react";
import { getSnippets, deleteSnippet, updateSnippet } from "../services/api";
import SnippetCard from "../components/SnippetCard";
import AddSnippetModal from "../components/AddSnippetModal";
import SearchBar from "../components/SearchBar";
import { ExpandIcon, Grid2X2Check } from "lucide-react";

const Dashboard = () => {
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [sortBy] = useState("createdAt");
  const [view, setView] = useState("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const data = await getSnippets();
      setSnippets(data);
      setFilteredSnippets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this snippet?")) return;

    try {
      await deleteSnippet(id);

      setSnippets((prev) => prev.filter((s) => s._id !== id));
      setFilteredSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const handleSave = async (updatedSnippet) => {
    const res = await updateSnippet(updatedSnippet._id, updatedSnippet);

    setSnippets((prev) =>
      prev.map((s) => (s._id === updatedSnippet._id ? res : s))
    );

    setFilteredSnippets((prev) =>
      prev.map((s) => (s._id === updatedSnippet._id ? res : s))
    );
  };

  const sortedSnippets = useMemo(() => {
    return [...filteredSnippets].sort((a, b) => {
      if (sortBy === "createdAt")
        return new Date(b.createdAt) - new Date(a.createdAt);

      if (sortBy === "language") return a.language.localeCompare(b.language);

      return 0;
    });
  }, [filteredSnippets, sortBy]);

  return (
    <div className="container mx-auto px-4 py-24 space-y-6 thin-scrollbar auto-hide-scrollbar">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>

        <button
          aria-label="Add Snippet"
          className="btn btn-sm btn-outline"
          onClick={() => setShowAddModal(true)}
        >
          Add Snippet
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchBar
          snippets={snippets}
          onFilter={(result) => setFilteredSnippets(result)}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">View:</label>

          <div className="flex gap-1">
            <button
              className={`btn btn-xs sm:btn-sm btn-circle ${
                view === "grid" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setView("grid")}
            >
              <Grid2X2Check size={16} />
            </button>

            <button
              className={`btn btn-xs sm:btn-sm btn-circle ${
                view === "list" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setView("list")}
            >
              <ExpandIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Snippet List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading snippets...</p>
      ) : sortedSnippets.length ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {sortedSnippets.map((snippet) => (
            <SnippetCard
              key={snippet._id}
              snippet={snippet}
              isDashboard={true}
              layout={view}
              onDelete={handleDelete}
              onSave={handleSave}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No snippets found.</p>
      )}

      {/* Modal */}
      {showAddModal && (
        <AddSnippetModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSnippets}
        />
      )}
    </div>
  );
};

export default Dashboard;
