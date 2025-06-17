import React, { useState, useEffect, useMemo } from "react";

// TEMPORARY: Placeholder Card component.
// YOU WILL REPLACE THIS WITH YOUR ACTUAL CARD COMPONENT IMPORT LATER.
interface CardProps {
  title: string;
  desc: string;
  date: string;
  id: string;
  completed: boolean;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void; // Changed from onSoftDelete to onDelete, and removed currentIsDeleted
  onEdit: (id: string, title: string, desc: string) => void;
}

const Card: React.FC<CardProps> = ({
  title,
  desc,
  date,
  id,
  completed,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  // Now, only 'completed' status determines strikethrough
  const isStrikethrough = completed;

  const cardStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: isStrikethrough ? "#e6ffe6" : "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textDecoration: isStrikethrough ? "line-through" : "none",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minWidth: "300px",
    maxWidth: "300px",
    width: "300px",
    boxSizing: "border-box",
  };
  const titleStyle: React.CSSProperties = {
    fontSize: "1.2em",
    fontWeight: "bold",
    marginBottom: "5px",
    color: isStrikethrough ? "#888" : "#333",
  };
  const dateStyle: React.CSSProperties = {
    fontSize: "0.8em",
    color: "#888",
  };
  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    marginTop: "10px",
    gap: "8px",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  };
  const actionButtonStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontSize: "0.8em",
  };
  const completeButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: completed ? "#f0ad4e" : "#5cb85c",
  };
  const deleteButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "#d9534f", // Red for actual delete
  };
  const editButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: "#ffc107",
    opacity: isStrikethrough ? 0.5 : 1, // Dim if completed
    cursor: isStrikethrough ? "not-allowed" : "pointer",
  };

  return (
    <div className="card" style={cardStyle}>
      <h3 className="card-title" style={titleStyle}>
        {title}
      </h3>
      <p className="card-date" style={dateStyle}>
        Due: {date}
      </p>
      <div style={buttonGroupStyle}>
        <button
          style={completeButtonStyle}
          onClick={() => onToggleComplete(id, completed)}
        >
          {completed ? "Undo" : "Complete"}
        </button>
        <button
          style={editButtonStyle}
          onClick={() => onEdit(id, title, desc)}
          disabled={isStrikethrough} // Disable if completed
        >
          Edit
        </button>
        <button style={deleteButtonStyle} onClick={() => onDelete(id)}>
          {" "}
          {/* Call onDelete */}
          Delete
        </button>
      </div>
    </div>
  );
};
// END TEMPORARY CARD COMPONENT

// Define the type for the data received from JSONPlaceholder API
interface JsonPlaceholderTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// Define the type for a Todo item as used in the component's state and passed to Card
interface TodoItem {
  id: string;
  title: string;
  desc: string;
  date: string;
  completed: boolean;
  // removed: isDeleted: boolean; // No longer needed for hard delete visual
}

// Base URL for JSONPlaceholder API
const API_BASE_URL = "https://jsonplaceholder.typicode.com/todos";

// Function to fetch todos from JSONPlaceholder API (GET /todos)
const getTodosFromApi = async (): Promise<JsonPlaceholderTodo[]> => {
  try {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: JsonPlaceholderTodo[] = await res.json();
    return data;
  } catch (err: any) {
    console.error("Error fetching todos from JSONPlaceholder API:", err);
    throw new Error(`Failed to fetch todos: ${err.message || "Unknown error"}`);
  }
};

// Function to add a todo to JSONPlaceholder API (POST /todos)
const addTodoToApi = async (title: string): Promise<JsonPlaceholderTodo> => {
  try {
    const payload = {
      title: title,
      completed: false, // New tasks start as incomplete
      userId: 1,
    };

    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `HTTP error! status: ${res.status}, Message: ${
          errorText || "Failed to add task"
        }`
      );
    }
    const data: JsonPlaceholderTodo = await res.json();
    return data;
  } catch (err: any) {
    console.error("Error adding todo to JSONPlaceholder API:", err);
    throw new Error(`Failed to add todo: ${err.message || "Unknown error"}`);
  }
};

