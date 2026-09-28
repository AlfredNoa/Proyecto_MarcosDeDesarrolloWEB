package pe.edu.utp.utilex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.utilex.model.Pedido;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Historial de compras de un cliente específico
    List<Pedido> findByClienteIdOrderByFechaDesc(Long clienteId);
}