export const CATEGORIAS_EGRESO = ['sueldos', 'alquiler', 'equipamiento', 'otros'] as const
export type CategoriaEgreso = (typeof CATEGORIAS_EGRESO)[number]

export const FORMAS_PAGO = ['efectivo', 'transferencia'] as const
export type FormaPago = (typeof FORMAS_PAGO)[number]

export const TIPOS_PAGO = ['mensual', 'parcial', 'adelanto'] as const
export type TipoPago = (typeof TIPOS_PAGO)[number]

export const ESTADOS_PAGO = ['pagado', 'deuda', 'parcial'] as const
export type EstadoPago = (typeof ESTADOS_PAGO)[number]

export const ROLES = ['admin', 'profesor', 'superadmin'] as const
export type Rol = (typeof ROLES)[number]

export const ESTADOS_VENTA = ['pagado', 'deuda'] as const
export type EstadoVenta = (typeof ESTADOS_VENTA)[number]
