import { registerAs } from "@nestjs/config"

export default registerAs("recados", () => ({
  Texte: 'Teste 1',
})) 