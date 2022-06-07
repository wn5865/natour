export const handleForm = function (event) {
  event.preventDefault();
  const formData = new FormData(event.target.closest('.form'));
  const data = Object.fromEntries(formData.entries());
  return data;
};
