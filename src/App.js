//pa que se vea bonito
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSort } from '@fortawesome/free-solid-svg-icons'
//funcionalidad basica
import React, { useState, useEffect } from 'react';
import './App.css';

function FilasProducto({ producto, onToggle }) {
  const name = producto.cantidad > 0 ? producto.name :
    <span>
      {producto.name}
    </span>;

  return (
    <tr>
      <td>{name}</td>
      <td>{producto.cantidad}</td>
      <td><input type="checkbox" onChange={() => onToggle(producto.id)} /></td>
    </tr>
  );
}

function TablaProductos({ productos, onRemove }) {
  const [marked, setMarked] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);

  const toggleMarked = (name) => {
    setMarked(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const rows = sortedProductos.map((producto) => (
    <FilasProducto
      producto={producto}
      key={producto.id}
      onToggle={toggleMarked}
    />
  ));

  const handleRemove = () => {
    onRemove(marked);
    setMarked([]);
  };

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

function MenuAñadirProductos({ onAddProduct }) {
  const [inputValue, setInputValue] = useState("");

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


  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input type="text" placeholder="Producto, cantidad" value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button type="submit">Añadir a la lista</button>
    </form>
  );
}

function TablaCompleta({ productos, onAddProduct, onRemove }) {
  return (
    <div className="container">
      <MenuAñadirProductos onAddProduct={onAddProduct} />
      <TablaProductos productos={productos} onRemove={onRemove} />
    </div>
  );
}
var listaProductos = []
export default function App() {
  // Inicializa el estado productos con los datos de localStorage si existen, si no, usa listaProductos
  const [productos, setProductos] = useState(JSON.parse(localStorage.getItem('productos')) || listaProductos);

  useEffect(() => {
    // Actualiza localStorage cada vez que productos cambia
    localStorage.setItem('productos', JSON.stringify(productos));
  }, [productos]);

  const handleAddProduct = (producto) => {
    // Añade un ID único al producto
    producto.id = Date.now();
    setProductos(prevProductos => [...prevProductos, producto]);
  };

  const handleRemoveProducts = (ids) => {
    setProductos(prevProductos => prevProductos.filter(producto => !ids.includes(producto.id)));
  };

  return <TablaCompleta productos={productos} onAddProduct={handleAddProduct} onRemove={handleRemoveProducts} />;
}