// Function to update a todo on JSONPlaceholder API (PATCH /todos/{id})
const updateTodoInApi = async (
  id: string,
  updates: Partial<JsonPlaceholderTodo>
): Promise<JsonPlaceholderTodo> => {
  console.warn(
    `JSONPlaceholder API: PATCH operation for ID ${id} is simulated, but changes are NOT persisted on the server.`
  );
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `HTTP error! status: ${res.status}, Message: ${
          errorText || "Failed to update task"
        }`
      );
    }
    const data: JsonPlaceholderTodo = await res.json();
    return data;
  } catch (err: any) {
    console.error(`Simulated error updating todo ${id}:`, err);
    throw new Error(`Failed to update todo: ${err.message || "Unknown error"}`);
  }
};

// Function to simulate delete call (JSONPlaceholder doesn't persist)
const simulateDeleteTodoInApi = async (id: string): Promise<void> => {
  console.warn(
    `JSONPlaceholder API: DELETE operation for ID ${id} is simulated, but changes are NOT persisted on the server.`
  );
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `HTTP error! status: ${res.status}, Message: ${
          errorText || "Failed to delete task"
        }`
      );
    }
  } catch (err: any) {
    console.error(`Simulated error deleting todo ${id}:`, err);
    throw new Error(`Failed to delete todo: ${err.message || "Unknown error"}`);
  }
};

