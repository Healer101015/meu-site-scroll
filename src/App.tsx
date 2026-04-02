import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import CustomCursor from './CustomCursor';

// Atualizamos o title para aceitar ReactNode, permitindo passar HTML (como o span interativo)
interface StepSectionProps {
  title: string | ReactNode;
  subtitle: string;
  children?: ReactNode;
  align?: 'left' | 'center' | 'right';
}

const StepSection = ({ title, subtitle, children, align = 'center' }: StepSectionProps) => {
  const alignmentClass =
    align === 'left' ? 'items-start text-left' :
      align === 'right' ? 'items-end text-right' :
        'items-center text-center';

  return (
    <section className="relative h-screen w-full flex flex-col justify-center snap-start overflow-hidden px-8 md:px-24">
      <motion.div
        style={{ perspective: 1200 }}
        className={`z-20 w-full max-w-4xl flex flex-col ${alignmentClass}`}
      >
        <motion.h2
          initial={{ opacity: 0, rotateX: 90, y: 50 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter mb-6"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, x: align === 'left' ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.5 }}
          className="text-2xl md:text-3xl text-gray-400 font-light max-w-2xl"
        >
          {subtitle}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            viewport={{ once: false }}
            className="mt-12"
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default function App() {
  return (
    // 1. O id="main-scroll-container" conecta o Three.js à rolagem
    // 2. A classe "cursor-none" esconde o mouse padrão do sistema
    // 3. Fundo 100% Dark Mode para destacar o roxo
    <main
      id="main-scroll-container"
      className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-zinc-950 font-sans cursor-none"
    >

      {/* INJETANDO O CURSOR DE ALTA PERFORMANCE */}
      <CustomCursor />

      {/* INJETANDO A SIMULAÇÃO 3D NO FUNDO */}
      <ParticlesBackground />

      {/* O CONTEÚDO */}
      <StepSection
        title="Formação"
        subtitle="3000 vértices renderizados pela GPU. Eles formam uma esfera suave que aguarda o seu comando."
        align="left"
      />

      <StepSection
        title="Mutação Geométrica"
        subtitle="Enquanto você chega aqui, a matemática recria as coordenadas em tempo real, colapsando a esfera em um cubo."
        align="right"
      />

      <StepSection
        // Aqui usamos o span com a classe 'interativo' para o cursor reagir!
        title={<span className="interativo">O Caos</span>}
        subtitle="A ordem se desfaz. As partículas explodem no espaço 3D, abraçando toda a tela."
        align="center"
      />

      <StepSection
        title="O Gran Finale"
        subtitle="Você acabou de integrar o ecossistema do React Three Fiber com Framer Motion e Tailwind."
        align="left"
      >
        <button className="relative px-12 py-5 bg-white text-zinc-950 text-lg font-extrabold rounded-none overflow-hidden group cursor-none">
          {/* Classe 'interativo' no texto do botão também */}
          <span className="relative z-10 interativo">Explorar CódigoFonte</span>
          <div className="absolute inset-0 h-full w-0 bg-violet-500 transition-all duration-300 ease-out group-hover:w-full z-0" />
        </button>
      </StepSection>

    </main>
  );
}