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

const TAG_COLORS = ["badge-primary", "badge-secondary", "badge-accent", "badge-info", "badge-success", "badge-warning", "badge-error"];

const LANGUAGE_ICONS = {
  javascript: "devicon-javascript-plain", python: "devicon-python-plain", html: "devicon-html5-plain",
  css: "devicon-css3-plain", java: "devicon-java-plain", c: "devicon-c-plain",
  cpp: "devicon-cplusplus-plain", typescript: "devicon-typescript-plain",
  nodejs: "devicon-nodejs-plain", react: "devicon-react-original",
  php: "devicon-php-plain", bash: "devicon-bash-plain",
  go: "devicon-go-plain", ruby: "devicon-ruby-plain"
};

// CHANGE: helper to mask email/full name to initials
// const getInitials = (s) => {
//   if (!s || typeof s !== "string") return "A";
//   let name = s;
//   if (s.includes("@")) {
//     name = s.split("@")[0]; // take local part
//   }
//   // split by non-letters and take first two tokens
//   const parts = name.replace(/[^a-zA-Z]+/g, " ").trim().split(" ").filter(Boolean);
//   const a = parts[0]?.[0] || name[0];
//   const b = parts[1]?.[0] || "";
//   return (a + b).toUpperCase();
// };

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
    navigator.clipboard.writeText(formData.code || "");
    setCopied(true);
    toast.success("Code copied"); // CHANGE: avoid inline text that shifts layout
    setTimeout(() => setCopied(false), 1500);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (idx, value) => {
    const updatedTags = [...(formData.tags || [])];
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

  // Get initials from a name or email
  const getInitials = (s) => {
    if (!s || typeof s !== "string") return "A";
    let name = s.includes("@") ? s.split("@")[0] : s;
    const parts = name.replace(/[^a-zA-Z]+/g, " ").trim().split(" ").filter(Boolean);
    const a = parts[0]?.[0] || name[0];
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  };

  // (Optional) Mask an email like j***@g***.com
  const maskEmail = (email) => {
    if (!email || typeof email !== "string" || !email.includes("@")) return email || "";
    const [local, domainFull] = email.split("@");
    const [domain, ...rest] = domainFull.split(".");
    const tld = rest.length ? rest.join(".") : "";
    const safeLocal = local ? `${local[0]}***` : "***";
    const safeDomain = domain ? `${domain[0]}***` : "***";
    return tld ? `${safeLocal}@${safeDomain}.${tld}` : `${safeLocal}@${safeDomain}`;
  };

  // CHANGE: derived display values
  const createdAtSafe = formData?.createdAt ? new Date(formData.createdAt) : null;
  const initials = getInitials(formData?.createdBy);

  return (
    <div
      className={[
        "relative p-5 space-y-4 transition-all",
        // CHANGE: glassy + pro look
        "bg-base-100/60 backdrop-blur-xl border border-base-200/60",
        "rounded-2xl shadow-lg ring-1 ring-base-300/40",
        "hover:shadow-xl hover:-translate-y-0.5"
      ].join(" ")}
    >
      {/* language badge */}
      <div className="absolute top-3 right-4 flex items-center gap-2">
        {LANGUAGE_ICONS[formData.language?.toLowerCase?.()] ? (
          <i
            className={`${LANGUAGE_ICONS[formData.language.toLowerCase()]} text-2xl opacity-80`}
            title={formData.language}
          />
        ) : (
          <span className="badge badge-neutral text-xs">{formData.language || "text"}</span>
        )}
      </div>

      {/* Title + actions */}
      <div className="flex justify-between items-start gap-3 pt-6">
        {editing ? (
          <input
            type="text"
            className="w-full bg-transparent text-lg font-medium px-2 py-1 border-b border-base-300 focus:outline-none focus:border-primary"
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        ) : (
          <h2 className="text-xl font-semibold leading-7">{formData.title}</h2>
        )}
        {isAdmin && isDashboard && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="btn btn-xs btn-circle btn-ghost"
              aria-label={editing ? "Stop editing" : "Edit snippet"}
            >
              {editing ? <X size={14} /> : <Pencil size={14} />}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-xs btn-ghost btn-circle text-error"
              aria-label="Delete snippet"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {(formData.tags || []).map((tag, idx) =>
          editing ? (
            <input
              key={idx}
              value={tag}
              onChange={(e) => handleTagChange(idx, e.target.value)}
              className="bg-base-200/70 px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ minWidth: "60px" }}
            />
          ) : (
            <span key={idx} className={`badge text-sm ${TAG_COLORS[idx % TAG_COLORS.length]} items-center gap-1`}>
              <HashIcon size={12} />
              {tag}
            </span>
          )
        )}
      </div>

      {/* Code with sticky toolbar */}
      {editing ? (
        <textarea
          className="w-full bg-base-200/70 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          rows={6}
          value={formData.code || ""}
          onChange={(e) => handleChange("code", e.target.value)}
        />
      ) : (
        <div
          className={[
            "relative rounded-lg ring-1 ring-base-300/50 overflow-hidden",
            "bg-base-200/50 backdrop-blur-md"
          ].join(" ")}
        >
          {/* scroll area */}
          <div className="max-h-64 overflow-auto">
            {/* CHANGE: sticky toolbar that stays while scrolling */}
            <div
              className={[
                "sticky top-0 z-10 flex justify-end gap-2 p-2",
                "bg-base-100/60 backdrop-blur-md", // glassy bar
                "border-b border-base-300/50",
                "pointer-events-none" // so scroll works through; buttons re-enable events
              ].join(" ")}
            >
              <button
                className="btn btn-xs btn-circle btn-outline pointer-events-auto"
                onClick={handleCopy}
                aria-label="Copy code"
                title={copied ? "Copied!" : "Copy"}
              >
                <ClipboardCopy size={14} />
              </button>
              <button
                className="btn btn-xs btn-circle btn-outline pointer-events-auto"
                onClick={() => setShowModal(true)}
                aria-label="Open preview"
                title="Preview"
              >
                <Eye size={14} />
              </button>
            </div>

            {/* code */}
            <SyntaxHighlighter
              language={formData.language || "text"}
              style={oneDark}
              showLineNumbers
              wrapLines
              wrapLongLines
              customStyle={{ backgroundColor: "transparent", padding: "0.75rem", margin: 0 }}
            >
              {formData.code || ""}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {/* Description (height-limited so other cards don't jump) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDescription((v) => !v)}
          className="flex items-center gap-1 text-sm text-primary font-medium mt-1 hover:underline"
        >
          Description {showDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDescription && (
          <>
            {editing ? (
              <textarea
                className="mt-2 w-full bg-base-200/70 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            ) : (
              // CHANGE: cap height + internal scroll so the card height barely changes
              <div className="mt-2 p-3 rounded-md bg-base-200/60 text-sm max-h-28 overflow-y-auto">
                {formData.description || "—"}
              </div>
            )}
          </>
        )}
      </div>

      {/* Save / Cancel */}
      {editing && (
        <div className="flex justify-end gap-2 mt-2">
          <button className="btn btn-xs btn-success btn-circle" onClick={handleSave} aria-label="Save">
            <Save size={14} />
          </button>
          <button className="btn btn-xs btn-ghost btn-circle" onClick={handleCancel} aria-label="Cancel">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Footer (initials only, no full email) */}
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-base-content/60 mt-2">
        <div className="flex items-center gap-2">
          {/* Small avatar circle with initials */}
          <div className="h-6 w-6 rounded-full bg-primary/15 text-primary grid place-items-center text-[10px] font-semibold">
            {initials}
          </div>
          <p className="font-medium">
            {/* Posted by: {initials} */}
            {/* Or show masked email instead of initials: */}
            Posted by: {maskEmail(formData?.createdBy)}
          </p>
        </div>
        <p>{format(new Date(formData.createdAt), "dd MMM yyyy, hh:mm a")}</p>
      </div>


      {/* Modal (glassy backdrop) */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-base-100/80 backdrop-blur-xl rounded-xl shadow-2xl w-11/12 max-w-3xl p-4 relative ring-1 ring-base-300/50">
              <button
                className="absolute top-3 right-3 btn btn-sm btn-circle"
                onClick={() => setShowModal(false)}
                aria-label="Close preview"
              >
                ✕
              </button>
              <div className="overflow-auto max-h-[80vh] rounded-lg ring-1 ring-base-300/50 bg-base-200/50">
                <SyntaxHighlighter
                  language={formData.language || "text"}
                  style={oneDark}
                  showLineNumbers
                  wrapLines
                  wrapLongLines
                  customStyle={{ background: "transparent", color: "inherit", padding: "1rem", margin: 0 }}
                >
                  {formData.code || ""}
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
