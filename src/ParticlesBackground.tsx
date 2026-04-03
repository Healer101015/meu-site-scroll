import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- COMPONENTE DO PORQUINHO DA ÍNDIA ---
const GuineaPigModel = ({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) => {
    // Carrega o ficheiro que colocaste na pasta public
    const { scene } = useGLTF('/3d.glb');
    const modelRef = useRef<THREE.Group>(null);

    // Prepara os materiais do modelo para permitirem transparência (fading)
    useMemo(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const material = (child as THREE.Mesh).material as THREE.Material;
                material.transparent = true;
                material.needsUpdate = true;
            }
        });
    }, [scene]);

    useFrame(() => {
        if (!modelRef.current) return;
        const progress = scrollProgressRef.current;

        // LÓGICA DE DESVANECIMENTO (FADE OUT)
        // O progresso total vai de 0 a 1. A fase da "Perda/Silêncio" é por volta dos 40% (0.4).
        // Vamos fazer com que a opacidade diminua até desaparecer quando chegar a essa fase.
        let opacity = 1 - (progress * 2.5);
        if (opacity < 0) opacity = 0;
        if (opacity > 1) opacity = 1;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                ((child as THREE.Mesh).material as THREE.Material).opacity = opacity;
            }
        });

        // LÓGICA DE MOVIMENTO
        // Conforme a pessoa faz scroll, o bixinho sobe levemente e afasta-se, simbolizando a partida
        modelRef.current.position.y = THREE.MathUtils.lerp(modelRef.current.position.y, progress * 8 - 1, 0.05);
        modelRef.current.position.z = THREE.MathUtils.lerp(modelRef.current.position.z, -(progress * 10), 0.05);
    });

    return (
        // O efeito Float dá a sensação de respiração e vida, flutuando suavemente
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={modelRef} position={[0, -1, 0]}>
                {/* Ajusta o valor "scale" se o modelo ficar muito grande ou muito pequeno no ecrã */}
                <primitive object={scene} scale={1.5} />
            </group>
        </Float>
    );
};

// Carrega o modelo de antemão para não haver atrasos na imagem
useGLTF.preload('/3d.glb');


