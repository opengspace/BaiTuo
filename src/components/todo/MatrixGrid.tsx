import { Todo, Quadrant } from '@/types'
import { QuadrantZone } from './QuadrantZone'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { TodoCard } from './TodoCard'

interface MatrixGridProps {
  todos: Todo[]
  onDragEnd: (activeId: string, overId: string | Quadrant) => void
  onAddTodo?: (quadrant: Quadrant) => void
  onComplete?: (id: string) => void
  onEdit?: (todo: Todo) => void
  onDelete?: (id: string) => void
}

export function MatrixGrid({
  todos,
  onDragEnd,
  onAddTodo,
  onComplete,
  onEdit,
  onDelete,
}: MatrixGridProps) {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const [overQuadrant, setOverQuadrant] = useState<Quadrant | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const todo = todos.find(t => t.id === active.id)
    setActiveTodo(todo || null)
    setOverQuadrant(null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over) {
      const overId = over.id as string
      // 检查是否是象限区域
      if (overId.includes('urgent-') || overId.includes('not-urgent-')) {
        setOverQuadrant(overId as Quadrant)
      }
    } else {
      setOverQuadrant(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onDragEnd(active.id as string, over.id as string | Quadrant)
    }

    setActiveTodo(null)
    setOverQuadrant(null)
  }

  const quadrants: Quadrant[] = [
    'urgent-important',
    'not-urgent-important',
    'urgent-not-important',
    'not-urgent-not-important',
  ]

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        {quadrants.map(quadrant => (
          <QuadrantZone
            key={quadrant}
            quadrant={quadrant}
            todos={todos.filter(t => t.quadrant === quadrant)}
            onAddTodo={onAddTodo}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            isOver={overQuadrant === quadrant && activeTodo?.quadrant !== quadrant}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTodo && (
          <TodoCard
            todo={activeTodo}
            isDragging
            draggable={false}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}