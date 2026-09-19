package pe.edu.utp.utilex.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false)
    private String nombre;

    @Column (nullable = false)
    private String apellido;

    @Column (nullable = false, unique = true)
    private String email;

    @Column (nullable = false)
    private String password;

    private String genero;

    private String telefono;

    @Column (nullable = false)
    private String rol = "CLIENTE";

    public Usuario(String nombre, String apellido, String email, String password, String telefono, String genero, String rol) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.password = password;
        this.telefono = telefono;
        this.genero = genero;
        this.rol = (rol != null) ? rol : "CLIENTE";
    }
}