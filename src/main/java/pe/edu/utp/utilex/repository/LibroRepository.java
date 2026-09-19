package pe.edu.utp.utilex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.utilex.model.Libro;
import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    // Spring crea la consulta SQL a partir del nombre del método:
    List<Libro> findByGenero(String genero);
}