import type { CategoriaEgreso, EstadoPago, EstadoVenta, FormaPago, Rol, TipoPago } from '@/lib/constants'

export interface Perfil {
  id: string
  nombre: string
  apellido: string
  rol: Rol
  telefono: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Configuracion {
  id: string
  nombre_negocio: string
  logo_url: string | null
  telefono_whatsapp: string | null
  mensaje_deuda: string
  moneda: string
  created_at: string
  updated_at: string
}

export interface Turno {
  id: string
  nombre: string
  dias: string
  horario: string
  categoria: string | null
  activo: boolean
  created_at: string
}

export interface Alumno {
  id: string
  nombre: string
  apellido: string
  fecha_nac: string | null
  localidad: string | null
  domicilio: string | null
  telefono: string | null
  nombre_tutor: string | null
  telefono_tutor: string | null
  turno_id: string | null
  activo: boolean
  created_at: string
  updated_at: string
  turno?: Turno
}

export interface Pago {
  id: string
  periodo: string
  fecha_pago: string | null
  forma_pago: FormaPago | null
  tipo_pago: TipoPago
  total: number
  estado: EstadoPago
  observaciones: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  detalles?: DetallePago[]
}

export interface DetallePago {
  id: string
  pago_id: string
  alumno_id: string
  subtotal: number
  monto_esperado: number
  alumno?: Alumno
}

export interface Egreso {
  id: string
  periodo: string
  fecha_egreso: string
  categoria: CategoriaEgreso
  concepto: string
  monto: number
  created_by: string | null
  created_at: string
}

export interface AsistenciaProfe {
  id: string
  profe_id: string
  fecha: string
  hora_entrada: string
  hora_salida: string
  horas_trabajadas: number | null
  observaciones: string | null
  created_at: string
  profe?: Perfil
}

export interface Producto {
  id: string
  nombre: string
  detalle: string | null
  talle: string | null
  precio_actual: number
  foto_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Venta {
  id: string
  producto_id: string
  alumno_id: string | null
  precio_venta: number
  cantidad: number
  total: number
  fecha_venta: string
  estado: EstadoVenta
  observaciones: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  producto?: Producto
  alumno?: Alumno
}
