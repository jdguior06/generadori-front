import axios from "axios";

//const API_URL = "http://localhost:3000/api/proyectos";
const API_URL = "https://generadori-back-production.up.railway.app/api/proyectos";

export const fetchProjects = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const fetchProjectById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const createProject = async (projectData) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(API_URL, projectData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateProject = async (id, updatedData) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_URL}/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const renameProject = async (id, newName) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_URL}/${id}`, { name: newName }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


export const deleteProject = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const exportProjectAsAngularZip = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/${id}/export-angular`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "angular-export.zip");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 🔑 Nuevas funciones para compartir proyecto por link

export const fetchProjectByLink = async (link) => {
  const res = await axios.get(`${API_URL}/link/${link}`);
  return res.data;
};

export const updateProjectByLink = async (link, updatedData) => {
  const res = await axios.put(`${API_URL}/link/${link}`, updatedData);
  return res.data;
};
