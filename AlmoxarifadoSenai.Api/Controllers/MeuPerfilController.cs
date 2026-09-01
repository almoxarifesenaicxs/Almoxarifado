using System.Security.Claims;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MeuPerfilController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;
        private readonly JwtService _jwtService;

        public MeuPerfilController(FirestoreService firestoreService, JwtService jwtService)
        {
            _firestoreService = firestoreService;
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<IActionResult> Obter()
        {
            var usuario = await ObterUsuarioLogadoAsync();
            return usuario == null ? NotFound("Usuário não encontrado.") : Ok(usuario);
        }

        [HttpPut]
        public async Task<IActionResult> Atualizar([FromBody] MeuPerfilUpdateDto dto)
        {
            var usuario = await ObterUsuarioLogadoAsync();
            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            usuario.Nome = dto.Nome.Trim();
            usuario.Email = dto.Email.Trim();
            usuario.Telefone = dto.Telefone.Trim();
            usuario.Setor = dto.Setor.Trim();

            await _firestoreService.SalvarUsuarioAsync(usuario);
            var token = _jwtService.GerarToken(usuario);
            return Ok(new { mensagem = "Dados atualizados com sucesso!", usuario, token });
        }

        private async Task<Usuario?> ObterUsuarioLogadoAsync()
        {
            var matricula = User.FindFirst("Matricula")?.Value;
            if (string.IsNullOrWhiteSpace(matricula))
            {
                return null;
            }

            return await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
        }
    }
}
