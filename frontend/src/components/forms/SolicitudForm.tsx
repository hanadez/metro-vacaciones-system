/**
 * Formulario para crear solicitudes de vacaciones y días económicos
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type {
  SolicitudFormData,
  Empleado,
  TipoVacacion,
  TipoDiaEconomico,
  SaldoVacaciones,
} from '../../types';

interface SolicitudFormProps {
  onSubmit: (data: SolicitudFormData) => Promise<void>;
  empleados: Empleado[];
  tiposVacaciones: TipoVacacion[];
  tiposDiasEconomicos: TipoDiaEconomico[];
  onCancel: () => void;
}

export const SolicitudForm: React.FC<SolicitudFormProps> = ({
  onSubmit,
  empleados,
  tiposVacaciones,
  tiposDiasEconomicos,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudFormData>();

  const [saldosDisponibles, setSaldosDisponibles] = useState<SaldoVacaciones[]>([]);
  const [fechaReanudacion, setFechaReanudacion] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Watch campos importantes
  const empleadoId = watch('empleado_id');
  const tipoSolicitud = watch('tipo_solicitud');
  const fechaInicio = watch('fecha_inicio');
  const diasHabiles = watch('dias_habiles');

  // Cargar saldos cuando se selecciona empleado
  useEffect(() => {
    if (empleadoId && tipoSolicitud === 'vacaciones') {
      cargarSaldos(empleadoId);
    }
  }, [empleadoId, tipoSolicitud]);

  // Calcular fecha de reanudación
  useEffect(() => {
    if (fechaInicio && diasHabiles) {
      calcularFechaReanudacion();
    }
  }, [fechaInicio, diasHabiles]);

  const cargarSaldos = async (empleadoId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/empleados/${empleadoId}/saldos/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      const data = await response.json();
      setSaldosDisponibles(data);
    } catch (error) {
      console.error('Error al cargar saldos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularFechaReanudacion = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/solicitudes/calcular-fecha-reanudacion/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            fecha_inicio: fechaInicio,
            dias_habiles: diasHabiles,
          }),
        }
      );
      const data = await response.json();
      setFechaReanudacion(data.fecha_reanudar);
      
      if (data.tiene_conflicto) {
        setWarning(data.mensaje_warning);
      } else {
        setWarning('');
      }
    } catch (error) {
      console.error('Error al calcular fecha:', error);
    }
  };

  const handleFormSubmit = async (data: SolicitudFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
    }
  };

  const empleadoSeleccionado = empleados.find(e => e.id === Number(empleadoId));
  const diasDisponibles = saldosDisponibles.reduce(
    (total, saldo) => total + saldo.dias_disponibles,
    0
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Selección de Empleado */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Datos del Empleado</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado *
            </label>
            <select
              {...register('empleado_id', { required: 'Seleccione un empleado' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar empleado...</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {empleado.nombre} {empleado.apellidos} - {empleado.numero_expediente}
                </option>
              ))}
            </select>
            {errors.empleado_id && (
              <p className="mt-1 text-sm text-red-600">{errors.empleado_id.message}</p>
            )}
          </div>

          {empleadoSeleccionado && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Expediente:</span>{' '}
                  {empleadoSeleccionado.numero_expediente}
                </div>
                <div>
                  <span className="font-medium">Categoría:</span>{' '}
                  {empleadoSeleccionado.categoria_laboral || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Fecha Ingreso:</span>{' '}
                  {new Date(empleadoSeleccionado.fecha_ingreso).toLocaleDateString()}
                </div>
                {empleadoSeleccionado.linea_metro && (
                  <div>
                    <span className="font-medium">Línea:</span>{' '}
                    {empleadoSeleccionado.linea_metro}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tipo de Solicitud */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tipo de Solicitud</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccione el tipo *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('tipo_solicitud', 'vacaciones')}
                className={`p-4 border-2 rounded-lg transition ${
                  tipoSolicitud === 'vacaciones'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Vacaciones</div>
                <div className="text-sm text-gray-600">
                  Períodos vacacionales programados
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue('tipo_solicitud', 'dia_economico')}
                className={`p-4 border-2 rounded-lg transition ${
                  tipoSolicitud === 'dia_economico'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Día Económico</div>
                <div className="text-sm text-gray-600">
                  Permisos especiales con/sin goce
                </div>
              </button>
            </div>
            <input
              type="hidden"
              {...register('tipo_solicitud', { required: 'Seleccione un tipo' })}
            />
            {errors.tipo_solicitud && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo_solicitud.message}</p>
            )}
          </div>

          {/* Subtipo según selección */}
          {tipoSolicitud === 'vacaciones' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vacaciones *
              </label>
              <select
                {...register('tipo_vacacion_id', {
                  required: tipoSolicitud === 'vacaciones' ? 'Seleccione un tipo' : false,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar...</option>
                {tiposVacaciones.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                    {tipo.requiere_documentos && ' (Requiere documentos)'}
                  </option>
                ))}
              </select>
              {errors.tipo_vacacion_id && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo_vacacion_id.message}</p>
              )}

              {/* Mostrar saldos disponibles */}
              {saldosDisponibles.length > 0 && (
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Saldos Disponibles</h4>
                  <div className="space-y-2 text-sm">
                    {saldosDisponibles.map((saldo) => (
                      <div key={saldo.id} className="flex justify-between">
                        <span>{saldo.periodo}</span>
                        <span className="font-medium">
                          {saldo.dias_disponibles} días disponibles
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-blue-200 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{diasDisponibles} días</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tipoSolicitud === 'dia_economico' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Día Económico *
              </label>
              <select
                {...register('tipo_dia_economico_id', {
                  required: tipoSolicitud === 'dia_economico' ? 'Seleccione un tipo' : false,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar...</option>
                <optgroup label="Con goce de sueldo">
                  {tiposDiasEconomicos
                    .filter((t) => t.categoria === 'con_goce')
                    .map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                        {tipo.limite_dias && ` (Máx. ${tipo.limite_dias} días)`}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Sin goce de sueldo">
                  {tiposDiasEconomicos
                    .filter((t) => t.categoria === 'sin_goce')
                    .map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                        {tipo.limite_dias && ` (Máx. ${tipo.limite_dias} días)`}
                      </option>
                    ))}
                </optgroup>
              </select>
              {errors.tipo_dia_economico_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tipo_dia_economico_id.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fechas y Días */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Fechas y Duración</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              {...register('fecha_inicio', { required: 'Ingrese la fecha de inicio' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.fecha_inicio && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días Hábiles *
            </label>
            <input
              type="number"
              min="1"
              {...register('dias_habiles', {
                required: 'Ingrese los días hábiles',
                min: { value: 1, message: 'Mínimo 1 día' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.dias_habiles && (
              <p className="mt-1 text-sm text-red-600">{errors.dias_habiles.message}</p>
            )}
          </div>
        </div>

        {fechaReanudacion && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="text-sm">
              <span className="font-medium text-green-900">Fecha de Reanudación:</span>{' '}
              <span className="text-green-700">
                {new Date(fechaReanudacion).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}

        {warning && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Advertencia</h3>
                <div className="mt-2 text-sm text-yellow-700">{warning}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios adicionales (opcional)
          </label>
          <textarea
            {...register('observaciones')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingrese cualquier información adicional relevante..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creando...' : 'Crear Solicitud'}
        </button>
      </div>
    </form>
  );
};