import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import './PetStory.css';
import PorquinhoScene from './PorquinhoScene';

const FadeInCard = ({ children, chapter }: { children: React.ReactNode, chapter?: string }) => (
    <motion.section
        className="story-section"
        initial={{ opacity: 0, y: 100, scale: 0.95, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
    >
        {chapter && <span className="chapter-marker">{chapter}</span>}
        {children}
    </motion.section>
);

export default function PetStory() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="app-container">
            <div className="film-grain"></div>

            <motion.div
                className="custom-cursor"
                animate={{ x: mousePos.x - 15, y: mousePos.y - 15 }}
                transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            />

            <motion.div className="progress-bar" style={{ scaleX }} />

            <div className="canvas-container">
                <PorquinhoScene />
            </div>

            <div className="stories-container">
                <motion.div className="timeline-line-track">
                    <motion.div className="timeline-line-fill" style={{ height: lineHeight }} />
                </motion.div>

                <FadeInCard chapter="01">
                    <h1>A Nossa Caminhada</h1>
                    <p>Cada passo que dei foi guiado pelo som da sua voz e pelo calor da sua companhia. Fomos um só em nossa jornada, desbravando a vida com alegria, lealdade e um amor que preenchia a casa toda.</p>
                </FadeInCard>

                <FadeInCard chapter="02">
                    <h2>Quando os Passos Ficaram Pesados</h2>
                    <p>O tempo é implacável, até para os corações mais puros. Chegou o momento em que meu corpo já não conseguia acompanhar a vontade da minha alma de correr na sua direção para te receber.</p>
                </FadeInCard>

                <FadeInCard chapter="03">
                    <h2>Me Desculpe... e Obrigada</h2>
                    <p>Se eu pudesse falar, eu diria: me perdoe por não ter mais forças para continuar lutando. Me desculpe por ter que partir. Mas, acima de tudo, muito obrigada por ter me dado a melhor vida que eu poderia sonhar.</p>
                </FadeInCard>

                <FadeInCard chapter="04">
                    <h2>Deixar Ir é Amar</h2>
                    <p>Entender a hora de descansar dói, mas você me amou o suficiente para me libertar da dor e me deixar ir em paz. A nossa caminhada física terminou, mas eu continuarei a andar para sempre dentro do seu coração.</p>
                </FadeInCard>

                <motion.section
                    className="story-section transparent-section"
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