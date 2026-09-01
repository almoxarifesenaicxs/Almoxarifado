using System;
using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class NotificacaoDto
    {
        public string Id { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string Mensagem { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string Icone { get; set; } = string.Empty;
        public string Cor { get; set; } = string.Empty;
        public string? Link { get; set; } = string.Empty;
        public string? DemandaId { get; set; } = string.Empty;
        public bool Lida { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataLeitura { get; set; }
        public bool Excluida { get; set; }
        public DateTime? DataExclusao { get; set; }
    }

    public class NotificacaoMarcarLidaDto
    {
        public bool Lida { get; set; } = true;
    }

    public class NotificacaoSistemaCriarDto
    {
        [Required]
        [StringLength(100)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Mensagem { get; set; } = string.Empty;

        public string Categoria { get; set; } = "Atualização";
    }

    public class NotificacaoFiltroDto
    {
        public string? UsuarioMatricula { get; set; }
        public string? Tipo { get; set; }
        public bool? Lida { get; set; }
        public int Limite { get; set; } = 50;
        public int Pagina { get; set; } = 1;
    }
}
