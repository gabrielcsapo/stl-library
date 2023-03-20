import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const STLViewer = ({ stlFiles }) => {
  const { stlFilePath } = useParams();
  const found = stlFiles.find((file) => file.path === stlFilePath);

  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const canvasAspect = mount.clientWidth / mount.clientHeight;
    let renderer, camera, scene, geometry, material, mesh, controls;

    const loader = new STLLoader();

    const absolutePath = `file://${stlFilePath}`;

    // Calculate the aspect ratio based on the canvas size
    camera = new THREE.PerspectiveCamera(75, canvasAspect, 0.1, 1000);

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

      // Set the distance between the camera and the center of the bounding box
      const distance = fitHeightDistance + maxSize / 4;

      // Position the camera at the center of the bounding box, looking towards it
      camera.position.set(center.x, center.y, center.z + distance);
      camera.lookAt(center);

      camera.far = distance * 2; // Adjust the far plane of the camera
      camera.near = distance / 100; // Adjust the near plane of the camera

      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

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
      <div
        style={{ width: "300px", height: "250px", margin: "0 auto" }}
        ref={mountRef}
      />
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
