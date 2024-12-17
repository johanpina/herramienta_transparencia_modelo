import React from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface DatePickerProps {
  selected: Date | null
  onChange: (date: Date | null, event: React.SyntheticEvent<any> | undefined) => void
  dateFormat?: string
}

export function CustomDatePicker({ selected, onChange, dateFormat = "dd/MM/yyyy" }: DatePickerProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={(date: Date | null, event: React.SyntheticEvent<any> | undefined) => onChange(date, event)}
      dateFormat={dateFormat}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  )
}