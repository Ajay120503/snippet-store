import {
  useState,
  useRef,
  useEffect,
  lazy,
  Suspense,
  useCallback,
} from "react";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Eye,
  HashIcon,
  Pencil,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { updateSnippet, deleteSnippet } from "../services/api.js";
import toast from "react-hot-toast";

/* ================= FIX 1: lazy OUTSIDE component ================= */
const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((m) => ({
    default: m.Prism,
  }))
);

const TAG_COLORS = [
  "badge-primary",
  "badge-secondary",
  "badge-accent",
  "badge-info",
  "badge-success",
  "badge-warning",
  "badge-error",
];

const SnippetCard = ({
  snippet,
  isAdmin = true,
  isDashboard = true,
  onUpdate,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(snippet);

  const dropdownRef = useRef(null);

  /* ================= SAFE STATE SYNC ================= */
  useEffect(() => {
    setFormData(snippet);
  }, [snippet]);

  /* ================= CLICK OUTSIDE ONLY WHEN OPEN ================= */
  useEffect(() => {
    if (!showDescription) return;

    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDescription(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDescription]);

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showModal]);

  /* ================= COPY ================= */
  const handleCopy = useCallback(async () => {
    const text = formData.code || "";

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setCopied(true);
      toast.success("Copied!");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Clipboard error:", err);
      toast.error("Copy failed");
    }
  }, [formData.code]);

  /* ================= FORM CHANGE ================= */
  const handleChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      const updated = await updateSnippet(formData._id, formData);
      toast.success("Snippet updated");
      setEditing(false);
      onUpdate?.(updated);
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!confirm("Delete this snippet?")) return;

    try {
      await deleteSnippet(formData._id);
      toast.success("Deleted");
      onUpdate?.();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= HELPERS ================= */
  const initials = formData?.createdBy?.[0]?.toUpperCase?.() ?? "A";

  const createdAtSafe = formData?.createdAt
    ? new Date(formData.createdAt)
    : null;

  /* ================= UI ================= */
  return (
    <div className="relative p-5 space-y-4 bg-base-200 rounded-2xl shadow-md hover:shadow-xl transition-all">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        {editing ? (
          <input
            className="input input-sm w-full"
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        ) : (
          <h2 className="text-lg font-semibold">{formData.title}</h2>
        )}

        {isAdmin && isDashboard && (
          <div className="flex gap-1">
            <button
              className="btn btn-xs btn-ghost btn-circle"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? <X size={14} /> : <Pencil size={14} />}
            </button>

            <button
              className="btn btn-xs btn-circle btn-ghost text-error"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2">
        {(formData.tags || []).map((tag, i) => (
          <span
            key={i}
            className={`badge ${TAG_COLORS[i % TAG_COLORS.length]}`}
          >
            <HashIcon size={10} />
            {tag}
          </span>
        ))}
      </div>

      {/* CODE BLOCK */}
      <div className="relative rounded-lg overflow-hidden bg-base-300/40">
        {/* Sticky toolbar */}
        <div className="sticky top-0 flex justify-end gap-2 p-2 bg-base-200 z-10">
          <button
            className="btn btn-xs btn-circle btn-outline"
            onClick={handleCopy}
          >
            <ClipboardCopy size={14} />
          </button>

          <button
            className="btn btn-xs btn-circle btn-outline"
            onClick={() => setShowModal(true)}
          >
            <Eye size={14} />
          </button>
        </div>

        <div className="max-h-64 overflow-auto">
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <SyntaxHighlighter
              language={formData.language || "text"}
              style={oneDark}
              showLineNumbers
              wrapLongLines
              customStyle={{
                background: "transparent",
                margin: 0,
              }}
            >
              {formData.code || ""}
            </SyntaxHighlighter>
          </Suspense>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div ref={dropdownRef}>
        <button
          onClick={() => setShowDescription((v) => !v)}
          className="flex items-center gap-1 text-sm text-primary"
        >
          Description
          {showDescription ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>

        {showDescription && (
          <div className="mt-2 p-3 bg-base-300/40 rounded-md text-sm max-h-28 overflow-y-auto">
            {formData.description || "—"}
          </div>
        )}
      </div>

      {/* SAVE BUTTONS */}
      {editing && (
        <div className="flex justify-end gap-2">
          <button className="btn btn-xs btn-success" onClick={handleSave}>
            <Save size={14} />
          </button>
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => {
              setFormData(snippet);
              setEditing(false);
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between text-xs opacity-70">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 grid place-items-center text-[10px] font-bold">
            {initials}
          </div>
          Posted by user {formData?.createdBy}
        </div>

        <div>{createdAtSafe ? format(createdAtSafe, "dd MMM yyyy") : "—"}</div>
      </div>

      {/* MODAL */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-6">
            {/* Modal Container */}
            <div
              className="
          relative w-full h-full
          sm:h-auto sm:max-h-[85vh]
          sm:max-w-4xl
          bg-base-100
          rounded-none sm:rounded-2xl
          shadow-2xl
          flex flex-col
          overflow-hidden
        "
            >
              {/* Header (sticky) */}
              <div className="flex items-center justify-between p-3 bg-base-300 sticky top-0 z-10">
                <h3 className="font-semibold text-sm sm:text-base">
                  Code Preview
                </h3>

                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-auto">
                <Suspense
                  fallback={
                    <div className="p-6 text-center">Loading preview...</div>
                  }
                >
                  <SyntaxHighlighter
                    language={formData.language || "text"}
                    style={oneDark}
                    showLineNumbers
                    wrapLongLines
                    customStyle={{
                      margin: 0,
                      background: "transparent",
                      padding: "1rem",
                    }}
                  >
                    {formData.code || ""}
                  </SyntaxHighlighter>
                </Suspense>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SnippetCard;
