import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useFps } from "react-fps";

const STLViewer = ({ stlFiles }) => {
  const { stlFilePath } = useParams();
  const found = stlFiles.find((file) => file.path === stlFilePath);

  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    let renderer, camera, scene, geometry, material, mesh, controls;

    const loader = new STLLoader();

    const absolutePath = `file://${stlFilePath}`;

    camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setClearColor(0xffffff, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    };

    loader.load(absolutePath, (geometry) => {
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
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.far = fitHeightDistance * 4;
      camera.near = fitHeightDistance / 4;
      camera.position.set(center.x, center.y, fitHeightDistance * 2.5);
      camera.lookAt(center);

      renderer.setSize(mount.clientWidth, mount.clientHeight);

      animate();
    });

    return () => {
      cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        mount.removeChild(rendererRef.current.domElement);
      }
    };
  }, [stlFilePath]);

  return (
    <>
      <br />
      <div style={{ width: "100vw", height: "500px" }} ref={mountRef} />
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
