const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="w-full max-w-lg mx-auto mb-6">
    <input
      type="text"
      placeholder="Search by name, email, ID or designation…"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default SearchBar;
