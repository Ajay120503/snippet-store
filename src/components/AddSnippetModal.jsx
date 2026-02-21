import { useState } from "react";
import { createPortal } from "react-dom";
import { createSnippet } from "../services/api";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AddSnippetModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [""],
    language: "javascript",
    code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (idx, value) => {
    const newTags = [...formData.tags];
    newTags[idx] = value;
    handleChange("tags", newTags);
  };

  const handleAddTag = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }));
  };

  const handleRemoveTag = (idx) => {
    const newTags = formData.tags.filter((_, i) => i !== idx);
    handleChange("tags", newTags);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.language || !formData.code) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      await createSnippet(formData);
      toast.success("Snippet saved successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save snippet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      {/* Modal Container */}
      <div
        className="
      w-full h-full sm:h-auto
      sm:max-w-4xl
      bg-base-100 text-base-content
      sm:rounded-2xl
      shadow-2xl
      flex flex-col
      overflow-hidden
      animate-fade-in
    "
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 bg-base-300 sticky top-0 z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Add New Snippet
          </h2>

          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title + Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Snippet Title *"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />

            <select
              className="select select-bordered w-full"
              value={formData.language}
              onChange={(e) => handleChange("language", e.target.value)}
            >
              {[
                "javascript",
                "typescript",
                "python",
                "java",
                "c",
                "cpp",
                "html",
                "css",
                "php",
                "bash",
                "go",
                "ruby",
              ].map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label font-medium">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Explain what this snippet does..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="label font-medium">Tags</label>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-lg"
                >
                  <input
                    className="bg-transparent outline-none text-sm w-20"
                    placeholder="tag"
                    value={tag}
                    onChange={(e) => handleTagChange(idx, e.target.value)}
                  />

                  <button
                    className="text-error font-bold"
                    onClick={() => handleRemoveTag(idx)}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              <button className="btn btn-sm btn-outline" onClick={handleAddTag}>
                + Tag
              </button>
            </div>
          </div>

          {/* Code Area */}
          <div>
            <label className="label font-medium">Code *</label>

            <textarea
              className="
              textarea textarea-bordered
              w-full
              font-mono text-sm
              h-64
              resize-none
              bg-base-200
            "
              placeholder="Paste or type your code here..."
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 flex justify-end gap-3 bg-base-300 sticky bottom-0">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-success px-6"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </span>
            ) : (
              "Save Snippet"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddSnippetModal;
