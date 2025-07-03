const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className=" w-[508px] ">
    <input
      type="text"
      placeholder="Search by name, email, ID or designation…"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full h-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default SearchBar;
