import React from 'react';
import './PetStory.css';

export default function PetStory() {
    return (
        <div className="app-container">

            {/* Área Fixa: O Modelo 3D fica aqui o tempo todo */}
            <div className="canvas-container">
                {/* Substitua a div abaixo pelo seu Canvas 3D (ex: React Three Fiber) */}
                <div className="placeholder-3d">
                    <p>[ Seu Modelo 3D Aqui ]</p>
                </div>
            </div>

            {/* Área de Scroll: As histórias que passam por cima */}
            <div className="stories-container">

                {/* História 1 */}
                <section className="story-section">
                    <h1>Uma Companheira Inseparável</h1>
                    <p>Não importava o cômodo da casa, se você olhasse para o lado, ela estava lá. Sempre seguindo os seus passos, como uma sombra cheia de amor.</p>
                </section>

                {/* História 2 */}
                <section className="story-section">
                    <h2>Sempre ao seu lado</h2>
                    <p>Nos dias difíceis, ela sabia. Encostava de mansinho, colocava a cabeça no seu colo e ficava ali, como quem diz "eu estou aqui com você".</p>
                </section>

                {/* História 3 */}
                <section className="story-section">
                    <h2>Alegria em Quatro Patas</h2>
                    <p>Cada vez que você chegava em casa era uma festa. O barulho das patinhas e o rabinho abanando eram a certeza de que o amor mais puro estava te esperando.</p>
                </section>

                {/* História 4 */}
                <section className="story-section">
                    <h2>Para Sempre</h2>
                    <p>As lembranças das brincadeiras, dos passeios e até das bagunças vão ficar guardadas para sempre.</p>
                </section>

            </div>
        </div>
    );
}