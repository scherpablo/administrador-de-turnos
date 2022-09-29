let DB;

// Campos del formulario
const nombreInput = document.querySelector("#nombre");
const apellidoInput = document.querySelector("#apellido");
const telefonoInput = document.querySelector("#telefono");
const fechaInput = document.querySelector("#fecha");
const horaInput = document.querySelector("#hora");
const servicioInput = document.querySelector("#servicio");

// Contenedor para las citas
const contenedorCitas = document.querySelector('#citas');

// Formulario nuevas citas
const formulario = document.querySelector('#nueva-cita')
formulario.addEventListener('submit', nuevaCita);

// Heading
const heading = document.querySelector('#administra');

let editando = false;

window.onload = () => {
    eventListeners();

    crearDB();    
}

// Registrar Eventos
function eventListeners() {
    nombreInput.addEventListener("input", datosCita);
    apellidoInput.addEventListener("input", datosCita);
    telefonoInput.addEventListener("input", datosCita);
    fechaInput.addEventListener("input", datosCita);
    horaInput.addEventListener("input", datosCita);
    servicioInput.addEventListener("input", datosCita);  
}

// Objeto con informacion de la cita
const citasObj = {
    nombre: "",
    apellido: "",
    telefono: "",
    fecha: "",
    hora: "",
    servicio: ""
}

class Citas { 
    constructor() { 
        this.citas = [];
    }

    // Definimos nuevo metodo
    agregarCita(cita) { 
        this.citas = [...this.citas, cita];           
    }

    eliminarCita(id) { 
        this.citas = this.citas.filter(cita => cita.id !== id); //Filter mantiene un elemento de acuerdo a una condición
    }

    editarCita(citaActualizada) { 
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita); //Map recorre el elemento y nos crea uno nuevo de acuerdo a los nuevos valores
    }
}

class UI { 

    constructor({citas}) {
        this.textoHeading(citas);
    }

