import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { Loader } from '@react-three/drei';
import './PetStory.css';
import PorquinhoScene from './PorquinhoScene';

// ADIÇÃO 2: Card com Efeito de Inclinação Física 3D (Tilt)
const TiltFadeInCard = ({ children, chapter, setHovered }: { children: React.ReactNode, chapter?: string, setHovered: (v: boolean) => void }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setHovered(false);
    };

    return (
        <motion.section
            className="story-section-wrapper"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0, y: 150, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div
                className="story-section"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            >
                {/* O conteúdo flutua acima do card */}
                <div style={{ transform: "translateZ(50px)" }}>
                    {chapter && <span className="chapter-marker">{chapter}</span>}
                    {children}
                </div>
            </motion.div>
        </motion.section>
    );
};

export default function PetStory() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    // ADIÇÃO 6: Cursor com Aura Secundária Elástica
    const [delayedMousePos, setDelayedMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isStarted, setIsStarted] = useState(false);

    // Controle dos capítulos para a navegação lateral
    const [activeChapter, setActiveChapter] = useState(1);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        document.body.style.overflow = isStarted ? 'auto' : 'hidden';
    }, [isStarted]);

    useEffect(() => {
        let isScrolling: any;
        const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });

        const handleScroll = () => {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            if (scrollPercent < 0.25) setActiveChapter(1);
            else if (scrollPercent < 0.5) setActiveChapter(2);
            else if (scrollPercent < 0.75) setActiveChapter(3);
            else setActiveChapter(4);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Atualiza a aura atrasada do cursor
    useFrameLoop(mousePos, setDelayedMousePos);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isMuted) audioRef.current.play();
            else audioRef.current.pause();
            setIsMuted(!isMuted);
        }
    };

    const startExperience = () => {
        setIsStarted(true);
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Autoplay bloqueado:", e));
            setIsMuted(false);
        }
    };

    return (
        <div className="app-container">
            <Loader containerStyles={{ background: '#020203', zIndex: 9999 }} innerStyles={{ width: '300px' }} barStyles={{ background: '#ffd700' }} dataStyles={{ color: '#ffd700', fontFamily: 'Inter', letterSpacing: '2px' }} />

            <AnimatePresence>
                {!isStarted && (
                    <motion.div className="intro-overlay" initial={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="intro-content">
                            <motion.p className="intro-message" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1.5 }}>
                                "Eu não sabia mexer com isso... eu aprendi por você.<br />
                                Mas dessa vez eu não quero que seja sobre a gente,<br />
                                e sim sobre algo que amou com sua alma, e seu coração."
                            </motion.p>
                            <motion.div className="intro-instructions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}>
                                <p>Para uma experiência imersiva e sem interrupções:</p>
                                <ul>
                                    <li>Pressione <strong>F11</strong> para Tela Cheia</li>
                                    <li>Ative a <strong>Aceleração de Hardware</strong> no seu navegador</li>
                                    <li>Desligue a extensão <strong>Cabeçona</strong></li>
                                </ul>
                            </motion.div>
                            <motion.button className="start-button" onClick={startExperience} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5, duration: 1 }} whileHover={{ scale: 1.05, textShadow: "0 0 15px rgba(255,215,0,0.5)" }} whileTap={{ scale: 0.95 }}>
                                Iniciar Homenagem
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="film-grain"></div>

            {/* O Cursor Duplo Magnético */}
            <motion.div className={`custom-cursor-dot ${isHovered ? 'hidden' : ''}`} animate={{ x: mousePos.x - 3, y: mousePos.y - 3 }} transition={{ duration: 0 }} />
            <motion.div className={`custom-cursor-ring ${isHovered ? 'cursor-hovered' : ''}`} animate={{ x: delayedMousePos.x - (isHovered ? 40 : 15), y: delayedMousePos.y - (isHovered ? 40 : 15) }} transition={{ type: "tween", ease: "linear", duration: 0 }} />

            <audio ref={audioRef} src="/musica.mp3" loop />

            <AnimatePresence>
                {isStarted && (
                    <motion.button className={`audio-btn ${!isMuted ? 'playing' : ''}`} onClick={toggleAudio} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                        {isMuted ? 'LIGAR SOM' : 'SOM LIGADO'}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ADIÇÃO 3: Navegação Lateral em Pontos */}
            <AnimatePresence>
                {isStarted && (
                    <motion.div className="side-nav" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2, duration: 1 }}>
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className={`nav-dot ${activeChapter === num ? 'active' : ''}`} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div className="progress-bar" style={{ scaleX }} />

            <div className="canvas-container">
                {isStarted && <PorquinhoScene />}
            </div>

            <AnimatePresence>
                {isStarted && (
                    <motion.div className="scroll-indicator" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 3, duration: 2 }}>
                        <div className="mouse-icon"></div>
                        <span>Desce para recordar</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="stories-container">
                <motion.div className="timeline-line-track">
                    <motion.div className="timeline-line-fill" style={{ height: lineHeight }} />
                </motion.div>

                <div className="story-wrapper">
                    <TiltFadeInCard chapter="01" setHovered={setIsHovered}>
                        <h1>A Nossa Caminhada</h1>
                        <p>Cada passo que dei foi guiado pelo som da sua voz e pelo calor da sua companhia. Fomos um só em nossa jornada, desbravando a <span className="highlight-word">vida</span> com alegria, lealdade e um amor que preenchia a casa toda.</p>
                    </TiltFadeInCard>
                </div>

                <div className="story-wrapper">
                    <TiltFadeInCard chapter="02" setHovered={setIsHovered}>
                        <h2>Quando os Passos Ficaram Pesados</h2>
                        <p>O tempo é implacável, até para os corações mais puros. Chegou o momento em que meu corpo já não conseguia acompanhar a vontade da minha alma de correr na sua direção para te receber.</p>
                    </TiltFadeInCard>
                </div>

                <div className="story-wrapper">
                    <TiltFadeInCard chapter="03" setHovered={setIsHovered}>
                        <h2>Me Desculpe... e Obrigada</h2>
                        <p>Se eu pudesse falar, eu diria: me perdoe por não ter mais forças para continuar lutando. Me desculpe por ter que partir. Mas, acima de tudo, muito obrigada por ter me dado a melhor vida que eu poderia sonhar.</p>
                    </TiltFadeInCard>
                </div>

                <div className="story-wrapper">
                    <TiltFadeInCard chapter="04" setHovered={setIsHovered}>
                        <h2>Deixar Ir é Amar</h2>
                        <p>Entender a hora de descansar dói, mas você me amou o suficiente para me libertar da dor e me deixar ir em <span className="highlight-word">paz</span>. A nossa caminhada física terminou, mas eu continuarei a andar para sempre dentro do seu <span className="highlight-word">coração</span>.</p>
                    </TiltFadeInCard>
                </div>

                <motion.section
                    className="transparent-section"
                    initial={{ opacity: 0, filter: 'blur(20px)' }}
                    whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 2.5 }}
                >
                    <p>Para sempre, a tua companheira.</p>
                </motion.section>
            </div>
        </div>
    );
}

// Helper para o cursor magnético secundário
function useFrameLoop(target: { x: number, y: number }, setter: Function) {
    useEffect(() => {
        let animationFrameId: number;
        let currentX = target.x;
        let currentY = target.y;

        const render = () => {
            currentX += (target.x - currentX) * 0.15;
            currentY += (target.y - currentY) * 0.15;
            setter({ x: currentX, y: currentY });
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [target, setter]);
}