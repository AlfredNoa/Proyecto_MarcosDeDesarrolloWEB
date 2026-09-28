package pe.edu.utp.utilex.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "utiles_escolares")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)

public class UtilEscolar extends Producto{
    
    @Column (nullable = false)
    private String marca;

    @Column (columnDefinition = "TEXT")
    private String descripcion;

    private String categoria;

    private String presentacion;

}