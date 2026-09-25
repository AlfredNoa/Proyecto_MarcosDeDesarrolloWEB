package pe.edu.utp.utilex.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Forma estándar en la que la API responde cuando ocurre un error,
 * para que el frontend siempre reciba el mismo formato de JSON.
 */
@Getter
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime fecha;
    private int status;
    private String error;
    private String mensaje;
    private String ruta;
}