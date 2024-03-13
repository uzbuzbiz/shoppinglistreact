// Importamos los iconos necesarios para la tabla
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSort } from '@fortawesome/free-solid-svg-icons'

// Importamos los hooks y componentes necesarios de React
import React, { useState, useEffect } from 'react';
import './App.css';

// Componente para cada fila de producto en la tabla
function FilasProducto({ producto, onToggle }) {

  // Asigna el nombre del producto a la constante 'name'
  const name = producto.name;


  // Devolvemos una fila de tabla con el nombre del producto, la cantidad y un checkbox para marcar el producto
  return (
    <tr>
      <td>{name}</td>
      <td>{producto.cantidad}</td>
      <td><input type="checkbox" onChange={() => onToggle(producto.id)} /></td>
    </tr>
  );
}

// Componente para la tabla de productos
function TablaProductos({ productos, onRemove }) {
  // Estado para los productos marcados y la configuración de ordenación
  const [marked, setMarked] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);

  // Función para marcar o desmarcar un producto
  const toggleMarked = (name) => {
    setMarked(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  // Ordenamos los productos según la configuración de ordenación
  const sortedProductos = React.useMemo(() => {
    let sortableProductos = [...productos];
    if (sortConfig !== null) {
      sortableProductos.sort((a, b) => {
        // Convierte las claves a minúsculas antes de comparar
        const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProductos;
  }, [productos, sortConfig]);

  // Función para solicitar la ordenación por una clave específica
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Creamos las filas de la tabla para cada producto
  const rows = sortedProductos.map((producto) => (
    <FilasProducto
      producto={producto}
      key={producto.id}
      onToggle={toggleMarked}
    />
  ));

  // Función para manejar la eliminación de los productos marcados
  const handleRemove = () => {
    onRemove(marked);
    setMarked([]);
  };

  // Devolvemos la tabla de productos y el botón para eliminar los productos marcados
  return (
    <div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>
                Nombre <FontAwesomeIcon icon={faSort} />
              </th>
              <th onClick={() => requestSort('cantidad')}>
                Cantidad <FontAwesomeIcon icon={faSort} />
              </th>
              <th>Marcar</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <div className="button-container">
        <button type="submit" onClick={handleRemove} className="remove">Remover marcados</button>
      </div>
    </div>
  );
}

// Componente para el menú de añadir productos
function MenuAñadirProductos({ onAddProduct }) {
  // Estado para el valor del input
  const [inputValue, setInputValue] = useState("");

  // Función para manejar el envío del formulario
  const handleSubmit = (event) => {
    event.preventDefault();
    const [name, cantidad] = inputValue.split(",");
    if (!name.trim()) {
      alert("Por favor, introduce un producto.");
      return;
    }
    // Verifica si 'cantidad' es un número. Si no lo es, establece el valor por defecto en 1.
    const cantidadNumerica = isNaN(cantidad) ? 1 : Number(cantidad);
    onAddProduct({ name, cantidad: cantidadNumerica });
    setInputValue("");
  };

  // Devolvemos el formulario para añadir productos
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input type="text" placeholder="Producto, cantidad" value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button type="submit">Añadir a la lista</button>
    </form>
  );
}

// Componente para la tabla completa de productos
function TablaCompleta({ productos, onAddProduct, onRemove }) {
  // Devolvemos el menú para añadir productos y la tabla de productos
  return (
    <div className="container">
      <MenuAñadirProductos onAddProduct={onAddProduct} />
      <TablaProductos productos={productos} onRemove={onRemove} />
    </div>
  );
}

var listaProductos = []

// Exportamos la función App como el componente principal
export default function App() {
  // Inicializamos el estado 'productos' con los datos de localStorage si existen, si no, usamos 'listaProductos'
  const [productos, setProductos] = useState(JSON.parse(localStorage.getItem('productos')) || listaProductos);

  // Usamos useEffect para actualizar localStorage cada vez que 'productos' cambia
  useEffect(() => {
    localStorage.setItem('productos', JSON.stringify(productos));
  }, [productos]);

  // Función para manejar la adición de un producto
  const handleAddProduct = (producto) => {
    // Añadimos un ID único al producto
    producto.id = Date.now();
    // Actualizamos el estado 'productos' con el nuevo producto
    setProductos(prevProductos => [...prevProductos, producto]);
  };

  // Función para manejar la eliminación de productos
  const handleRemoveProducts = (ids) => {
    // Filtramos 'productos' para eliminar los productos cuyos IDs están en 'ids'
    setProductos(prevProductos => prevProductos.filter(producto => !ids.includes(producto.id)));
  };

  // Renderizamos el componente 'TablaCompleta' con las props necesarias
  return <TablaCompleta productos={productos} onAddProduct={handleAddProduct} onRemove={handleRemoveProducts} />;
}
