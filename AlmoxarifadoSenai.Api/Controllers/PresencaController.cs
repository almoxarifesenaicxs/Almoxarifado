using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PresencaController : ControllerBase
    {
        private static readonly TimeSpan JanelaOnline = TimeSpan.FromSeconds(90);
        private readonly FirestoreService _firestoreService;

        public PresencaController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpPost("heartbeat")]
        public async Task<IActionResult> RegistrarHeartbeat()
        {
            var matricula = User.FindFirstValue("Matricula");
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();

            await _firestoreService.AtualizarPresencaAsync(new PresencaUsuario
            {
                Matricula = matricula,
                Nome = User.Identity?.Name ?? string.Empty,
                Perfil = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty,
                UltimaAtividade = DateTime.UtcNow
            });

            return NoContent();
        }

        [HttpGet("online")]
        [Authorize(Roles = Perfis.Desenvolvedor + "," + Perfis.Coordenador)]
        public async Task<ActionResult<List<PresencaUsuarioDto>>> ListarOnline()
        {
            var limite = DateTime.UtcNow.Subtract(JanelaOnline);
            var presencas = await _firestoreService.ObterPresencasDesdeAsync(limite);

            return Ok(presencas.Select(p => new PresencaUsuarioDto
            {
                Matricula = p.Matricula,
                Nome = p.Nome,
                Perfil = p.Perfil,
                UltimaAtividade = p.UltimaAtividade
            }));
        }
    }
}
