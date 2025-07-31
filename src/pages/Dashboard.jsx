import { useEffect, useState } from "react";
import {
  getSnippets,
  deleteSnippet,
  updateSnippet,
} from "../services/api";
import SnippetCard from "../components/SnippetCard";
import AddSnippetModal from "../components/AddSnippetModal";
import SearchBar from "../components/SearchBar";
import { ExpandIcon, Grid2X2Check, Plus } from "lucide-react";

const ITEMS_PER_PAGE = 6;

const Dashboard = () => {
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSnippets = async () => {
    const data = await getSnippets();
    setSnippets(data);
    setFilteredSnippets(data);
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Delete this snippet?")) {
      await deleteSnippet(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      setFilteredSnippets((prev) => prev.filter((s) => s._id !== id));
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

  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    if (sortBy === "createdAt")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "language")
      return a.language.localeCompare(b.language);
    return 0;
  });

  const totalPages = Math.ceil(sortedSnippets.length / ITEMS_PER_PAGE);
  const paginated = sortedSnippets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-24 space-y-6 thin-scrollbar auto-hide-scrollbar">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Dashboard
        </h1>
        <button
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
          onFilter={(result) => {
            setFilteredSnippets(result);
            setPage(1);
          }}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">View:</label>
          <div className="flex gap-1">
            <button
              className={`btn btn-xs sm:btn-sm btn-circle ${view === "grid" ? "btn-primary" : "btn-ghost"
                }`}
              onClick={() => setView("grid")}
            >
              <Grid2X2Check size={16} />
            </button>
            <button
              className={`btn btn-xs sm:btn-sm btn-circle ${view === "list" ? "btn-primary" : "btn-ghost"
                }`}
              onClick={() => setView("list")}
            >
              <ExpandIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Snippet List */}
      {paginated.length ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {paginated.map((snippet) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="join flex flex-wrap justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`join-item btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-outline"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
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
