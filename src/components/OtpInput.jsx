import { useRef } from 'react'

const LENGTH = 6

export default function OtpInput({ value, onChange }) {
  const inputsRef = useRef([])

  const digits = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('')

  function focusAt(index) {
    inputsRef.current[index]?.focus()
  }

  function updateDigit(index, digit) {
    const next = digits.map((d, i) => (i === index ? digit : d === ' ' ? '' : d))
    const joined = next.join('').replace(/\s/g, '')
    onChange(joined)
    return joined
  }

  function handleChange(index, e) {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      updateDigit(index, '')
      return
    }

    if (raw.length > 1) {
      const pasted = raw.slice(0, LENGTH)
      onChange(pasted)
      focusAt(Math.min(pasted.length, LENGTH - 1))
      return
    }

    updateDigit(index, raw[0])
    if (index < LENGTH - 1) focusAt(index + 1)
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      focusAt(index - 1)
    }
    if (e.key === 'ArrowLeft' && index > 0) focusAt(index - 1)
    if (e.key === 'ArrowRight' && index < LENGTH - 1) focusAt(index + 1)
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    onChange(pasted)
    focusAt(Math.min(pasted.length, LENGTH - 1))
  }

  return (
    <div className="otp-row" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          className="otp-box"
          value={digit.trim()}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
