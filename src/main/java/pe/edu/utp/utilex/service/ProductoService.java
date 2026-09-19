package pe.edu.utp.utilex.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pe.edu.utp.utilex.model.Libro;
import pe.edu.utp.utilex.model.Producto;
import pe.edu.utp.utilex.model.UtilEscolar;
import pe.edu.utp.utilex.repository.LibroRepository;
import pe.edu.utp.utilex.repository.ProductoRepository;
import pe.edu.utp.utilex.repository.UtilEscolarRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    private final LibroRepository libroRepository;

    private final UtilEscolarRepository utilEscolarRepository;

    // Obtener todos los productos (libros y útiles mezclados)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    // Buscar producto por su ID
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    // Listar solo los libros
    public List<Libro> listarLibros() {
        return libroRepository.findAll();
    }

    // Listar libros filtrados por género (Fantasía, Aventura, etc.)
    public List<Libro> listarLibrosPorGenero(String genero) {
        return libroRepository.findByGenero(genero);
    }

    // Listar solo útiles escolares
    public List<UtilEscolar> listarUtiles() {
        return utilEscolarRepository.findAll();
    }

    // Guardar o actualizar un producto
    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }
}