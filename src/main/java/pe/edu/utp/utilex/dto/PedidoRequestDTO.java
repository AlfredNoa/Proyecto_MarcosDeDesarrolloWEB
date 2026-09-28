package pe.edu.utp.utilex.dto;

import lombok.Data;
import java.util.List;

@Data
public class PedidoRequestDTO {
    private Long usuarioId; // Opcional: si viene null, se usará el usuario por defecto (ID 1)
    private List<ItemDTO> items;

    @Data
    public static class ItemDTO {
        private Long productoId;
        private Integer cantidad;
    }
}