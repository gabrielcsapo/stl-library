import React from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

import style from "./STLViewer.module.css";

const STLViewer = ({ stlFile }) => {
  const imgRef = React.useRef(null);

  const { path: stlFilePath, image } = stlFile;

  React.useEffect(() => {
    const width = 500;
    const height = 500;

    const img = imgRef.current;
    if (image) {
      img.src = `file://${image}`;
      return;
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const camera = new THREE.PerspectiveCamera(
      75,
      1,
      0.1,
      1000
    );
    const scene = new THREE.Scene();
    let mesh;

    const loader = new STLLoader();

    const absolutePath = `file://${stlFilePath}`;

    loader.load(absolutePath, (geometry) => {
      const material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance =
        maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
      camera.far = fitHeightDistance * 4;
      camera.near = fitHeightDistance / 4;
      camera.position.set(center.x, center.y, fitHeightDistance * 2.5);
      camera.lookAt(center);

      renderer.setSize(width, height);

      renderer.render(scene, camera);

      const imageData = renderer.domElement.toDataURL();
      img.src = imageData;

      window.electron.stlRendered(stlFilePath, imageData);
    });

    return () => {
      renderer.dispose();
    };
  }, [stlFilePath]);

  return (
    <div className={style.container}>
      <Link to={`/stl/${encodeURIComponent(stlFilePath)}`}>
        <img
          ref={imgRef}
          style={{ cursor: "pointer" }}
        />
        <div>
          {stlFile.name} ({stlFile.size})
        </div>
      </Link>
    </div>
  );
};

export default STLViewer;
