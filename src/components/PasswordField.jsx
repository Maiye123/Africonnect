import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  name,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <div className="auth-input-wrap">
        {Icon && <Icon size={18} strokeWidth={1.75} />}
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={name === 'confirmPassword' ? 'new-password' : 'current-password'}
        />
        <button
          type="button"
          className="auth-toggle-pw"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
