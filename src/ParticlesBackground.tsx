import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

const ParticleSwarm = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const dustRef = useRef<THREE.Points>(null);
    const smoothedProgress = useRef(0);
    const scrollVelocity = useRef(0);
    const aberrationAmount = useRef(0); // Controla a distorção RGB no scroll rápido
    const { viewport, camera } = useThree();

    const mouseState = useRef({ isDown: false, downTime: 0, x: 0, y: 0 });

    const count = 4000;
    const dustCount = 2000;

    const particleTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const { stagesPositions, stagesColors } = useMemo(() => {
        const pos = Array.from({ length: 10 }, () => new Float32Array(count * 3));
        const col = Array.from({ length: 10 }, () => new Float32Array(count * 3));

        // Paleta elegante e dessaturada (estilo agência francesa)
        const palettes = [
            new THREE.Color('#d8b4fe'), // Lilás
            new THREE.Color('#bae6fd'), // Azul suave
            new THREE.Color('#a7f3d0'), // Verde menta
            new THREE.Color('#fcd34d'), // Ouro claro
            new THREE.Color('#fbcfe8'), // Rosa pálido
            new THREE.Color('#7dd3fc'), // Azul céu
            new THREE.Color('#c4b5fd'), // Lavanda
            new THREE.Color('#fca5a5'), // Pêssego
            new THREE.Color('#fda4af'), // Coral
            new THREE.Color('#ffffff')  // Branco puro
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const mix = Math.random() * 0.4;
            for (let stage = 0; stage < 10; stage++) {
                col[stage][i3] = palettes[stage].r + mix;
                col[stage][i3 + 1] = palettes[stage].g + mix;
                col[stage][i3 + 2] = palettes[stage].b + mix;
            }

            // 0: Esfera
            const phi0 = Math.acos(Math.random() * 2 - 1), theta0 = Math.random() * Math.PI * 2;
            pos[0][i3] = 4 * Math.sin(phi0) * Math.cos(theta0); pos[0][i3 + 1] = 4 * Math.sin(phi0) * Math.sin(theta0); pos[0][i3 + 2] = 4 * Math.cos(phi0);
            // 1: Anel Expandido
            const rT = Math.random() * Math.PI * 2;
            pos[1][i3] = (3 + Math.random() * 2.5) * Math.cos(rT); pos[1][i3 + 1] = (Math.random() - 0.5) * 0.4; pos[1][i3 + 2] = (3 + Math.random() * 2.5) * Math.sin(rT);
            // 2: DNA
            const dY = (Math.random() - 0.5) * 12, st = i % 2 === 0 ? 0 : Math.PI;
            pos[2][i3] = Math.cos(dY * 2 + st) * 2; pos[2][i3 + 1] = dY; pos[2][i3 + 2] = Math.sin(dY * 2 + st) * 2;
            // 3: Cubo
            pos[3][i3] = (Math.random() - 0.5) * 6; pos[3][i3 + 1] = (Math.random() - 0.5) * 6; pos[3][i3 + 2] = (Math.random() - 0.5) * 6;
            // 4: Torus
            const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
            pos[4][i3] = (3 + 1.2 * Math.cos(v)) * Math.cos(u); pos[4][i3 + 1] = 1.2 * Math.sin(v); pos[4][i3 + 2] = (3 + 1.2 * Math.cos(v)) * Math.sin(u);
            // 5: Oceano
            pos[5][i3] = (Math.random() - 0.5) * 18; pos[5][i3 + 1] = 0; pos[5][i3 + 2] = (Math.random() - 0.5) * 18;
            // 6: Cilindro Longo
            const cT = Math.random() * Math.PI * 2;
            pos[6][i3] = 3.5 * Math.cos(cT); pos[6][i3 + 1] = (Math.random() - 0.5) * 14; pos[6][i3 + 2] = 3.5 * Math.sin(cT);
            // 7: Gargantua
            const bR = 1.5 + Math.pow(Math.random(), 3) * 8;
            pos[7][i3] = bR * Math.cos(bR); pos[7][i3 + 1] = (Math.random() - 0.5) * (1.5 / (bR - 1.0)); pos[7][i3 + 2] = bR * Math.sin(bR);
            // 8: Caos
            pos[8][i3] = (Math.random() - 0.5) * 35; pos[8][i3 + 1] = (Math.random() - 0.5) * 35; pos[8][i3 + 2] = (Math.random() - 0.5) * 35;
            // 9: Nebulosa
            const nR = 9 * Math.cbrt(Math.random()), nP = Math.acos(Math.random() * 2 - 1), nT = Math.random() * Math.PI * 2;
            pos[9][i3] = nR * Math.sin(nP) * Math.cos(nT); pos[9][i3 + 1] = nR * Math.sin(nP) * Math.sin(nT); pos[9][i3 + 2] = nR * Math.cos(nP);
        }
        return { stagesPositions: pos, stagesColors: col };
    }, [count]);

    const currentPositions = useMemo(() => new Float32Array(count * 3), [count]);
    const currentColors = useMemo(() => new Float32Array(count * 3), [count]);

    const dustPositions = useMemo(() => {
        const arr = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 50;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 50;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 40 - 15;
        }
        return arr;
    }, [dustCount]);

    useEffect(() => {
        const handleDown = () => mouseState.current.isDown = true;
        const handleUp = () => { mouseState.current.isDown = false; mouseState.current.downTime = 0; };
        const handleMove = (e: MouseEvent) => {
            mouseState.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseState.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousedown', handleDown);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('mousemove', handleMove);
        return () => {
            window.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('mousemove', handleMove);
        };
    }, []);

    useFrame((state, delta) => {
        if (!pointsRef.current || !dustRef.current) return;

        // Captura o scroll de forma global na janela
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let targetProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

        const scrollDelta = targetProgress - smoothedProgress.current;
        scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, scrollDelta * 20, 0.05);
        smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, targetProgress, 0.04);

        const progress = smoothedProgress.current;
        const time = state.clock.elapsedTime;
        const mouseX = mouseState.current.x, mouseY = mouseState.current.y;

        const perspectiveCamera = camera as THREE.PerspectiveCamera;

        // ADIÇÃO: Aberração Cromática atrelada à velocidade do scroll
        aberrationAmount.current = THREE.MathUtils.lerp(aberrationAmount.current, Math.abs(scrollDelta) * 0.1, 0.1);

        // O VOO PANORÂMICO (PAN X + ZOOM Z)
        // A câmera se move fisicamente para a direita conforme você rola a página, simulando o ambiente horizontal
        const targetX = (progress * 15) - 7.5; // Vai de -7.5 até 7.5
        const targetZ = 12 - (progress * 10);

        perspectiveCamera.position.x = THREE.MathUtils.lerp(perspectiveCamera.position.x, targetX + (mouseX * 1.5), 0.03);
        perspectiveCamera.position.z = THREE.MathUtils.lerp(perspectiveCamera.position.z, targetZ, 0.03);
        perspectiveCamera.position.y = THREE.MathUtils.lerp(perspectiveCamera.position.y, mouseY * 1.5, 0.03);

        // A câmera sempre olha levemente à frente no eixo X para antecipar o movimento
        perspectiveCamera.lookAt(targetX * 1.2, 0, targetZ - 10);
        perspectiveCamera.updateProjectionMatrix();

        pointsRef.current.rotation.y = (time * 0.05) + scrollVelocity.current;
        pointsRef.current.rotation.x = time * 0.02;
        dustRef.current.rotation.y = -time * 0.01;
        dustRef.current.position.z = (time * 2) % 15;

        const mappedProgress = progress * 9;
        const currentStage = Math.floor(mappedProgress);
        const nextStage = Math.min(currentStage + 1, 9);
        const t = mappedProgress - currentStage;

        // Turbulência de Fluidos nas transições
        const turbulence = Math.sin(t * Math.PI) * 1.5;

        if (mouseState.current.isDown) mouseState.current.downTime += delta * 2;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;

        // Offset do mouse baseado na posição atual da câmera
        const mouseWorldX = perspectiveCamera.position.x + (mouseX * 8);
        const mouseWorldY = perspectiveCamera.position.y + (mouseY * 8);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            let pX = THREE.MathUtils.lerp(stagesPositions[currentStage][i3], stagesPositions[nextStage][i3], t);
            let pY = THREE.MathUtils.lerp(stagesPositions[currentStage][i3 + 1], stagesPositions[nextStage][i3 + 1], t);
            let pZ = THREE.MathUtils.lerp(stagesPositions[currentStage][i3 + 2], stagesPositions[nextStage][i3 + 2], t);

            let r = THREE.MathUtils.lerp(stagesColors[currentStage][i3], stagesColors[nextStage][i3], t);
            let g = THREE.MathUtils.lerp(stagesColors[currentStage][i3 + 1], stagesColors[nextStage][i3 + 1], t);
            let b = THREE.MathUtils.lerp(stagesColors[currentStage][i3 + 2], stagesColors[nextStage][i3 + 2], t);

            if (turbulence > 0.01) {
                pX += Math.sin(time * 2 + i * 0.1) * turbulence;
                pY += Math.cos(time * 2.5 + i * 0.1) * turbulence;
                pZ += Math.sin(time * 3 + i * 0.05) * turbulence;
                r += turbulence * 0.3; g += turbulence * 0.3; b += turbulence * 0.3; // Flash suave
            }

            if (currentStage === 7) {
                const distToCenter = Math.sqrt(pX * pX + pZ * pZ);
                const spinSpeed = time * (5 / (distToCenter + 0.5));
                const rx = pX * Math.cos(spinSpeed) - pZ * Math.sin(spinSpeed);
                const rz = pX * Math.sin(spinSpeed) + pZ * Math.cos(spinSpeed);
                pX = rx; pZ = rz;
                if (distToCenter < 2.0) { r += 0.5; g += 0.5; b += 0.5; } // Núcleo brilhante
            } else if (currentStage === 5) {
                pY += Math.sin(pX * 1.5 + time * 2) * 1.0;
            }

            if (mouseState.current.isDown) {
                pX = THREE.MathUtils.lerp(pX, mouseWorldX + (Math.random() - 0.5) * 2, 0.08);
                pY = THREE.MathUtils.lerp(pY, mouseWorldY + (Math.random() - 0.5) * 2, 0.08);
                pZ = THREE.MathUtils.lerp(pZ, perspectiveCamera.position.z - 5, 0.05);
                r += 0.3; b += 0.5;
            }

            pZ += scrollVelocity.current * (Math.random() * 15);

            const lerpSpeed = mouseState.current.isDown ? 0.2 : 0.06;
            positions[i3] = THREE.MathUtils.lerp(positions[i3] || pX, pX, lerpSpeed);
            positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1] || pY, pY, lerpSpeed);
            positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2] || pZ, pZ, lerpSpeed);

            colors[i3] = r; colors[i3 + 1] = g; colors[i3 + 2] = b;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;

        // Atualiza a aberração cromática no shader postprocessing via State
        const chromaticMaterial = state.scene.userData.chromaticMaterial;
        if (chromaticMaterial) {
            chromaticMaterial.uniforms.offset.value.set(aberrationAmount.current, aberrationAmount.current);
        }
    });

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[currentColors, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.08} map={particleTexture} vertexColors transparent alphaTest={0.01} depthWrite={false} blending={THREE.AdditiveBlending} />
            </points>
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.03} map={particleTexture} color="#ffffff" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
            </points>

            {/* Componente para atualizar valores do EffectComposer */}
            <ChromaticAberrationController />
        </group>
    );
};

// Hook isolado para acessar a cena e atualizar a aberração dinamicamente
function ChromaticAberrationController() {
    const { scene } = useThree();
    const chromaticRef = useRef<any>();

    useFrame(() => {
        if (chromaticRef.current) {
            scene.userData.chromaticMaterial = chromaticRef.current;
        }
    });

    return null; // O componente em si não renderiza nada no DOM 3D
}

export default function ParticlesBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#050505', 4, 22]} />

                <ParticleSwarm />

                <EffectComposer>
                    {/* Depth of Field (Desfoque de Câmera de Cinema) */}
                    <DepthOfField focusDistance={0.01} focalLength={0.15} bokehScale={6} height={480} />
                    {/* Bloom (Luz Neon estourada nas partículas juntas) */}
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.8} />
                    {/* Aberração Cromática que ativa na velocidade */}
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0, 0)}
                    />
                    <Vignette eskil={false} offset={0.25} darkness={1.5} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}