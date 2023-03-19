import React from "react";
import STLViewer from "./STLViewer";

import { SearchContext } from "../Layout";

import styles from "./STLList.module.css";

const PAGE_SIZE = 12;

const STLList = ({ stlFiles = [] }) => {
  const { searchText } = React.useContext(SearchContext);
  const [page, setPage] = React.useState(1);

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const stlFilesPage = stlFiles
    .filter((stlfile) =>
      stlfile.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .slice(startIndex, endIndex);

  const pageCount = Math.ceil(
    stlFiles.filter((stlfile) =>
      stlfile.name.toLowerCase().includes(searchText.toLowerCase())
    ).length / PAGE_SIZE
  );

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, pageCount));
  };

  return (
    <>
    <div className={styles.paginationController}>
        <button onClick={handlePrevPage} disabled={page === 1}>
          Prev
        </button>
        <div style={{ margin: "10px 20px" }}>
          Page {page} of {pageCount}
        </div>
        <button onClick={handleNextPage} disabled={page === pageCount}>
          Next
        </button>
      </div>
      <div className={styles.stlList}>
        {stlFilesPage.map((stlfile) => (
          <div key={stlfile.path} className={styles.stlViewer}>
            <STLViewer stlFile={stlfile} />
          </div>
        ))}
      </div>
    </>
  );
};

export default STLList;