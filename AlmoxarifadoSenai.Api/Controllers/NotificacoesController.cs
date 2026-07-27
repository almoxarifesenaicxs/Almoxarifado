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
    public class NotificacoesController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public NotificacoesController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        private static NotificacaoDto ParaDto(Notificacao n) => new()
        {
            Id = n.Id,
            Titulo = n.Titulo,
            Mensagem = n.Mensagem,
            Tipo = n.Tipo,
            Icone = n.Icone,
            Cor = n.Cor,
            Link = n.Link,
            DemandaId = n.DemandaId,
            Lida = n.Lida,
            DataCriacao = n.DataCriacao,
            DataLeitura = n.DataLeitura,
            Excluida = n.Excluida,
            DataExclusao = n.DataExclusao
        };

        [HttpGet]
        public async Task<IActionResult> ObterMinhasNotificacoes([FromQuery] bool? lida = null, [FromQuery] int limite = 50)
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();
            var notificacoes = await _firestoreService.ObterNotificacoesPorUsuarioAsync(matricula, lida, limite);

            return Ok(notificacoes.Select(ParaDto));
        }

        [HttpGet("lixeira")]
        public async Task<IActionResult> ObterLixeira([FromQuery] int limite = 100)
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();

            var notificacoes = await _firestoreService.ObterNotificacoesPorUsuarioAsync(
                matricula,
                limite: limite,
                excluidas: true);

            return Ok(notificacoes.Select(ParaDto));
        }

        [HttpGet("nao-lidas/contador")]
        public async Task<IActionResult> ContarNaoLidas()
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();
            var total = await _firestoreService.ContarNotificacoesNaoLidasAsync(matricula);
            return Ok(new { total });
        }

        [HttpPut("{id}/marcar-lida")]
        public async Task<IActionResult> MarcarLida(string id, [FromBody] NotificacaoMarcarLidaDto dto)
        {
            var notificacao = await _firestoreService.ObterNotificacaoPorIdAsync(id);
            if (notificacao == null)
            {
                return NotFound($"Notificação com ID {id} não encontrada.");
            }

            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();
            if (notificacao.UsuarioMatricula != matricula)
            {
                return Forbid("Você só pode marcar suas próprias notificações.");
            }

            await _firestoreService.MarcarNotificacaoLidaAsync(id, dto.Lida);
            return Ok(new { mensagem = "Notificação atualizada com sucesso!" });
        }

        [HttpPut("marcar-todas-lidas")]
        public async Task<IActionResult> MarcarTodasLidas()
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();
            var notificacoes = await _firestoreService.ObterNotificacoesPorUsuarioAsync(matricula, false, 1000);

            foreach (var notif in notificacoes)
            {
                await _firestoreService.MarcarNotificacaoLidaAsync(notif.Id, true);
            }

            return Ok(new { mensagem = $"Todas as {notificacoes.Count} notificações marcadas como lidas!" });
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(string id)
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();

            var notificacao = await _firestoreService.ObterNotificacaoPorIdAsync(id);
            if (notificacao == null) return NotFound("Notificação não encontrada.");
            if (notificacao.UsuarioMatricula != matricula) return Forbid();

            await _firestoreService.MoverNotificacaoParaLixeiraAsync(id);
            return NoContent();
        }

        [HttpPut("{id}/restaurar")]
        public async Task<IActionResult> Restaurar(string id)
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();

            var notificacao = await _firestoreService.ObterNotificacaoPorIdAsync(id);
            if (notificacao == null) return NotFound("Notificação não encontrada.");
            if (notificacao.UsuarioMatricula != matricula) return Forbid();
            if (!notificacao.Excluida) return BadRequest("A notificação não está na lixeira.");

            await _firestoreService.RestaurarNotificacaoAsync(id);
            return NoContent();
        }

        [HttpDelete("{id}/permanente")]
        public async Task<IActionResult> ExcluirPermanentemente(string id)
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();

            var notificacao = await _firestoreService.ObterNotificacaoPorIdAsync(id);
            if (notificacao == null) return NotFound("Notificação não encontrada.");
            if (notificacao.UsuarioMatricula != matricula) return Forbid();
            if (!notificacao.Excluida) return BadRequest("Mova a notificação para a lixeira antes de excluí-la permanentemente.");

            await _firestoreService.ExcluirNotificacaoPermanentementeAsync(id);
            return NoContent();
        }

        [HttpDelete("lixeira")]
        public async Task<IActionResult> EsvaziarLixeira()
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(matricula)) return Unauthorized();

            var notificacoes = await _firestoreService.ObterNotificacoesPorUsuarioAsync(
                matricula,
                limite: 1000,
                excluidas: true);

            foreach (var notificacao in notificacoes)
            {
                await _firestoreService.ExcluirNotificacaoPermanentementeAsync(notificacao.Id);
            }

            return Ok(new { total = notificacoes.Count });
        }
    }
}
