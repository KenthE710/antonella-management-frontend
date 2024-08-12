export function getChangedValues(initialValues: Record<string, any> = {}, formValues: Record<string, any> = {}) {
  const changedValues: Record<string, any> = {};
  for (const key in initialValues) {
    if (formValues.hasOwnProperty(key) && formValues[key] !== initialValues[key]) {
      changedValues[key] = formValues[key];
    }
  }
  return changedValues;
}
