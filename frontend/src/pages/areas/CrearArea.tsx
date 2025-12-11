import { AreaForm } from '../../components/forms/AreaForm';

export const CrearArea: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await areasService.create(data);
      navigate('/areas');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear área');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Área</h1>
          <p className="text-gray-600 mt-1">Crear una nueva área del sistema</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <div className="bg-white shadow rounded-lg p-6">
          <AreaForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </MainLayout>
  );
};