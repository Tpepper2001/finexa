import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePayroll() {
  const [employees, setEmployees] = useState([])
  const [runs, setRuns]           = useState([])
  const [loading, setLoading]     = useState(true)

  const loadEmployees = useCallback(async () => {
    const { data } = await supabase.from('employees').select('*').order('full_name')
    setEmployees(data || [])
  }, [])

  const loadRuns = useCallback(async () => {
    const { data } = await supabase.from('payroll_runs').select('*').order('created_at', { ascending: false })
    setRuns(data || [])
  }, [])

  useEffect(() => {
    Promise.all([loadEmployees(), loadRuns()]).then(() => setLoading(false))
  }, [loadEmployees, loadRuns])

  const addEmployee = async (payload) => {
    const { data, error } = await supabase.from('employees').insert(payload).select().single()
    if (!error) loadEmployees()
    return { data, error }
  }

  const runPayroll = async () => {
    const total = employees.reduce((s, e) => s + Number(e.salary_ngn || 0), 0)
    const now   = new Date()
    const payload = {
      period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      period_end:   now.toISOString().split('T')[0],
      status: 'processed',
      total,
    }
    const { data, error } = await supabase.from('payroll_runs').insert(payload).select().single()
    if (!error) loadRuns()
    return { data, error }
  }

  return { employees, runs, loading, addEmployee, runPayroll, loadEmployees }
}
