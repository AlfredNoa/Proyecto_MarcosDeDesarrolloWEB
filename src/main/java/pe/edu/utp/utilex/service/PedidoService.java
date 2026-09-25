package pe.edu.utp.utilex.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.utilex.dto.PedidoRequestDTO;
import pe.edu.utp.utilex.exception.RecursoNoEncontradoException;
import pe.edu.utp.utilex.model.DetallePedido;
import pe.edu.utp.utilex.model.Pedido;
import pe.edu.utp.utilex.model.Producto;
import pe.edu.utp.utilex.model.Usuario;
import pe.edu.utp.utilex.repository.PedidoRepository;
import pe.edu.utp.utilex.repository.ProductoRepository;
import pe.edu.utp.utilex.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Pedido procesarPedido(PedidoRequestDTO request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("El carrito no contiene productos.");
        }

        // 1. Obtener el cliente (usa el enviado o el ID 1 por defecto)
        Long idCliente = (request.getUsuarioId() != null) ? request.getUsuarioId() : 1L;
        Usuario cliente = usuarioRepository.findById(idCliente)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", idCliente));

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente); // Satisface nullable = false

        double totalCalculado = 0.0;

        // 2. Procesar ítems y descontar stock
        for (PedidoRequestDTO.ItemDTO item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", item.getProductoId()));

            // Validación de stock: lanza 400 Bad Request formateado
            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Descuento de inventario
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            // Armar detalle
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());

            pedido.getDetalles().add(detalle);
            totalCalculado += detalle.getSubtotal(); // Invoca getSubtotal() del modelo
        }

        pedido.setTotal(totalCalculado);

        // Guarda pedido y detalles en cascada; @PrePersist asigna fecha y estado "PAGADO"
        return pedidoRepository.save(pedido);
    }
}