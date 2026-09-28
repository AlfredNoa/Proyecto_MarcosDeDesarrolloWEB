package pe.edu.utp.utilex.exception;

/**
 * Se lanza cuando se busca una entidad (Producto, Usuario, Pedido, etc.)
 * por un ID que no existe en la base de datos.
 */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    public RecursoNoEncontradoException(String entidad, Long id) {
        super(entidad + " con id " + id + " no fue encontrado/a");
    }
}