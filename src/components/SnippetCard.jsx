import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ChevronDown, ChevronUp, ClipboardCopy, Eye, HashIcon,
  Pencil, Save, X, Trash2
} from "lucide-react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { updateSnippet, deleteSnippet } from "../services/api.js";
import toast from "react-hot-toast";

const TAG_COLORS = [ "badge-primary", "badge-secondary", "badge-accent", "badge-info", "badge-success", "badge-warning", "badge-error" ];

const LANGUAGE_ICONS = {
  javascript: "devicon-javascript-plain", python: "devicon-python-plain", html: "devicon-html5-plain",
  css: "devicon-css3-plain", java: "devicon-java-plain", c: "devicon-c-plain",
  cpp: "devicon-cplusplus-plain", typescript: "devicon-typescript-plain",
  nodejs: "devicon-nodejs-plain", react: "devicon-react-original",
  php: "devicon-php-plain", bash: "devicon-bash-plain",
  go: "devicon-go-plain", ruby: "devicon-ruby-plain"
};

const SnippetCard = ({ snippet, isAdmin = true, isDashboard = true, onUpdate }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...snippet });

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDescription(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (idx, value) => {
    const updatedTags = [...formData.tags];
    updatedTags[idx] = value;
    handleChange("tags", updatedTags);
  };

  const handleSave = async () => {
    try {
      const updated = await updateSnippet(formData._id, formData);
      toast.success("Snippet updated");
      setEditing(false);
      onUpdate?.(updated);
    } catch (err) {
      toast.error("Failed to update snippet");
    }
  };

  const handleCancel = () => {
    setFormData(snippet);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      try {
        await deleteSnippet(snippet._id);
        toast.success("Deleted successfully");
        onUpdate?.();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="relative bg-base-100 shadow-md rounded-2xl border border-base-200 p-5 space-y-4 transition-all">
      <div className="absolute top-3 right-4 flex items-center gap-2">
        {LANGUAGE_ICONS[formData.language?.toLowerCase()] ? (
          <i className={`${LANGUAGE_ICONS[formData.language.toLowerCase()]} text-2xl`} title={formData.language}></i>
        ) : (
          <span className="badge badge-neutral text-xs">{formData.language}</span>
        )}
      </div>

      {/* Title */}
      <div className="flex justify-between items-start gap-3 pt-6">
        {editing ? (
          <input
            type="text"
            className="w-full bg-transparent text-lg font-medium px-2 py-1 border-b border-base-300 focus:outline-none focus:border-primary"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        ) : (
          <h2 className="text-xl font-semibold">{formData.title}</h2>
        )}
        {isAdmin && isDashboard && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="btn btn-xs btn-circle btn-ghost">
              <Pencil size={14} />
            </button>
            <button onClick={handleDelete} className="btn btn-xs btn-ghost btn-circle text-error">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {formData.tags?.map((tag, idx) =>
          editing ? (
            <input
              key={idx}
              value={tag}
              onChange={(e) => handleTagChange(idx, e.target.value)}
              className="bg-base-200 px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ minWidth: "60px" }}
            />
          ) : (
            <span key={idx} className={`badge text-sm ${TAG_COLORS[idx % TAG_COLORS.length]}`}>
              <HashIcon className="py-1" />
              {tag}
            </span>
          )
        )}
      </div>

      {/* Code */}
      {editing ? (
        <textarea
          className="w-full bg-base-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          rows={6}
          value={formData.code}
          onChange={(e) => handleChange("code", e.target.value)}
        />
      ) : (
        <div className="relative rounded-lg overflow-auto max-h-64 text-sm bg-base-200">
          <SyntaxHighlighter
            language={formData.language}
            style={oneDark}
            showLineNumbers
            wrapLines
            wrapLongLines
            customStyle={{ backgroundColor: "transparent", padding: "0.5rem", margin: 0 }}
          >
            {formData.code}
          </SyntaxHighlighter>
          <div className="absolute top-2 right-2 flex gap-2">
            <button className="btn btn-xs btn-circle btn-outline" onClick={handleCopy}>
              <ClipboardCopy size={14} />
              {copied && <span className="ml-1 text-xs">Copied!</span>}
            </button>
            <button className="btn btn-xs btn-circle btn-outline" onClick={() => setShowModal(true)}>
              <Eye size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="relative z-10" ref={dropdownRef}>
        <button
          onClick={() => setShowDescription(!showDescription)}
          className="flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline"
        >
          Description {showDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showDescription && (
          <>
            {editing ? (
              <textarea
                className="mt-2 w-full bg-base-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            ) : (
              <div className="mt-2 p-3 rounded-md bg-base-200 text-sm">
                {formData.description}
              </div>
            )}
          </>
        )}
      </div>

      {/* Save / Cancel Buttons */}
      {editing && (
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn btn-xs btn-success btn-circle" onClick={handleSave}>
            <Save size={14} />
          </button>
          <button className="btn btn-xs btn-ghost btn-circle" onClick={handleCancel}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <p>Posted by: {formData.createdBy || "Anonymous"}</p>
        <p>{format(new Date(formData.createdAt), "dd MMM yyyy, hh:mm a")}</p>
      </div>

      {/* Modal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-base-100 rounded-xl shadow-xl w-11/12 max-w-3xl p-4 relative">
              <button className="absolute top-3 right-3 btn btn-sm btn-circle" onClick={() => setShowModal(false)}>
                ✕
              </button>
              <div className="overflow-auto max-h-[80vh]">
                <SyntaxHighlighter
                  language={formData.language}
                  style={oneDark}
                  showLineNumbers
                  wrapLines
                  wrapLongLines
                  customStyle={{ background: "transparent", color: "inherit", padding: "1rem" }}
                >
                  {formData.code}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SnippetCard;