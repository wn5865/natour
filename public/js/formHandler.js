/**
 * Accepts 'submit' event and transform HTML form element to proper object
 * to be used in the next function
 */
export const handleForm = function (event) {
  event.preventDefault();

  const form = event.target.closest('.form');
  const enctype = form.getAttribute('enctype');
  const formData = new FormData(form);

  // If form data is encoded as multipart/form-data, return formData itself
  if (enctype === 'multipart/form-data') return formData;

  // If not, construct data from the entries of formData
  const data = Object.fromEntries(formData.entries());

  // Parse data in case the data is in the format of JSON
  Object.keys(data).forEach((key) => {
    try {
      data[key] = data[key] ? JSON.parse(data[key]) : undefined;
    } catch {}
  });

  return data;
};
