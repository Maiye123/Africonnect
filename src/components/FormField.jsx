export default function FormField({ label, icon: Icon, type = 'text', placeholder, value, onChange, name }) {
  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <div className="auth-input-wrap">
        {Icon && <Icon size={18} strokeWidth={1.75} />}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={name}
        />
      </div>
    </div>
  )
}
