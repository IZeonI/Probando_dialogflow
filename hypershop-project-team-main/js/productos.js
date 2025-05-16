function agregar(valor){
    let actual = document.getElementById("total").innerHTML;
    let actualp = parseInt(actual) || 0;
    document.getElementById("total").innerHTML = actualp + valor;
}

class Producto{
    constructor(imagen, nombre, precio, descripcion){
        this.imagen = imagen;
        this.nombre = nombre;
        this.precio = precio;
    }

    mostrar(contenedor_id){
        const contenedor = document.getElementById(contenedor_id);
    
        const producto_div = document.createElement("div");
        producto_div.classList.add("producto");
        
        producto_div.innerHTML = `
            <img class="imagen_producto "src="${this.imagen}" width="150">
            <h2 class="titulo_producto">${this.nombre}</h2>
            <p class="precio">$${this.precio}</p>
            <button onclick="agregar(${this.precio})"><img src="../assets/productos/carrito invertido.png" width="20">+ AGREGAR</button>
        `;
    
        contenedor.appendChild(producto_div);
    }
}

let bateria = new Producto('../assets/productos/bateria1.jpeg', 'Bateria Auto Bosch De 12×65', 1499);
let balatas = new Producto('../assets/productos/balatas.jpeg', 'Balatas Tra Mitsubishi No.4605a389', 999);
let aceite = new Producto('../assets/productos/aceite1.jpeg', 'Aceite Multigrado Super Tech 25W-50', 399);
let anticongelante = new Producto('../assets/productos/anticongelante.jpeg', 'Anticongelante más Refrigerante PEAK 5l', 249);
let llanta = new Producto('../assets/productos/llanta.jpeg', 'Michelin Primacy SUV+ 215/70 R16', 3999);
let limpiaparabrisas = new Producto('../assets/productos/limpiaparabrisas.webp', 'Limpiaparabrisas Trico 35-160', 999);
let jabon = new Producto('../assets/productos/jabon.jpeg', 'Jabón 1320 Video Street Shine Sudz', 199);
let suspension = new Producto('../assets/productos/suspension.jpg', 'Suspensión trasera amortiguador de 10,5', 1199);

document.addEventListener("DOMContentLoaded", () => {
    bateria.mostrar("contenedor_productos");
    balatas.mostrar("contenedor_productos");
    aceite.mostrar("contenedor_productos");
    anticongelante.mostrar("contenedor_productos");
    llanta.mostrar("contenedor_productos");
    limpiaparabrisas.mostrar("contenedor_productos");
    jabon.mostrar("contenedor_productos");
    suspension.mostrar("contenedor_productos");
});