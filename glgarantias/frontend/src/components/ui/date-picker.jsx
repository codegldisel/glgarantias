import { Input } from './input.jsx'

export function DatePickerWithRange({ value, onChange, ...props }) {
  return (
    <div className="flex gap-2">
      <Input
        type="date"
        placeholder="Data inicial"
        {...props}
      />
      <Input
        type="date"
        placeholder="Data final"
        {...props}
      />
    </div>
  )
}

