package pe.edu.utp.utilex.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "libros")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)

public class Libro extends Producto{
    
    @Column (nullable = false)
    private String autor;

    private String editorial;

    @Column (name = "anio_publicacion")
    private Integer anio;

    @Column (unique = true)
    private String isbn;

    @Column (columnDefinition = "TEXT")
    private String sinopsis;

    private String genero;

    private Integer tomo;
}