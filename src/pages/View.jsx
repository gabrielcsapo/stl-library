import React, { useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { SearchContext } from "../Layout";

import styles from "./View.module.css";

const STLViewer = () => {
  const { stlFiles } = useContext(SearchContext);

  const { stlFilePath } = useParams();
  const found = stlFiles.get(stlFilePath);

  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);

  const canvasAspect = 1;

  useEffect(() => {
    if (!mountRef.current) return;
    let renderer, camera, scene, geometry, material, mesh, controls;

    const loader = new STLLoader();

    const absolutePath = `file://${stlFilePath}`;

    camera = new THREE.PerspectiveCamera(75, canvasAspect, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setClearColor(0xffffff, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const animate = () => {
      requestRef.current = setTimeout(() => {
        requestAnimationFrame(animate);

        controls.update();

        renderer.render(scene, camera);
      }, 1000 / 30);
    };

    loader.load(absolutePath, (geometry) => {
      geometry.center();
      material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh(geometry, material);
      scene = new THREE.Scene();
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance =
        maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
      const aspectRatio = canvasAspect; // Use the canvas aspect ratio
      camera.aspect = aspectRatio;

      const distance = fitHeightDistance + maxSize / 4;
      camera.position.set(center.x, center.y, center.z + distance);
      camera.lookAt(center);

      camera.far = distance * 2;
      camera.near = distance / 100;

      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      renderer.setPixelRatio(1); // Use a lower pixel ratio

      animate();
    });

    return () => {
      clearTimeout(requestRef.current);
      if (material) material.dispose(); // Dispose of the material
      if (geometry) geometry.dispose(); // Dispose of the geometry
      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, [stlFilePath, canvasAspect]);

  return (
    <>
      <br />
      <div className={styles.stlViewer}>
        <div
          style={{ width: "500px", height: "500px", margin: "0 auto" }}
          ref={mountRef}
        />
      </div>
      <hr />
      {found ? (
        <div>
          <ul>
            <ol>{found.name}</ol>
            <ol>{found.path}</ol>
            <ol>{found.size}</ol>
          </ul>
        </div>
      ) : null}
      <hr />
    </>
  );
};

export default STLViewer;
