import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

export const Home = () => {
    return (
        <>
            <section className="home-section">
                <div>
                    {/* Enlaces para "niv0 beats", "log in", y "sign up" */}
                    <h3>
                        <Link to="/">niv0 beats</Link>
                    </h3>
                    <h4>
                        <Link to="/login">log in</Link>
                    </h4>
                    <h5>
                        <Link to="/login">sign up</Link>
                    </h5>

                    {/* Botones con enlaces para las secciones */}
                    <h2>
                        <Link to="/login">BEATS</Link>
                    </h2>
                    <h6>
                        <Link to="/login">SAMPLE<br />PACKS</Link>
                    </h6>
                    <h7>
                        <Link to="/login">LOOPS</Link>
                    </h7>
                    <h8>
                        <Link to="/login">MIDI KITS</Link>
                    </h8>
                    <h9>
                        <Link to="/login">REC</Link>
                    </h9>
                    <h10>
                        <Link to="/login">MIX MASTER</Link>
                    </h10>
                </div>

                {/* Icono de Instagram */}
                <div className='icon-insta'>
                    <Link to="https://www.instagram.com/__niv0__/" target="_blank">
                        <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
                    </Link>
                </div>
                
                <p>SIGN UP / LOGIN TO HAVE ACCESS</p>
            </section>
        </>
    );
};
