import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, XCircle } from "lucide-react";

/* ================= SEARCH PARSER ================= */
const parseSearch = (query) => {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const filters = {
    text: [],
    languages: [],
    tags: [],
  };

  tokens.forEach((token) => {
    if (token.startsWith("#")) {
      filters.tags.push(token.slice(1));
    } else if (token.startsWith("lang:")) {
      filters.languages.push(
        ...token
          .slice(5)
          .split(",")
          .map((l) => l.trim())
      );
    } else {
      filters.text.push(token);
    }
  });

  return filters;
};

const SearchBar = ({ snippets = [], onFilter }) => {
  const [input, setInput] = useState("");

  /* ================= PARSED QUERY ================= */
  const parsedQuery = useMemo(() => parseSearch(input), [input]);

  /* ================= FILTER LOGIC ================= */
  const filterSnippets = useCallback(() => {
    if (!input.trim()) {
      onFilter(snippets);
      return;
    }

    const result = snippets.filter((s) => {
      const textBlob = `${s.title ?? ""} ${s.description ?? ""} ${
        s.code ?? ""
      }`.toLowerCase();

      const tags = (s.tags || []).map((t) => t.toLowerCase());
      const language = s.language?.toLowerCase() || "";

      /* text search */
      const textMatch = parsedQuery.text.every((term) =>
        textBlob.includes(term)
      );

      /* language filter */
      const langMatch =
        parsedQuery.languages.length === 0 ||
        parsedQuery.languages.includes(language);

      /* tag filter */
      const tagMatch =
        parsedQuery.tags.length === 0 ||
        parsedQuery.tags.every((tag) => tags.includes(tag));

      return textMatch && langMatch && tagMatch;
    });

    onFilter(result);
  }, [parsedQuery, snippets, input, onFilter]);

  /* ================= DEBOUNCED SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(filterSnippets, 250);
    return () => clearTimeout(timer);
  }, [filterSnippets]);

  /* ================= CLEAR ================= */
  const handleClear = () => {
    setInput("");
    onFilter(snippets);
  };

  return (
    <div className="relative w-full sm:max-w-md group">
      <input
        type="text"
        placeholder="Search snippets…  lang:js #api useEffect"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="
          input input-bordered w-full rounded-full
          pl-5 pr-16 transition-all
          focus:outline-none focus:ring-2 focus:ring-primary/30
        "
      />

      {/* Search Icon */}
      <button
        onClick={filterSnippets}
        className="
          absolute right-3 top-1/2 -translate-y-1/2
          text-base-content/50 hover:text-primary transition
        "
      >
        <Search size={18} />
      </button>

      {/* Clear Icon */}
      {input && (
        <button
          onClick={handleClear}
          className="
            absolute right-10 top-1/2 -translate-y-1/2
            text-base-content/40 hover:text-error transition
          "
        >
          <XCircle size={18} />
        </button>
      )}

      {/* Helper hint (UX upgrade) */}
      <p className="absolute -bottom-5 left-2 text-xs opacity-0 group-focus-within:opacity-60 transition">
        Use #tag or lang:js,python filters
      </p>
    </div>
  );
};

export default SearchBar;
