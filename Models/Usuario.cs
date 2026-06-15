using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


    namespace AlmoxarifadoSenai.Api.Models
    {
        public class Usuario
        {
            public string Matricula { get; set; } = string.Empty;
            public string Nome { get; set; } = string.Empty;
            public string Perfil { get; set; } = string.Empty;
            public DateTime DataNascimento { get; set; }
        }
    }
