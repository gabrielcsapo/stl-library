import { Link } from "react-router-dom";
import { createContext, useState } from "react";

export const SearchContext = createContext({
  searchText: "",
  setSearchText: () => {},
});

export default function Layout({ children }) {
  const [searchText, setSearchText] = useState("");

  return (
    <SearchContext.Provider value={{ searchText, setSearchText }}>
      <nav className="navbar">
        <div className="navbar__inner">
          <div className="navbar__items">
            <a className="navbar__brand">
              <Link to={"/"}>STL Preview</Link>
            </a>
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