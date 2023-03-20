import { useContext } from "react";

import STLList from "../components/STLList";

import { SearchContext } from "../Layout";

const Home = () => {
  const { stlFiles } = useContext(SearchContext);

  return (
    <>
      <STLList stlFiles={Array.from(stlFiles.values())} />
    </>
  );
};

export default Home;
