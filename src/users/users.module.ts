import { Module } from '@nestjs/common';

import { UsersRepository } from './users.repository'; // Importa el repositorio de usuarios
import { UsersController } from './users.controller'; // Importa el controlador de usuarios

@Module({
  providers: [UsersRepository], // Usar el repositorio de usuarios en lugar del de indicadores
  exports: [UsersRepository], // Exportar el repositorio de usuarios
  controllers: [UsersController], // Usar el controlador de usuarios en lugar del de indicadores
})
export class UsersModule {} // Cambiar el nombre del módulo a UsersModule
