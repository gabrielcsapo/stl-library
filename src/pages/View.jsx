import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { SearchContext } from "../Layout";

import styles from "./View.module.css";

function countFacets(geometry) {
  const numVertices = geometry.attributes.position.count;
  const numTriangles = numVertices / 3;
  return numTriangles;
}

function getVolume(geometry) {
  const vertices = geometry.attributes.position.array;
  let total = 0;
  for (let i = 0; i < vertices.length; i += 9) {
    const v1x = vertices[i];
    const v1y = vertices[i + 1];
    const v1z = vertices[i + 2];
    const v2x = vertices[i + 3];
    const v2y = vertices[i + 4];
    const v2z = vertices[i + 5];
    const v3x = vertices[i + 6];
    const v3y = vertices[i + 7];
    const v3z = vertices[i + 8];
    total += signedVolumeOfTriangle(
      v1x,
      v1y,
      v1z,
      v2x,
      v2y,
      v2z,
      v3x,
      v3y,
      v3z
    );
  }
  return Math.abs(total);
}

function getSurfaceArea(geometry) {
  const vertices = geometry.attributes.position.array;
  let total = 0;
  for (let i = 0; i < vertices.length; i += 9) {
    const v1x = vertices[i];
    const v1y = vertices[i + 1];
    const v1z = vertices[i + 2];
    const v2x = vertices[i + 3];
    const v2y = vertices[i + 4];
    const v2z = vertices[i + 5];
    const v3x = vertices[i + 6];
    const v3y = vertices[i + 7];
    const v3z = vertices[i + 8];
    total += triangleArea(v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z);
  }
  return total;
}

function signedVolumeOfTriangle(ax, ay, az, bx, by, bz, cx, cy, cz) {
  const v321 = cx * by * az;
  const v231 = bx * cy * az;
  const v312 = cx * ay * bz;
  const v132 = ax * cy * bz;
  const v213 = bx * ay * cz;
  const v123 = ax * by * cz;
  return (-v321 + v231 + v312 - v132 - v213 + v123) / 6;
}

function triangleArea(ax, ay, az, bx, by, bz, cx, cy, cz) {
  const a = Math.sqrt(
    Math.pow(ax - bx, 2) + Math.pow(ay - by, 2) + Math.pow(az - bz, 2)
  );
  const b = Math.sqrt(
    Math.pow(bx - cx, 2) + Math.pow(by - cy, 2) + Math.pow(bz - cz, 2)
  );
  const c = Math.sqrt(
    Math.pow(cx - ax, 2) + Math.pow(cy - ay, 2) + Math.pow(cz - az, 2)
  );
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return area;
}

const STLViewer = () => {
  const { stlFiles } = useContext(SearchContext);

  const { stlFilePath } = useParams();
  const found = stlFiles.get(stlFilePath);

  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);

  const [containerHeight, setContainerHeight] = useState(200);
  const [containerWidth, setContainerWidth] = useState(200);
  const [canvasAspect, setCanvasAspect] = useState(1);
  const [dimensions, setDimensions] = useState(null);
  const [volume, setVolume] = useState(null);
  const [surfaceArea, setSurfaceArea] = useState(null);
  const [numFacets, setNumFacets] = useState(null);
  const [boundingBox, setBoundingBox] = useState(null);
  const [fileFormat, setFileFormat] = useState(null);
  const [units, setUnits] = useState(null);
  const [creationDate, setCreationDate] = useState(null);

  useEffect(() => {
    const node = mountRef.current;
    if (node) {
      const observer = new ResizeObserver(() => {
        const { width, height } = node.getBoundingClientRect();
        const aspect = width / height;
        if (canvasAspect !== aspect) {
          setCanvasAspect(width / height);
        }

        if (containerWidth !== width) {
          setContainerWidth(width);
        }

        if (containerHeight !== height) {
          setContainerHeight(height);
        }
      });
      observer.observe(node);
      return () => {
        observer.unobserve(node);
      };
    }
  }, []);

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
      var skipFrame = false;

      requestRef.current = setTimeout(() => {
        if (!skipFrame) {
          controls.update();

          renderer.render(scene, camera);
        }

        skipFrame = !skipFrame;
        requestAnimationFrame(animate);
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

      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(1); // Use a lower pixel ratio

      // Calculate and set model metadata
      const dimensions = {
        width: size.x.toFixed(2),
        height: size.y.toFixed(2),
        depth: size.z.toFixed(2),
      };
      setDimensions(dimensions);

      const numFacets = countFacets(geometry);
      setNumFacets(numFacets.toFixed(2));

      const volume = geometry ? getVolume(geometry) : 0;
      setVolume(volume.toFixed(2));

      const surfaceArea = geometry ? getSurfaceArea(geometry) : 0;
      setSurfaceArea(surfaceArea.toFixed(2));

      const boundingBox = {
        width: (size.x + 2).toFixed(2),
        height: (size.y + 2).toFixed(2),
        depth: (size.z + 2).toFixed(2),
      };
      setBoundingBox(boundingBox);

      const fileFormat = geometry
        ? (geometry.metadata && geometry.metadata.format) || ""
        : "";
      setFileFormat(fileFormat);

      const units = geometry
        ? (geometry.metadata && geometry.metadata.units) || ""
        : "";
      setUnits(units);

      const creationDate = found ? found.created : "";
      setCreationDate(creationDate);

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
  }, [stlFilePath, canvasAspect, found, containerHeight, containerWidth]);

  return (
    <div className={styles.container}>
      <div className={styles.stlViewer}>
        <div
          style={{ maxWidth: "80%", height: "500px", flexGrow: "1" }}
          ref={mountRef}
        />
        <div className={styles.metadataSidebar}>
          {dimensions ? (
            <>
              {found ? (
                <>
                  <p>File:</p>
                  <ul>
                    <li>{found.name}</li>
                    <li>{found.path}</li>
                    <li>{found.size}</li>
                  </ul>
                </>
              ) : null}
              <p>Dimensions:</p>
              <ul>
                <li>Width: {dimensions.width} mm</li>
                <li>Height: {dimensions.height} mm</li>
                <li>Depth: {dimensions.depth} mm</li>
              </ul>
              <p>Volume: {volume} mm³</p>
              <p>Surface Area: {surfaceArea} mm²</p>
              <p>Number of Facets: {numFacets}</p>
              <p>Bounding Box:</p>
              <ul>
                <li>Width: {boundingBox?.width} mm</li>
                <li>Height: {boundingBox?.height} mm</li>
                <li>Depth: {boundingBox?.depth} mm</li>
              </ul>
              <p>File Format: {fileFormat}</p>
              <p>Units: {units}</p>
              <p>Creation/Modification Date: {creationDate}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default STLViewer;
