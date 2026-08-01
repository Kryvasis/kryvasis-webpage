/* ============================================
   blackhole.js — Reusable Kerr Black Hole Animation
   Gargantua-inspired with relativistic disk, photon ring,
   frame dragging, Doppler brightening, and lensing illusion.
   Exposes: initBlackHole(canvasId)
   ============================================ */

(function () {
  'use strict';

  window.initBlackHole = function (canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    try {
      var COUNT = 20000;
      var SPEED_MULT = 0.5;

      var scene, camera, renderer, controls, composer;
      var instancedMesh;
      var positions = [];
      var dummy = new THREE.Object3D();
      var color = new THREE.Color();
      var target = new THREE.Vector3();
      var clock = new THREE.Clock();
      var paused = false;
      var animFrameId;

      function setup() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.01);

        camera = new THREE.PerspectiveCamera(
          60,
          canvas.clientWidth / canvas.clientHeight,
          0.1,
          2000
        );
        camera.position.set(0, 0, 100);

        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controls.enableZoom = false;
        controls.enablePan = false;

        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        var bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
          1.5, 0.4, 0.85
        );
        bloomPass.strength = 1.8;
        bloomPass.radius = 0.4;
        bloomPass.threshold = 0;
        composer.addPass(bloomPass);

        var geometry = new THREE.TetrahedronGeometry(0.25);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        instancedMesh = new THREE.InstancedMesh(geometry, material, COUNT);
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(instancedMesh);

        for (var i = 0; i < COUNT; i++) {
          positions.push(
            new THREE.Vector3(
              (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 100
            )
          );
          instancedMesh.setColorAt(i, color.setHex(0x00ff88));
        }
      }

      function animate() {
        animFrameId = requestAnimationFrame(animate);
        if (paused || document.hidden) {
          return;
        }
        var time = clock.getElapsedTime() * SPEED_MULT;

        controls.update();

        var mass = 41;
        var spin = 0.5544;
        var disk = 157;
        var lensVal = 1.62;
        var turb = 0.75;

        var pi2 = 6.28318530718;
        var arms = 240.0;

        for (var i = 0; i < COUNT; i++) {
          var row = Math.floor(i / arms);
          var col = i - row * arms;

          var u = (col + 0.5) / arms;
          var v = (row + 0.5) / ((COUNT / arms) + 1.0);

          var theta0 = pi2 * u;

          var rh = 0.18 * disk * (1.0 + Math.sqrt(1.0 - spin * spin));
          var risco = rh * (1.45 - 0.35 * spin);
          var r = risco + (disk - risco) * Math.sqrt(v);
          var rr = r / disk;

          var omega =
            1.8 / Math.pow(rr + 0.12, 1.5) +
            0.9 * spin / ((rr + 0.12) * (rr + 0.12));

          var theta = theta0 + omega * time;

          var spiral =
            turb * 0.025 * r *
            Math.sin(7.0 * theta - 2.0 * time + 18.0 * rr);

          var rad = r + spiral;

          var photonR = rh * 1.55;
          var d = (rad - photonR) / (0.05 * disk + 0.001);
          var photon = Math.exp(-d * d);

          var bend = lensVal * photon * 0.22 * disk;

          var thickness = 0.01 * disk;
          var z =
            thickness * Math.sin(25.0 * theta + 10.0 * rr) +
            bend * Math.sin(theta);

          var x = rad * Math.cos(theta);
          var y = rad * Math.sin(theta);

          target.set(x, y, z);

          var beam = 0.5 + 0.5 * Math.cos(theta);

          var hot =
            Math.exp(
              -80.0 *
              (rr - 0.55 - 0.05 * Math.sin(0.15 * time)) *
              (rr - 0.55 - 0.05 * Math.sin(0.15 * time))
            ) *
            Math.exp(-18.0 * (1.0 - Math.cos(theta - time)));

          var glow = 0.55 * photon + 0.30 * beam + 0.35 * hot;

          var hue = 0.10 - 0.08 * beam - 0.03 * photon;

          var sat = 0.92 - 0.65 * photon - 0.25 * beam;

          var light = 0.05 + 0.78 * glow + 0.10 * Math.pow(1.0 - rr, 1.5);

          color.setHSL(
            hue - Math.floor(hue),
            sat < 0.0 ? 0.0 : sat,
            light > 1.0 ? 1.0 : light
          );

          positions[i].lerp(target, 0.1);
          dummy.position.copy(positions[i]);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(i, dummy.matrix);
          instancedMesh.setColorAt(i, color);
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.instanceColor.needsUpdate = true;

        composer.render();
      }

      var resizeTimer;
      function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var w = canvas.clientWidth;
          var h = canvas.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          composer.setSize(w, h);
        }, 150);
      }

      /* ── Dispose GPU resources on page unload ── */
      function cleanupBlackHole() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('beforeunload', cleanupBlackHole);
        if (controls) controls.dispose();
        if (instancedMesh) {
          instancedMesh.geometry.dispose();
          instancedMesh.material.dispose();
          scene.remove(instancedMesh);
        }
        if (renderer) {
          renderer.dispose();
        }
        positions.length = 0;
        scene.fog = null;
        if (composer) composer = null;
      }

      setup();
      animate();
      window.addEventListener('resize', onResize);
      window.addEventListener('beforeunload', cleanupBlackHole);
      window._cleanupBlackHole = cleanupBlackHole;
    } catch (e) {
      console.warn('BlackHole init failed:', e);
    }
  };
})();
