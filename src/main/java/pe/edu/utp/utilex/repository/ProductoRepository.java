package pe.edu.utp.utilex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.utilex.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}