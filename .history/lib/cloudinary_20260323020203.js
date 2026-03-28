// lib/cloudinary.js
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "sandyfeet_upload");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/ddw1bmtgh/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url;
};