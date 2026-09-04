using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class PresencaUsuario
    {
        [FirestoreProperty]
        public string Matricula { get; set; } = string.Empty;
        [FirestoreProperty]
        public string Nome { get; set; } = string.Empty;
        [FirestoreProperty]
        public string Perfil { get; set; } = string.Empty;
        [FirestoreProperty]
        public DateTime UltimaAtividade { get; set; }
    }
}
