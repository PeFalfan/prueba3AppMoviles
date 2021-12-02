import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Respuesta } from 'src/app/interfaces/respuesta-interface';
import { ApiService } from 'src/app/services/api.service';
import { DbService } from 'src/app/services/db.service';
import { Camera, CameraResultType } from '@capacitor/camera';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  usuario : string;

  resp: Respuesta;

  ruta = '';

  estado = 'Asistencia no registrada.'

  constructor(
    public rutaActiva: ActivatedRoute, 
    private dbService: DbService, 
    private alertController: AlertController, 
    private apiService:ApiService,
    private qr: BarcodeScanner) {
      this.rutaActiva.queryParams.subscribe(params =>{
      this.usuario = params.usuario;
    })
   } 

  ngOnInit() {
  }

  olvidarEstado(){
    this.dbService.olvidarUsuarios();
  }

  // formulario para cambiar contraseña
  async formularioCambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar contraseña',
      inputs: [
        {
          name: 'contrasenaActual',
          type: 'text',
          placeholder: 'contraseña actual'
        },
        {
          name: 'contrasenaNueva',
          type: 'password',
          placeholder: 'Contraseña nueva'
        },
        {
          name: 'confContrasenaNueva',
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
          }
        }, {
          text: 'Confirmar',
          handler: (data) => {
            if (data.contrasenaNueva != data.confContrasenaNueva) {
              this.contrasenasDiferentes();
            } else {
              //funcion que actualiza la clave
              this.intentarActualizarContrasena(data.contrasenaActual, data.contrasenaNueva);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cambioCorrectoContrasena() {
    var alertaContrasenas = await this.alertController.create({
      header: 'Contraseña actualizada',
      buttons: [
        'Volver'
      ]
    });
    await alertaContrasenas.present();
  }

  async contrasenasDiferentes() {
    var alertaContrasenas = await this.alertController.create({
      header: 'Contraseñas diferentes',
      message: 'Nueva contraseña debe ser identica.',
      buttons: [
        'Atras'
      ]
    });
    await alertaContrasenas.present();
  }

  intentarActualizarContrasena(contrasenaActual, contrasenaNueva){
    // confirmar si la contraseña corresponde.
    this.dbService.validarContrasena(this.usuario, contrasenaActual).then((data) => {
      if (data){
        //cambio de pass en bd
        this.dbService.cambiarContrasena(contrasenaNueva, this.usuario);
        //cambio de pass en API
        this.apiService.modificarContraseña(this.usuario, contrasenaNueva).subscribe((data) => {
          this.resp = data;
          alert('Cambio de contraseña: ' + this.resp.result)
        })
      }else{
        alert('Contraseña incorrecta');
      }
    })

  }

  //Logica para scan del codigo qr.
  validarQR(){
    this.qr.scan().then(info => {
      if(info.text == '30/11/2021'){
        this.estado = 'Asistencia Registrada.';
        this.alertaAsistenciaRegistrada();
      }
    }).catch(e => {
      console.log('error: ' , e);
      this.alertaAsistenciaNoRegistrada(e);
    })
  }

  async alertaAsistenciaRegistrada() {
    var alertaAsistencia = await this.alertController.create({
      header: 'Asistencia',
      message: 'Asistencia registrada correctamente.',
      buttons: [
        'Aceptar'
      ]
    });
    await alertaAsistencia.present();
  }

  async alertaAsistenciaNoRegistrada(error) {
    var alertaAsistenciaError = await this.alertController.create({
      header: 'Asistencia',
      message: 'Error al registrar asistencia: ' + error,
      buttons: [
        'Atras'
      ]
    });
    await alertaAsistenciaError.present();
  }

}