function Todo() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [allTodos, setAllTodos] = useState<TodoItem[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const dismissAlert = () => {
    setAlertMessage(null);
    setIsSuccess(null);
  };

  // --- Fetch All Todos (or load from Local Storage) on Mount ---
  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      setError(null);
      setAlertMessage(null);
      setIsSuccess(null);
      console.log(desc);

      try {
        const storedTodos = localStorage.getItem("todos");
        let initialTodos: TodoItem[];

        if (storedTodos) {
          initialTodos = JSON.parse(storedTodos);
          console.log("Loaded todos from local storage."); // For debugging
        } else {
          // Fetch from JSONPlaceholder if nothing in local storage
          const data = await getTodosFromApi();
          initialTodos = data.map((item: JsonPlaceholderTodo) => ({
            id: item.id.toString(),
            title: item.title,
            desc: item.title,
            date: "N/A",
            completed: item.completed,
          }));
          // Save fetched data to local storage for future loads
          localStorage.setItem("todos", JSON.stringify(initialTodos));
          console.log(
            "Fetched todos from JSONPlaceholder and saved to local storage."
          ); // For debugging
        }

        setAllTodos(initialTodos);
        setDisplayCount(itemsPerPage);
      } catch (err: any) {
        console.error("Error loading todos:", err);
        setError(err.message || "Failed to load todos.");
        setAlertMessage(`Error: ${err.message || "Failed to load todos."}`);
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []); // Empty dependency array means this runs once on mount

  // --- Save allTodos to Local Storage whenever it changes ---
  useEffect(() => {
    // Only save if not in initial loading state and not during an error fetching
    if (!loading && !error) {
      localStorage.setItem("todos", JSON.stringify(allTodos));
      console.log("Todos saved to local storage."); // For debugging
    }
  }, [allTodos, loading, error]);

  // --- Add/Edit Todo Handler ---
  const handleSaveTodo = async () => {
    if (!title.trim()) {
      setAlertMessage("Task title cannot be empty.");
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);
    setIsSuccess(null);

    try {
      if (editingTodoId) {
        // --- EDIT EXISTING TODO ---
        // Simulate API update call - no need to await for persistence for JSONPlaceholder
        await updateTodoInApi(editingTodoId, { title: title.trim() });

        setAllTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === editingTodoId
              ? { ...todo, title: title.trim(), desc: title.trim() }
              : todo
          )
        );
        setAlertMessage("Todo updated successfully!"); // Removed "(Not saved on server)"
      } else {
        // --- ADD NEW TODO ---
        // Generate a new unique ID for local storage persistence
        const newId = crypto.randomUUID();

        // Simulate API add call - no need to await for persistence for JSONPlaceholder
        // JSONPlaceholder POST returns a new object with an incremented ID, but we use our own UUID for local persistence
        // We'll call it for consistency even if its return value isn't used to generate the ID
        await addTodoToApi(title.trim());

        const newTodoItem: TodoItem = {
          id: newId,
          title: title.trim(),
          desc: title.trim(),
          date: "Today", // Placeholder date
          completed: false,
        };
        // Add new todo to the beginning of the ALL todos list
        setAllTodos((prevTodos) => [newTodoItem, ...prevTodos]);
        setAlertMessage("Todo added successfully!"); // Removed "(Not saved on server)"

        // If adding a new todo, immediately show it by incrementing display count if needed
        // This makes sure the newly added item is visible if we're not at the end of the current view
        if (displayedAndFilteredTodos.length < displayCount) {
          setDisplayCount((prevCount) => prevCount + 1);
        }
      }

      setIsSuccess(true);
      setTitle("");
      setDesc("");
      setIsOpen(false);
      setEditingTodoId(null);
    } catch (err: any) {
      console.error("Error saving todo:", err);
      setAlertMessage(`Failed to save todo: ${err.message || "Unknown error"}`);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Toggle Todo Complete Status Handler (PATCH) ---
  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    setAlertMessage(null);
    setIsSuccess(null);

    // Optimistically update UI first in allTodos
    setAllTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !currentStatus } : todo
      )
    );

    try {
      // Simulate API update call
      await updateTodoInApi(id, { completed: !currentStatus });
      setAlertMessage(
        `Task ${currentStatus ? "marked as incomplete" : "completed"}!`
      ); // Removed "(Not saved on server)"
      setIsSuccess(true);
    } catch (err: any) {
      console.error(`Error toggling todo ${id} status:`, err);
      setAlertMessage(
        `Failed to update task status: ${err.message || "Unknown error"}`
      );
      setIsSuccess(false);
      // Revert UI on error in allTodos
      setAllTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: currentStatus } : todo
        )
      );
    }
  };

  // --- Hard Delete (from UI) Handler ---
  const handleDeleteTodo = async (id: string) => {
    setAlertMessage(null);
    setIsSuccess(null);

    // Optimistically remove from UI by filtering allTodos
    setAllTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

    try {
      // Simulate API delete call
      await simulateDeleteTodoInApi(id);
      setAlertMessage("Todo deleted successfully!"); // Removed "(Not saved on server)"
      setIsSuccess(true);
    } catch (err: any) {
      console.error(`Error deleting todo ${id}:`, err);
      setAlertMessage(
        `Failed to delete todo: ${err.message || "Unknown error"}`
      );
      setIsSuccess(false);
      // For a real app, you might re-add the item to `allTodos` on error here.
      // For JSONPlaceholder, since it's not truly deleted, we just show the error.
    }
  };

  // --- Handle Edit Button Click ---
  const handleEditClick = (
    id: string,
    currentTitle: string,
    currentDesc: string
  ) => {
    setEditingTodoId(id);
    setTitle(currentTitle);
    setDesc(currentDesc);
    setIsOpen(true);
    setAlertMessage(null);
    setIsSuccess(null);
  };

  // --- Form Submission Handler for Add/Edit Todo Modal ---
  const onSumit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSaveTodo();
  };

  // --- Filter and Paginate Displayed Todos ---
  const displayedAndFilteredTodos = useMemo(() => {
    // Apply search filter first to the full list
    const filtered = allTodos.filter((todo) => {
      if (!searchQuery.trim()) {
        return true;
      }
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      return (
        todo.title.toLowerCase().includes(lowerCaseQuery) ||
        todo.desc.toLowerCase().includes(lowerCaseQuery) ||
        todo.id.toLowerCase().includes(lowerCaseQuery)
      );
    });

    // Then, slice based on current displayCount
    return filtered.slice(0, displayCount);
  }, [allTodos, displayCount, searchQuery]);

  // --- Load More Function ---
  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + itemsPerPage);
  };

  const hasMoreToLoad = useMemo(() => {
    // Check if there are more items in the *filtered* list than currently displayed
    const totalFiltered = allTodos.filter((todo) => {
      if (!searchQuery.trim()) return true;
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      return (
        todo.title.toLowerCase().includes(lowerCaseQuery) ||
        todo.desc.toLowerCase().includes(lowerCaseQuery) ||
        todo.id.toLowerCase().includes(lowerCaseQuery)
      );
    }).length;
    return displayCount < totalFiltered;
  }, [allTodos, displayCount, searchQuery]);

  // --- Inline Styling for Alert Message (to avoid external CSS changes) ---
  const alertStyle: React.CSSProperties = {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "1rem",
    color:
      isSuccess === true ? "green" : isSuccess === false ? "red" : "inherit",
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    padding: "8px 15px",
    borderRadius: "5px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    zIndex: 1001,
  };

  // --- Inline Styles for the Modal Overlay and Form (to ensure functionality without external CSS) ---
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: isOpen ? "flex" : "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const addTodoFormStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 15px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    transition: "opacity 0.2s ease-in-out",
  };

  const doneButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "green",
    opacity: isSubmitting ? 0.7 : 1,
    cursor: isSubmitting ? "not-allowed" : "pointer",
  };

  const closeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "red",
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <section
        className="todo"
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          className="loading-message"
          style={{ textAlign: "center", fontSize: "1.2em" }}
        >
          Loading todos...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="todo"
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          className="error-message"
          style={{ textAlign: "center", fontSize: "1.2em", color: "red" }}
        >
          Error: {error}
        </p>
      </section>
    );
  }

  return (
    <section className="todo">
      <div className="todo-header">
        <h1 className="todo-title">Todo</h1>
        <div
          className="add-section"
          onClick={() => {
            setIsOpen(true);
            setEditingTodoId(null);
            setTitle("");
            setDesc("");
          }}
        >
          {/* Direct reference to image in public folder */}
          <img src="/Edit/Add_Plus.svg" alt="add" />
        </div>
      </div>
      <div className="form">
        <div className="input-container">
          <input
            type="text"
            placeholder="search by title, description or ID"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Direct reference to image in public folder */}
          <img src="/search.svg" alt="search" />
        </div>
      </div>
      <div
        className="card-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {/* Render cards dynamically based on filtered and paginated todos */}
        {displayedAndFilteredTodos.length > 0 ? (
          displayedAndFilteredTodos.map((todo) => (
            <Card
              key={todo.id}
              id={todo.id}
              title={todo.title}
              desc={todo.desc}
              date={todo.date}
              completed={todo.completed}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onEdit={handleEditClick}
            />
          ))
        ) : (
          <p
            className="no-todos-message"
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#555",
              width: "100%",
            }}
          >
            {searchQuery
              ? "No matching todos found."
              : "No todos found. Add a new one!"}
          </p>
        )}
        {hasMoreToLoad && (
          <p
            className="pagination"
            style={{ width: "100%", textAlign: "center", marginTop: "20px" }}
          >
            <button
              onClick={handleLoadMore}
              style={{
                padding: "8px 15px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#f0f0f0",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.2s ease-in-out",
              }}
            >
              Load More
            </button>
          </p>
        )}
      </div>

      {/* Modal for adding/editing a todo */}
      <section
        className={`absolute ${isOpen ? "show" : "hide"}`}
        style={modalOverlayStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOpen(false);
            setAlertMessage(null);
            setIsSuccess(null);
            setTitle(""); // Clear fields on modal close
            setDesc("");
            setEditingTodoId(null); // Clear editing state
          }
        }}
      >
        <form className="add-todo" onSubmit={onSumit} style={addTodoFormStyle}>
          <h2
            style={{
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "1.5em",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {editingTodoId ? "Edit Task" : "Add New Task"}
          </h2>
          <input
            type="text"
            className="Input"
            placeholder="task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            disabled={isSubmitting}
            required
          />
          <div className="button-container" style={buttonContainerStyle}>
            <button
              type="submit"
              className="but Done"
              style={doneButtonStyle}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingTodoId
                ? "Save Changes"
                : "Add Task"}
            </button>
            <button
              type="button"
              className="but Close"
              onClick={() => {
                setIsOpen(false);
                setAlertMessage(null);
                setIsSuccess(null);
                setTitle(""); // Clear fields on close
                setDesc("");
                setEditingTodoId(null); // Clear editing state
              }}
              style={closeButtonStyle}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
          {/* Display form submission alert messages inside the modal */}
          {alertMessage && isOpen && (
            <p
              style={{
                ...alertStyle,
                position: "static",
                transform: "none",
                bottom: "auto",
                left: "auto",
              }}
            >
              {alertMessage}
              <span
                onClick={dismissAlert}
                style={{
                  cursor: "pointer",
                  marginLeft: "10px",
                  fontWeight: "bold",
                }}
              >
                &times;
              </span>
            </p>
          )}
        </form>
      </section>

      {/* Display global alert message if modal is closed and there's an alert */}
      {alertMessage && !isOpen && (
        <p
          style={{
            ...alertStyle,
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            backgroundColor: "white",
            padding: "8px 15px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {alertMessage}
          <span
            onClick={dismissAlert}
            style={{
              cursor: "pointer",
              marginLeft: "10px",
              fontWeight: "bold",
            }}
          >
            &times;
          </span>
        </p>
      )}
    </section>
  );
}

export default Todo;
