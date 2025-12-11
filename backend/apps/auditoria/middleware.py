class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Aquí podrías agregar lógica de auditoría si la necesitas.
        # Por ahora solo continúa la ejecución normal.
        response = self.get_response(request)
        return response