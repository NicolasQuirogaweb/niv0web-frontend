import React, { useEffect, useState } from 'react';
import GoogleLogin from 'react-google-login';
import { gapi } from 'gapi-script';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import axios from 'axios'; // Importa Axios para hacer peticiones HTTP

export const Login = () => {
    const clientID = "637641906869-2ccg1rhghuasa13gmkkcogtq0948pu05.apps.googleusercontent.com"; // Tu clientID de Google
    const [user, setUser] = useState({}); // Estado para almacenar la información del usuario
    const navigate = useNavigate(); // Inicializa navigate para redirigir

    useEffect(() => {
        const start = () => {
            gapi.auth2.init({
                clientId: clientID,
            });
        };
        gapi.load("client:auth2", start);
    }, []);

    // Función que se ejecuta cuando el login es exitoso
    const onSuccess = async (response) => {
        try {
        console.log(response.profileObj); // Muestra el perfil en la consola
    
        const { email, name, imageUrl } = response.profileObj;
    
        // Llama a la API de backend para verificar el usuario y obtener el token JWT
            const res = await axios.post('http://localhost:5000/api/auth/google-login', {
                email,
                name,
                imageUrl,
            });
    
            const { token } = res.data; // El servidor devuelve el token JWT
    
            // Almacena el token JWT en el localStorage o sessionStorage
            localStorage.setItem('authToken', token);
    
            // Almacena los datos del usuario (incluyendo el email) en el localStorage
            localStorage.setItem('userEmail', email);
    
            // Actualiza el estado con la información del usuario de Google
            setUser({
                name,
                imageUrl,
                email,
            });
    
            // Redirige a la página de bienvenida o dashboard
            navigate('/homelogued');
        } catch (error) {
            console.error('Error en la autenticación de Google:', error);
        }
    };
    // Función que se ejecuta cuando el login falla
    const onFailure = (error) => {
        console.log("Algo salió mal", error);
        alert("Hubo un problema con el inicio de sesión. Por favor, inténtalo de nuevo.");
    };

    const profileClass = user.name ? "profile" : "hidden"

    return (
        <section className="login-section">
            <div>
                <h1>BEATS, SAMPLE PACKS, MIDI KITS, LOOPS</h1>

                <div className="btnauth">
                    <GoogleLogin
                        clientId={clientID}
                        onSuccess={onSuccess}
                        onFailure={onFailure}  // Aquí se pasa la función onFailure
                        cookiePolicy={"single_host_origin"}
                        buttonText="Iniciar sesión con Google"
                    />
                </div>

                {/* Mostrar el perfil del usuario cuando haya iniciado sesión */}
                <div className={profileClass}>
                    <img src={user.imageUrl} alt="Usuario" />
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
            </div>
        </section>
    );
};
