import Logo from '../media/logo.jpeg';
import UserImage from '../media/user.jpg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../hooks/UserContentHook';
import { useContext } from 'react';
import AddButton from '../media/thin-add-button-svgrepo-com.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import MailBox from '../media/mailbox-svgrepo-com.svg';
import Package from '../media/package-svgrepo-com.svg';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const user = useContext(UserContext);

    const cerrarSesion = () => {
        user.setUser(null);
        localStorage.removeItem("id");
        window.location.href = "https://el-rastro-nine.vercel.app";
    }

    function handleCallbackResponse(response) {
        var userObject = jwtDecode(response.credential);
        axios.get('https://el-rastro-six.vercel.app/usuarios/correo/' + userObject.email)
            .then((response) => {
                const { data } = response;
                const { message } = data;
                if (message === "No se ha encontrado ningún usuario con ese correo.") {
                    //Por hacer, es pra registrarse, hacer un desvio de pagina a /crearUsuario
                    user.setUser({
                        email: userObject.email,
                    });
                    window.location.href = "https://el-rastro-nine.vercel.app/crearUsuario";
                    return
                } else {
                    user.setUser({
                        id: data[0]._id,
                        email: userObject.email,
                        name: userObject.name
                    });
                    localStorage.setItem("id", data[0]._id);
                }
            })
            .catch((error) => console.log(error));

    }

    useEffect(() => {
        // Verificar si el objeto 'google' está disponible
        if (window.google && window.google.accounts && window.google.accounts.id) {
            // Inicializar Google Sign-In
            window.google.accounts.id.initialize({
                client_id: '125549162694-dmj5gauc815vss9fnlo3ju6qeke9d2ea.apps.googleusercontent.com',
                callback: handleCallbackResponse,
            });

            window.google.accounts.id.renderButton(
                document.getElementById('sigInDiv'),
                { theme: 'outline', size: 'large', text: 'signIn', width: '300px', height: '50px' }
            );
            console.log(user.user);

        } else {
            console.error("El objeto 'google' no está disponible.");
        }
    }, [handleCallbackResponse])

    return (
        <div style={{ textAlign: 'center' }}>
            <nav className="navbar" style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', padding: '1%' }}>
                <Link to="/" style={{ paddingRight: '2%' }} className=''>
                    <img src={Logo} style={{ width: '80px', height: '80px', borderRadius: '90px' }} alt="Logo" />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {user.user && (
                        <div style={{ display: 'flex', marginLeft: '1%' }}>
                            <Link to="/SubirProducto" style={{ color: 'white', textDecoration: 'none' }}>
                                <img src={AddButton} style={{ width: '50px', height: '50px', borderRadius: '90px' }} alt="SubirProducto" />
                            </Link>
                            <Link to="/Buzon" style={{ marginRight: '1%', textDecoration: 'none' }}>
                                <img src={MailBox} style={{ width: '50px', height: '50px', borderRadius: '90px' }} alt="Buzon" />
                            </Link>
                            <Link to="/MisProductos" style={{ textDecoration: 'none' }}>
                                <img src={Package} style={{ width: '50px', height: '50px' }} alt="Package" />
                            </Link>
                        </div>
                    )}
                    {user.user ? (
                        <div>
                            <a className="d-none d-md-block" style={{ color: 'white', paddingLeft: '2%', marginLeft: '1%' }}>
                                Bienvenido <br /> {user.user.name}
                            </a>
                            <button onClick={cerrarSesion} className="btn d-md-block" id="botonazul" style={{ marginLeft: '17%', marginTop: '8%', width: '70%' }}>Cerrar Sesión</button>
                        </div>
                    ) : (
<></>                    )}

                    {(user.user == null && <div id="sigInDiv" className="d-none d-md-block"></div>)}
                    <div className="d-block d-md-none mr-2" onClick={() => setMenuOpen(!menuOpen)}>
                        <FontAwesomeIcon icon={faBars} size="2x" style={{ color: 'white' }} />
                    </div>
                </div>
            </nav>
            {menuOpen && (
                <div className="d-flex flex-column">
                    {/* Incluye las categorías aquí */}
                    <Link to="/category/coches">Coches</Link>
                    <Link to="/category/motos">Motos</Link>
                    <Link to="/category/moda">Moda</Link>
                    <Link to="/category/tecnología">Tecnología</Link>
                    <Link to="/category/deporte">Deporte</Link>
                    <Link to="/category/hogar%20y%20jardin">Hogar y Jardin</Link>
                    {(user.user == null && <div id="sigInDiv" className="d-none d-md-block"></div>)}

                </div>
            )}
            <nav className='navbar d-none d-md-block'>
                <div className='w-100 d-flex justify-content-around '>
                    <a
                        style={{ color: "white" }}
                        className="menu-toggle tipoLetraMonse"
                        onMouseEnter={() => {
                            document.querySelector('.categorias').style.display = 'flex';
                            document.querySelector('.menu-toggle').style.fontWeight = 'bold';
                            document.querySelector('.menu-toggle').style.borderBottom = '2px solid white';
                            document.querySelector(".categorias").style.flexdirection = 'row';
                        }}
                        onMouseLeave={() => {
                            document.querySelector('.categorias').style.display = 'none'
                            document.querySelector('.menu-toggle').style.fontWeight = 'normal';
                            document.querySelector('.menu-toggle').style.borderBottom = 'none';
                        }}

                    >
                        Categoria
                    </a>
                    <a className={"text-light tipoLetraMonse"}>
                        <Link to="/category/coches" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Coches
                        </Link>
                    </a>
                    <a className={"text-light tipoLetraMonse"}>
                        <Link to="/category/motos" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Motos
                        </Link>
                    </a>
                    <a className={"text-light tipoLetraMonse"}>
                        <Link to="/category/moda%20y%20accesorios" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Moda
                        </Link> </a>
                    <a className={"text-light tipoLetraMonse"}>
                        <Link to="/category/móviles%20y%20tecnología" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Tecnología
                        </Link> </a>
                    <a className={"text-light tipoLetraMonse"}>
                        <Link to="/category/deporte%20y%20ocio" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Deporte
                        </Link> </a>
                    <a className={"text-light tipoLetraMonse"}>
                        <Link to="/category/hogar%20y%20jardin" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Hogar y Jardin
                        </Link> </a>
                </div>
                <div
                    className='w-100'
                    onMouseEnter={() => {
                        document.querySelector('.categorias').style.display = 'flex';
                        document.querySelector('.menu-toggle').style.fontWeight = 'bold';
                        document.querySelector('.menu-toggle').style.borderBottom = '2px solid white';
                        document.querySelector(".categorias").style.flexdirection = 'row';

                    }

                    }
                    onMouseLeave={() => {
                        document.querySelector('.categorias').style.display = 'none'
                        document.querySelector('.menu-toggle').style.fontWeight = 'normal';
                        document.querySelector('.menu-toggle').style.borderBottom = 'none';
                    }}

                >
                    <div className="categorias flex-row none">


                        <ul className=" w-100 d-flex  text-start flex-column mt-4 none"
                        >
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/coches" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Coches
                                </Link></li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/tv,%20audio%20y%20foto" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    TV, Audio y Foto
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/consolas%20y%20videojuegos" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Consolas y VideoJuegos
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/coleccionismo" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Coleccionismo
                                </Link>
                            </li>
                        </ul>

                        <ul className=" w-100 d-flex   text-start flex-column mt-4"
                        >
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/motos" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Motos
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/móviles%20y%20tecnología" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Móviles y Tecnología
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/hogar%20y%20jardin" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Hogar y Jardin
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/construcción%20y%20reformas" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Construcción y Reformas
                                </Link>
                            </li>
                        </ul>

                        <ul className=" w-100 d-flex  text-start flex-column mt-4"
                        >
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/motor%20y%20accesorios" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Motor y Accesorios
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/informática%20y%20electrónica" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Informática y Electrónica
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/electrodomésticos" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Electrodomésticos
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/industria%20y%20agricultura" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Industria y Agricultura
                                </Link>
                            </li>
                        </ul>
                        <ul className=" w-100 d-flex  text-start flex-column mt-4"
                        >
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/moda%20y%20accesorios" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Moda y Accesorios
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/deporte%20y%20ocio" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Deporte y ocio
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/cine,%20libros%20y%20música" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Cine, Libros y Música
                                </Link>
                            </li>
                            <li className='text-light tipoLetraMonse'>
                                <Link to="/category/otro" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    Otro
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

            </nav>
        </div>
    )
}

export default Navbar