import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Respuesta } from '../interfaces/respuesta-interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  rutaBase = 'http://fer-sepulveda.cl/api/api-prueba2.php/';

  constructor(private http: HttpClient) { }

  //FUNCION QUE REGISTRA AL USUARIO:
  registrarUsuario(usuario, contrasena){
    return this.http.post(this.rutaBase , { nombreFuncion:'UsuarioAlmacenar', parametros:[usuario, contrasena] });
  }

  //FUNCION QUE VALIDA EL LOGIN
  validaLogin(usuario, contrasena){
    return this.http.get(this.rutaBase + '?nombreFuncion=UsuarioLogin&usuario=' + usuario + "&contrasena=" + contrasena);
  }

  //FUNCION QUE MODIFICA LA CONTRASEÑA:
  modificarContraseña(usuario, contrasena){
    return this.http.put(this.rutaBase, { nombreFuncion: "UsuarioModificarContrasena", parametros: { usuario: usuario, contrasena: contrasena} });
  }
}
