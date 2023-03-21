import { Link } from "react-router-dom";
import { createContext, useState, useEffect } from "react";

export const SearchContext = createContext({
  searchText: "",
  directoryText: "/Users/gabrielcsapo/Downloads",
  stlFiles: new Map(),
  setSearchText: () => {},
  setDirectoryText: () => {},
  setSTLFiles: () => {},
});

export default function Layout({ children }) {
  const [searchText, setSearchText] = useState("");
  const [directoryText, setDirectoryText] = useState("");

  const [stlFiles, setSTLFiles] = useState(new Map());

  useEffect(() => {
    if (!directoryText) return;

    window.electron.scanForSTLFiles(directoryText, (fileFound) => {
      setSTLFiles((map) => new Map(map.set(fileFound.path, fileFound)));
    });
  }, [directoryText]);

  const handleDirectorySelect = async () => {
    const { dialog } = window.electron;
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!result.canceled) {
      setDirectoryText(result.filePaths[0]);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchText,
        setSearchText,
        directoryText,
        setDirectoryText,
        stlFiles,
        setSTLFiles,
      }}
    >
      <nav className="navbar">
        <div className="navbar__inner">
          <div className="navbar__items">
            <a className="navbar__brand">
              <Link to={"/"}>STL Preview</Link>
            </a>
          </div>
          <div className="navbar__items navbar__items--right">
            <form style={{ marginRight: "10px" }}>
              <div className="navbar__search">
                <input
                  className="navbar__search-input"
                  placeholder="Search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
            </form>
            <button
              onClick={handleDirectorySelect}
              style={{
                display: "flex",
                minWidth: "60px",
                paddingRight: "12px",
              }}
            >
              {directoryText ? (
                <>{directoryText.split("/").pop()}</>
              ) : (
                <svg
                  fill="#fff"
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21.32,9.55l-1.89-.63.89-1.78A1,1,0,0,0,20.13,6L18,3.87a1,1,0,0,0-1.15-.19l-1.78.89-.63-1.89A1,1,0,0,0,13.5,2h-3a1,1,0,0,0-.95.68L8.92,4.57,7.14,3.68A1,1,0,0,0,6,3.87L3.87,6a1,1,0,0,0-.19,1.15l.89,1.78-1.89.63A1,1,0,0,0,2,10.5v3a1,1,0,0,0,.68.95l1.89.63-.89,1.78A1,1,0,0,0,3.87,18L6,20.13a1,1,0,0,0,1.15.19l1.78-.89.63,1.89a1,1,0,0,0,.95.68h3a1,1,0,0,0,.95-.68l.63-1.89,1.78.89A1,1,0,0,0,18,20.13L20.13,18a1,1,0,0,0,.19-1.15l-.89-1.78,1.89-.63A1,1,0,0,0,22,13.5v-3A1,1,0,0,0,21.32,9.55ZM20,12.78l-1.2.4A2,2,0,0,0,17.64,16l.57,1.14-1.1,1.1L16,17.64a2,2,0,0,0-2.79,1.16l-.4,1.2H11.22l-.4-1.2A2,2,0,0,0,8,17.64l-1.14.57-1.1-1.1L6.36,16A2,2,0,0,0,5.2,13.18L4,12.78V11.22l1.2-.4A2,2,0,0,0,6.36,8L5.79,6.89l1.1-1.1L8,6.36A2,2,0,0,0,10.82,5.2l.4-1.2h1.56l.4,1.2A2,2,0,0,0,16,6.36l1.14-.57,1.1,1.1L17.64,8a2,2,0,0,0,1.16,2.79l1.2.4ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="container">{children}</div>
    </SearchContext.Provider>
  );
}
