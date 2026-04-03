import { Canvas } from '@react-three/fiber';
import {
    Environment,
    MeshTransmissionMaterial,
    Float,
    Sparkles,
    OrbitControls,
    Html,
    useGLTF // Importante: adicionar o hook para carregar o modelo
} from '@react-three/drei';
import { Suspense } from 'react';

// Novo componente responsável por carregar e renderizar o ficheiro 3D
function ModeloBixinho() {
    // O Vite serve os ficheiros da pasta public diretamente a partir da raiz '/'
    const { scene } = useGLTF('/3d.glb');

    // Podes ajustar o 'scale' (tamanho) e a 'position' (posição) conforme o tamanho original do teu modelo
    return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
}

export default function PorquinhoScene() {
    return (
        // O fundo escuro mantém-se como definido no projeto
        <div className="fixed inset-0 w-full h-full z-0 bg-[#030305]">
            <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }}>

                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} />

                <Suspense fallback={
                    <Html center>
                        <div className="text-white/50 text-sm tracking-widest uppercase whitespace-nowrap animate-pulse">
                            A despertar lembranças...
                        </div>
                    </Html>
                }>

                    <Environment preset="city" />

                    {/* autoRotate faz a cena girar sozinha bem devagar em torno do modelo */}
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

                    <Sparkles count={250} scale={15} size={2} speed={0.2} opacity={0.3} color="#ffb8a3" />

                    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>

                        {/* O modelo real importado do ficheiro .glb substitui as formas anteriores */}
                        <ModeloBixinho />

                        {/* CRISTAL DO TEMPO: Base por baixo do modelo (opcional, mas dá um efeito bonito) */}
                        <mesh position={[0, -1.5, 0]}>
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