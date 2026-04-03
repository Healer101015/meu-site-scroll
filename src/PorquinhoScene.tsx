import { Canvas, useFrame } from '@react-three/fiber';
import {
    Environment,
    Float,
    Html,
    useGLTF,
    useAnimations,
    Sparkles,
    Center,
    Text
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';

function CenaScroll() {
    const estatico = useGLTF('/3d.glb');
    const animado = useGLTF('/3dAndando.glb');
    const { actions, names } = useAnimations(animado.animations, animado.scene);

    const estaticoRef = useRef<THREE.Group>(null);
    const animadoRef = useRef<THREE.Group>(null);
    const grupoGeralRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (names && names.length > 0 && actions[names[0]]) {
            actions[names[0]]?.reset().play();
        }
    }, [actions, names]);

    useFrame((state) => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progresso = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

        const estaCorrendo = progresso > 0.25;

        // ATENÇÃO: Se o modelo animado ficar muito pequeno/grande, ajusta o 100 abaixo
        // Se o modelo estático ficar muito pequeno/grande, ajusta o 1.5 abaixo
        const escalaEstaticoAlvo = estaCorrendo ? 0.001 : 1.5;
        const escalaAnimadoAlvo = estaCorrendo ? 100 : 0.001;

        if (estaticoRef.current && animadoRef.current) {
            // A mágica da transição suave aplicada de forma segura
            estaticoRef.current.scale.lerp(new THREE.Vector3(escalaEstaticoAlvo, escalaEstaticoAlvo, escalaEstaticoAlvo), 0.08);
            animadoRef.current.scale.lerp(new THREE.Vector3(escalaAnimadoAlvo, escalaAnimadoAlvo, escalaAnimadoAlvo), 0.08);
        }

        if (grupoGeralRef.current) {
            const rotacaoScroll = progresso * Math.PI * 2;
            const alvoX = (state.pointer.x * Math.PI) * 0.05;
            const alvoY = (state.pointer.y * Math.PI) * 0.05;

            // Parallax e rotação blindados
            grupoGeralRef.current.rotation.y = THREE.MathUtils.lerp(grupoGeralRef.current.rotation.y, rotacaoScroll + alvoX, 0.05);
            grupoGeralRef.current.rotation.x = THREE.MathUtils.lerp(grupoGeralRef.current.rotation.x, alvoY, 0.05);
            grupoGeralRef.current.position.z = THREE.MathUtils.lerp(grupoGeralRef.current.position.z, progresso * 2, 0.05);
        }
    });

    return (
        <group ref={grupoGeralRef}>
            {/* CORREÇÃO: O Center está agora dentro do grupo individual, garantindo que não fogem do ecrã */}
            <group ref={estaticoRef} scale={1.5}>
                <Center>
                    <primitive object={estatico.scene} />
                </Center>
            </group>

            <group ref={animadoRef} scale={0.001}>
                <Center>
                    <primitive object={animado.scene} />
                </Center>
            </group>
        </group>
    );
}

export default function PorquinhoScene() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0.5, 8], fov: 45 }}>
                <fog attach="fog" args={['#020203', 5, 20]} />

                <ambientLight intensity={0.4} />
                <spotLight position={[0, 10, 5]} intensity={4.0} color="#ffebc2" penumbra={1} />
                <pointLight position={[5, -5, 5]} intensity={2.0} color="#ffd700" />
                <spotLight position={[-8, 3, -8]} intensity={8.0} color="#a855f7" distance={30} penumbra={0.5} />

                <Suspense fallback={null}>
                    <Environment preset="city" />

                    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                        <Text position={[-4, 2, -5]} color="rgba(255,255,255,0.1)" fontSize={0.8}>Saudade</Text>
                        <Text position={[4, -2, -6]} color="rgba(215,185,0,0.1)" fontSize={0.6}>Amor</Text>
                        <Text position={[-3, -3, -4]} color="rgba(168,85,247,0.08)" fontSize={0.5}>Sempre</Text>
                    </Float>

                    <Sparkles count={400} scale={15} size={1.5} speed={0.2} opacity={0.5} color="#ffd700" />
                    <Sparkles count={200} scale={20} size={3.0} speed={0.4} opacity={0.15} color="#a855f7" />

                    <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}>
                        <CenaScroll />
                    </Float>

                    <EffectComposer disableNormalPass>
                        {/* Removi o DepthOfField que estava a desfocar a cena e adicionei Noise cinematográfico */}
                        <Noise opacity={0.04} />
                        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={2.0} />
                        <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
                        <Vignette eskil={false} offset={0.15} darkness={1.1} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}