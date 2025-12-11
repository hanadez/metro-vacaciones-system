from django.db import models

class Requisito(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)
    obligatorio = models.BooleanField(default=True)
    area = models.ForeignKey('areas.Area', null=True, blank=True, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "requisitos"
        unique_together = ("codigo", "area")
        indexes = [
            models.Index(fields=["area"]),
            models.Index(fields=["activo"]),
        ]

    def __str__(self):
        return self.nombre
    

class Firmante(models.Model):
    ROLES = [
        ("interesado", "Interesado"),
        ("encargado_area", "Encargado de Área"),
        ("jefe_encargado", "Jefe Encargado"),
    ]

    area = models.ForeignKey('areas.Area', on_delete=models.CASCADE)
    rol = models.CharField(max_length=50, choices=ROLES)
    nombre_completo = models.CharField(max_length=200)
    cargo = models.CharField(max_length=150)
    orden = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "firmantes"
        unique_together = ("area", "rol")
        indexes = [
            models.Index(fields=["area"]),
            models.Index(fields=["rol"]),
        ]

    def __str__(self):
        return f"{self.nombre_completo} ({self.cargo})"
    

class TipoDiaEconomico(models.Model):
    CATEGORIAS = [
        ("con_goce", "Con goce"),
        ("sin_goce", "Sin goce"),
    ]

    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    descripcion = models.TextField(blank=True, null=True)
    texto_explicativo = models.TextField(blank=True, null=True)
    limite_dias = models.IntegerField(null=True, blank=True)
    area = models.ForeignKey('areas.Area', null=True, blank=True, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    requisitos = models.ManyToManyField(Requisito, blank=True)
    
    class Meta:
        db_table = "tipos_dias_economicos"
        unique_together = ("codigo", "area")
        indexes = [
            models.Index(fields=["area"]),
            models.Index(fields=["categoria"]),
            models.Index(fields=["activo"]),
        ]

    def __str__(self):
        return self.nombre
    

class TipoVacacion(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)
    requiere_documentos = models.BooleanField(default=False)
    area = models.ForeignKey('areas.Area', null=True, blank=True, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    requisitos = models.ManyToManyField(Requisito, blank=True)

    class Meta:
        db_table = "tipos_vacaciones"
        unique_together = ("codigo", "area")
        indexes = [
            models.Index(fields=["area"]),
            models.Index(fields=["activo"]),
        ]

    def __str__(self):
        return self.nombre