// src/GuineaPigScene.tsx
import { Canvas } from '@react-three/fiber';
import {
    Environment,
    MeshTransmissionMaterial,
    Text,
    Float,
    Sparkles,
    OrbitControls
} from '@react-three/drei';
import { Suspense } from 'react';

export default function GuineaPigScene() {
    return (
        <div className="absolute inset-0 w-full h-full z-0 cursor-auto">
            <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }}>
                {/* Iluminação suave para destacar a pele do porquinho */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <OrbitControls enableZoom={false} enablePan={false} />

                    {/* Partículas flutuantes da galáxia */}
                    <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.6} color="#ffb8a3" />

                    {/* Elementos flutuantes (Porquinho + Base) */}
                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>

                        {/* =========================================
                AQUI ENTRA O TEU MODELO GLTF DO PORQUINHO
                Para usar o teu modelo real:
                1. Coloca o ficheiro na pasta /public (ex: porquinho.glb)
                2. Usa o useGLTF: const { scene } = useGLTF('/porquinho.glb')
                3. Troca a <mesh> abaixo por: <primitive object={scene} position={[0,0.8,0]} />
            ========================================= */}
                        <mesh position={[0, 0.8, 0]}>
                            <capsuleGeometry args={[0.8, 1.2, 32, 32]} />
                            <meshStandardMaterial color="#5C3A21" roughness={0.7} />

                            {/* Tufo de pelo no nariz (Placeholder) */}
                            <mesh position={[0, 0.8, 0.8]}>
                                <sphereGeometry args={[0.2, 16, 16]} />
                                <meshStandardMaterial color="#3A2010" roughness={0.9} />
                            </mesh>
                        </mesh>

                        {/* Base de Gelo/Cristal */}
                        <mesh position={[0, -0.5, 0]}>
                            <cylinderGeometry args={[2.5, 2, 0.8, 8]} />
                            <MeshTransmissionMaterial
                                backside
                                samples={4}
                                thickness={1}
                                chromaticAberration={0.15}
                                anisotropy={0.3}
                                distortion={0.4}
                                distortionScale={0.5}
                                temporalDistortion={0.1}
                                color="#e0f2fe"
                            />
                        </mesh>
                    </Float>

                    {/* Textos Pixelados */}
                    <Text
                        font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff"
                        position={[0, 3, 0]}
                        fontSize={0.5}
                        color="black"
                        outlineWidth={0.03}
                        outlineColor="white"
                    >
                        PORQUINHO 1
                    </Text>

                    <Text
                        font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff"
                        position={[0, 4.5, -2]}
                        fontSize={0.25}
                        color="white"
                    >
                        GALÁXIA 1
                    </Text>

                    <Text
                        font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff"
                        position={[0, -2, 1]}
                        fontSize={0.35}
                        color="black"
                        outlineWidth={0.02}
                        outlineColor="white"
                    >
                        MEU SITE SCROLL
                    </Text>
                </Suspense>
            </Canvas>
        </div>
    );
}