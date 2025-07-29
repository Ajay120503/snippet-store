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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-base-100 text-base-content rounded-2xl shadow-xl w-full max-w-3xl p-6 relative space-y-6 animate-fade-in">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-outline"
          onClick={onClose}
        >
          <X />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center sm:text-left">📝 Add New Snippet</h2>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title *"
            className="input input-bordered w-full"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <select
            className="select select-bordered w-full"
            value={formData.language}
            onChange={(e) => handleChange("language", e.target.value)}
          >
            <option disabled>Select Language *</option>
            {[
              "javascript", "typescript", "python", "java", "c", "cpp", "html", "css",
              "php", "bash", "go", "ruby",
            ].map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        {/* Tags */}
        <div>
          <label className="font-semibold block mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  className="input input-sm input-bordered"
                  placeholder="Tag"
                  value={tag}
                  onChange={(e) => handleTagChange(idx, e.target.value)}
                />
                <button
                  className="btn btn-xs btn-circle btn-error text-white"
                  onClick={() => handleRemoveTag(idx)}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="btn btn-sm btn-outline" onClick={handleAddTag}>
              + Add Tag
            </button>
          </div>
        </div>

        {/* Code Input */}
        <div>
          <label className="font-semibold block mb-2">Code *</label>
          <textarea
            className="textarea textarea-bordered w-full font-mono"
            rows={5}
            placeholder="Paste or type your code here"
            value={formData.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            className={`btn btn-success px-6 rounded-full ${
              loading ? "btn-disabled" : ""
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddSnippetModal;
