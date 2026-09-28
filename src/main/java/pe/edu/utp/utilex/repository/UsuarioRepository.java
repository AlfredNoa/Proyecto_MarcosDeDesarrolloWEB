package pe.edu.utp.utilex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.utilex.model.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Busca al usuario cuando inicie sesión con su correo
    Optional<Usuario> findByEmail(String email);
    
    // Verificar si el correo ya existe antes de registrar un nuevo cliente
    boolean existsByEmail(String email);
}