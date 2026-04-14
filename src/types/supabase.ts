// Este archivo se genera con: npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
// Por ahora se define manualmente hasta tener las credenciales de Supabase.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          nombre: string
          apellido: string
          rol: string
          telefono: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre: string
          apellido: string
          rol?: string
          telefono?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          apellido?: string
          rol?: string
          telefono?: string | null
          activo?: boolean
          updated_at?: string
        }
      }
      configuracion: {
        Row: {
          id: string
          nombre_negocio: string
          logo_url: string | null
          telefono_whatsapp: string | null
          mensaje_deuda: string
          moneda: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_negocio?: string
          logo_url?: string | null
          telefono_whatsapp?: string | null
          mensaje_deuda?: string
          moneda?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre_negocio?: string
          logo_url?: string | null
          telefono_whatsapp?: string | null
          mensaje_deuda?: string
          moneda?: string
          updated_at?: string
        }
      }
      turnos: {
        Row: {
          id: string
          nombre: string
          dias: string
          horario: string
          categoria: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          dias: string
          horario: string
          categoria?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          nombre?: string
          dias?: string
          horario?: string
          categoria?: string | null
          activo?: boolean
        }
      }
      alumnos: {
        Row: {
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
        }
        Insert: {
          id?: string
          nombre: string
          apellido: string
          fecha_nac?: string | null
          localidad?: string | null
          domicilio?: string | null
          telefono?: string | null
          nombre_tutor?: string | null
          telefono_tutor?: string | null
          turno_id?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          apellido?: string
          fecha_nac?: string | null
          localidad?: string | null
          domicilio?: string | null
          telefono?: string | null
          nombre_tutor?: string | null
          telefono_tutor?: string | null
          turno_id?: string | null
          activo?: boolean
          updated_at?: string
        }
      }
      pagos: {
        Row: {
          id: string
          periodo: string
          fecha_pago: string | null
          forma_pago: string | null
          tipo_pago: string
          total: number
          estado: string
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          periodo: string
          fecha_pago?: string | null
          forma_pago?: string | null
          tipo_pago?: string
          total?: number
          estado?: string
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          periodo?: string
          fecha_pago?: string | null
          forma_pago?: string | null
          tipo_pago?: string
          total?: number
          estado?: string
          observaciones?: string | null
          updated_at?: string
        }
      }
      detalle_pago: {
        Row: {
          id: string
          pago_id: string
          alumno_id: string
          subtotal: number
          monto_esperado: number
        }
        Insert: {
          id?: string
          pago_id: string
          alumno_id: string
          subtotal?: number
          monto_esperado?: number
        }
        Update: {
          subtotal?: number
          monto_esperado?: number
        }
      }
      egresos: {
        Row: {
          id: string
          periodo: string
          fecha_egreso: string
          categoria: string
          concepto: string
          monto: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          periodo: string
          fecha_egreso: string
          categoria: string
          concepto: string
          monto: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          periodo?: string
          fecha_egreso?: string
          categoria?: string
          concepto?: string
          monto?: number
        }
      }
      asistencia_profes: {
        Row: {
          id: string
          profe_id: string
          fecha: string
          hora_entrada: string
          hora_salida: string
          horas_trabajadas: number | null
          observaciones: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profe_id: string
          fecha: string
          hora_entrada: string
          hora_salida: string
          horas_trabajadas?: number | null
          observaciones?: string | null
          created_at?: string
        }
        Update: {
          fecha?: string
          hora_entrada?: string
          hora_salida?: string
          horas_trabajadas?: number | null
          observaciones?: string | null
        }
      }
      productos: {
        Row: {
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
        Insert: {
          id?: string
          nombre: string
          detalle?: string | null
          talle?: string | null
          precio_actual?: number
          foto_url?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          detalle?: string | null
          talle?: string | null
          precio_actual?: number
          foto_url?: string | null
          activo?: boolean
          updated_at?: string
        }
      }
      ventas: {
        Row: {
          id: string
          producto_id: string
          alumno_id: string | null
          precio_venta: number
          cantidad: number
          total: number
          fecha_venta: string
          estado: string
          observaciones: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          producto_id: string
          alumno_id?: string | null
          precio_venta: number
          cantidad?: number
          total: number
          fecha_venta: string
          estado?: string
          observaciones?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          alumno_id?: string | null
          precio_venta?: number
          cantidad?: number
          total?: number
          fecha_venta?: string
          estado?: string
          observaciones?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
