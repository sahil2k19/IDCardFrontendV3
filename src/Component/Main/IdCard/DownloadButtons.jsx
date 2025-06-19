const DownloadButtons = ({
  loading,
  downloadAllImagesAsZip,
  downloadAllImagesWithoutBackgroundAsZip,
  downloadAllEntries,
  toggleModalOpenedit,
  toggleModalOpen,
}) => (
  <div className="grid grid-cols-3 md:grid-cols-5 gap-4 my-5 justify-center">
    <button
      className="bg-green-500 hover:bg-green-700 whitespace-nowrap text-sm h-10 text-white font-bold py-2 px-4 rounded"
      onClick={toggleModalOpenedit}
    >
      Edit All ID Cards
    </button>
    <button
      className="bg-orange-500 hover:bg-orange-700 whitespace-nowrap text-sm h-10 text-white font-bold py-2 px-4 rounded"
      onClick={toggleModalOpen}
    >
      Show & Hide
    </button>
    <button
      className="bg-blue-500 hover:bg-blue-700 whitespace-nowrap text-sm h-10 text-white font-bold py-2 px-4 rounded flex items-center"
      onClick={downloadAllImagesAsZip}
      disabled={loading}
    >
      {loading ? (
        <>
          Wait...
          <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </>
      ) : (
        "Download All as ZIP"
      )}
    </button>
    <button
      className="bg-blue-500 hover:bg-blue-700 whitespace-nowrap text-sm h-10 text-white font-bold py-2 px-4 rounded flex items-center"
      onClick={downloadAllImagesWithoutBackgroundAsZip}
      disabled={loading}
    >
      {loading ? (
        <>
          Wait...
          <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </>
      ) : (
        "Download Without Background ZIP"
      )}
    </button>
    <button
      className="bg-yellow-500 flex gap-2 items-center whitespace-nowrap text-sm h-10 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
      onClick={downloadAllEntries}
      disabled={loading}
    >
      {loading ? "Preparing Excel..." : "Download All Entries"}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor"
        className="bi bi-cloud-arrow-down mt-1" viewBox="0 0 16 16">
        <path fillRule="evenodd"
          d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z" />
        <path
          d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
      </svg>
    </button>
  </div>
);

export default DownloadButtons;
