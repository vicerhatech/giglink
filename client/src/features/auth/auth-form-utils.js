export function validateLogin(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = "Email is required.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

export function validateRegistration(values) {
  const errors = validateLogin(values);
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.phone.trim()) errors.phone = "Phone number is required.";
  if (!values.role || !["customer", "talent"].includes(values.role)) {
    errors.role = "Choose Customer or Talent.";
  }
  return errors;
}
