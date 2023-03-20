import "infima/dist/css/default/default.css";
import "./App.css";

import React from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Home from "./pages/Home";
import View from "./pages/View";

const startDir = "/Users/gabrielcsapo/Downloads"; // Change this to the folder where you want to start the search

const App = () => {
  const [stlFiles, setSTLFiles] = React.useState([]);

  React.useEffect(() => {
    window.electron.scanForSTLFiles(startDir, (filesFound) => {
      setSTLFiles(filesFound);
    });
  }, []);

  const Router = window.electron.isDev ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home stlFiles={stlFiles} />} />
          <Route
            path="/stl/:stlFilePath"
            element={<View stlFiles={stlFiles} />}
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
