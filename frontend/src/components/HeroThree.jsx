import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowRight, Play, Sparkles, CheckCircle2, Users, Star, Award } from 'lucide-react';

export default function HeroThree({ onExploreClick, onWatchPreviewClick }) {
  const mountRef = useRef(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect user reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set up Three.js Scene, Camera, Renderer
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init fallback:', e);
      return;
    }

    // Main Group for interactive tilt
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Core Sphere - Soft Rose Pink with subtle iridescent burgundy sheen
    const sphereGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F7DCE8'),
      emissive: new THREE.Color('#970747'),
      emissiveIntensity: 0.15,
      roughness: 0.18,
      metalness: 0.1,
      transmission: 0.5,
      ior: 1.45,
      thickness: 1.2,
      reflectivity: 0.8,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });
    const mainSphere = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(mainSphere);

    // 2. Inner Glowing Core - Primary Burgundy (#970747)
    const innerGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#970747'),
      roughness: 0.3,
      metalness: 0.8,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerSphere);

    // 3. Floating Orbital Torus Rings (Rose Pink & Burgundy)
    const ringGeo1 = new THREE.TorusGeometry(2.35, 0.045, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D63384'),
      metalness: 0.6,
      roughness: 0.2
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.65, 0.035, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F3A6C4'),
      metalness: 0.4,
      roughness: 0.3
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    mainGroup.add(ring2);

    // 4. Floating abstract petals / geometric crystals
    const petalCount = window.innerWidth < 768 ? 8 : 16;
    const petals = [];
    const petalGeo = new THREE.ConeGeometry(0.2, 0.45, 5);
    const petalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F3A6C4'),
      roughness: 0.2,
      metalness: 0.3,
      transmission: 0.6,
      thickness: 0.5
    });

    for (let i = 0; i < petalCount; i++) {
      const mesh = new THREE.Mesh(petalGeo, petalMat);
      const angle = (i / petalCount) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 0.7;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.2,
        Math.sin(angle) * radius
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = {
        speed: 0.01 + Math.random() * 0.015,
        rotSpeed: 0.02,
        angle: angle,
        radius: radius,
        yBase: mesh.position.y
      };
      mainGroup.add(mesh);
      petals.push(mesh);
    }

    // 5. Delicate Particle Cloud
    const particleCount = window.innerWidth < 768 ? 60 : 130;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorBurgundy = new THREE.Color('#970747');
    const colorRose = new THREE.Color('#D63384');
    const colorSoftPink = new THREE.Color('#F3A6C4');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const c = Math.random() > 0.6 ? colorBurgundy : Math.random() > 0.3 ? colorRose : colorSoftPink;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xD63384, 1.8);
    dirLight2.position.set(-5, -3, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x970747, 3.5, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    setIsSceneReady(true);

    // Mouse / Pointer Interaction with subtle dampening
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.45;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth dampening towards target
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        mainGroup.rotation.y = time * 0.25 + mouseX;
        mainGroup.rotation.x = Math.sin(time * 0.2) * 0.15 - mouseY;

        // Animate Rings
        ring1.rotation.z += 0.006;
        ring2.rotation.y -= 0.008;

        // Animate Petals
        petals.forEach((p) => {
          p.userData.angle += p.userData.speed;
          p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
          p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
          p.position.y = p.userData.yBase + Math.sin(time * 2 + p.userData.angle) * 0.25;
          p.rotation.x += p.userData.rotSpeed;
          p.rotation.y += p.userData.rotSpeed;
        });

        // Rotate subtle particles
        particles.rotation.y = -time * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#EBDDE4]">
      {/* Background Subtle Gradient & Circular Accents */}
      <div 
        className="absolute top-0 right-0 w-[550px] lg:w-[750px] h-[550px] lg:h-[750px] rounded-full opacity-60 pointer-events-none blur-3xl -mr-32 -mt-20"
        style={{
          background: 'radial-gradient(circle at 60% 40%, #F7DCE8 0%, #F3A6C4 35%, rgba(214, 51, 132, 0.2) 70%, transparent 100%)'
        }}
      />
      <div 
        className="absolute -bottom-24 left-10 w-96 h-96 rounded-full opacity-40 pointer-events-none blur-2xl"
        style={{
          background: 'radial-gradient(circle, #FDF5F8 0%, #F7DCE8 60%, transparent 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[560px]">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F7DCE8] border border-[#F3A6C4] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#970747] animate-pulse" />
              <span className="text-xs font-bold text-[#970747] tracking-wider uppercase font-mono">
                KAIRA WEBINAR HUB
              </span>
              <span className="text-[#D63384] text-xs font-medium">| 2026 Season</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#25171E] tracking-tight leading-[1.12]">
              Your next big idea <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#970747] via-[#D63384] to-[#970747]">
                starts here.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#66545D] leading-relaxed max-w-2xl font-normal">
              Discover expert-led webinars and practical workshops that help you build skills, connect with industry professionals and grow with confidence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="btn-primary px-8 py-4 text-base font-bold flex items-center gap-3 cursor-pointer"
              >
                <span>Explore Webinars</span>
                <ArrowRight className="w-5 h-5 text-white/90" />
              </button>

              <button
                onClick={onWatchPreviewClick}
                className="btn-secondary px-7 py-3.5 text-base font-semibold flex items-center gap-2.5 cursor-pointer shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#970747] text-white flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>Watch Preview</span>
              </button>
            </div>

            {/* Credibility / Highlights Badges */}
            <div className="pt-6 border-t border-[#EBDDE4] grid grid-cols-3 gap-4 max-w-xl">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[#970747]">
                  <Users className="w-4 h-4 text-[#D63384]" />
                  <span className="font-heading font-bold text-xl sm:text-2xl text-[#25171E]">15,000+</span>
                </div>
                <p className="text-xs text-[#66545D] font-medium">Learners Joined</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[#970747]">
                  <Star className="w-4 h-4 fill-[#D63384] text-[#D63384]" />
                  <span className="font-heading font-bold text-xl sm:text-2xl text-[#25171E]">4.9 / 5</span>
                </div>
                <p className="text-xs text-[#66545D] font-medium">Average Rating</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[#970747]">
                  <Award className="w-4 h-4 text-[#D63384]" />
                  <span className="font-heading font-bold text-xl sm:text-2xl text-[#25171E]">100%</span>
                </div>
                <p className="text-xs text-[#66545D] font-medium">Verified Credentials</p>
              </div>
            </div>

          </div>

          {/* Right 3D Visual with Three.js */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Decorative concentric soft pink circles behind 3D visual */}
            <div className="absolute w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full border border-[#F3A6C4]/40 bg-[#FDF5F8]/70 pointer-events-none animate-pulse" />
            <div className="absolute w-[260px] sm:w-[320px] h-[260px] sm:h-[320px] rounded-full border border-[#F7DCE8] pointer-events-none" />

            {/* Three.js Container */}
            <div 
              ref={mountRef} 
              className="w-[320px] sm:w-[420px] lg:w-[460px] h-[320px] sm:h-[420px] lg:h-[460px] relative z-10 flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Static Fallback Artwork while scene initializes */}
              {!isSceneReady && (
                <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-[#970747] via-[#D63384] to-[#F3A6C4] shadow-2xl flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Floating feature pill on bottom right */}
            <div className="absolute -bottom-3 sm:bottom-4 right-2 sm:right-6 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-[#EBDDE4] flex items-center gap-3 animate-bounce hover:animate-none">
              <div className="w-10 h-10 rounded-xl bg-[#F7DCE8] flex items-center justify-center text-[#970747]">
                <CheckCircle2 className="w-5 h-5 text-[#970747]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#25171E]">Interactive Q&A Included</p>
                <p className="text-[11px] text-[#66545D]">Live with domain experts</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
