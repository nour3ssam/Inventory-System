import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BackgroundCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // isActive lives inside the closure — resets every time the effect runs.
    // This correctly handles BOTH React StrictMode double-mount AND Vite HMR reloads.
    let isActive = true;

    const scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Soft radial gradient sprite texture
    const createFuzzySprite = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      return new THREE.CanvasTexture(canvas);
    };

    const fuzzyTexture = createFuzzySprite();

    // Single color for every ball — soft electric blue
    const BALL_COLOR = new THREE.Color(0x4da6ff);

    const furBalls = [];

    // Compute the visible width/height of the scene at a given Z depth,
    // so balls spread across the FULL page regardless of window size/aspect ratio.
    const getVisibleBoundsAtZ = (z) => {
      const distance = Math.abs(camera.position.z - z);
      const vFovRad = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * distance;
      const visibleWidth = visibleHeight * camera.aspect;
      return { halfWidth: visibleWidth / 2, halfHeight: visibleHeight / 2 };
    };

    const numBalls = 220; // dense swarm covering the full page

    for (let i = 0; i < numBalls; i++) {
      // Each ball is its own independent sprite — no grouping into clusters
      // Skew toward smaller balls with occasional larger ones for natural variety
      const baseSize = 0.12 + Math.pow(Math.random(), 1.6) * 1.0;

      const brightness = 0.75 + Math.random() * 0.45;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: fuzzyTexture,
        color: new THREE.Color(
          BALL_COLOR.r * brightness,
          BALL_COLOR.g * brightness,
          BALL_COLOR.b * brightness
        ),
        transparent: true,
        opacity: 0.4 + Math.random() * 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.setScalar(baseSize);

      const homeZ = -4 + Math.random() * 5;
      const { halfWidth, halfHeight } = getVisibleBoundsAtZ(homeZ);

      const homeX = (Math.random() * 2 - 1) * halfWidth;
      const homeY = (Math.random() * 2 - 1) * halfHeight;

      sprite.position.set(homeX, homeY, homeZ);
      scene.add(sprite);

      furBalls.push({
        points: sprite,
        homePosition: new THREE.Vector3(homeX, homeY, homeZ),
        velocity: new THREE.Vector3(0, 0, 0),
        // Slow, lazy "swimming" drift — like moving gently through water
        driftOffset: Math.random() * 100,
        driftOffset2: Math.random() * 100,
        driftSpeed: 0.0012 + Math.random() * 0.0022,
        radius: baseSize,
        baseSize,
        isHovered: false,
      });
    }

    // Mouse tracking
    const mouse = new THREE.Vector2(-9999, -9999);
    const mouse3D = new THREE.Vector3(-9999, -9999, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Render loop
    const clock = new THREE.Clock();

    const animate = () => {
      // Stop scheduling new frames as soon as this effect instance is torn down
      if (!isActive) return;

      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Project mouse to Z = 0 plane
      if (mouse.x !== -9999) {
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, intersectPoint);
        mouse3D.copy(intersectPoint);
      }

      furBalls.forEach((ball) => {
        // A. Slow, layered "swimming" drift — two gentle sine waves combined
        // feels more organic than one, like drifting currents in water
        const t1 = elapsed * ball.driftSpeed * 100 + ball.driftOffset;
        const t2 = elapsed * ball.driftSpeed * 55 + ball.driftOffset2;
        const driftForceX = Math.sin(t1) * 0.0016 + Math.sin(t2 * 0.6) * 0.001;
        const driftForceY = Math.cos(t1 * 0.8) * 0.0016 + Math.cos(t2 * 0.5) * 0.001;
        ball.velocity.x += driftForceX;
        ball.velocity.y += driftForceY;

        // B. Gentle pull back toward home so balls stay roughly in place
        const returnForce = new THREE.Vector3().subVectors(ball.homePosition, ball.points.position);
        returnForce.z = 0;
        ball.velocity.addScaledVector(returnForce, 0.003);

        // C. Mouse hover — slowly push the ball away, like water parting around your hand
        ball.isHovered = false;
        if (mouse.x !== -9999) {
          const ballFlatPos = new THREE.Vector3(ball.points.position.x, ball.points.position.y, 0);
          const distance = ballFlatPos.distanceTo(mouse3D);
          const repelRadius = 3.2;

          if (distance < repelRadius) {
            ball.isHovered = true;
            const forceDir = new THREE.Vector3().subVectors(ballFlatPos, mouse3D);
            forceDir.z = 0;
            forceDir.normalize();
            const strengthFactor = (repelRadius - distance) / repelRadius;
            // Small multiplier keeps the push slow and smooth, not a snap
            ball.velocity.addScaledVector(forceDir, strengthFactor * 0.02);
          }
        }

        // D. Heavy friction/drag — like moving through water, not air
        ball.velocity.multiplyScalar(0.95);
        ball.points.position.add(ball.velocity);
        ball.points.position.z = ball.homePosition.z;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup — runs on StrictMode unmount AND on HMR reload AND on real unmount
    return () => {
      isActive = false; // stops the RAF loop immediately at next frame check
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);

      // Safely remove only the canvas we added (not innerHTML wipe which can race)
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }

      fuzzyTexture.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="background-canvas"
    />
  );
};

export default BackgroundCanvas;