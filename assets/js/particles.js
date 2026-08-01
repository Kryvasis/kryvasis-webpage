/* ──────────────────────────────────────────────────────────────────
   particles.js — Three.js ParticlesSwarm (Kerr accretion disk)
   with cursor-reactive hover pattern (inspired by Google Antigravity)
   Exposes: initParticlesSwarm(containerId, count)
   ────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  window.initParticlesSwarm = function (containerId, count) {
    var container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    count = count || 20000;
    var THREE = window.THREE;

    try {
      var scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.01);

      var camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 2000);
      camera.position.set(0, 0, 100);

      var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      container.appendChild(renderer.domElement);

      var composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      var bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(container.offsetWidth, container.offsetHeight), 1.5, 0.4, 0.85
      );
      bloomPass.strength = 1.8;
      bloomPass.radius = 0.4;
      bloomPass.threshold = 0;
      composer.addPass(bloomPass);

      var dummy = new THREE.Object3D();
      var color = new THREE.Color();
      var target = new THREE.Vector3();

      var geometry = new THREE.TetrahedronGeometry(0.25);
      var material = new THREE.MeshBasicMaterial({ color: 0xffffff });

      var mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);

      var positions = [];
      for (var i = 0; i < count; i++) {
        positions.push(new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ));
        mesh.setColorAt(i, color.setHex(0x00ff88));
      }

      /* ── Cursor-reactive hover ── */
      var mouse = { x: 0, y: 0, active: false };
      var mouseWorld = new THREE.Vector3(0, 0, 0);
      var hoverStrength = 0;
      var targetHover = 0;

      container.addEventListener('mouseenter', function () { mouse.active = true; targetHover = 1; });
      container.addEventListener('mouseleave', function () { mouse.active = false; targetHover = 0; });
      container.addEventListener('mousemove', function (e) {
        var rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      });

      /* Also track on hero section for full-viewport feel */
      var heroSection = container.closest('.hero') || container.parentElement;
      if (heroSection) {
        heroSection.addEventListener('mouseenter', function () { mouse.active = true; targetHover = 1; });
        heroSection.addEventListener('mouseleave', function () { mouse.active = false; targetHover = 0; });
        heroSection.addEventListener('mousemove', function (e) {
          var rect = container.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });
      }

      var clock = new THREE.Clock();
      var speedMult = 1;
      var pi2 = 6.28318530718;
      var paused = false;
      var animFrameId;

      function animate() {
        animFrameId = requestAnimationFrame(animate);
        if (paused || document.hidden) {
          return;
        }
        var time = clock.getElapsedTime() * speedMult;

        /* Smooth hover interpolation */
        hoverStrength += (targetHover - hoverStrength) * 0.04;
        mouseWorld.set(mouse.x * 50, mouse.y * 50, 0);

        var mass = 41;
        var spin = 0.5544;
        var disk = 157;
        var lens = 1.62;
        var turb = 0.75;
        var arms = 240.0;

        for (var i = 0; i < count; i++) {
          var row = Math.floor(i / arms);
          var col = i - row * arms;
          var u = (col + 0.5) / arms;
          var v = (row + 0.5) / ((count / arms) + 1.0);

          var theta0 = pi2 * u;

          var rh = 0.18 * disk * (1.0 + Math.sqrt(1.0 - spin * spin));
          var risco = rh * (1.45 - 0.35 * spin);
          var r = risco + (disk - risco) * Math.sqrt(v);
          var rr = r / disk;

          var omega = 1.8 / Math.pow(rr + 0.12, 1.5) + 0.9 * spin / ((rr + 0.12) * (rr + 0.12));
          var theta = theta0 + omega * time;

          var spiral = turb * 0.025 * r * Math.sin(7.0 * theta - 2.0 * time + 18.0 * rr);
          var rad = r + spiral;

          var photonR = rh * 1.55;
          var d = (rad - photonR) / (0.05 * disk + 0.001);
          var photon = Math.exp(-d * d);
          var bend = lens * photon * 0.22 * disk;

          var thickness = 0.01 * disk;
          var z = thickness * Math.sin(25.0 * theta + 10.0 * rr) + bend * Math.sin(theta);
          var x = rad * Math.cos(theta);
          var y = rad * Math.sin(theta);

          target.set(x, y, z);

          /* Cursor attraction — particles drift toward mouse */
          if (hoverStrength > 0.01) {
            var dx = mouseWorld.x - x;
            var dy = mouseWorld.y - y;
            var dist = Math.sqrt(dx * dx + dy * dy) + 1;
            var pull = (hoverStrength * 8) / (dist * dist);
            target.x += dx * pull;
            target.y += dy * pull;
          }

          var beam = 0.5 + 0.5 * Math.cos(theta);
          var hot = Math.exp(-80.0 * (rr - 0.55 - 0.05 * Math.sin(0.15 * time)) * (rr - 0.55 - 0.05 * Math.sin(0.15 * time)))
                    * Math.exp(-18.0 * (1.0 - Math.cos(theta - time)));

          var glow = 0.55 * photon + 0.30 * beam + 0.35 * hot;
          var hue = 0.10 - 0.08 * beam - 0.03 * photon;
          var sat = 0.92 - 0.65 * photon - 0.25 * beam;
          var light = 0.05 + 0.78 * glow + 0.10 * Math.pow(1.0 - rr, 1.5);

          /* Brighten particles near cursor */
          if (hoverStrength > 0.01) {
            var brightBoost = hoverStrength * 0.3 / (1 + dist * 0.05);
            light = Math.min(light + brightBoost, 1.0);
            sat = Math.min(sat + brightBoost * 0.2, 1.0);
          }

          color.setHSL(hue - Math.floor(hue), sat < 0.0 ? 0.0 : sat, light > 1.0 ? 1.0 : light);

          positions[i].lerp(target, 0.1);
          dummy.position.copy(positions[i]);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          mesh.setColorAt(i, color);
        }

        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        composer.render();
      }

      var resizeTimer;
      function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          camera.aspect = container.offsetWidth / container.offsetHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.offsetWidth, container.offsetHeight);
          composer.setSize(container.offsetWidth, container.offsetHeight);
        }, 150);
      }

      /* ── Dispose GPU resources on page unload ── */
      function cleanupParticles() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('beforeunload', cleanupParticles);
        if (mesh) {
          mesh.geometry.dispose();
          mesh.material.dispose();
          scene.remove(mesh);
        }
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
        if (composer) composer = null;
        positions.length = 0;
      }

      window.addEventListener('resize', onResize);
      window.addEventListener('beforeunload', cleanupParticles);

      /* Expose cleanup so page-level scripts can dispose manually */
      window._cleanupParticlesSwarm = cleanupParticles;

      animate();
    } catch (e) {
      console.warn('ParticlesSwarm init failed:', e);
    }
  };
})();