// --- SISTEMA DE PARTÍCULAS (MEMÓRIA) ---
const ParticleSwarm = ({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const { camera } = useThree();

    const count = 5000;
    const stagesCount = 6;

    const particleTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }, []);

    const { stagesPositions, stagesColors } = useMemo(() => {
        const pos = Array.from({ length: stagesCount }, () => new Float32Array(count * 3));
        const col = Array.from({ length: stagesCount }, () => new Float32Array(count * 3));

        const palettes = [
            new THREE.Color('#fef3c7'), // Âmbar (Vida)
            new THREE.Color('#fde68a'), // Ouro (Alegria)
            new THREE.Color('#4b5563'), // Cinza (Perda)
            new THREE.Color('#818cf8'), // Indigo (Estrelas)
            new THREE.Color('#f472b6'), // Rosa (Amor)
            new THREE.Color('#ffffff')  // Branco (Eternidade)
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            for (let s = 0; s < stagesCount; s++) {
                col[s][i3] = palettes[s].r; col[s][i3 + 1] = palettes[s].g; col[s][i3 + 2] = palettes[s].b;
            }

            // S0: Vida (Esfera em volta do modelo 3D)
            const phi = Math.acos(Math.random() * 2 - 1), theta = Math.random() * Math.PI * 2;
            pos[0][i3] = 4 * Math.sin(phi) * Math.cos(theta); pos[0][i3 + 1] = 4 * Math.sin(phi) * Math.sin(theta); pos[0][i3 + 2] = 4 * Math.cos(phi);

            // S1: Alegria (Anel em expansão)
            const r1 = 5 + Math.random() * 2, t1 = Math.random() * Math.PI * 2;
            pos[1][i3] = r1 * Math.cos(t1); pos[1][i3 + 1] = (Math.random() - 0.5) * 2; pos[1][i3 + 2] = r1 * Math.sin(t1);

            // S2: Perda (Caos disperso)
            pos[2][i3] = (Math.random() - 0.5) * 20; pos[2][i3 + 1] = (Math.random() - 0.5) * 20; pos[2][i3 + 2] = (Math.random() - 0.5) * 20;

            // S3: Estrelas (Cilindro infinito)
            const t3 = Math.random() * Math.PI * 2;
            pos[3][i3] = 6 * Math.cos(t3); pos[3][i3 + 1] = (Math.random() - 0.5) * 30; pos[3][i3 + 2] = 6 * Math.sin(t3);

            // S4: Amor (Torus)
            const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
            pos[4][i3] = (4 + 1.5 * Math.cos(v)) * Math.cos(u); pos[4][i3 + 1] = 1.5 * Math.sin(v); pos[4][i3 + 2] = (4 + 1.5 * Math.cos(v)) * Math.sin(u);

            // S5: Eternidade (Nebulosa suave)
            const r5 = 10 * Math.cbrt(Math.random());
            pos[5][i3] = r5 * Math.sin(phi) * Math.cos(theta); pos[5][i3 + 1] = r5 * Math.sin(phi) * Math.sin(theta); pos[5][i3 + 2] = r5 * Math.cos(phi);
        }
        return { stagesPositions: pos, stagesColors: col };
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const prog = scrollProgressRef.current * (stagesCount - 1);
        const cur = Math.floor(prog);
        const next = Math.min(cur + 1, stagesCount - 1);
        const t = prog - cur;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = THREE.MathUtils.lerp(stagesPositions[cur][i3], stagesPositions[next][i3], t) + Math.sin(state.clock.elapsedTime + i) * 0.02;
            positions[i3 + 1] = THREE.MathUtils.lerp(stagesPositions[cur][i3 + 1], stagesPositions[next][i3 + 1], t);
            positions[i3 + 2] = THREE.MathUtils.lerp(stagesPositions[cur][i3 + 2], stagesPositions[next][i3 + 2], t);

            colors[i3] = THREE.MathUtils.lerp(stagesColors[cur][i3], stagesColors[next][i3], t);
            colors[i3 + 1] = THREE.MathUtils.lerp(stagesColors[cur][i3 + 1], stagesColors[next][i3 + 1], t);
            colors[i3 + 2] = THREE.MathUtils.lerp(stagesColors[cur][i3 + 2], stagesColors[next][i3 + 2], t);
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;

        pointsRef.current.rotation.y += 0.002;
        camera.position.x = (scrollProgressRef.current * 10) - 5;
        camera.lookAt(0, 0, 0);
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[new Float32Array(count * 3), 3]} />
                <bufferAttribute attach="attributes-color" args={[new Float32Array(count * 3), 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.08} map={particleTexture} vertexColors transparent alphaTest={0.01} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    );
};

// --- COMPONENTE PRINCIPAL QUE ENGLOBA TUDO ---
export default function ParticlesBackground() {
    const scrollProgressRef = useRef(0);

    // Capturar o scroll a partir do root da janela para passar para o 3D
    useEffect(() => {
        const handleScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgressRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            {/* O modelo GLTF também precisa de luz para ser visível */}
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <color attach="background" args={['#050505']} />

                {/* Luzes para iluminar o porquinho-da-índia */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#fde68a" />
                <directionalLight position={[-10, 5, -5]} intensity={1} color="#818cf8" />

                <GuineaPigModel scrollProgressRef={scrollProgressRef} />
                <ParticleSwarm scrollProgressRef={scrollProgressRef} />

                <EffectComposer>
                    <Bloom intensity={1.5} luminanceThreshold={0.2} mipmapBlur />
                    <DepthOfField focusDistance={0.02} focalLength={0.2} bokehScale={3} />
                    <Vignette darkness={1.2} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}