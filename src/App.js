import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Fetch todos from the backend when the component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/todos`); // Adjust the URL if hosted
      const data = await response.json();
      setTodos(data);
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (input.trim()) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setInput('');
    }
  };

  const toggleTodo = async (id) => {
    const todoToUpdate = todos.find(todo => todo._id === id);
    const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };

    await fetch(`${process.env.REACT_APP_API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTodo),
    });

    setTodos(todos.map(todo => (todo._id === id ? updatedTodo : todo)));
  };

  const deleteTodo = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    setTodos(todos.filter(todo => todo._id !== id));
  };

  const editTodo = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = async () => {
    if (editingText.trim()) {
      const updatedTodo = { text: editingText, completed: false };
      const response = await fetch(`${process.env.REACT_APP_API_URL}/todos/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      });
      const updatedData = await response.json();
      
      setTodos(todos.map(todo => (todo._id === editingId ? updatedData : todo)));
      setEditingId(null);
      setEditingText('');
    }
  };

  const clearCompleted = async () => {
    const completedIds = todos.filter(todo => todo.completed).map(todo => todo._id);
    
    // Delete each completed todo
    await Promise.all(completedIds.map(id => fetch(`${process.env.REACT_APP_API_URL}/todos/${id}`, {
      method: 'DELETE',
    })));

    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  return (
    <div className="container">
      <h1>To-Do List</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={addTodo}>Add Task</button>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>Active</button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo._id} className={todo.completed ? 'completed' : ''}>
            {editingId === todo._id ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={saveEdit}>Save</button>
              </div>
            ) : (
              <div className="task-info">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo._id)}
                />
                <span onDoubleClick={() => editTodo(todo._id, todo.text)}>{todo.text}</span>
                <button onClick={() => deleteTodo(todo._id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="remaining-tasks">
        {filteredTodos.filter(todo => !todo.completed).length} task{filteredTodos.filter(todo => !todo.completed).length !== 1 ? 's' : ''} left
      </div>

      <button className="clear-button" onClick={clearCompleted}>
        Clear Completed
      </button>
    </div>
  );
};

export default App;
