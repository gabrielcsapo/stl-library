import "infima/dist/css/default/default.css";
import "./App.css";

import React from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Home from "./pages/Home";
import View from "./pages/View";

const startDir = "/Users/gabrielcsapo/Downloads"; // Change this to the folder where you want to start the search

const App = () => {
  const [stlFiles, setSTLFiles] = React.useState(new Map());

  React.useEffect(() => {
    window.electron.scanForSTLFiles(startDir, (fileFound) => {
      setSTLFiles((map) => new Map(map.set(fileFound.path, fileFound)));
    });
  }, []);

  const Router = window.electron.isDev ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Home stlFiles={Array.from(stlFiles.values())} />}
          />
          <Route
            path="/stl/:stlFilePath"
            element={<View stlFiles={Array.from(stlFiles.values())} />}
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
