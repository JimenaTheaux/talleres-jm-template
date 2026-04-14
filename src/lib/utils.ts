import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)

export const formatPeriodo = (periodo: string): string => {
  const [year, month] = periodo.split('-')
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return `${meses[parseInt(month) - 1]} ${year}`
}

export const getCurrentPeriodo = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const buildWhatsAppUrl = (
  telefonoTutor: string,
  template: string,
  vars: { alumno: string; tutor: string; periodo: string; monto: string }
): string => {
  const mensaje = template
    .replace('{alumno}', vars.alumno)
    .replace('{tutor}', vars.tutor)
    .replace('{periodo}', vars.periodo)
    .replace('{monto}', vars.monto)
  const numero = telefonoTutor.replace(/\D/g, '')
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
