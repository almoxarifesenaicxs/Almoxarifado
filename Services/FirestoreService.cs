using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Services
{
    public class FirestoreService
    {
        private readonly FirestoreDb _db;

        public FirestoreService()
        {
            _db = FirestoreDb.Create("SEU-PROJECT-ID");
        }

        public FirestoreDb GetDatabase()
        {
            return _db;
        }
    }
}