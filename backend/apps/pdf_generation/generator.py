"""
Generador de PDFs para formatos oficiales
Genera una hoja con dos copias idénticas: Copia Usuario y Copia Área
"""

from weasyprint import HTML, CSS
from django.template.loader import render_to_string
from django.conf import settings
from datetime import date
import os
from typing import Dict, Optional


class PDFGenerator:
    """
    Generador principal de PDFs para solicitudes
    """
    
    def __init__(self, solicitud):
        """
        Args:
            solicitud: Instancia del modelo Solicitud
        """
        self.solicitud = solicitud
        self.empleado = solicitud.empleado
        self.area = solicitud.area
    
    def generar_pdf(self, output_path: Optional[str] = None) -> str:
        """
        Genera el PDF de la solicitud
        
        Args:
            output_path: Ruta donde guardar el PDF (opcional)
        
        Returns:
            Ruta del archivo PDF generado
        """
        # Obtener contexto según tipo de solicitud
        if self.solicitud.tipo_solicitud == 'vacaciones':
            contexto = self._preparar_contexto_vacaciones()
            template_name = 'pdf/vacaciones.html'
        else:
            contexto = self._preparar_contexto_dias_economicos()
            template_name = 'pdf/dias_economicos.html'
        
        # Renderizar HTML
        html_string = render_to_string(template_name, contexto)
        
        # Generar PDF
        if output_path is None:
            output_path = self._generar_ruta_pdf()
        
        # Asegurar que el directorio existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Generar PDF con WeasyPrint
        html = HTML(string=html_string)
        css = CSS(string=self._get_base_css())
        html.write_pdf(output_path, stylesheets=[css])
        
        # Actualizar solicitud con ruta del PDF
        self.solicitud.pdf_path = output_path
        self.solicitud.pdf_generado_en = date.today()
        self.solicitud.save(update_fields=['pdf_path', 'pdf_generado_en'])
        
        return output_path
    
    def _preparar_contexto_vacaciones(self) -> Dict:
        """Prepara el contexto para el PDF de vacaciones"""
        
        # Obtener firmantes del área
        firmantes = self._obtener_firmantes()
        
        # Obtener requisitos del tipo de vacación
        requisitos = []
        if self.solicitud.tipo_vacacion:
            requisitos = list(
                self.solicitud.tipo_vacacion.requisitos.filter(activo=True)
                .values_list('nombre', flat=True)
            )
        
        # Calcular antigüedad
        from apps.calculos.antiguedad import CalculadoraAntiguedad
        calculadora = CalculadoraAntiguedad()
        antiguedad = calculadora.calcular_antiguedad(
            self.empleado.fecha_ingreso,
            self.solicitud.fecha_solicitud
        )
        
        contexto = {
            # Datos del empleado
            'nombre_completo': self.empleado.get_full_name(),
            'numero_expediente': self.empleado.numero_expediente,
            'categoria_laboral': self.empleado.categoria_laboral or 'N/A',
            'fecha_ingreso': self.empleado.fecha_ingreso.strftime('%d/%m/%Y'),
            'antiguedad_años': int(antiguedad),
            
            # Datos del área
            'area_nombre': self.area.nombre,
            'area_codigo': self.area.codigo,
            
            # Datos de la solicitud
            'folio': self.solicitud.folio,
            'fecha_solicitud': self.solicitud.fecha_solicitud.strftime('%d/%m/%Y'),
            'tipo_vacacion': self.solicitud.tipo_vacacion.nombre if self.solicitud.tipo_vacacion else '',
            'periodo': self.solicitud.periodo or 'N/A',
            'fecha_inicio': self.solicitud.fecha_inicio.strftime('%d/%m/%Y'),
            'fecha_reanudar': self.solicitud.fecha_reanudar.strftime('%d/%m/%Y'),
            'dias_habiles': self.solicitud.dias_habiles,
            'observaciones': self.solicitud.observaciones or '',
            
            # Firmantes
            'firmante_interesado': firmantes.get('interesado', {}),
            'firmante_encargado': firmantes.get('encargado_area', {}),
            'firmante_jefe': firmantes.get('jefe_encargado', {}),
            
            # Requisitos
            'requisitos': requisitos,
            
            # Línea metro (si aplica)
            'linea_metro': self.empleado.linea_metro or '',
            'es_taquilla': self.empleado.es_taquilla,
            
            # Warnings
            'tiene_conflicto': self.solicitud.tiene_conflicto_descanso,
            'mensaje_warning': self.solicitud.mensaje_warning or '',
            
            # Fecha actual
            'fecha_impresion': date.today().strftime('%d/%m/%Y'),
        }
        
        return contexto
    
    def _preparar_contexto_dias_economicos(self) -> Dict:
        """Prepara el contexto para el PDF de días económicos"""
        
        firmantes = self._obtener_firmantes()
        
        requisitos = []
        if self.solicitud.tipo_dia_economico:
            requisitos = list(
                self.solicitud.tipo_dia_economico.requisitos.filter(activo=True)
                .values_list('nombre', flat=True)
            )
        
        # Información del tipo de día económico
        tipo_info = {
            'nombre': '',
            'categoria': '',
            'texto_explicativo': '',
            'limite_dias': None,
        }
        
        if self.solicitud.tipo_dia_economico:
            tipo_info = {
                'nombre': self.solicitud.tipo_dia_economico.nombre,
                'categoria': self.solicitud.tipo_dia_economico.get_categoria_display(),
                'texto_explicativo': self.solicitud.tipo_dia_economico.texto_explicativo or '',
                'limite_dias': self.solicitud.tipo_dia_economico.limite_dias,
            }
        
        contexto = {
            # Datos del empleado
            'nombre_completo': self.empleado.get_full_name(),
            'numero_expediente': self.empleado.numero_expediente,
            'categoria_laboral': self.empleado.categoria_laboral or 'N/A',
            
            # Datos del área
            'area_nombre': self.area.nombre,
            'area_codigo': self.area.codigo,
            
            # Datos de la solicitud
            'folio': self.solicitud.folio,
            'fecha_solicitud': self.solicitud.fecha_solicitud.strftime('%d/%m/%Y'),
            'tipo_dia_economico': tipo_info,
            'fecha_inicio': self.solicitud.fecha_inicio.strftime('%d/%m/%Y'),
            'fecha_reanudar': self.solicitud.fecha_reanudar.strftime('%d/%m/%Y'),
            'dias_solicitados': self.solicitud.dias_habiles,
            'observaciones': self.solicitud.observaciones or '',
            
            # Firmantes
            'firmante_interesado': firmantes.get('interesado', {}),
            'firmante_encargado': firmantes.get('encargado_area', {}),
            'firmante_jefe': firmantes.get('jefe_encargado', {}),
            
            # Requisitos
            'requisitos': requisitos,
            
            # Fecha actual
            'fecha_impresion': date.today().strftime('%d/%m/%Y'),
        }
        
        return contexto
    
    def _obtener_firmantes(self) -> Dict:
        """
        Obtiene los firmantes configurados para el área
        
        Returns:
            Diccionario con firmantes por rol
        """
        from apps.catalogos.models import Firmante
        
        firmantes_query = Firmante.objects.filter(
            area=self.area,
            activo=True
        )
        
        firmantes = {}
        for firmante in firmantes_query:
            firmantes[firmante.rol] = {
                'nombre': firmante.nombre_completo,
                'cargo': firmante.cargo,
            }
        
        # Si el interesado no está configurado, usar datos del empleado
        if 'interesado' not in firmantes:
            firmantes['interesado'] = {
                'nombre': self.empleado.get_full_name(),
                'cargo': self.empleado.categoria_laboral or 'Empleado',
            }
        
        return firmantes
    
    def _generar_ruta_pdf(self) -> str:
        """Genera la ruta donde se guardará el PDF"""
        año = self.solicitud.fecha_solicitud.year
        mes = self.solicitud.fecha_solicitud.month
        
        filename = f"{self.solicitud.folio}.pdf"
        
        ruta = os.path.join(
            settings.MEDIA_ROOT,
            'pdfs',
            str(año),
            f"{mes:02d}",
            filename
        )
        
        return ruta
    
    def _get_base_css(self) -> str:
        """
        Retorna el CSS base para los PDFs
        Diseñado para generar dos copias en una sola hoja tamaño carta
        """
        return """
        @page {
            size: Letter;
            margin: 0.5cm;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }
        
        .documento {
            width: 100%;
            height: 100%;
        }
        
        .copia {
            width: 100%;
            height: 48%;
            border: 1px solid #000;
            padding: 0.3cm;
            margin-bottom: 0.3cm;
            page-break-inside: avoid;
        }
        
        .copia:last-child {
            margin-bottom: 0;
        }
        
        .encabezado {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 0.3cm;
            border-bottom: 2px solid #000;
            padding-bottom: 0.2cm;
        }
        
        .tipo-copia {
            background-color: #f0f0f0;
            padding: 0.1cm;
            font-weight: bold;
            text-align: right;
            font-size: 8pt;
        }
        
        .seccion {
            margin-bottom: 0.2cm;
        }
        
        .seccion-titulo {
            font-weight: bold;
            background-color: #e0e0e0;
            padding: 0.1cm;
            margin-bottom: 0.1cm;
            font-size: 9pt;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.2cm;
        }
        
        table td, table th {
            border: 1px solid #000;
            padding: 0.1cm;
            font-size: 8pt;
        }
        
        table th {
            background-color: #e0e0e0;
            font-weight: bold;
        }
        
        .campo {
            display: inline-block;
            margin-right: 1cm;
            margin-bottom: 0.1cm;
        }
        
        .campo-label {
            font-weight: bold;
            margin-right: 0.2cm;
        }
        
        .firmas {
            display: table;
            width: 100%;
            margin-top: 0.3cm;
        }
        
        .firma {
            display: table-cell;
            width: 33%;
            text-align: center;
            vertical-align: bottom;
            padding: 0 0.2cm;
        }
        
        .firma-linea {
            border-top: 1px solid #000;
            margin-top: 1.5cm;
            padding-top: 0.1cm;
        }
        
        .firma-nombre {
            font-weight: bold;
            font-size: 8pt;
        }
        
        .firma-cargo {
            font-size: 7pt;
            font-style: italic;
        }
        
        .requisitos {
            font-size: 7pt;
        }
        
        .requisitos ul {
            margin: 0.1cm 0;
            padding-left: 0.5cm;
        }
        
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 0.2cm;
            margin-bottom: 0.2cm;
            font-size: 8pt;
        }
        
        .sello-rh {
            float: right;
            width: 3cm;
            height: 3cm;
            border: 1px dashed #999;
            text-align: center;
            line-height: 3cm;
            font-size: 7pt;
            color: #999;
        }
        """