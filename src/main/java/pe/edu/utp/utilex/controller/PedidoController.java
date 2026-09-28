package pe.edu.utp.utilex.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.utilex.dto.PedidoRequestDTO;
import pe.edu.utp.utilex.model.Pedido;
import pe.edu.utp.utilex.service.PedidoService;

import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody PedidoRequestDTO request) {
        Pedido nuevoPedido = pedidoService.procesarPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Pedido registrado exitosamente",
                "pedidoId", nuevoPedido.getId(),
                "total", nuevoPedido.getTotal(),
                "estado", nuevoPedido.getEstado()
        ));
    }
}