package pe.edu.utp.utilex.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import pe.edu.utp.utilex.exception.RecursoNoEncontradoException;
import pe.edu.utp.utilex.model.Libro;
import pe.edu.utp.utilex.model.Producto;
import pe.edu.utp.utilex.model.UtilEscolar;
import pe.edu.utp.utilex.service.ProductoService;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor

public class ProductoController {

    private final ProductoService productoService;

    // Endpoint: GET /api/productos
    @GetMapping
    public List<Producto> listarTodos() {
        return productoService.listarTodos();
    }

    // Endpoint: GET /api/productos/libros
    @GetMapping("/libros")
    public List<Libro> listarLibros(@RequestParam(required = false) String genero) {
        if (genero != null && !genero.isEmpty()) {
            return productoService.listarLibrosPorGenero(genero);
        }
        return productoService.listarLibros();
    }

    // Endpoint: GET /api/productos/utiles
    @GetMapping("/utiles")
    public List<UtilEscolar> listarUtiles() {
        return productoService.listarUtiles();
    }

    // Endpoint: GET /api/productos/1 (buscar por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Producto producto = productoService.buscarPorId(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));
        return ResponseEntity.ok(producto);        
    }
}