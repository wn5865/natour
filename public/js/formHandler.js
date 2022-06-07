export const handleForm = function (event) {
  event.preventDefault();
  const formData = new FormData(event.target.closest('.form'));
  const data = Object.fromEntries(formData.entries());
  Object.keys(data).forEach((key) => {
    try {
      data[key] = data[key] ? JSON.parse(data[key]) : undefined;
    } catch {}
  });
  return data;
};
