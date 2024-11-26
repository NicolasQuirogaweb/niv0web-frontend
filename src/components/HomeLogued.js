import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

export const HomeLogued = () => {
    const [userEmail, setUserEmail] = useState(null); // Estado para almacenar el correo del usuario
    const navigate = useNavigate();

    useEffect(() => {
        // Al cargar el componente, buscamos el email del usuario en el localStorage
        const email = localStorage.getItem('userEmail');
        if (email) {
            setUserEmail(email); // Si lo encontramos, lo almacenamos en el estado
        } else {
            // Si no hay email en el localStorage, redirigimos al login (si es necesario)
            navigate('/');
        }
    }, [navigate]);

    return (
        <section className="home-section-logued">
            <div>
                {/* Enlaces para "niv0 beats", "log in", y "sign up" */}
                <h3>
                    <Link to="/homelogued">niv0 beats</Link>
                </h3>

                {/* Mostrar el correo electrónico del usuario en lugar de "username666" */}
                <h4>
                    <Link to="/">{userEmail ? userEmail : "Cargando..."}</Link>
                </h4>

                <h5>
                    <Link to="/home">Log out</Link>
                </h5>

                {/* Botones con enlaces para las secciones */}
                <h2>
                    <Link to="/beats">BEATS</Link>
                </h2>
                <h6>
                    <Link to="/samplepacks">SAMPLE<br />PACKS</Link>
                </h6>
                <h7>
                    <Link to="/loops">LOOPS</Link>
                </h7>
                <h8>
                    <Link to="/midikits">MIDI KITS</Link>
                </h8>
                <h9>
                    <Link to="/rec">REC</Link>
                </h9>
                <h10>
                    <Link to="/mixmaster">MIX MASTER</Link>
                </h10>
            </div>

            {/* Icono de Instagram */}
            <div className='icon-insta'>
                <Link to="https://www.instagram.com/__niv0__/" target="_blank">
                    <FontAwesomeIcon icon={faInstagram} className="instagram-icon" />
                </Link>
            </div>
            <p>Contact me & lets make sum music</p>
            <p>THANK YOU FOR SIGN IN ENJOY </p>
        </section>
    );
};
