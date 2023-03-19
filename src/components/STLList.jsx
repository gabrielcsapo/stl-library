import React from "react";
import STLViewer from "./STLViewer";

import styles from "./STLList.module.css";

const PAGE_SIZE = 12;

const STLList = ({ stlFiles = [] }) => {
  const [page, setPage] = React.useState(1);

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const stlFilesPage = stlFiles.slice(startIndex, endIndex);

  const pageCount = Math.ceil(stlFiles.length / PAGE_SIZE);

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, pageCount));
  };

  return (
    <>
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {stlFilesPage.map((stlfile) => (
          <STLViewer key={stlfile.path} stlFile={stlfile} />
        ))}
      </div>
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
    </>
  );
};

export default STLList;
