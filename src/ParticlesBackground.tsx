import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

const ParticleSwarm = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const smoothedProgress = useRef(0);
    const scrollVelocity = useRef(0);
    const { viewport, camera } = useThree(); // Pegamos os dados reais da câmera

    // ADIÇÃO 3: Estado da Onda de Choque (Click)
    const shockwave = useRef({ active: false, time: 0, x: 0, y: 0 });

    const count = 3000;

    const particleTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.arc(32, 32, 32, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const {
        spherePositions, cubePositions, randomPositions,
        sphereColors, cubeColors, randomColors
    } = useMemo(() => {
        const sphereP = new Float32Array(count * 3);
        const cubeP = new Float32Array(count * 3);
        const randomP = new Float32Array(count * 3);
        const sphereC = new Float32Array(count * 3);
        const cubeC = new Float32Array(count * 3);
        const randomC = new Float32Array(count * 3);

        const colorSphere = new THREE.Color('#a855f7'); // Roxo Neon
        const colorCube = new THREE.Color('#22d3ee');   // Ciano Neon
        const colorRandom = new THREE.Color('#fb7185'); // Rosa Neon

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 2.5;
            sphereP[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            sphereP[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            sphereP[i * 3 + 2] = radius * Math.cos(phi);

            const size = 3.5;
            cubeP[i * 3] = (Math.random() - 0.5) * size;
            cubeP[i * 3 + 1] = (Math.random() - 0.5) * size;
            cubeP[i * 3 + 2] = (Math.random() - 0.5) * size;

            const spread = 20;
            randomP[i * 3] = (Math.random() - 0.5) * spread;
            randomP[i * 3 + 1] = (Math.random() - 0.5) * spread;
            randomP[i * 3 + 2] = (Math.random() - 0.5) * spread;

            const mix = Math.random() * 0.3; // Aumentei o contraste de cor
            sphereC[i * 3] = colorSphere.r + mix; sphereC[i * 3 + 1] = colorSphere.g + mix; sphereC[i * 3 + 2] = colorSphere.b + mix;
            cubeC[i * 3] = colorCube.r + mix; cubeC[i * 3 + 1] = colorCube.g + mix; cubeC[i * 3 + 2] = colorCube.b + mix;
            randomC[i * 3] = colorRandom.r + mix; randomC[i * 3 + 1] = colorRandom.g + mix; randomC[i * 3 + 2] = colorRandom.b + mix;
        }

        return {
            spherePositions: sphereP, cubePositions: cubeP, randomPositions: randomP,
            sphereColors: sphereC, cubeColors: cubeC, randomColors: randomC
        };
    }, [count]);

    const currentPositions = useMemo(() => new Float32Array(count * 3), [count]);
    const currentColors = useMemo(() => new Float32Array(count * 3), [count]);

    // OUVINTE DE CLIQUE (Ativa a onda de choque)
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Converte a posição do clique da tela (pixels) para o mundo 3D (-1 a 1)
            shockwave.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            shockwave.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
            shockwave.current.time = 0;
            shockwave.current.active = true;
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const scrollContainer = document.getElementById('main-scroll-container');
        let targetProgress = 0;
        if (scrollContainer) {
            targetProgress = scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight);
        }

        const scrollDelta = targetProgress - smoothedProgress.current;
        scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, scrollDelta * 15, 0.1);

        smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, targetProgress, 0.05);
        const progress = smoothedProgress.current;

        pointsRef.current.rotation.y = (state.clock.elapsedTime * 0.1) + scrollVelocity.current;
        pointsRef.current.rotation.x = state.clock.elapsedTime * 0.05;

        // Mouse no mundo 3D
        const mouseX = state.pointer.x;
        const mouseY = state.pointer.y;

        // Movimento cinematográfico da câmera
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX * 2, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseY * 2, 0.05);
        camera.lookAt(0, 0, 0);

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;

        // Atualiza o tempo da onda de choque
        if (shockwave.current.active) {
            shockwave.current.time += delta * 5; // Velocidade da expansão
            if (shockwave.current.time > Math.PI) shockwave.current.active = false;
        }

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            let targetX, targetY, targetZ;

            // Define a posição base dependendo do scroll
            if (progress < 0.5) {
                const t = Math.min(progress * 2, 1);
                targetX = THREE.MathUtils.lerp(spherePositions[i3], cubePositions[i3], t);
                targetY = THREE.MathUtils.lerp(spherePositions[i3 + 1], cubePositions[i3 + 1], t);
                targetZ = THREE.MathUtils.lerp(spherePositions[i3 + 2], cubePositions[i3 + 2], t);

                colors[i3] = THREE.MathUtils.lerp(sphereColors[i3], cubeColors[i3], t);
                colors[i3 + 1] = THREE.MathUtils.lerp(sphereColors[i3 + 1], cubeColors[i3 + 1], t);
                colors[i3 + 2] = THREE.MathUtils.lerp(sphereColors[i3 + 2], cubeColors[i3 + 2], t);
            } else {
                const t = Math.min((progress - 0.5) * 2, 1);
                targetX = THREE.MathUtils.lerp(cubePositions[i3], randomPositions[i3], t);
                targetY = THREE.MathUtils.lerp(cubePositions[i3 + 1], randomPositions[i3 + 1], t);
                targetZ = THREE.MathUtils.lerp(cubePositions[i3 + 2], randomPositions[i3 + 2], t);

                colors[i3] = THREE.MathUtils.lerp(cubeColors[i3], randomColors[i3], t);
                colors[i3 + 1] = THREE.MathUtils.lerp(cubeColors[i3 + 1], randomColors[i3 + 1], t);
                colors[i3 + 2] = THREE.MathUtils.lerp(cubeColors[i3 + 2], randomColors[i3 + 2], t);
            }

            // ADIÇÃO 2: Repulsão Magnética do Mouse
            // Calcula a distância entre o mouse e a partícula no mundo 3D
            const mouseWorldX = (mouseX * viewport.width) / 2;
            const mouseWorldY = (mouseY * viewport.height) / 2;

            // Usamos a distância euclidiana (otimizada sem sqrt para performance)
            const dx = targetX - mouseWorldX;
            const dy = targetY - mouseWorldY;
            const distanceSq = dx * dx + dy * dy;
            const repelRadiusSq = 4.0; // O quão "gordo" é o campo de força do mouse

            if (distanceSq < repelRadiusSq) {
                const force = (repelRadiusSq - distanceSq) / repelRadiusSq;
                // Empurra a partícula para longe do mouse
                targetX += dx * force * 0.5;
                targetY += dy * force * 0.5;
                targetZ += force * 2; // Faz ela "pular" para a frente também
            }

            // ADIÇÃO 3: Onda de Choque (Click)
            if (shockwave.current.active) {
                const swX = (shockwave.current.x * viewport.width) / 2;
                const swY = (shockwave.current.y * viewport.height) / 2;
                const distToClick = Math.sqrt((targetX - swX) ** 2 + (targetY - swY) ** 2);

                // Se a partícula estiver na frente da "onda", empurre-a
                const waveRadius = shockwave.current.time * 4;
                if (Math.abs(distToClick - waveRadius) < 1.5) {
                    const waveForce = Math.sin(shockwave.current.time) * 1.5;
                    targetX += (targetX - swX) * waveForce * 0.2;
                    targetY += (targetY - swY) * waveForce * 0.2;
                    targetZ += waveForce;
                }
            }

            // Aplica o Lerp final para deslizar suavemente até o Alvo (Mesmo empurrada pelo mouse, ela volta com física de mola)
            positions[i3] = THREE.MathUtils.lerp(positions[i3] || targetX, targetX, 0.1);
            positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1] || targetY, targetY, 0.1);
            positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2] || targetZ, targetZ, 0.1);
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
                <bufferAttribute attach="attributes-color" args={[currentColors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                map={particleTexture}
                vertexColors={true}
                transparent
                alphaTest={0.01}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
            />
        </points>
    );
};

export default function ParticlesBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            {/* ADIÇÃO 5: Fog (Neblina de profundidade). O que vai pra trás escurece no fundo preto */}
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#09090b', 5, 15]} />
                <ParticleSwarm />

                {/* ADIÇÃO 1 e 4: Pós-Processamento Profissional */}
                <EffectComposer>
                    {/* Bloom cria o brilho luminoso em volta das cores (Neon) */}
                    <Bloom
                        luminanceThreshold={0.1} // O quão brilhante algo tem que ser para ganhar neon
                        mipmapBlur
                        intensity={1.5}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}