// Accessible form fields for the admin: each field gets an id, aria-invalid
// and aria-describedby pointing at its error, and the first invalid field
// gets focus when a submit fails validation.

export const errorId = (prefix, name) => `${prefix}-${name}-error`;

export const fieldA11y = (prefix, name, errors, describedBy) => {
  const hasError = !!errors[name];
  const ids = [describedBy, hasError ? errorId(prefix, name) : null].filter(Boolean).join(" ");
  return {
    id: `${prefix}-${name}`,
    name,
    "aria-invalid": hasError || undefined,
    "aria-describedby": ids || undefined,
  };
};

export const FieldError = ({ prefix, name, errors, className }) =>
  errors[name] ? <p id={errorId(prefix, name)} className={className}>{errors[name]}</p> : null;

// Focuses the first control (in DOM order) whose `name` has an error.
export const focusFirstInvalid = (formEl, errs) => {
  if (!formEl?.elements) return;
  const target = Array.from(formEl.elements).find((el) => el.name && errs[el.name]);
  target?.focus();
};
