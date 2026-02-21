import { useEffect, useState } from "react";
import { Search, XCircle } from "lucide-react";

const SearchBar = ({ snippets, onFilter }) => {
  const [input, setInput] = useState("");

  const parseSearch = (query) => {
    const tokens = query.trim().split(/\s+/);
    const filters = {
      searchText: [],
      language: "",
      tags: [],
    };

    tokens.forEach((token) => {
      if (token.startsWith("#")) {
        filters.tags.push(token.slice(1));
      } else if (token.startsWith("lang:")) {
        filters.language = token.slice(5).split(",");
      } else {
        filters.searchText.push(token);
      }
    });

    return filters;
  };

  const handleSearch = () => {
    const parsed = parseSearch(input);

    const result = snippets.filter((s) => {
      const text = `${s.title} ${s.description} ${s.code}`.toLowerCase();
      const tags = (s.tags || []).map((t) => t.toLowerCase());
      const language = s.language?.toLowerCase();

      const searchMatch = parsed.searchText.every((term) =>
        text.includes(term.toLowerCase())
      );

      const langMatch = parsed.language.length
        ? parsed.language.includes(language)
        : true;

      const tagMatch = parsed.tags.length
        ? parsed.tags.every((tag) => tags.includes(tag.toLowerCase()))
        : true;

      return searchMatch && langMatch && tagMatch;
    });
    onFilter(result);
  };

  const handleClear = () => {
    setInput("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [input, snippets]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <input
        type="text"
        placeholder="Search: lang:js #api useEffect"
        className="input input-bordered w-full pl-5 pr-10 focus:outline-none rounded-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      {/* Search Icon */}
      <button
        onClick={handleSearch}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
      >
        <Search size={18} />
      </button>

      {/* Clear Icon */}
      {input && (
        <button
          onClick={handleClear}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
