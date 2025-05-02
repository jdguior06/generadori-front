import { ChromePicker } from "react-color";
import { useState } from "react";
import { Trash2, Copy, Link } from "lucide-react";

export default function ElementEditor({
  selectedElement,
  updateElement,
  deleteElement,
  duplicateElement,
}) {
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  if (!selectedElement) {
    return (
      <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center h-64">
        <p>Selecciona un elemento para editar</p>
      </div>
    );
  }

  const handleChange = (property, value) => {
    updateElement(selectedElement.id, { [property]: value });
  };

  const availableTabs = () => {
    const tabs = ["general"];

    tabs.push("style");

    if (
      [
        "texto",
        "boton",
        "input",
        "checkbox",
        "radio",
        "switch",
        "select",
        "search",
        "card",
      ].includes(selectedElement.type)
    ) {
      tabs.push("text");
    }

    if (selectedElement.type === "imagen" || selectedElement.type === "icono") {
      tabs.push("image");
    }

    return tabs;
  };

  return (
    <div className="p-4 overflow-y-auto h-full bg-white border-l">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          {selectedElement.type.charAt(0).toUpperCase() +
            selectedElement.type.slice(1)}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => duplicateElement(selectedElement)}
            title="Duplicar"
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => deleteElement(selectedElement.id)}
            title="Eliminar"
            className="p-1 hover:bg-gray-100 rounded text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex mb-4 border-b">
        {availableTabs().map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "general"
              ? "General"
              : tab === "style"
              ? "Estilo"
              : tab === "text"
              ? "Texto"
              : "Imagen"}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-4">
          {["x", "y", "width", "height"].map((prop) => (
            <div key={prop}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {prop}
              </label>
              <input
                type="number"
                value={selectedElement[prop] || 0}
                onChange={(e) =>
                  handleChange(prop, parseInt(e.target.value, 10))
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === "style" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de Fondo
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 border rounded cursor-pointer"
                style={{
                  backgroundColor: selectedElement.color || "#ffffff",
                }}
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              />
              <input
                type="text"
                value={selectedElement.color || "#ffffff"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {showBgColorPicker && (
              <div className="mt-2">
                <ChromePicker
                  color={selectedElement.color || "#ffffff"}
                  onChange={(color) => handleChange("color", color.hex)}
                  disableAlpha={false}
                />
              </div>
            )}
          </div>

          {selectedElement.type === "texto" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color de Texto
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 border rounded cursor-pointer"
                  style={{
                    backgroundColor: selectedElement.textColor || "#000000",
                  }}
                  onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                />
                <input
                  type="text"
                  value={selectedElement.textColor || "#000000"}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {showTextColorPicker && (
                <div className="mt-2">
                  <ChromePicker
                    color={selectedElement.textColor || "#000000"}
                    onChange={(color) => handleChange("textColor", color.hex)}
                    disableAlpha={false}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radio de Borde
            </label>
            <input
              type="number"
              value={selectedElement.borderRadius || 0}
              onChange={(e) =>
                handleChange("borderRadius", parseInt(e.target.value, 10))
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ancho de Borde
            </label>
            <input
              type="number"
              value={selectedElement.borderWidth || 0}
              onChange={(e) =>
                handleChange("borderWidth", parseInt(e.target.value, 10))
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {selectedElement.borderWidth > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color de Borde
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 border rounded cursor-pointer"
                  style={{
                    backgroundColor: selectedElement.borderColor || "#000000",
                  }}
                  onClick={() =>
                    setShowBorderColorPicker(!showBorderColorPicker)
                  }
                />
                <input
                  type="text"
                  value={selectedElement.borderColor || "#000000"}
                  onChange={(e) => handleChange("borderColor", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {showBorderColorPicker && (
                <div className="mt-2">
                  <ChromePicker
                    color={selectedElement.borderColor || "#000000"}
                    onChange={(color) => handleChange("borderColor", color.hex)}
                    disableAlpha={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "text" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <textarea
              value={selectedElement.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño de Fuente
            </label>
            <input
              type="number"
              value={selectedElement.fontSize || 16}
              onChange={(e) =>
                handleChange("fontSize", parseInt(e.target.value, 10))
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso de Fuente
            </label>
            <select
              value={selectedElement.fontWeight || "normal"}
              onChange={(e) => handleChange("fontWeight", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="normal">Normal</option>
              <option value="bold">Negrita</option>
              <option value="lighter">Ligero</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alineación
            </label>
            <select
              value={selectedElement.textAlign || "center"}
              onChange={(e) => handleChange("textAlign", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Fuente
            </label>
            <div className="relative">
              <select
                value={selectedElement.fontFamily || "Arial"}
                onChange={(e) => handleChange("fontFamily", e.target.value)}
                className="appearance-none w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                style={{ fontFamily: selectedElement.fontFamily || "Arial" }}
              >
                <option style={{ fontFamily: "Arial" }} value="Arial">
                  Arial
                </option>
                <option style={{ fontFamily: "Helvetica" }} value="Helvetica">
                  Helvetica
                </option>
                <option
                  style={{ fontFamily: "Times New Roman" }}
                  value="Times New Roman"
                >
                  Times New Roman
                </option>
                <option style={{ fontFamily: "Georgia" }} value="Georgia">
                  Georgia
                </option>
                <option style={{ fontFamily: "Verdana" }} value="Verdana">
                  Verdana
                </option>
                <option style={{ fontFamily: "Tahoma" }} value="Tahoma">
                  Tahoma
                </option>
                <option style={{ fontFamily: "Impact" }} value="Impact">
                  Impact
                </option>
                <option
                  style={{ fontFamily: "Courier New" }}
                  value="Courier New"
                >
                  Courier New
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                ▼
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "image" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la Imagen/Icono
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedElement.src || ""}
                onChange={(e) => handleChange("src", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <Link size={18} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Introduce la URL de una imagen o icono
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto Alternativo
            </label>
            <input
              type="text"
              value={selectedElement.alt || ""}
              onChange={(e) => handleChange("alt", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Descripción de la imagen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajuste de Imagen
            </label>
            <select
              value={selectedElement.objectFit || "cover"}
              onChange={(e) => handleChange("objectFit", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="cover">Cubrir (cover)</option>
              <option value="contain">Contener (contain)</option>
              <option value="fill">Rellenar (fill)</option>
              <option value="none">Sin ajuste (none)</option>
            </select>
          </div>

          {selectedElement.type === "imagen" && (
            <div className="p-3 bg-gray-50 rounded-md mt-2">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Vista previa:
              </p>
              <div className="border rounded-md overflow-hidden h-32 flex items-center justify-center bg-white">
                <img
                  src={selectedElement.src || "/api/placeholder/200/150"}
                  alt={selectedElement.alt || "Vista previa"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: selectedElement.objectFit || "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/api/placeholder/200/150";
                    e.target.alt = "Error al cargar imagen";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
