package pe.edu.utp.utilex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.utilex.model.UtilEscolar;
import java.util.List;

public interface UtilEscolarRepository extends JpaRepository<UtilEscolar, Long> {
    List<UtilEscolar> findByCategoria(String categoria);
    List<UtilEscolar> findByMarca(String marca);
}