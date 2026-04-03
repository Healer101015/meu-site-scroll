import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import './PetStory.css';
import PorquinhoScene from './PorquinhoScene';

// O Efeito 3D de Tilt nos Cards da História
const TiltFadeInCard = ({ children, chapter, setHovered }: { children: React.ReactNode, chapter?: string, setHovered: (v: boolean) => void }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / rect.width - 0.5);
        y.set(mouseY / rect.height - 0.5);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); setHovered(false); };

    return (
        <motion.section
            className="story-section-wrapper"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0, y: 150, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.div className="story-section" onMouseMove={handleMouseMove} onMouseEnter={() => setHovered(true)} onMouseLeave={handleMouseLeave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
                <div style={{ transform: "translateZ(50px)" }}>
                    {chapter && <span className="chapter-marker">{chapter}</span>}
                    {children}
                </div>
            </motion.div>
        </motion.section>
    );
};

// Lógica de atraso do rato para a aura elástica
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

export default function PetStory() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [delayedMousePos, setDelayedMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [activeChapter, setActiveChapter] = useState(1);

    const [isMuted, setIsMuted] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { progress } = useProgress();

    const [holdProgress, setHoldProgress] = useState(0);
    const holdIntervalRef = useRef<any>(null);
    const isReady = progress >= 100;

    useEffect(() => {
        document.body.style.overflow = isStarted ? 'auto' : 'hidden';
    }, [isStarted]);

    useEffect(() => {
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

    useFrameLoop(mousePos, setDelayedMousePos);

    const toggleAudio = () => {
        if (audioRef.current) {
            isMuted ? audioRef.current.play() : audioRef.current.pause();
            setIsMuted(!isMuted);
        }
    };

    const startHold = () => {
        if (!isReady) return;
        setIsHovered(true);
        holdIntervalRef.current = setInterval(() => {
            setHoldProgress(prev => {
                if (prev >= 100) {
                    clearInterval(holdIntervalRef.current);
                    triggerExperience();
                    return 100;
                }
                return prev + 2.5;
            });
        }, 30);
    };

    const stopHold = () => {
        setIsHovered(false);
        clearInterval(holdIntervalRef.current);
        if (!isStarted) setHoldProgress(0);
    };

    const triggerExperience = () => {
        setIsStarted(true);
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Autoplay bloqueado:", e));
            setIsMuted(false);
        }
    };

    const btnX = useMotionValue(0);
    const btnY = useMotionValue(0);
    const btnSpringX = useSpring(btnX, { stiffness: 150, damping: 15 });
    const btnSpringY = useSpring(btnY, { stiffness: 150, damping: 15 });

    const handleBtnMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        btnX.set((e.clientX - cx) * 0.3);
        btnY.set((e.clientY - cy) * 0.3);
    };
    const resetBtnMagnetic = () => { btnX.set(0); btnY.set(0); stopHold(); };

    const typewriterSentence = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.5 } }
    };
    const typewriterLetter = {
        hidden: { opacity: 0, filter: 'blur(5px)' },
        visible: { opacity: 1, filter: 'blur(0px)' }
    };
    const message = "Eu não sabia mexer com isso... eu aprendi por você. Mas dessa vez eu não quero que seja sobre a gente, e sim sobre algo que amou com sua alma, e seu coração.";

    return (
        <div className="app-container">
            {/* O Spotlight do Foco na Intro */}
            {!isStarted && (
                <div
                    className="intro-spotlight"
                    style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)` }}
                />
            )}

            <AnimatePresence>
                {!isStarted && (
                    <motion.div
                        className="intro-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(30px)', scale: 1.2 }}
                        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            className="intro-content"
                            animate={{ x: (mousePos.x - window.innerWidth / 2) * -0.02, y: (mousePos.y - window.innerHeight / 2) * -0.02 }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        >
                            <motion.p className="intro-message" variants={typewriterSentence} initial="hidden" animate="visible">
                                {message.split(" ").map((word, index) => {
                                    const isSpecial = word.includes("alma") || word.includes("coração");
                                    return (
                                        <span key={index} style={{ display: 'inline-block', marginRight: '8px' }}>
                                            {word.split("").map((char, charIndex) => (
                                                <motion.span key={charIndex} variants={typewriterLetter} className={isSpecial ? "pulsing-word" : ""}>
                                                    {char}
                                                </motion.span>
                                            ))}
                                        </span>
                                    );
                                })}
                            </motion.p>

                            <motion.div className="headphone-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 2 }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                                <span>Coloque os fones de ouvido</span>
                                <div className="intro-instructions-minimal">
                                    Pressione <strong>F11</strong> • Ative <strong>Aceleração de Hardware</strong> • Desligue <strong>Cabeçona</strong>
                                </div>
                            </motion.div>

                            <motion.button
                                className={`hold-button ${isReady ? 'ready' : 'loading'}`}
                                style={{ x: btnSpringX, y: btnSpringY }}
                                onMouseMove={handleBtnMagnetic}
                                onMouseLeave={resetBtnMagnetic}
                                onMouseDown={startHold}
                                onMouseUp={stopHold}
                                onTouchStart={startHold}
                                onTouchEnd={stopHold}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 4, duration: 1 }}
                            >
                                <span className="hold-text">
                                    {isReady ? "Pressione e Segure" : `Despertando memórias... ${Math.round(progress)}%`}
                                </span>
                                <div className="hold-fill" style={{ width: `${holdProgress}%` }} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="film-grain"></div>

            <motion.div className={`custom-cursor-dot ${isHovered ? 'hidden' : ''}`} animate={{ x: mousePos.x - 3, y: mousePos.y - 3 }} transition={{ duration: 0 }} />
            <motion.div className={`custom-cursor-ring ${isHovered ? 'cursor-hovered' : ''}`} animate={{ x: delayedMousePos.x - (isHovered ? 40 : 15), y: delayedMousePos.y - (isHovered ? 40 : 15) }} transition={{ type: "tween", ease: "linear", duration: 0 }} />

            <audio ref={audioRef} src="/musica.mp3" loop />

            <AnimatePresence>
                {isStarted && (
                    <motion.button className={`audio-btn ${!isMuted ? 'playing' : ''}`} onClick={toggleAudio} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                        {isMuted ? 'LIGAR SOM' : 'SOM LIGADO'}
                    </motion.button>
                )}
            </AnimatePresence>

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
                <PorquinhoScene />
            </div>

            <AnimatePresence>
                {isStarted && (
                    <motion.div className="scroll-indicator" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 4, duration: 2 }}>
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