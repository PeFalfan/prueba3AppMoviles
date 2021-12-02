import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  enSesion: boolean = false;

  existe: boolean = false;

  constructor(private router: Router, private sqlite: SQLite) {

    // creacion tabla de usuarios
    this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('CREATE TABLE IF NOT EXISTS USUARIO(USUARIO VARCHAR(75), CONTRASENA VARCHAR(30), ESTADO VARCHAR(10))', []).then(() => {
        console.log('CREACION TABLA USUARIO OK');
      }).catch(e => {
        console.log("TABLA NOK " + e);
      })
    }).catch(e => {
      console.log("error: " + e)
    });

  }

  // registra el usuario en la BD
  registrarUsuario(usuario, contrasena, estado) {
    this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('INSERT INTO USUARIO VALUES (?,?,?)', [usuario, contrasena, estado]).then(() => {
        console.log('Usuario Almacenado');
      }).catch(e => {
        console.log("Usuario NO Almacenado " + e);
      })
    }).catch(e => {
      console.log("error: " + e);
    });
  }

  /**
   * Valida que el usuario no existe en la base de datos, con un select de usuario.
   */
  validarUsuario(usuario) {
    return this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      return db.executeSql('SELECT COUNT(USUARIO) AS USUARIO_REGISTRADO FROM USUARIO WHERE USUARIO = ?', [usuario]).then((data) => {
        if (data.rows.item(0).USUARIO_REGISTRADO === 0) {
          return false;
        }
        return true;
      }).catch(e => {
        console.log("SELECT ERROR " + e);
        return true;
      })
    }).catch(e => {
      console.log("error: " + e);
      return true;
    });
  }

  // retorna true o false dependiendo de si encontró o no al usuario que intentó ingresar
  // true = encontrado
  // false = no encontrado
  validarLogIn(usuario, contrasena) {

    return this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      return db.executeSql('SELECT USUARIO, CONTRASENA, ESTADO FROM USUARIO WHERE USUARIO = ? AND CONTRASENA = ?', [usuario, contrasena]).then((data) => {
        if (data.rows.item(0).USUARIO === usuario && data.rows.item(0).CONTRASENA === contrasena) {
          this.enSesion = true;
          return true;
        }
        return false;
      }).catch(e => {
        console.log("SELECT ERROR " + e);
        return false;
      })
    }).catch(e => {
      console.log("error: " + e);
      return false;
    });

  }

  // TODO como configurar la sesion para navanegar.
  canActivate() {
    if (!this.enSesion) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  //metodo para guardar el estado de sesion:
  recordarUsuarioIngresando(usuario) {

    this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE USUARIO SET ESTADO = "REC" WHERE USUARIO = ?', [ usuario]).then(() => {
        console.log('usuario recordado');
      }).catch(e => {
        console.log("usuario no recordado " + e);
      })
    }).catch(e => {
      console.log("error: " + e)
    });

  }

  guardarNuevoEstado(usuario){
    this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE USUARIO SET ESTADO = "REC" WHERE USUARIO = ?', [ usuario]).then(() => {
        console.log('usuario recordado');
      }).catch(e => {
        console.log("usuario no recordado " + e);
      })
    }).catch(e => {
      console.log("error: " + e)
    });
  }

  // metodo para olvidar a los usuarios.
  olvidarUsuarios() {

    this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE USUARIO SET ESTADO = "NREC"', []).then(() => {
        this.enSesion = false;
        console.log('usuarios olvidados');
      }).catch(e => {
        console.log("usuario no olvidados " + e);
      })
    }).catch(e => {
      console.log("error: " + e)
    });

  }

  /*consulta si se recuerda a un usuario 
  retorna  E001 si no encuentra
  retorna nombre de usuario
  */
  consultarUsuarioRecordado() {

    return this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      return db.executeSql('SELECT USUARIO, ESTADO FROM USUARIO WHERE ESTADO = "REC"', []).then((data) => {
        if (data.rows.length !== 0) {
          this.enSesion = true;
          return data.rows.item(0).USUARIO;
        } else {
          return 'E001'
        }

      }).catch(e => {
        console.log("SELECT ERROR " + e);
        return null;
      })
    }).catch(e => {
      console.log("error: " + e);
      return null;
    });
  }

  //valida clave
  validarContrasena(usuario, contrasenaActual){
    return this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      return db.executeSql('SELECT USUARIO, CONTRASENA, ESTADO FROM USUARIO WHERE USUARIO = ? AND CONTRASENA = ?', [usuario, contrasenaActual]).then((data) => {
        if (data.rows.item(0).USUARIO === usuario && data.rows.item(0).CONTRASENA === contrasenaActual) {
          return true;
        }
        return false;
      }).catch(e => {
        console.log("SELECT ERROR " + e);
        return false;
      })
    }).catch(e => {
      console.log("error: " + e);
      return false;
    });
  }

  // cambia la clave
  cambiarContrasena(nuevaPass, usuario){
    this.sqlite.create({
      name: 'datos.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE USUARIO SET CONTRASENA = ? WHERE USUARIO = ?', [nuevaPass, usuario]).then(() => {
        alert('contraseña actualizada')
        console.log('contraseña actualizada');
      }).catch(e => {
        console.log("contraseña no actualizada " + e);
      })
    }).catch(e => {
      console.log("error: " + e)
    });
  }

}
