import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import CanvasArea from "../components/CanvasArea";
import {
  exportProjectAsAngularZip,
  fetchProjectById,
  updateProject,
} from "../services/proyectoService";
import PageManager from "../components/PageManager";
import PageTabs from "../components/PageTabs";
import { Palette, Layers, Save } from "lucide-react";
import ElementEditor from "../components/ElementEditor";
import generateRandomColor from "../utils/generateRandomColor";
import { useNavigate } from "react-router-dom";

// const socket = io("https://generadori-back-production.up.railway.app");

const socket = io(
  import.meta.env.MODE === "development"
    ? "http://localhost:3001"
    : "https://generadori-back-production.up.railway.app",
  {
    transports: ["websocket"],
  }
);


export default function ProjectoPizarra() {
  const { id } = useParams();
  const [selectedId, setSelectedId] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);

  const [showTools, setShowTools] = useState(true);
  const [showPages, setShowPages] = useState(true);

  const [userColor] = useState(generateRandomColor());
  const [selectedElementsByUsers, setSelectedElementsByUsers] = useState({});

  const [currentFrame, setCurrentFrame] = useState(null);
  const [zoom, setZoom] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await fetchProjectById(id);
        if (data.objetos && data.objetos.pages) {
          setPages(data.objetos.pages);
          setCurrentPageId(data.objetos.pages[0]?.id || null);

          if (data.objetos.currentFrame) {
            setCurrentFrame(data.objetos.currentFrame);
          }
          if (data.objetos.zoom) {
            setZoom(data.objetos.zoom);
          }
        } else {
          const newPage = {
            id: `page-${Date.now()}`,
            name: "Página 1",
            elements: [],
          };
          setPages([newPage]);
          setCurrentPageId(newPage.id);
        }
      } catch (err) {
        console.error("Error al cargar proyecto:", err);
        const newPage = {
          id: `page-${Date.now()}`,
          name: "Página 1",
          elements: [],
        };
        setPages([newPage]);
        setCurrentPageId(newPage.id);
      }
    };

    loadProject();
  }, [id]);

  useEffect(() => {
    socket.on("elements-updated", ({ projectId, pageId, elements }) => {
      if (projectId === id && pageId === currentPageId) {
        setPages((prevPages) =>
          prevPages.map((page) =>
            page.id === pageId ? { ...page, elements } : page
          )
        );
      }
    });

    socket.on("element-selected", ({ projectId, pageId, elementId, color }) => {
      if (projectId === id && pageId === currentPageId) {
        setSelectedElementsByUsers((prev) => ({
          ...prev,
          [elementId]: color,
        }));
      }
    });

    socket.on("element-deselected", ({ projectId, pageId, elementId }) => {
      if (projectId === id && pageId === currentPageId) {
        setSelectedElementsByUsers((prev) => {
          const newSelections = { ...prev };
          delete newSelections[elementId];
          return newSelections;
        });
      }
    });

    socket.on("frame-updated", ({ projectId, frame, newZoom }) => {
      if (projectId === id) {
        setCurrentFrame(frame);
        if (newZoom) {
          setZoom(newZoom);
        }
      }
    });

    return () => {
      socket.off("elements-updated");
      socket.off("element-selected");
      socket.off("element-deselected");
      socket.off("frame-updated");
    };
  }, [id, currentPageId]);

  const saveFrameSettings = (frame, newZoom) => {
    setCurrentFrame(frame);
    setZoom(newZoom);

    socket.emit("update-frame", {
      projectId: id,
      frame,
      newZoom,
    });
  };

  const handleSave = async () => {
    try {
      await updateProject(id, {
        objetos: {
          pages,
          currentFrame,
          zoom,
        },
      });
      alert("Proyecto guardado correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el proyecto ❌");
    }
  };

  const socketDeleteElement = (elementId) => {
    socket.emit("element-deselected", {
      projectId: id,
      pageId: currentPageId,
      elementId,
    });
  };

  const socketDuplicateElement = (newElement) => {
    socket.emit("update-elements", {
      projectId: id,
      pageId: currentPageId,
      elements: [...currentElements, newElement],
    });
  };

  const eliminarElemento = (elementId) => {
    if (!elementId) return;
    updateElements(currentElements.filter((el) => el.id !== elementId));
    setSelectedId(null);
    socket.emit("element-deselected", {
      projectId: id,
      pageId: currentPageId,
      elementId,
    });
  };

  const duplicarElemento = (elemento) => {
    if (!elemento) return;
    const newElement = {
      ...elemento,
      id: Date.now().toString(),
      x: elemento.x + 20,
      y: elemento.y + 20,
    };
    updateElements([...currentElements, newElement]);
    setSelectedId(newElement.id);
  };

  const currentPage = pages.find((p) => p.id === currentPageId) || {
    elements: [],
  };

  const currentElements = Array.isArray(currentPage.elements)
    ? currentPage.elements
    : [];

  const selectedElement = selectedId
    ? currentElements.find((el) => el.id === selectedId) || null
    : null;

  const updateElements = (newElements) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === currentPageId ? { ...page, elements: newElements } : page
      )
    );

    socket.emit("update-elements", {
      projectId: id,
      pageId: currentPageId,
      elements: newElements,
    });
  };

  const handleSelectElement = (idElement) => {
    setSelectedId(idElement);
    socket.emit("element-selected", {
      projectId: id,
      pageId: currentPageId,
      elementId: idElement,
      color: userColor,
    });
  };

  const handleDeselectElement = () => {
    if (selectedId) {
      socket.emit("element-deselected", {
        projectId: id,
        pageId: currentPageId,
        elementId: selectedId,
      });
    }
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-between bg-white border-b px-4 py-2 shadow-sm">
        <div className="flex gap-4">
          <button
            onClick={() => setShowTools(!showTools)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            <Palette size={16} />
            {showTools ? "Ocultar Herramientas" : "Mostrar Herramientas"}
          </button>
          <button
            onClick={() => setShowPages(!showPages)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            <Layers size={16} />
            {showPages ? "Ocultar Páginas" : "Mostrar Páginas"}
          </button>
        </div>
        <PageTabs
          pages={pages}
          setPages={setPages}
          currentPageId={currentPageId}
          setCurrentPageId={setCurrentPageId}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showTools && (
          <aside className="w-64 bg-white border-r overflow-y-auto shadow-sm">
            <ElementEditor
              selectedElement={selectedElement}
              updateElement={(id, changes) => {
                updateElements(
                  currentElements.map((el) =>
                    el.id === id ? { ...el, ...changes } : el
                  )
                );
              }}
              deleteElement={eliminarElemento}
              duplicateElement={duplicarElemento}
            />
          </aside>
        )}

        <main className="flex-1 bg-gray-50 relative overflow-hidden">
          <CanvasArea
            elements={currentElements}
            setElements={updateElements}
            selectedId={selectedId}
            setSelectedId={handleSelectElement}
            deselectElement={handleDeselectElement}
            selectedElementsByUsers={selectedElementsByUsers}
            myColor={userColor}
            onElementDelete={socketDeleteElement}
            onElementDuplicate={socketDuplicateElement}
            currentFrame={currentFrame}
            setCurrentFrame={setCurrentFrame}
            saveFrameSettings={saveFrameSettings}
          />
        </main>

        {showPages && (
          <aside className="w-64 bg-white border-l overflow-y-auto shadow-sm">
            <PageManager
              pages={pages}
              setPages={setPages}
              currentPageId={currentPageId}
              setCurrentPageId={setCurrentPageId}
            />
          </aside>
        )}
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
        >
          <Save size={20} /> Guardar cambios
        </button>
        <button
          onClick={() => exportProjectAsAngularZip(id)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
        >
          <Save size={20} /> Exportar a Angular
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
        >
          🏠 Ir al inicio
        </button>
      </div>
    </div>
  );
}
