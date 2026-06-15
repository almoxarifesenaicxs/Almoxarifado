using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwtService;

        public AuthController(JwtService jwtService)
        {
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            Usuario? usuario = null;

            if (request.Matricula == "111")
            {
                usuario = new Usuario
                {
                    Matricula = "111",
                    Nome = "Administrador",
                    Perfil = Perfis.Admin,
                    DataNascimento = new DateTime(2000, 1, 1)
                };
            }
            else if (request.Matricula == "222")
            {
                usuario = new Usuario
                {
                    Matricula = "222",
                    Nome = "Coordenador",
                    Perfil = Perfis.Coordenador,
                    DataNascimento = new DateTime(2000, 1, 1)
                };
            }
            else if (request.Matricula == "333")
            {
                usuario = new Usuario
                {
                    Matricula = "333",
                    Nome = "Professor",
                    Perfil = Perfis.Professor,
                    DataNascimento = new DateTime(2000, 1, 1)
                };
            }
            else if (request.Matricula == "444")
            {
                usuario = new Usuario
                {
                    Matricula = "444",
                    Nome = "Almoxarife",
                    Perfil = Perfis.Almoxarife,
                    DataNascimento = new DateTime(2000, 1, 1)
                };
            }

            if (usuario == null)
            {
                return Unauthorized("Usuário não encontrado.");
            }

            if (request.DataNascimento.Date != usuario.DataNascimento.Date)
            {
                return Unauthorized("Data de nascimento inválida.");
            }

            var token = _jwtService.GerarToken(usuario);

            return Ok(new
            {
                mensagem = "Login realizado com sucesso.",
                token,
                usuario = new
                {
                    usuario.Nome,
                    usuario.Matricula,
                    usuario.Perfil
                }
            });
        }
    }
}