using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AlmoxarifadoSenai.Api.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TesteController : ControllerBase
    {
        [HttpGet("publico")]
        public IActionResult Publico()
        {
            return Ok("Área pública");
        }

        [Authorize]
        [HttpGet("protegido")]
        public IActionResult Protegido()
        {
            return Ok("Usuário autenticado");
        }

        [Authorize(Roles = Perfis.Admin)]
        [HttpGet("admin")]
        public IActionResult Admin()
        {
            return Ok("Área exclusiva do Admin");
        }

        [Authorize(Roles = Perfis.Coordenador)]
        [HttpGet("coordenador")]
        public IActionResult Coordenador()
        {
            return Ok("Área exclusiva do Coordenador");
        }

        [Authorize(Roles = Perfis.Professor)]
        [HttpGet("professor")]
        public IActionResult Professor()
        {
            return Ok("Área exclusiva do Professor");
        }

        [Authorize(Roles = Perfis.Almoxarife)]
        [HttpGet("almoxarife")]
        public IActionResult Almoxarife()
        {
            return Ok("Área exclusiva do Almoxarife");
        }
    }
}