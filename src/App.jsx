import "infima/dist/css/default/default.css";
import "./App.css";

import React from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Home from "./pages/Home";
import View from "./pages/View";

const App = () => {
  const Router = window.electron.isDev ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stl/:stlFilePath" element={<View />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
