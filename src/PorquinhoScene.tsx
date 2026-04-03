import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Environment,
    Float,
    useGLTF,
    useAnimations,
    Sparkles,
    Center,
    Text,
    MeshTransmissionMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Suspense, useEffect, useRef } from 'react';
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

    useEffect(() => {
        if (names && names.length > 0 && actions[names[0]]) {
            actions[names[0]].reset().fadeIn(0.5).play();
        }
    }, [actions, names]);

    useFrame((state) => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progresso = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

        const estaCorrendo = progresso > 0.25;

        // Melhoria: Escala mínima maior para não sumir do motor de render
        const escalaEstaticoAlvo = estaCorrendo ? 0.01 : 1.5;
        const escalaAnimadoAlvo = estaCorrendo ? 100 : 0.01;

        if (estaticoRef.current && animadoRef.current) {
            // Suavidade aumentada para 0.1
            estaticoRef.current.scale.lerp(new THREE.Vector3(escalaEstaticoAlvo, escalaEstaticoAlvo, escalaEstaticoAlvo), 0.1);
            animadoRef.current.scale.lerp(new THREE.Vector3(escalaAnimadoAlvo, escalaAnimadoAlvo, escalaAnimadoAlvo), 0.1);

            // Garante visibilidade binária para evitar sombras fantasmas
            estaticoRef.current.visible = !estaCorrendo;
            animadoRef.current.visible = estaCorrendo;
        }

        if (grupoGeralRef.current) {
            const rotacaoScroll = progresso * Math.PI * 2;
            const alvoX = (state.pointer.x * Math.PI) * 0.05;
            const alvoY = (state.pointer.y * Math.PI) * 0.05;

            grupoGeralRef.current.rotation.y = THREE.MathUtils.lerp(grupoGeralRef.current.rotation.y, rotacaoScroll + alvoX, 0.05);
            grupoGeralRef.current.rotation.x = THREE.MathUtils.lerp(grupoGeralRef.current.rotation.x, alvoY, 0.05);
            grupoGeralRef.current.position.z = THREE.MathUtils.lerp(grupoGeralRef.current.position.z, progresso * 2, 0.05);
        }

        if (luzRatoRef.current) {
            luzRatoRef.current.position.x = THREE.MathUtils.lerp(luzRatoRef.current.position.x, state.pointer.x * 6, 0.1);
            luzRatoRef.current.position.y = THREE.MathUtils.lerp(luzRatoRef.current.position.y, state.pointer.y * 6, 0.1);
        }
    });

    return (
        <group ref={grupoGeralRef}>
            <pointLight ref={luzRatoRef} color="#ffffff" intensity={2.5} distance={15} />

            <group ref={estaticoRef} key="static-mem">
                <Center top>
                    <primitive object={estatico.scene} />
                </Center>
            </group>

            <group ref={animadoRef} key="anim-mem">
                <Center top>
                    <primitive object={animado.scene} />
                </Center>
            </group>
        </group>
    );
}

export default function PorquinhoScene() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
                <color attach="background" args={['#020203']} />
                <fog attach="fog" args={['#020203', 5, 20]} />

                {/* Luz de preenchimento global para evitar que o modelo fique preto */}
                <hemisphereLight intensity={0.5} groundColor="#000000" />
                <ambientLight intensity={0.4} />
                <spotLight position={[0, 10, 5]} intensity={4.0} color="#ffebc2" penumbra={1} />
                <pointLight position={[5, -5, 5]} intensity={2.0} color="#ffd700" />
                <spotLight position={[-8, 3, -8]} intensity={6.0} color="#a855f7" distance={30} penumbra={0.5} />

                <Suspense fallback={null}>
                    <Environment preset="city" />

                    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                        <Text position={[-4, 2, -5]} fontSize={0.8}>
                            Saudade
                            <MeshTransmissionMaterial backside samples={4} thickness={1} chromaticAberration={0.1} color="#ffffff" />
                        </Text>
                        <Text position={[4, -2, -6]} fontSize={0.6}>
                            Amor
                            <MeshTransmissionMaterial backside samples={4} thickness={1} chromaticAberration={0.1} color="#ffd700" />
                        </Text>
                    </Float>

                    <Sparkles count={400} scale={15} size={1.5} speed={0.2} opacity={0.5} color="#ffd700" />
                    <Sparkles count={200} scale={20} size={3.0} speed={0.4} opacity={0.15} color="#a855f7" />

                    <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}>
                        <CenaScroll />
                    </Float>

                    <EffectComposer disableNormalPass>
                        <Noise opacity={0.03} />
                        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                        <ChromaticAberration offset={new THREE.Vector2(0.0015, 0.0015)} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
}