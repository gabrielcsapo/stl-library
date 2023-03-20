import { Link } from "react-router-dom";
import { createContext, useState } from "react";

export const SearchContext = createContext({
  searchText: "",
  directoryText: "",
  setSearchText: () => {},
  setDirectoryText: () => {},
});

export default function Layout({ children }) {
  const [searchText, setSearchText] = useState("");
  const [directoryText, setDirectoryText] = useState("");

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
      value={{ searchText, setSearchText, directoryText, setDirectoryText }}
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
