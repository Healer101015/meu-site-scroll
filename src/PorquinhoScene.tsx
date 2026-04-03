import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Environment,
    Float,
    useGLTF,
    useAnimations,
    Sparkles,
    Center,
    Text,
    MeshTransmissionMaterial // ADIÇÃO 1: Material de Vidro Avançado
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function CenaScroll() {
    const estatico = useGLTF('/3d.glb');
    const animado = useGLTF('/3dAndando.glb');
    const { actions, names } = useAnimations(animado.animations, animado.scene);
    const { scene } = useThree();

    const estaticoRef = useRef<THREE.Group>(null);
    const animadoRef = useRef<THREE.Group>(null);
    const grupoGeralRef = useRef<THREE.Group>(null);
    const luzRatoRef = useRef<THREE.PointLight>(null);

    // Para medir velocidade do scroll
    const [lastScroll, setLastScroll] = useState(0);
    const velocityRef = useRef(0);

    useEffect(() => {
        if (names && names.length > 0 && actions[names[0]]) {
            actions[names[0]]?.reset().play();
        }
    }, [actions, names]);

    useFrame((state) => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progresso = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

        // Calcula a velocidade do scroll (ADIÇÃO 7)
        velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, Math.abs(scrollY - lastScroll), 0.1);
        setLastScroll(scrollY);

        const estaCorrendo = progresso > 0.25;
        const escalaEstaticoAlvo = estaCorrendo ? 0.001 : 1.5;
        const escalaAnimadoAlvo = estaCorrendo ? 100 : 0.001;

        if (estaticoRef.current && animadoRef.current) {
            estaticoRef.current.scale.lerp(new THREE.Vector3(escalaEstaticoAlvo, escalaEstaticoAlvo, escalaEstaticoAlvo), 0.08);
            animadoRef.current.scale.lerp(new THREE.Vector3(escalaAnimadoAlvo, escalaAnimadoAlvo, escalaAnimadoAlvo), 0.08);
        }

        if (grupoGeralRef.current) {
            const rotacaoScroll = progresso * Math.PI * 2;
            const alvoX = (state.pointer.x * Math.PI) * 0.05;
            const alvoY = (state.pointer.y * Math.PI) * 0.05;

            grupoGeralRef.current.rotation.y = THREE.MathUtils.lerp(grupoGeralRef.current.rotation.y, rotacaoScroll + alvoX, 0.05);
            grupoGeralRef.current.rotation.x = THREE.MathUtils.lerp(grupoGeralRef.current.rotation.x, alvoY, 0.05);

            // ADIÇÃO 8: Parallax profundo com o Scroll
            grupoGeralRef.current.position.y = THREE.MathUtils.lerp(grupoGeralRef.current.position.y, progresso * 1.5, 0.05);
            grupoGeralRef.current.position.z = THREE.MathUtils.lerp(grupoGeralRef.current.position.z, progresso * 2, 0.05);
        }

        if (luzRatoRef.current) {
            luzRatoRef.current.position.x = THREE.MathUtils.lerp(luzRatoRef.current.position.x, state.pointer.x * 6, 0.1);
            luzRatoRef.current.position.y = THREE.MathUtils.lerp(luzRatoRef.current.position.y, state.pointer.y * 6, 0.1);
        }

        // ADIÇÃO 5: Transição Dinâmica do Clima/Neblina
        if (scene.fog) {
            const corSaudade = new THREE.Color('#020203');
            const corPaz = new THREE.Color('#0a0805');
            // @ts-ignore (evitando avisos do ts sobre color.lerp)
            scene.fog.color.lerp(estaCorrendo ? corPaz : corSaudade, 0.02);
        }
    });

    return (
        <group ref={grupoGeralRef}>
            <pointLight ref={luzRatoRef} color="#ffffff" intensity={2.5} distance={15} castShadow />

            <group ref={estaticoRef} scale={1.5}>
                <Center><primitive object={estatico.scene} castShadow receiveShadow /></Center>
            </group>
            <group ref={animadoRef} scale={0.001}>
                <Center><primitive object={animado.scene} castShadow receiveShadow /></Center>
            </group>
        </group>
    );
}

export default function PorquinhoScene() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, opacity: 0, animation: 'fadeIn 3s forwards 1s' }}>
            <Canvas camera={{ position: [0, 0.5, 8], fov: 45 }} shadows>
                <fog attach="fog" args={['#020203', 5, 20]} />

                <ambientLight intensity={0.3} />
                <spotLight position={[0, 10, 5]} intensity={3.0} color="#ffebc2" penumbra={1} castShadow />
                <pointLight position={[5, -5, 5]} intensity={1.5} color="#ffd700" />
                <spotLight position={[-8, 3, -8]} intensity={6.0} color="#a855f7" distance={30} penumbra={0.5} castShadow />

                <Suspense fallback={null}>
                    <Environment preset="city" />

                    {/* ADIÇÃO 1: Palavras em Vidro Hiper-Realista */}
                    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                        <Text position={[-4, 2, -5]} fontSize={1.2}>
                            Saudade
                            <MeshTransmissionMaterial backside samples={4} thickness={2} chromaticAberration={0.1} anisotropy={0.3} color="#ffffff" distortion={0.2} distortionScale={0.5} />
                        </Text>
                        <Text position={[4, -2, -6]} fontSize={1.0}>
                            Amor
                            <MeshTransmissionMaterial backside samples={4} thickness={3} chromaticAberration={0.1} color="#ffd700" />
                        </Text>
                        <Text position={[-3, -3, -4]} fontSize={0.8}>
                            Sempre
                            <MeshTransmissionMaterial backside samples={4} thickness={1.5} chromaticAberration={0.2} color="#a855f7" />
                        </Text>
                    </Float>

                    <Sparkles count={400} scale={15} size={1.5} speed={0.2} opacity={0.4} color="#ffd700" />
                    <Sparkles count={200} scale={20} size={3.0} speed={0.4} opacity={0.15} color="#a855f7" />

                    <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}>
                        <CenaScroll />
                    </Float>

                    <EffectComposer disableNormalPass>
                        <Noise opacity={0.03} />
                        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.8} />
                        {/* A aberração muda dinamicamente via framer, mas aqui deixamos uma base rica */}
                        <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
                        <Vignette eskil={false} offset={0.15} darkness={1.2} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}