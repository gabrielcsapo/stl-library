import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <>
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
                <input className="navbar__search-input" placeholder="Search" />
              </div>
            </form>
          </div>
        </div>
      </nav>

      <div className="container">{children}</div>
    </>
  );
}
