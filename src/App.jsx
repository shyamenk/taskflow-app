import { useEffect, useState } from 'react'
import './App.css'

export const STORAGE_KEY = 'taskflow.tasks'

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    // Corrupt or blocked storage should not stop the app from starting.
    return []
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Private mode or a full quota: keep working in memory.
    }
  }, [tasks])

  function addTask(event) {
    event.preventDefault()
    const title = text.trim()
    if (!title) return
    // Counter ids, not crypto.randomUUID(): browsers disable randomUUID on
    // plain http pages, and this app is served over http from a load balancer.
    const id = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1
    setTasks([...tasks, { id, title, done: false }])
    setText('')
  }

  function toggleTask(id) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const remaining = tasks.filter((task) => !task.done).length

  return (
    <main className="app">
      <h1>Taskflow</h1>
      <form onSubmit={addTask} className="add-form">
        <input
          aria-label="New task"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
              <span>{task.title}</span>
            </label>
            <button
              type="button"
              aria-label={`Delete ${task.title}`}
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <p className="count">
        {remaining} {remaining === 1 ? 'task' : 'tasks'} left
      </p>
    </main>
  )
}

export default App
