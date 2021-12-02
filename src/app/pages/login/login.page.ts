import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Respuesta } from 'src/app/interfaces/respuesta-interface';
import { ApiService } from 'src/app/services/api.service';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  recordarSesion: boolean = false;
  ingreso: boolean = false;
  usuarioIngresado: string = '';
  contrasenaIngresada: string = '';
  usuarioRecordado: string = '';

  resp: Respuesta;

  constructor(private dbService: DbService, private alertController: AlertController, public navController: NavController, private apiService: ApiService) {
    console.log('Pagina Login Iniciada');

    this.ingresoAutomatico();

  }

  ngOnInit() {
  }

  /**
   * Levanta una alerta, con un formulario que valida nombre de nuevo usuario y contraseña
   * si el nombre de usuario ya existe manda error, y valida que las contraseñas sean iguales.
   * **/
  async formulario() {
    const alert = await this.alertController.create({
      header: 'Nuevo Usuario',
      inputs: [
        {
          name: 'usuario',
          type: 'text',
          placeholder: 'Nombre Usuario'
        },
        {
          name: 'contrasena',
          type: 'password',
          placeholder: 'Contraseña Usuario'
        },
        {
          name: 'nuevaContrasena',
          type: 'password',
          placeholder: 'Confirmar Contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Registrar',
          handler: (data) => {
            if (data.contrasena != data.nuevaContrasena) {
              this.contrasenasDiferentes();
            } else {
              this.registrarUsuario(data.usuario, data.contrasena);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Metodo que levanta una alerta indicando que hay diferencia entre las contraseñas del usuario a registrar
  async contrasenasDiferentes() {
    var alertaContrasenas = await this.alertController.create({
      header: 'Contraseñas diferentes',
      message: 'Validar contraseñas.',
      buttons: [
        'Atras'
      ]
    });
    await alertaContrasenas.present();
  }

  //alerta que indica que el usuario quedo registrado correctamente en BD
  async registroCorrecto() {
    var alertaContrasenas = await this.alertController.create({
      header: 'Bienvenido!',
      message: 'Usuario Registrado',
      buttons: [
        'Volver al Login'
      ]
    });
    await alertaContrasenas.present();
  }
  // alerta que indica que el usuario ya existe en la BD.
  async usuarioYaRegistrado() {
    var alertaContrasenas = await this.alertController.create({
      header: 'Error!',
      message: 'Usuario ya registrado',
      buttons: [
        'Volver al Login'
      ]
    });
    await alertaContrasenas.present();
  }

  // metodo que valida que el usuario no esté registrado, y de no estarlo, lo guarda.
  registrarUsuario(usuario, contrasena) {
    this.dbService.validarUsuario(usuario).then((data) => {
      if (!data) {
        this.registroCorrecto();
        this.dbService.registrarUsuario(usuario, contrasena, 'NREC');
        this.apiService.registrarUsuario(usuario, contrasena).subscribe(data => {
          this.resp = data;
          alert(this.resp.result);
        })
      } else {
        this.usuarioYaRegistrado();
      }
    })
  }

  // metodo que se llama al no coincidir el usuario y contraseña ingresados con los de la BD.
  async credencialesIncorrectas() {
    var alertaContrasenas = await this.alertController.create({
      header: 'Error!',
      message: 'Credenciales Incorrectas',
      buttons: [
        'Volver al Login'
      ]
    });
    await alertaContrasenas.present();
  }

  /* 
  ** Metodo que llama al servicio, y su funcion validarLogIn entregando usuario y contraseña ingresado
  ** dependiendo si encuentra al usuario o nó, deja ingresar al inicio.
  */
  ingresar() {
    this.dbService.validarLogIn(this.usuarioIngresado, this.contrasenaIngresada).then((promesa => {
      this.ingreso = promesa.valueOf();

      if (this.ingreso) {
        if (this.recordarSesion) {
          this.guardarNuevoEstado();
        }

        this.apiService.validaLogin(this.usuarioIngresado, this.contrasenaIngresada).subscribe((data)=>{
          this.resp = data;
          alert('resulta de log in en API: ' + this.resp.result);
        })

        this.navegarAInicio(this.usuarioIngresado);
      } else {
        this.credencialesIncorrectas();
      }

    })).catch((e => {
      alert('error al ingresar' + e);
    }))

  }

  //metodo para ingresar con el usuario recordado.
  ingresoAutomatico() {
    alert('Hola, soy el ingreso automatico');

    // primero valido que exista un usuario guardado.
    this.dbService.consultarUsuarioRecordado().then((data) => {

      if (data === 'E001') {
        alert('No se recuerdan sesiones: ' + data);

      } else {
        alert('usuario recordado: ' + data);
        this.ingreso = true;
        this.navegarAInicio(data);
      }

    })
  }

  // metodo que redirecciona al inicio y envia como parametro al usuario ingresado.
  navegarAInicio(usuario) {
    this.navController.navigateRoot('inicio', {
      queryParams: {
        'usuario': usuario
      }
    });
  }

  //metodo para guardar credenciales.
  // E001 = No se encuentran usuarios con estado REC
  guardarNuevoEstado() {
    this.dbService.recordarUsuarioIngresando(this.usuarioIngresado);
  }
}
