import { Rnd } from "react-rnd";
import { useEffect, useState, useRef } from "react";
import {
  LayoutGrid,
  Smartphone,
  Maximize2,
  Hand,
  ChevronDown,
} from "lucide-react";
import FrameSelector from "./FrameSelector";
import DesignToolbox from "./DesignToolbox";

export default function CanvasArea({
  elements,
  setElements,
  selectedId,
  setSelectedId,
  deselectElement,
  selectedElementsByUsers,
  myColor,
  onElementDelete,
  onElementDuplicate,
  currentFrame,
  setCurrentFrame,
  saveFrameSettings,
}) {
  const [zoom] = useState(1);
  const [showFrameControls, setShowFrameControls] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const LINE_THICKNESS = 2;

  const handleAddElement = (type, extraProps = {}) => {
    let defaultProps = {
      x: currentFrame ? currentFrame.width / 2 - 75 : 100,
      y: currentFrame ? currentFrame.height / 2 - 25 : 100,
      width: 150,
      height: 50,
      color: "#ffffff",
      textColor: "#000000",
      text: "",
      borderRadius: 4,
    };

    switch (type) {
      case "texto":
        defaultProps.text = "Texto aquí";
        defaultProps.height = 40;
        break;
      case "rectangulo":
        defaultProps.width = 200;
        defaultProps.height = 150;
        defaultProps.color = "#e6e6e6";
        defaultProps.borderRadius = 0;
        break;
      case "circulo":
        defaultProps.width = 100;
        defaultProps.height = 100;
        defaultProps.color = "#e6e6e6";
        defaultProps.borderRadius = 50;
        break;
      case "triangulo":
        defaultProps.width = 100;
        defaultProps.height = 100;
        defaultProps.color = "#e6e6e6";
        break;
      case "linea":
        defaultProps.width = 200;
        defaultProps.height = LINE_THICKNESS;
        defaultProps.color = "#333333";
        defaultProps.isVertical = false;
        break;
      case "linea-vertical":
        defaultProps.width = LINE_THICKNESS;
        defaultProps.height = 200;
        defaultProps.color = "#333333";
        defaultProps.isVertical = true;
        break;
      case "imagen":
        defaultProps.width = 200;
        defaultProps.height = 150;
        defaultProps.src = extraProps.src || "/api/placeholder/200/150";
        defaultProps.alt = "Imagen";
        break;
      case "icono":
        defaultProps.width = 40;
        defaultProps.height = 40;
        defaultProps.src = extraProps.src || "";
        defaultProps.color = "transparent";
        break;
      case "boton":
      case "input":
      case "checkbox":
      case "radio":
      case "switch":
      case "select":
      case "search":
      case "tabla":
        break;
    }

    const newElement = {
      id: Date.now().toString(),
      type: type === "linea-vertical" ? "linea" : type,
      ...defaultProps,
      ...extraProps,
    };

    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const handleDragStop = (id) => (e, d) => {
    e.stopPropagation();

    setElements(
      elements.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            x: Math.round(d.x / zoom),
            y: Math.round(d.y / zoom),
          };
        }
        return el;
      })
    );
  };

  const handleResize = (id) => (e, direction, ref, delta, position) => {
    setElements(
      elements.map((el) => {
        if (el.id === id) {
          if (el.type === "linea") {
            if (el.isVertical) {
              return {
                ...el,
                width: LINE_THICKNESS,
                height: Math.round(ref.offsetHeight / zoom),
                x: Math.round(position.x / zoom),
                y: Math.round(position.y / zoom),
              };
            } else {
              return {
                ...el,
                width: Math.round(ref.offsetWidth / zoom),
                height: LINE_THICKNESS,
                x: Math.round(position.x / zoom),
                y: Math.round(position.y / zoom),
              };
            }
          } else {
            return {
              ...el,
              width: Math.round(ref.offsetWidth / zoom),
              height: Math.round(ref.offsetHeight / zoom),
              x: Math.round(position.x / zoom),
              y: Math.round(position.y / zoom),
            };
          }
        }
        return el;
      })
    );
  };

  const addNewFrame = () => {
    const defaultFrame = { name: "Desktop", width: 1280, height: 800 };
    setCurrentFrame(defaultFrame);
    saveFrameSettings(defaultFrame, zoom);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      const isInputFocused =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA";

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        !isInputFocused
      ) {
        e.preventDefault();
        setElements(elements.filter((el) => el.id !== selectedId));
        onElementDelete(selectedId);
        setSelectedId(null);
      }

      if (e.key === "Escape") {
        setSelectedId(null);
        if (panMode) {
          setPanMode(false);
        }
      }

      if (e.key === "d" && e.ctrlKey && selectedId && !isInputFocused) {
        e.preventDefault();
        const elemToDuplicate = elements.find((el) => el.id === selectedId);
        if (elemToDuplicate) {
          const newElement = {
            ...elemToDuplicate,
            id: Date.now().toString(),
            x: elemToDuplicate.x + 20,
            y: elemToDuplicate.y + 20,
          };
          setElements([...elements, newElement]);
          setSelectedId(newElement.id);
          onElementDuplicate(newElement);
        }
      }
      if (e.key === "h" && !isInputFocused) {
        setPanMode(!panMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, selectedId, setElements, setSelectedId, panMode]);

  useEffect(() => {
    if (currentFrame) {
      saveFrameSettings(currentFrame, zoom);
    }
  }, [currentFrame, zoom, saveFrameSettings]);

  const renderTriangle = (color) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "50px solid transparent",
          borderRight: "50px solid transparent",
          borderBottom: `100px solid ${color}`,
        }}
      />
    </div>
  );

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      deselectElement();
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (panMode) {
      setIsPanning(true);
      setStartPanPos({
        x: e.clientX,
        y: e.clientY,
      });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning && panMode) {
      const deltaX = e.clientX - startPanPos.x;
      const deltaY = e.clientY - startPanPos.y;

      setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      });

      setStartPanPos({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsPanning(false);
  };

  const getCursorStyle = () => {
    if (panMode) {
      return isPanning ? "grabbing" : "grab";
    }
    return "default";
  };

  const handleRotateLine = (id) => {
    setElements(
      elements.map((el) => {
        if (el.id === id && el.type === "linea") {
          if (el.isVertical) {
            return {
              ...el,
              width: el.height,
              height: LINE_THICKNESS,
              isVertical: false,
            };
          } else {
            return {
              ...el,
              width: LINE_THICKNESS,
              height: el.width,
              isVertical: true,
            };
          }
        }
        return el;
      })
    );
  };

  const getResizeHandles = (element) => {
    if (element.type === "linea") {
      if (element.isVertical) {
        return { top: true, bottom: true };
      } else {
        return { left: true, right: true };
      }
    }

    return {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true,
    };
  };

  const renderUIComponent = (el) => {
    switch (el.type) {
      case "texto":
        return (
          <div
            style={{
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "16px",
              fontWeight: el.fontWeight || "normal",
              fontFamily: el.fontFamily || "Arial",
              textAlign: el.textAlign || "center",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {el.text}
          </div>
        );

      case "rectangulo":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 0}px`,
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "0px",
              borderColor: el.borderColor || "transparent",
              borderStyle: el.borderWidth ? "solid" : "none",
              width: "100%",
              height: "100%",
            }}
          ></div>
        );

      case "circulo":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: "50%",
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "0px",
              borderColor: el.borderColor || "transparent",
              borderStyle: el.borderWidth ? "solid" : "none",
              width: "100%",
              height: "100%",
            }}
          ></div>
        );

      case "linea":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              style={{
                backgroundColor: el.color,
                width: "100%",
                height: "100%",
              }}
            ></div>
            {selectedId === el.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRotateLine(el.id);
                }}
                className="absolute -top-6 right-0 bg-white border rounded-md p-1 shadow-sm text-xs"
                title="Rotar línea"
              >
                {el.isVertical ? "Horizontal" : "Vertical"}
              </button>
            )}
          </div>
        );

      case "triangulo":
        return renderTriangle(el.color);

      case "imagen":
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={el.src || "/api/placeholder/200/150"}
              alt={el.alt || "Imagen"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: el.objectFit || "cover",
                borderRadius: `${el.borderRadius || 0}px`,
              }}
              onError={(e) => {
                e.target.src = "/api/placeholder/200/150";
                e.target.alt = "Error al cargar imagen";
              }}
            />
          </div>
        );

      case "icono":
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={el.src}
              alt="Icono"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src = "/api/placeholder/40/40";
                e.target.alt = "Error al cargar icono";
              }}
            />
          </div>
        );

      case "boton":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 4}px`,
              color: el.textColor,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
              fontWeight: el.fontWeight || "500",
              fontFamily: el.fontFamily || "Arial",
              cursor: "default",
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "0px",
              borderColor: el.borderColor || "transparent",
              borderStyle: el.borderWidth ? "solid" : "none",
            }}
          >
            {el.text}
          </div>
        );

      case "input":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 4}px`,
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "1px",
              borderColor: el.borderColor || "#d1d5db",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
              fontFamily: el.fontFamily || "Arial",
            }}
          >
            {el.text}
          </div>
        );

      case "checkbox":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
              fontFamily: el.fontFamily || "Arial",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: `${el.borderRadius || 4}px`,
                borderWidth: "1px",
                borderColor: "#d1d5db",
                borderStyle: "solid",
                marginRight: "8px",
                backgroundColor: el.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {el.checked && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L10 17L20 7"
                    stroke="#4F46E5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            {el.text}
          </div>
        );

      case "radio":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
              fontFamily: el.fontFamily || "Arial",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                borderWidth: "1px",
                borderColor: "#d1d5db",
                borderStyle: "solid",
                marginRight: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {el.checked && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#4F46E5",
                  }}
                ></div>
              )}
            </div>
            {el.text}
          </div>
        );

      case "switch":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
              fontFamily: el.fontFamily || "Arial",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "20px",
                borderRadius: "999px",
                backgroundColor: el.checked ? "#4F46E5" : el.color,
                marginRight: "8px",
                position: "relative",
                transition: "background-color 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  top: "2px",
                  left: el.checked ? "18px" : "2px",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              ></div>
            </div>
            {el.text}
          </div>
        );

      case "select":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 4}px`,
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "1px",
              borderColor: el.borderColor || "#d1d5db",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
              fontFamily: el.fontFamily || "Arial",
            }}
          >
            <span>{el.text}</span>
            <ChevronDown size={16} />
          </div>
        );

      case "search":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 4}px`,
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "1px",
              borderColor: el.borderColor || "#d1d5db",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              gap: "8px",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
              fontFamily: el.fontFamily || "Arial",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{el.text}</span>
          </div>
        );

      case "tabla":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 4}px`,
              borderWidth: "1px",
              borderColor: "#d1d5db",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  backgroundColor: "#f3f4f6",
                  borderBottom: "1px solid #d1d5db",
                }}
              >
                {(
                  el.headers || ["Encabezado 1", "Encabezado 2", "Encabezado 3"]
                ).map((header, index) => (
                  <div
                    key={`header-${index}`}
                    style={{
                      padding: "8px",
                      borderRight: index < 2 ? "1px solid #d1d5db" : "none",
                      fontWeight: "bold",
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  overflow: "auto",
                }}
              >
                {(
                  el.rows || [
                    ["Celda 1,1", "Celda 1,2", "Celda 1,3"],
                    ["Celda 2,1", "Celda 2,2", "Celda 2,3"],
                    ["Celda 3,1", "Celda 3,2", "Celda 3,3"],
                  ]
                ).map((row, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      borderBottom:
                        rowIndex < (el.rows?.length || 3) - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                    }}
                  >
                    {row.map((cell, cellIndex) => (
                      <div
                        key={`cell-${rowIndex}-${cellIndex}`}
                        style={{
                          padding: "8px",
                          borderRight:
                            cellIndex < 2 ? "1px solid #e5e7eb" : "none",
                          fontSize: "12px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "card":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 8}px`,
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "1px",
              borderColor: el.borderColor || "#e5e7eb",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: el.fontSize ? `${el.fontSize}px` : "16px",
                fontWeight: "600",
                marginBottom: "8px",
                color: el.textColor,
                fontFamily: el.fontFamily || "Arial",
              }}
            >
              {el.text || "Título de tarjeta"}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontFamily: el.fontFamily || "Arial",
              }}
            >
              {el.description || "Descripción de ejemplo para esta tarjeta"}
            </div>
          </div>
        );

      case "alert":
        return (
          <div
            style={{
              backgroundColor: el.color,
              borderRadius: `${el.borderRadius || 4}px`,
              borderWidth: el.borderWidth ? `${el.borderWidth}px` : "1px",
              borderColor: el.borderColor || "#fecaca",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              color: el.textColor,
              fontSize: el.fontSize ? `${el.fontSize}px` : "14px",
              fontFamily: el.fontFamily || "Arial",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "8px", color: el.textColor }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            {el.text || "¡Esta es una alerta de ejemplo!"}
          </div>
        );

      case "divider":
        return (
          <div
            style={{
              backgroundColor: el.color,
              width: "100%",
              height: "100%",
            }}
          ></div>
        );

      default:
        return <div>Elemento desconocido</div>;
    }
  };

  return (
    <div className="w-full h-full bg-white relative">
      <div
        ref={canvasRef}
        className="absolute inset-0 bg-grid bg-gray-50"
        style={{
          backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), 
                              linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          cursor: getCursorStyle(),
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
      >
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-4">
          {showFrameControls && (
            <>
              <FrameSelector
                currentFrame={currentFrame}
                setCurrentFrame={(frame) => {
                  setCurrentFrame(frame);
                  saveFrameSettings(frame, zoom);
                }}
                addNewFrame={addNewFrame}
              />

              <button
                onClick={() => setPanMode(!panMode)}
                className={`text-gray-500 hover:text-gray-700 bg-white border rounded-md p-1.5 shadow-sm ${
                  panMode ? "bg-blue-50 text-blue-600" : ""
                }`}
                title={panMode ? "Desactivar modo mano" : "Activar modo mano"}
              >
                <Hand size={14} />
              </button>

              <button
                onClick={() => setShowFrameControls(false)}
                className="text-gray-500 hover:text-gray-700 bg-white border rounded-md p-1.5 shadow-sm"
                title="Ocultar controles de frame"
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}

          {!showFrameControls && (
            <button
              onClick={() => setShowFrameControls(true)}
              className="text-gray-500 hover:text-gray-700 bg-white border rounded-md p-1.5 shadow-sm"
              title="Mostrar controles de frame"
            >
              <LayoutGrid size={14} />
            </button>
          )}
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          {currentFrame ? (
            <div
              className="bg-white shadow-lg border border-gray-300 relative"
              style={{
                width: currentFrame.width,
                height: currentFrame.height,
                transition: "width 0.3s, height 0.3s",
                overflow: "hidden",
              }}
            >
              <div className="absolute -top-7 left-0 text-xs text-gray-500 flex items-center gap-2">
                <span className="bg-white px-2 py-1 rounded-md shadow-sm border">
                  {currentFrame.name} ({currentFrame.width} ×{" "}
                  {currentFrame.height})
                </span>
                {currentFrame.width <= 480 && (
                  <span
                    className="bg-white p-1 rounded-md shadow-sm border"
                    title="Mobile"
                  >
                    <Smartphone size={12} />
                  </span>
                )}
              </div>

              {elements.map((el) => (
                <Rnd
                  key={el.id}
                  size={{ width: el.width, height: el.height }}
                  position={{ x: el.x, y: el.y }}
                  onDragStop={handleDragStop(el.id)}
                  onResizeStop={handleResize(el.id)}
                  bounds="parent"
                  onClick={() => setSelectedId(el.id)}
                  className="flex items-center justify-center"
                  style={{
                    zIndex: selectedId === el.id ? 10 : 1,
                    outline:
                      selectedId === el.id
                        ? `2px solid ${myColor}`
                        : selectedElementsByUsers[el.id]
                        ? `2px solid ${selectedElementsByUsers[el.id]}`
                        : "none",
                  }}
                  resizeHandleStyles={{
                    topRight: {
                      display: el.type === "linea" ? "none" : "block",
                    },
                    bottomRight: {
                      display: el.type === "linea" ? "none" : "block",
                    },
                    bottomLeft: {
                      display: el.type === "linea" ? "none" : "block",
                    },
                    topLeft: {
                      display: el.type === "linea" ? "none" : "block",
                    },
                  }}
                  enableResizing={getResizeHandles(el)}
                  disableDragging={panMode}
                >
                  {renderUIComponent(el)}
                </Rnd>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-white bg-opacity-80 rounded-lg shadow-sm">
              <p className="text-gray-500 mb-3">
                No hay ningún frame seleccionado
              </p>
              <button
                onClick={addNewFrame}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm"
              >
                Añadir un frame
              </button>
            </div>
          )}
        </div>

        <DesignToolbox handleAddElement={handleAddElement} />
      </div>
    </div>
  );
}
