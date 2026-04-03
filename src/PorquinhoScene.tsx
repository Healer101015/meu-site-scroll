import { Canvas } from '@react-three/fiber';
import {
    Environment,
    MeshTransmissionMaterial,
    Float,
    Sparkles,
    OrbitControls,
    Html
} from '@react-three/drei';
import { Suspense } from 'react';

export default function PorquinhoScene() {
    return (
        // 'fixed' prende a cena 3D no fundo da tela enquanto o site rola por cima
        <div className="fixed inset-0 w-full h-full z-0 bg-[#030305]">
            <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }}>

                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} />

                <Suspense fallback={
                    <Html center>
                        <div className="text-white/50 text-sm tracking-widest uppercase whitespace-nowrap animate-pulse">
                            Despertando lembranças...
                        </div>
                    </Html>
                }>

                    <Environment preset="city" />

                    {/* autoRotate faz a cena girar sozinha bem devagar e poeticamente */}
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

                    <Sparkles count={250} scale={15} size={2} speed={0.2} opacity={0.3} color="#ffb8a3" />

                    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>

                        {/* PORQUINHO GEOMÉTRICO (Substitua pelo seu .glb depois) */}
                        <mesh position={[0, 0.8, 0]}>
                            <capsuleGeometry args={[0.8, 1.2, 32, 32]} />
                            <meshStandardMaterial color="#4A2E1B" roughness={0.8} />

                            <mesh position={[0, 0.8, 0.8]}>
                                <sphereGeometry args={[0.2, 16, 16]} />
                                <meshStandardMaterial color="#2B190E" roughness={0.9} />
                            </mesh>
                        </mesh>

                        {/* CRISTAL DO TEMPO */}
                        <mesh position={[0, -0.5, 0]}>
                            <cylinderGeometry args={[2.5, 2, 0.8, 8]} />
                            <MeshTransmissionMaterial
                                backside
                                samples={4}
                                thickness={2}
                                chromaticAberration={0.2}
                                anisotropy={0.3}
                                distortion={0.5}
                                distortionScale={0.5}
                                temporalDistortion={0.05}
                                color="#e0f2fe"
                            />
                        </mesh>
                    </Float>

                </Suspense>
            </Canvas>
        </div>
    );
}