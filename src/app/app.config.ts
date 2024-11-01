import { registerAs } from "@nestjs/config"

export default registerAs("app", () => ({
  database: {
    type: process.env.TYPEORM_CONNECTION as any,
    host: process.env.TYPEORM_HOST,
    port: +process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    database: process.env.TYPEORM_DATABASE,
    password: process.env.TYPEORM_PASSWORD,
    autoLoadEntities: Boolean(process.env.TYPEORM_AUTOLOAD_ENTITIES),
    synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
  },
  environmwent: process.env.NODE_ENV || 'development',
})) 