    imprimirALerta(mensaje, tipo) { 
        // Creamos un div
        const divMensaje = document.createElement("div");
        divMensaje.classList.add("text-uppercase", "text-center", "alert", "d-block", "col-12", "font-weight-bold", "font-size:3rem");

        // Agregar clase de acuerdo al tipo de validacion
        if (tipo === "error") {
            divMensaje.classList.add("alert-danger");
        } else { 
            divMensaje.classList.add("alert-success")
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Agregar al DOM
        document.querySelector("#contenido").appendChild(divMensaje, document.querySelector(".agregar-cita"));

        // Eliminamos alerta despues de 2 segundos
        setTimeout(() => {
            divMensaje.remove();  
            resetearFormulario();
        }, 3000);
    }

    imprimirCitas() { 

        this.limpiarHTML();

        this.textoHeading(citas);

        // Leer el contenido de la DB
        const objectStore = DB.transaction("citas").objectStore("citas");

        const fnTextoHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = function () {
            fnTextoHeading(total.result);
        }
        

        objectStore.openCursor().onsuccess = function (e) {
            
            const cursor = e.target.result;

            if (cursor) { 
                const { nombre, apellido, telefono, fecha, hora, servicio, id } = cursor.value;

                const divCita = document.createElement("div");
                divCita.classList.add("cita", "p-3");
                divCita.dataset.id = id;

                // Scripting de los elementos de la cita
                const nombreParrafo = document.createElement("h2");
                nombreParrafo.classList.add("card-title", "font-weight-bolder");
                nombreParrafo.textContent = nombre;
                
                const apellidoParrafo = document.createElement("h2");
                apellidoParrafo.classList.add("card-title", "font-weight-bolder");
                apellidoParrafo.textContent = apellido;

                const telefonoParrafo = document.createElement("p");
                telefonoParrafo.innerHTML = `<span class="font-weigth-bolder">Teléfono: </span> ${telefono}`;
                
                const fechaParrafo = document.createElement("p");
                fechaParrafo.innerHTML = `<span class="font-weigth-bolder">Fecha: </span> ${fecha}`;
                
                const horaParrafo = document.createElement("p");
                horaParrafo.innerHTML = `<span class="font-weigth-bolder">Hora: </span> ${hora}`;
                
                const servicioParrafo = document.createElement("p");
                servicioParrafo.innerHTML = `<span class="font-weigth-bolder">Servicio: </span> ${servicio}`;

                // Boton para eliminar citas
                const btnEliminar = document.createElement("button");
                btnEliminar.classList.add("btn", "btn-danger", "mr-2");
                btnEliminar.innerHTML = 'Eliminar <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

                btnEliminar.onclick = () => {
                    eliminarCita(id);
                }
                
                // Boton para editar citas 
                const btnEditar = document.createElement("button");
                const cita = cursor.value;
                btnEditar.classList.add("btn", "btn-info", "mr-2");
                btnEditar.innerHTML = 'Editar <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>' 

                btnEditar.onclick = () => {
                    cargarEdicion(cita);
                }
                

                // Agregamos los parrafos al divCita
                divCita.appendChild(nombreParrafo);
                divCita.appendChild(apellidoParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(servicioParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                // Agregar las citas al HTML
                contenedorCitas.appendChild(divCita);

                // Ir al siguiente elemento
                cursor.continue();
            }            
        }        
    }

    textoHeading(resultado) {
        if(resultado > 0 ) {
            heading.textContent = 'Administra tus Turnos '
        } else {
            heading.textContent = 'No hay turnos aun . . . '
        }
    }

    limpiarHTML() { 
        while (contenedorCitas.firstChild) { 
            contenedorCitas.removeChild(contenedorCitas.firstChild)
        }
    }
}

const administrarCitas = new Citas();

const ui = new UI(administrarCitas);

// Agrega datos al objeto de cita
function datosCita(e) {
    citasObj[e.target.name] = e.target.value; //Al usar corchetes accedemos a las propiedades del objeto citasObj   
}

// Valida y agrega una nueva cita a la clase de citas
function nuevaCita(e) {
    e.preventDefault();

    // Extraemos las propiedades del objeto citasObj
    const { nombre, apellido, telefono, fecha, hora, servicio } = citasObj;

    // Validar
    if (nombre === "" || apellido === "" || telefono === "" || fecha === "" || hora === "" || servicio === "") { 
        ui.imprimirALerta("Todos los campos son obligatorios", "error");

        return;        
    }

    if (editando) {
        // Mensaje nueva cita agregada correctamente
        ui.imprimirALerta("Turno editado correctamente")

        // Edita en IndexDB
        const transaction = DB.transaction(["citas"], "readwrite");
        const objectStore = transaction.objectStore("citas");

        objectStore.put(citasObj);

        transaction.oncomplete = () => {
            // Pasar el objeto de la cita a edicion
            administrarCitas.editarCita({ ...citasObj })

            // Cambiar texto del boton
            formulario.querySelector("button[type=submit]").textContent = "Resrevar Turno";

            // Deshabilitar modo edicion 
            editando = false;
        }
        
        transaction.onerror = () => {
            ui.imprimirALerta("Hubo un error al querer editar el turno", "error");               
        }
        
    } else { 
        // Generar ID unico para citas
        citasObj.id = Date.now();

        // Creamos la nueva cita
        administrarCitas.agregarCita({ ...citasObj });

        // Insertar Registro en IndexDB
        const transaction = DB.transaction(["citas"], "readwrite");
        
        // Habilitar el objectStore
        const objectStore = transaction.objectStore("citas");
        
        // Insertar en la DB
        objectStore.add(citasObj);

        transaction.onerror = () => {           

            // Mensaje de error (horario no dispónible)
            ui.imprimirALerta("Horario no disponible", "error");            
        }   

        transaction.oncomplete = () => {           

            // Mensaje nueva cita agregada correctamente
            ui.imprimirALerta("Turno agregado correctamente");            
        }      
    }    

    // Reiniciar Objeto luego de crear la resreva
    reiniciarObjeto();

    // Reseteamos el FOrmulario luego de generar el turno
    formulario.reset();    

    // Mostrar el HTML de citas
    ui.imprimirCitas();

}

// RESETEAR FORMULARIO
function resetearFormulario() {
    formulario.reset();
}

// REINICIAR OBJETO
function reiniciarObjeto() {
    citasObj.nombre = "";
    citasObj.apellido = "";
    citasObj.telefono = "";
    citasObj.fecha = "";
    citasObj.hora = "";
    citasObj.servicio = "";
}

// ELIMINAR CITA
function eliminarCita(id) {

    const transaction = DB.transaction(["citas"], "readwrite");
    const objectStore = transaction.objectStore("citas");

    objectStore.delete(id);

    transaction.oncomplete = () => {   
        // Mostrar Mensaje
        ui.imprimirALerta("Turno eliminado correctamente");
        
        // Refrescar las citas
        ui.imprimirCitas();     
    }

    transaction.onerror = () => {
        // Mostrar Mensaje
        ui.imprimirALerta("No se pudo eliminar el turno");     
    }   
}

// CARGAR LOS DATOS Y EDITAR UNA CITA
function cargarEdicion(cita) {
    const { nombre, apellido, telefono, fecha, hora, servicio, id} = cita;

    // Llenar los input
    nombreInput.value = nombre;    
    apellidoInput.value = apellido;    
    telefonoInput.value = telefono;    
    fechaInput.value = fecha;    
    horaInput.value = hora;    
    servicioInput.value = servicio;    

    // Llenar el Objeto
    citasObj.nombre = nombre;
    citasObj.apellido = apellido;
    citasObj.telefono = telefono;
    citasObj.fecha = fecha;
    citasObj.hora = hora;
    citasObj.servicio = servicio;
    citasObj.id = id;

    // Cambiar texto del boton
    formulario.querySelector("button[type=submit]").textContent = "Guardar Cambios";

    editando = true;
}

function crearDB() {
    // Crear la DB version 1.0
    const crearDB = window.indexedDB.open("citas", 1); 

    // Si hay un error
    crearDB.onerror = function () {
        console.log("hubo un error");
        }
    
    // Si todo sale bien
    crearDB.onsuccess = function () {
                
        DB = crearDB.result;

        // Mostrar citas al cargar la pagina (Pero indexDB ya esta listo)
        ui.imprimirCitas();
        
    }     
    
    // Definir el schema
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore("citas", {
            keyPath: "id",
            autoincrement: true
        });

        // Definir todas las columnas
        objectStore.createIndex("nombre", "nombre", { unique: false });
        objectStore.createIndex("apellido", "apellido", { unique: false });
        objectStore.createIndex("telefono", "telefono", { unique: false });
        objectStore.createIndex("fecha", "fecha", { unique: false });
        objectStore.createIndex("hora", "hora", { unique: true });
        objectStore.createIndex("servicio", "servicio", { unique: false });
        objectStore.createIndex("id", "id", { unique: true });       
    }    
}








