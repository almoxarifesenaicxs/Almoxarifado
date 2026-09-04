namespace AlmoxarifadoSenai.Api.DTOs
{
    public class PresencaUsuarioDto
    {
        public string Matricula { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;
        public DateTime UltimaAtividade { get; set; }
    }
}
