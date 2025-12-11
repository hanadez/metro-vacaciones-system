"""
Motor de cálculo de días de vacaciones según antigüedad
"""

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from typing import Dict, List, Tuple
import json


class CalculadoraAntiguedad:
    """
    Calcula días de vacaciones basado en antigüedad del empleado
    """
    
    def __init__(self, config_global=None):
        """
        Inicializa el calculador con la configuración global
        
        Args:
            config_global: Diccionario con configuración (tabla de antigüedad, etc.)
        """
        self.config = config_global or self._get_default_config()
        self.tabla_antiguedad = self.config.get('tabla_antiguedad', [])
    
    def _get_default_config(self) -> Dict:
        """Retorna configuración por defecto"""
        return {
            'tabla_antiguedad': [
                {'años_min': 0, 'años_max': 1, 'dias': 6},
                {'años_min': 1, 'años_max': 3, 'dias': 8},
                {'años_min': 3, 'años_max': 5, 'dias': 10},
                {'años_min': 5, 'años_max': 10, 'dias': 12},
                {'años_min': 10, 'años_max': 15, 'dias': 14},
                {'años_min': 15, 'años_max': 999, 'dias': 16},
            ],
            'meses_para_primera_solicitud': 6,
            'dias_acumulables_max': 24,
        }
    
    def calcular_antiguedad(self, fecha_ingreso: date, fecha_calculo: date = None) -> float:
        """
        Calcula la antigüedad en años del empleado
        
        Args:
            fecha_ingreso: Fecha de ingreso del empleado
            fecha_calculo: Fecha para calcular antigüedad (default: hoy)
        
        Returns:
            Antigüedad en años (con decimales)
        """
        if fecha_calculo is None:
            fecha_calculo = date.today()
        
        if fecha_ingreso > fecha_calculo:
            raise ValueError("La fecha de ingreso no puede ser posterior a la fecha de cálculo")
        
        delta = relativedelta(fecha_calculo, fecha_ingreso)
        años = delta.years
        meses = delta.months
        dias = delta.days
        
        # Convertir a años con decimales
        antiguedad = años + (meses / 12.0) + (dias / 365.0)
        
        return round(antiguedad, 2)
    
    def obtener_dias_por_antiguedad(self, antiguedad: float) -> int:
        """
        Obtiene los días de vacaciones según la antigüedad
        
        Args:
            antiguedad: Antigüedad en años
        
        Returns:
            Días de vacaciones correspondientes
        """
        for rango in self.tabla_antiguedad:
            if rango['años_min'] <= antiguedad < rango['años_max']:
                return rango['dias']
        
        # Si no se encuentra en ningún rango, retornar el máximo
        if self.tabla_antiguedad:
            return self.tabla_antiguedad[-1]['dias']
        
        return 6  # Mínimo por defecto
    
    def puede_solicitar_vacaciones(self, fecha_ingreso: date, fecha_solicitud: date = None) -> Tuple[bool, str]:
        """
        Verifica si un empleado puede solicitar vacaciones
        
        Args:
            fecha_ingreso: Fecha de ingreso del empleado
            fecha_solicitud: Fecha de la solicitud (default: hoy)
        
        Returns:
            Tupla (puede_solicitar: bool, mensaje: str)
        """
        if fecha_solicitud is None:
            fecha_solicitud = date.today()
        
        meses_requeridos = self.config.get('meses_para_primera_solicitud', 6)
        fecha_elegible = fecha_ingreso + relativedelta(months=meses_requeridos)
        
        if fecha_solicitud < fecha_elegible:
            meses_faltantes = relativedelta(fecha_elegible, fecha_solicitud).months
            return False, f"Debe esperar {meses_faltantes} mes(es) más para solicitar vacaciones"
        
        return True, "Empleado elegible para solicitar vacaciones"
    
    def calcular_periodos_disponibles(self, fecha_ingreso: date, año: int = None) -> List[Dict]:
        """
        Calcula los periodos de vacaciones disponibles para un empleado en un año
        
        Args:
            fecha_ingreso: Fecha de ingreso del empleado
            año: Año para calcular periodos (default: año actual)
        
        Returns:
            Lista de periodos con fechas y días correspondientes
        """
        if año is None:
            año = date.today().year
        
        # Calcular antigüedad al inicio del año
        fecha_inicio_año = date(año, 1, 1)
        antiguedad = self.calcular_antiguedad(fecha_ingreso, fecha_inicio_año)
        dias_por_periodo = self.obtener_dias_por_antiguedad(antiguedad)
        
        # Los periodos se basan en la fecha de ingreso
        mes_ingreso = fecha_ingreso.month
        dia_ingreso = fecha_ingreso.day
        
        # Periodo 1: 6 meses después del aniversario anterior
        periodo_1_inicio = date(año - 1, mes_ingreso, dia_ingreso) + relativedelta(months=6)
        periodo_1_fin = periodo_1_inicio + relativedelta(months=6) - timedelta(days=1)
        
        # Periodo 2: Del aniversario a 6 meses después
        periodo_2_inicio = date(año, mes_ingreso, dia_ingreso)
        periodo_2_fin = periodo_2_inicio + relativedelta(months=6) - timedelta(days=1)
        
        periodos = [
            {
                'periodo': f'{año}-1',
                'fecha_inicio': periodo_1_inicio,
                'fecha_fin': periodo_1_fin,
                'dias_otorgados': dias_por_periodo,
                'descripcion': f'Periodo 1 del {año}'
            },
            {
                'periodo': f'{año}-2',
                'fecha_inicio': periodo_2_inicio,
                'fecha_fin': periodo_2_fin,
                'dias_otorgados': dias_por_periodo,
                'descripcion': f'Periodo 2 del {año}'
            }
        ]
        
        return periodos
    
    def calcular_dias_habiles(self, fecha_inicio: date, fecha_fin: date, 
                              excluir_fines_semana: bool = True,
                              dias_festivos: List[date] = None) -> int:
        """
        Calcula los días hábiles entre dos fechas
        
        Args:
            fecha_inicio: Fecha de inicio
            fecha_fin: Fecha de fin (inclusiva)
            excluir_fines_semana: Si debe excluir sábados y domingos
            dias_festivos: Lista de fechas festivas a excluir
        
        Returns:
            Número de días hábiles
        """
        if fecha_inicio > fecha_fin:
            raise ValueError("La fecha de inicio debe ser anterior a la fecha fin")
        
        dias_festivos = dias_festivos or []
        dias_habiles = 0
        fecha_actual = fecha_inicio
        
        while fecha_actual <= fecha_fin:
            # Verificar si es día hábil
            es_fin_semana = fecha_actual.weekday() >= 5  # 5=Sábado, 6=Domingo
            es_festivo = fecha_actual in dias_festivos
            
            if excluir_fines_semana:
                if not es_fin_semana and not es_festivo:
                    dias_habiles += 1
            else:
                if not es_festivo:
                    dias_habiles += 1
            
            fecha_actual += timedelta(days=1)
        
        return dias_habiles
    
    def validar_saldo_disponible(self, dias_solicitados: int, dias_disponibles: int) -> Tuple[bool, str]:
        """
        Valida si hay saldo suficiente para la solicitud
        
        Args:
            dias_solicitados: Días que se desean solicitar
            dias_disponibles: Días disponibles en el saldo
        
        Returns:
            Tupla (es_valido: bool, mensaje: str)
        """
        if dias_solicitados <= 0:
            return False, "Debe solicitar al menos 1 día"
        
        if dias_solicitados > dias_disponibles:
            return False, f"Días insuficientes. Disponible: {dias_disponibles}, Solicitado: {dias_solicitados}"
        
        return True, "Saldo suficiente"
    
    def calcular_fecha_reanudacion(self, fecha_inicio: date, dias_habiles: int,
                                   excluir_fines_semana: bool = True,
                                   dias_festivos: List[date] = None) -> date:
        """
        Calcula la fecha de reanudación de labores
        
        Args:
            fecha_inicio: Fecha de inicio de vacaciones/permiso
            dias_habiles: Cantidad de días hábiles solicitados
            excluir_fines_semana: Si debe excluir fines de semana
            dias_festivos: Lista de días festivos
        
        Returns:
            Fecha de reanudación de labores
        """
        dias_festivos = dias_festivos or []
        dias_contados = 0
        fecha_actual = fecha_inicio
        
        while dias_contados < dias_habiles:
            es_fin_semana = fecha_actual.weekday() >= 5
            es_festivo = fecha_actual in dias_festivos
            
            if excluir_fines_semana:
                if not es_fin_semana and not es_festivo:
                    dias_contados += 1
            else:
                if not es_festivo:
                    dias_contados += 1
            
            if dias_contados < dias_habiles:
                fecha_actual += timedelta(days=1)
        
        # La fecha de reanudación es el siguiente día hábil
        fecha_reanudacion = fecha_actual + timedelta(days=1)
        
        # Asegurar que la fecha de reanudación sea un día hábil
        while True:
            es_fin_semana = fecha_reanudacion.weekday() >= 5
            es_festivo = fecha_reanudacion in dias_festivos
            
            if excluir_fines_semana:
                if not es_fin_semana and not es_festivo:
                    break
            else:
                if not es_festivo:
                    break
            
            fecha_reanudacion += timedelta(days=1)
        
        return fecha_reanudacion


class ValidadorDiasEconomicos:
    """
    Valida y gestiona días económicos
    """
    
    def __init__(self, tipo_dia_economico):
        """
        Args:
            tipo_dia_economico: Instancia del modelo TipoDiaEconomico
        """
        self.tipo = tipo_dia_economico
    
    def validar_limite_dias(self, dias_solicitados: int, dias_utilizados: int) -> Tuple[bool, str]:
        """
        Valida si los días solicitados están dentro del límite permitido
        
        Args:
            dias_solicitados: Días que se desean solicitar
            dias_utilizados: Días ya utilizados en el periodo
        
        Returns:
            Tupla (es_valido: bool, mensaje: str)
        """
        if self.tipo.limite_dias is None:
            return True, "Sin límite de días"
        
        total_dias = dias_utilizados + dias_solicitados
        
        if total_dias > self.tipo.limite_dias:
            dias_restantes = self.tipo.limite_dias - dias_utilizados
            return False, f"Excede el límite permitido. Disponible: {dias_restantes} días"
        
        return True, "Dentro del límite permitido"
    
    def requiere_goce_sueldo(self) -> bool:
        """Verifica si el tipo de día económico es con goce de sueldo"""
        return self.tipo.categoria == 'con_goce'