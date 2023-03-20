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
      console.log("trying to set", result.filePaths[0]);
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
            <button onClick={handleDirectorySelect}>Select Directory</button>
            {directoryText && (
              <div style={{ marginLeft: "10px" }}>
                {directoryText.split("/").pop()}
              </div>
            )}
          </div>
          <div className="navbar__items navbar__items--right">
            <form>
              <div className="navbar__search">
                <input
                  className="navbar__search-input"
                  placeholder="Search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
      </nav>

      <div className="container">{children}</div>
    </SearchContext.Provider>
  );
}
