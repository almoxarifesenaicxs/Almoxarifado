using System.Net;
using System.Net.Mail;
using AlmoxarifadoSenai.Api.Models;

namespace AlmoxarifadoSenai.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> EnviarEmailSolicitacaoCompraAsync(SolicitacaoCompra solicitacao)
        {
            try
            {
                var assunto = $"[COMPRAS ALMOXARIFADO AUTOMOTIVO] Prioridade: {solicitacao.Urgencia} - {solicitacao.Categoria} - {solicitacao.NomeItem}";
                var corpo = $@"
                    <h2>Solicitacao de Compra</h2>
                    <p><strong>Categoria:</strong> {WebUtility.HtmlEncode(solicitacao.Categoria)}</p>
                    <p><strong>Item:</strong> {WebUtility.HtmlEncode(solicitacao.NomeItem)}</p>
                    <p><strong>Especificacao:</strong> {WebUtility.HtmlEncode(solicitacao.Especificacao)}</p>
                    <p><strong>Quantidade:</strong> {solicitacao.Quantidade}</p>
                    <p><strong>Urgencia:</strong> {WebUtility.HtmlEncode(solicitacao.Urgencia)}</p>
                    <p><strong>Justificativa:</strong> {WebUtility.HtmlEncode(solicitacao.Justificativa)}</p>
                    <p><strong>Solicitante:</strong> {WebUtility.HtmlEncode(solicitacao.AlmoxarifeNome)} ({WebUtility.HtmlEncode(solicitacao.AlmoxarifeMatricula)})</p>
                    <p><strong>Data:</strong> {solicitacao.DataSolicitacao:dd/MM/yyyy HH:mm}</p>
                    <hr>
                    <p><small>Esta e uma mensagem automatica do Sistema de Almoxarifado SENAI Automotivo.</small></p>
                ";

                var emailComprador = _configuration["Email:Comprador"] ?? string.Empty;
                var emailCoordenador = _configuration["Email:Coordenador"] ?? string.Empty;

                await EnviarEmailAsync(
                    new[] { emailComprador },
                    assunto,
                    corpo,
                    new[] { emailCoordenador });

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar e-mail de solicitacao de compra: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> EnviarEmailRecuperacaoAcessoAsync(Usuario usuario)
        {
            if (string.IsNullOrWhiteSpace(usuario.Email))
            {
                return false;
            }

            try
            {
                var assunto = "Recuperacao de acesso - Almoxarifado SENAI";
                var corpo = $@"
                    <h2>Recuperacao de acesso</h2>
                    <p>Ola, {WebUtility.HtmlEncode(usuario.Nome)}.</p>
                    <p>Localizamos seu cadastro ativo no Sistema de Almoxarifado SENAI.</p>
                    <p><strong>Matricula:</strong> {WebUtility.HtmlEncode(usuario.Matricula)}</p>
                    <p>Para entrar, use sua matricula e a data de nascimento cadastrada no sistema.</p>
                    <p>Se este for seu primeiro acesso, complete o cadastro apos o login.</p>
                    <hr>
                    <p><small>Esta e uma mensagem automatica. Se voce nao solicitou esta recuperacao, ignore este e-mail.</small></p>
                ";

                await EnviarEmailAsync(new[] { usuario.Email }, assunto, corpo);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar e-mail de recuperacao: {ex.Message}");
                return false;
            }
        }

        private async Task EnviarEmailAsync(
            IEnumerable<string> destinatarios,
            string assunto,
            string corpoHtml,
            IEnumerable<string>? copias = null)
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPass = _configuration["Email:SmtpPass"];
            var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;
            var fromName = _configuration["Email:FromName"] ?? "Sistema Almoxarifado SENAI";
            var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");

            if (string.IsNullOrWhiteSpace(smtpHost) ||
                string.IsNullOrWhiteSpace(smtpUser) ||
                string.IsNullOrWhiteSpace(smtpPass) ||
                string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new InvalidOperationException("Configure Email__SmtpHost, Email__SmtpUser, Email__SmtpPass e Email__FromEmail para enviar e-mails.");
            }

            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(smtpUser, smtpPass)
            };

            using var mensagem = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = assunto,
                Body = corpoHtml,
                IsBodyHtml = true
            };

            foreach (var destinatario in destinatarios.Where(email => !string.IsNullOrWhiteSpace(email)).Distinct(StringComparer.OrdinalIgnoreCase))
            {
                mensagem.To.Add(destinatario);
            }

            foreach (var copia in (copias ?? Array.Empty<string>()).Where(email => !string.IsNullOrWhiteSpace(email)).Distinct(StringComparer.OrdinalIgnoreCase))
            {
                mensagem.CC.Add(copia);
            }

            if (mensagem.To.Count == 0)
            {
                throw new InvalidOperationException("Nenhum destinatario valido informado para envio de e-mail.");
            }

            await client.SendMailAsync(mensagem);
        }
    }
}
