export const Loading: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};