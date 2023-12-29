import React from 'react';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UserImage from '../media/user.jpg';
import Estrellas from '../components/Estrellas';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import EstrellasDejarValoracion from '../components/EstrellasDejarValoracion';
import '../css/PaginaConcretaProducto.css';
import { UserContext } from '../hooks/UserContentHook';
import { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import PayPalButton from '../components/PayPalButton';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaginaConcretaProducto = () => {
    const user = useContext(UserContext);
    const [cantidad, setCantidad] = useState('');
    const [puja, setPuja] = useState('');
    
    function handleCallbackResponse(response) {
        var userObject = jwtDecode(response.credential);
        axios.get('https://front-elrastro.vercel.app/usuarios/correo/' + userObject.email)
            .then((response) => {
                const { data } = response;
                const { message } = data;
                if (message === "No se ha encontrado ningún usuario con ese correo.") {
                    //Por hacer, es pra registrarse, hacer un desvio de pagina a /crearUsuario
                    user.setUser({
                        email: userObject.email,
                    });
                    window.location.href = "https://front-elrastro.vercel.app/crearUsuario";
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
                client_id: '71937643255-t87vgiaf2pignoee98j3uej1q648cp5r.apps.googleusercontent.com',
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

    const [categorias, setCategorias] = useState([]); // ['Electronica', 'Informatica', 'Hogar'
    const [articulo, setArticulo] = useState({});
    const [vendedor, setVendedor] = useState({});
    const [latitud, setLatitud] = useState(0);
    const [longitud, setLongitud] = useState(0);
    const [position, setPosition] = useState([0, 0]); // [latitud, longitud
    const [imagenes, setImagenes] = useState([]);
    const [precioCalculado, setPrecioCalculado] = useState(0);
    const [calculandoPrecio, setCalculandoPrecio] = useState(true); // estado para saber si estamos en proceso de cálculo
    const id = useParams().id;
    const [imagenActual, setImagenActual] = useState(0);
    
    const handleClickImagen = (index) => {
        setImagenActual(index);
    };

    useEffect(() => {
        axios.get(`https://front-elrastro.vercel.app/productos/${id}`)
            .then(response => {
                if (response.data !== null) {
                    setArticulo(response.data);
                    setCategorias(response.data.categorias.split(','));
                    setImagenes(response.data.imagenes);
                    console.log('Datos del backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            });
    }, []);

    useEffect(() => {
        if(articulo !== undefined && puja !== undefined && articulo !== null && puja !== null && !puja.message)
        calcularPrecio();
    }, [articulo, puja]);    

    const calcularPrecio = async () => {
        try {
            console.log(puja);
            console.log(articulo);
            const response1 = await axios.get(`https://front-elrastro.vercel.app/huellaC/huellaCarbonoCostoCamion/${puja.comprador}/${articulo._id}`);
                console.log(response1);
            if (response1.data !== null && response1.data !== undefined && response1.data !== '') {
                const { data } = response1;
                const response2 = await axios.get(`https://front-elrastro.vercel.app/huellaC/getPrecio/${data}`);
                
                if (response2.data !== null) {
                    const precioHuellaCarbono = parseInt(response2.data.precio, 10);
                    const total = precioHuellaCarbono + parseInt(puja.precio, 10);
                    setPrecioCalculado(total);
                    console.log('Coste de huella de carbono:', precioHuellaCarbono);
                    console.log('Precio de la puja:', puja.precio);
                    console.log('Coste total:', total);
                    if(typeof total === 'number' && !isNaN(total)) {
                        console.log('Precio calculado:', total);
                        setCalculandoPrecio(false);
                    }
                }
            }else{
                setCalculandoPrecio(false);
                setPrecioCalculado(parseInt(puja.precio, 10));

            }
        } catch (error) {
            console.error('Error al obt ener datos del backend:', error);
            throw error;
        }
    }   

    useEffect(() => {
        axios.get(`https://front-elrastro.vercel.app/mapa/coordenadasProducto/` + id)
            .then(response => {
                if (response.data !== null) {
                    setLatitud(response.data.latitud);
                    setLongitud(response.data.longitud);
                    setPosition([response.data.latitud, response.data.longitud]);


                    console.log('Datos del Mapa backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            });
    }, [articulo]);

    useEffect(() => {
        axios.get(`https://front-elrastro.vercel.app/usuarios/${articulo.vendedor}`)
            .then(response => {
                if (response.data !== null) {
                    setVendedor(response.data);
                    console.log('Datos del Vendedor en backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            })
    }, [articulo]);

    useEffect(() => {
        axios.get(`https://front-elrastro.vercel.app/pujas/${articulo.pujaGanadora}`)
            .then(response => {
                if (response.data !== null) {
                    setPuja(response.data);
                    console.log('Datos de Puja en backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            })
    }, [articulo]);

    const borrar = async () => {
        // Mostrar ventana de confirmación
        const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este artículo?");
    
        // Si el usuario hace clic en "Aceptar", procede con la operación de borrado
        if (confirmacion) {
            try {
                const deleteResponse = await axios.delete(`https://front-elrastro.vercel.app/productos/${articulo._id}`);
                console.log('Respuesta de DELETE:', deleteResponse.data);
                window.location.href = "https://el-rastro-nine.vercel.app";
            } catch (error) {
                console.error('Error en operaciones DELETE:', error);
            }
        } else {
            // Si el usuario hace clic en "Cancelar", no hagas nada o muestra un mensaje
            console.log('Operación de borrado cancelada por el usuario.');
        }
    }
    
    const handlePaymentSuccess = async (data) => {
        console.log('Pago completado:', data);
        alert('Pago completado');
        
        const deleteArticulo = await axios.delete(`https://front-elrastro.vercel.app/productos/${articulo._id}`);
        console.log('Respuesta de DELETE:', deleteArticulo.data);
        console.log('Puja:', puja)
        const deletePuja = await axios.delete(`https://front-elrastro.vercel.app/pujas/${puja._id}`);
        console.log('Respuesta de DELETE de Puja:', deletePuja.data);

        window.location.href = "localhost:3000/dejarValoracion/" + vendedor._id + "/" + articulo._id;
      };


    const pujar = async (precio) => {
        
        if (articulo.pujaGanadora !== null && puja !== null && precio < puja.precio) {
            alert('La puja debe ser mayor que la puja ganadora');
            return false;
        } else if (user.user === null) {
            alert('Identificate para pujar');
            return false;
        } else if (user.user.id === vendedor._id || user.user.id === articulo.vendedor) {
            alert('No puedes pujar por tu propio producto');
            return false;
        } else if (Date.now() > Date.parse(articulo.fechaDeCierre)) {
            alert('El producto ya ha cerrado');
            return false;
        }
        
        try {
        const postResponse = await axios.post(`https://front-elrastro.vercel.app/pujas/`, {
            comprador: localStorage.id,
            producto: articulo._id,
            precio: precio,
            fechaDeCreacion: Date.now(),
        });

        console.log('Respuesta de POST:', postResponse.data);
        const idPuja = postResponse.data._id;

        const putResponse = await axios.put(`https://front-elrastro.vercel.app/productos/${articulo._id}`, {
            pujaGanadora: idPuja,
            imagenes: articulo.imagenes,
            nombre: articulo.nombre,
            descripcion: articulo.descripcion,
            categorias: articulo.categorias,
            precioInicial: articulo.precioInicial,
            fechaDeCierre: articulo.fechaDeCierre,
            vendedor: articulo.vendedor,
            fechaDeCreacion: articulo.fechaDeCreacion,
            peso : articulo.peso,
        })
       
       
        //window.location.reload();
        window.location.href = `/paginaConcreta/${articulo._id}`;

      } catch (error) {
        console.error('Error en operaciones POST o PUT:', error);
      }
    }    

    return (
        <div>
            <Navbar />
            <div className='col-md-6 col-12 bg-white centrarConMargenes mt-4 tarjetaProducto'>
                <div className='d-flex flex-row justify-content-between align-items-center'>
                    <div className='d-flex flew-column align-items-center '>
                        <img src={UserImage} className='fotoProfile' alt="User" />
                        <div>
                            <h5 style={{paddingLeft: '10%'}} className='fs-4 fw-bolder ml-4 mr-4' >{vendedor.nombreCompleto}</h5>
                            <Estrellas valoracion={vendedor.valoracion} numeroValoraciones={vendedor.numeroValoraciones} />
                        </div>
                        

                    </div>
                    <div>
                        {localStorage.id !== null  ?
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {Date.parse(articulo.fechaDeCierre) > Date.now() ?
                        <h6 style={{marginRight: "2%"}} >Deadline:{new Date(articulo.fechaDeCierre).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                            })}
                            </h6>
                        : null }
                        {localStorage.id !== vendedor._id ? 
                        <a href={`/chat/${articulo._id}/${vendedor._id}/${localStorage.id}`} style={{ marginRight: '1%' }}>
                        <button className="button-36" role="button">Contactar</button>
                        </a>
                        :  <button type="button" className="btn btn-danger" onClick={borrar}>Eliminar</button>}
                        </div>
                        :  <div id="sigInDiv" className='d-none d-md-block' style={{ paddingLeft: "2%" }}></div>}
                    </div>
                </div>

                <div className='w-75 centrarConMargenes mt-4 d-flex flex-row'>
                    <div className='d-flex flex-row col-4 overflow-x-auto'>
                        <div className='d-flex flex-column overflow-y-auto overflow-x-hidden'>
                            {imagenes.map((imagen, index) => (
                                <img
                                    key={index}
                                    src={imagen}
                                    alt={`Imagen ${index + 1}`}
                                    className={`imagen ${index === imagenActual ? 'active imagenesLateral' : 'imagenesLateral'}`}
                                    onClick={() => handleClickImagen(index)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className='d-flex  col-8  imagenCentralGrande'>
                        <img src={imagenes[imagenActual]} alt={`Imagen ${imagenActual + 1}`} className='imagenC' />

                    </div>
                </div>

                <div className='d-flex flex-justify-center align-items-center'>
                    <div className='d-flex flex-column border-bottom w-100'>
                        <h1 className='TituloProducto'>{articulo.nombre}</h1>
                                {articulo.pujaGanadora != null ? (
                                    <div className='d-flex align-items-center'> 
                                        <h2 className='mr-3'>Ultima Puja: {puja.precio} €</h2> 
                                    {localStorage.id !== vendedor._id && (
                                        <div>
                                        {puja.comprador === localStorage.id && (
                                            <img 
                                                style={{ width: "7%" }} 
                                                src={Date.parse(articulo.fechaDeCierre) < Date.now() 
                                                    ? "https://media.istockphoto.com/id/691856234/vector/flat-round-check-mark-green-icon-button-tick-symbol-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=hXL5nXQ2UJlh4yzs2LyZC4GtctQG0fs-mk30GPPbhbQ=" 
                                                    : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Eo_circle_yellow_checkmark.svg/1024px-Eo_circle_yellow_checkmark.svg.png"} 
                                                alt={Date.parse(articulo.fechaDeCierre) < Date.now() ? "tick" : "tick2"} 
                                            />
                                        )}

                                        {puja.comprador !== localStorage.id  && (
                                            <img 
                                            style={{ width: "7%" }} 
                                            src={Date.parse(articulo.fechaDeCierre) < Date.now() 
                                                ? "https://as2.ftcdn.net/v2/jpg/02/50/79/73/1000_F_250797393_yLNptJKu7T6NSm3c70tidf2fEBUq6yNu.jpg" 
                                                : "https://img.freepik.com/premium-vector/yellow-cross-illustration_637394-1884.jpg?w=2000"} 
                                            alt={Date.parse(articulo.fechaDeCierre) < Date.now() ? "tick" : "tick2"} 
                                            />
                                        )}

                                        {Date.parse(articulo.fechaDeCierre) < Date.now() && puja.comprador === localStorage.id ? (
                                            calculandoPrecio == true && !precioCalculado ? <div>Cargando precio...</div> : 
                                            <>
                                            <PayPalButton precio={precioCalculado} onPaymentSuccess={handlePaymentSuccess}/>
                                            <p>Precio totale: {precioCalculado} €</p>
                                            </>
                                        ) : (
                                            <div>
                                                <input 
                                                    value={cantidad}
                                                    onChange={(e) => setCantidad(e.target.value)}
                                                    placeholder="Cantidad" 
                                                    style={{ marginLeft: '10%', width: '100px' }}
                                                />
                                                <button onClick={() => pujar(cantidad)} className='button-36 ml-auto' style={{marginLeft: '10%'}}>Pujar</button>  
                                            </div>
                                        )}
                                    </div>
                                )}
                                </div>
                                ) : (
                                    <div className='d-flex align-items-center'>
                                        <h2 className='mr-3'>Precio Inicial: {articulo.precioInicial} €</h2>
                                        {localStorage.id !== vendedor._id && (
                                        <button onClick={() => pujar(articulo.precioInicial)} className='button-36 ml-auto' style={{ marginRight: '1%' }}>Pujar</button>
                                        )}
                                    </div>
                                )}
                    </div>
                    <small class="text-muted">Se incluyen gastos de huella de carbono</small> 
                </div>
                
                <div className='d-flex flex-column  border-bottom w-100'>
                    <p className='DescripcionProducto' >{articulo.descripcion}</p>
                    
                {categorias.map((categoria, index) => (
                            <div key={index} className='card m-3'>
                                <div className='card-body'>
                                     <p className='card-text fs-4 fw' >{categoria}</p>
                                </div>
                            </div>
                        ))
                }
                </div>
                <div className='d-flex flex-row align-items-center border-bottom w-100'>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="#29363D" fillRule="evenodd" d="M12 5.25a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5ZM8.25 10.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" clipRule="evenodd"></path>
                <path fill="#29363D" fillRule="evenodd" d="m12.56 23.81.063-.033c4.982-2.532 9.865-7.337 9.877-13.28C22.512 4.79 17.75-.05 12 0 6.384.05 1.487 4.664 1.5 10.5c.021 7.863 8.235 12.44 9.883 13.279l.069.035c.174.09.361.186.549.186.19 0 .381-.099.559-.19ZM21 10.5c-.01 5.081-4.235 9.56-8.998 12-.816-.42-3.064-1.77-5.117-3.797C4.775 16.62 3.01 13.877 3 10.5c-.012-4.968 4.178-8.957 9.014-9 4.898-.043 8.996 4.112 8.986 9Z" clipRule="evenodd"></path>
                </svg>
                {vendedor.ciudad !== undefined ? (
                    <p className='ml-2 mt-3'>{vendedor.ciudad}</p>
                ) : (
                    <p className='ml-2 mt-3'>Desconocido</p>
                )}
                </div>
            </div>
            <div className='mapa' id="mapa" >
                { (position[0] !== 0 && position[1] !== 0 && position[0] !== undefined ) ? (
                    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                            OpenStreetMap</a> contributors'
                        />
                        <Marker position={position}>
                            <Popup>{articulo.nombre}</Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <p>Cargando mapa...</p>
                )}
                
            </div>


        </div>


    );
};

export default PaginaConcretaProducto;