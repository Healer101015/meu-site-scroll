import { useEffect, useState, useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import CustomCursor from './CustomCursor';

interface SlideProps {
  number: string;
  title: string;
  subtitle: string;
  bgWord: string; // A palavra gigante que fica no fundo
  align: 'top-left' | 'bottom-right' | 'split';
}

const Slide = ({ number, title, subtitle, bgWord, align }: SlideProps) => {
  return (
    <section className="relative h-screen w-screen shrink-0 flex items-center justify-center overflow-hidden px-10 md:px-24 border-r border-white/5">

      {/* TIPOGRAFIA GIGANTE DE FUNDO (PARALLAX) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
        <h1 className="text-[15vw] font-black text-transparent whitespace-nowrap" style={{ WebkitTextStroke: '2px white' }}>
          {bgWord}
        </h1>
      </div>

      {/* LAYOUT ASSIMÉTRICO */}
      <div className="relative z-10 w-full h-full flex flex-col pt-32 pb-24">

        {/* Número da Etapa (Fixo no topo esquerdo) */}
        <div className="absolute top-20 left-10 md:left-24 text-zinc-600 font-mono text-sm tracking-[0.3em]">
          [ {number} / 10 ]
        </div>

        {align === 'bottom-right' && (
          <div className="mt-auto ml-auto max-w-lg text-right">
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6">{title}</h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light backdrop-blur-md bg-black/10 p-4 rounded-2xl">{subtitle}</p>
          </div>
        )}

        {align === 'top-left' && (
          <div className="mt-20 mr-auto max-w-lg text-left">
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6">{title}</h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light backdrop-blur-md bg-black/10 p-4 rounded-2xl">{subtitle}</p>
          </div>
        )}

        {align === 'split' && (
          <div className="m-auto w-full flex flex-col md:flex-row justify-between items-center gap-10">
            <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter">{title}</h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-sm text-right backdrop-blur-md bg-black/10 p-4 rounded-2xl">{subtitle}</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // A MÁGICA: Captura o scroll vertical da página
  const { scrollYProgress } = useScroll({ target: containerRef });

  // E converte isso para puxar as telas para a esquerda (como um carrossel horizontal)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-90%"]); // -90% porque são 10 telas

  // Barra de progresso conectada
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    return scrollYProgress.on('change', (latest) => setProgress(latest * 100));
  }, [scrollYProgress]);

  return (
    // O container pai precisa ser MUITO ALTO (1000vh) para criar bastante rolagem
    <main ref={containerRef} className="relative h-[1000vh] bg-[#050505] cursor-none font-sans">

      <CustomCursor />

      {/* Barra de Progresso Perimetral (Fina e Minimalista no topo) */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-white/5">
        <div className="h-full bg-white transition-all duration-300 ease-out shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ width: `${progress}%` }} />
      </div>

      {/* Container "Fixo" que prende a tela enquanto você rola */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

        {/* O MOTOR 3D (Roda atrás de tudo) */}
        <ParticlesBackground />

        {/* O "Trilho" horizontal que desliza para o lado */}
        <motion.div style={{ x }} className="relative z-10 flex w-[1000vw] h-full">

          <Slide number="01" title="A Gênese" bgWord="ORIGIN" subtitle="Tudo começa com um ponto. Role para baixo e veja o mundo viajar horizontalmente." align="bottom-right" />
          <Slide number="02" title="Expansão" bgWord="EXPAND" subtitle="Segure o clique para sugar a matéria. A gravidade achata a forma em um anel estelar." align="top-left" />
          <Slide number="03" title="Código" bgWord="NATURE" subtitle="A matemática simula a vida. Hélices orgânicas do DNA em suspensão." align="split" />
          <Slide number="04" title="O Racional" bgWord="LOGIC" subtitle="Dê um scroll rápido. Repare como as cores da lente se dividem na borda da tela." align="bottom-right" />
          <Slide number="05" title="Paradoxo" bgWord="LOOP" subtitle="Superfícies contínuas. A luz pulsa na geometria do Torus perpétuo." align="top-left" />
          <Slide number="06" title="O Oceano" bgWord="FLUID" subtitle="A matéria diminui. Um grid fluído dança sob seus olhos através do espaço." align="split" />
          <Slide number="07" title="A Fenda" bgWord="TUNNEL" subtitle="As paredes se fecham. A câmera varre o interior do cilindro quântico." align="bottom-right" />
          <Slide number="08" title="Gargantua" bgWord="EVENT" subtitle="O horizonte de eventos. A inércia no centro é extrema, distorcendo o tempo." align="top-left" />
          <Slide number="09" title="Ruptura" bgWord="CHAOS" subtitle="O caos toma conta. As regras geométricas entram em colapso total." align="split" />

          <section className="relative h-screen w-screen shrink-0 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
              <h1 className="text-[15vw] font-black text-transparent whitespace-nowrap" style={{ WebkitTextStroke: '2px white' }}>FINALE</h1>
            </div>
            <div className="relative z-10 text-center mt-24">
              <h2 className="text-5xl font-black text-white tracking-widest mb-10">O PONTO PÁLIDO</h2>
              <button className="px-12 py-5 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-[0.2em] text-sm">
                Voltar ao Início
              </button>
            </div>
          </section>

        </motion.div>
      </div>
    </main>
  );
}