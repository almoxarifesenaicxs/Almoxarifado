using System;
using System.IO;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.Services
{
    public class StorageService
    {
        public async Task<(string url, string fileName)> SalvarArquivoAsync(
            string base64File,
            string demandaId,
            string nomeOriginal)
        {
            try
            {
                var base64Data = base64File;
                if (base64File.Contains(","))
                {
                    base64Data = base64File[(base64File.IndexOf(",") + 1)..];
                }

                var fileBytes = Convert.FromBase64String(base64Data);
                var extension = Path.GetExtension(nomeOriginal);

                if (string.IsNullOrWhiteSpace(extension))
                {
                    extension = ".bin";
                }

                var fileName = $"{demandaId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
                var uploadDir = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    demandaId
                );

                Directory.CreateDirectory(uploadDir);

                var filePath = Path.Combine(uploadDir, fileName);
                await File.WriteAllBytesAsync(filePath, fileBytes);

                return ($"/uploads/{demandaId}/{fileName}", fileName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao salvar arquivo: {ex.Message}");
                throw;
            }
        }

        public Task<(string url, string fileName)> SalvarImagemAsync(
            string base64Image,
            string demandaId,
            string nomeOriginal)
        {
            return SalvarArquivoAsync(base64Image, demandaId, nomeOriginal);
        }

        public Task<bool> DeletarArquivoAsync(string url)
        {
            try
            {
                var relativePath = url.TrimStart('/');
                var filePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    relativePath
                );

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    return Task.FromResult(true);
                }

                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao deletar arquivo: {ex.Message}");
                return Task.FromResult(false);
            }
        }

        public async Task<byte[]?> ObterArquivoAsync(string url)
        {
            try
            {
                var relativePath = url.TrimStart('/');
                var filePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    relativePath
                );

                if (File.Exists(filePath))
                {
                    return await File.ReadAllBytesAsync(filePath);
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao ler arquivo: {ex.Message}");
                return null;
            }
        }
    }
}
