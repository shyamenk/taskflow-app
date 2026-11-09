import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App, { STORAGE_KEY } from './App.jsx'

async function addTask(user, title) {
  await user.type(screen.getByLabelText('New task'), title)
  await user.click(screen.getByRole('button', { name: 'Add' }))
}

describe('Taskflow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, 'Write the Dockerfile')

    expect(screen.getByText('Write the Dockerfile')).toBeInTheDocument()
    expect(screen.getByLabelText('New task')).toHaveValue('')
    expect(screen.getByText('1 task left')).toBeInTheDocument()
  })

  it('rejects an empty or whitespace-only task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, '   ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText('0 tasks left')).toBeInTheDocument()
  })

  it('marks a task done and undone', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Push the image')
    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByText('0 tasks left')).toBeInTheDocument()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText('1 task left')).toBeInTheDocument()
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Tear down the cluster')

    await user.click(screen.getByRole('button', { name: 'Delete Tear down the cluster' }))

    expect(screen.queryByText('Tear down the cluster')).not.toBeInTheDocument()
  })

  it('keeps tasks across a page reload', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await addTask(user, 'Survive a reload')
    await user.click(screen.getByRole('checkbox'))
    first.unmount()

    render(<App />)

    expect(screen.getByText('Survive a reload')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('starts empty when saved data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')

    render(<App />)

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
