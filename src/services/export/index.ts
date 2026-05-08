import { Todo, ReputationRecord } from '@/types'

interface ExportData {
  version: string
  exportedAt: number
  todos: Todo[]
  reputationRecords: ReputationRecord[]
}

export async function exportData(todos: Todo[], records: ReputationRecord[]): Promise<void> {
  const data: ExportData = {
    version: '1.0.0',
    exportedAt: Date.now(),
    todos,
    reputationRecords: records,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `baituo-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData

        if (!data.version || !data.todos) {
          throw new Error('无效的备份文件格式')
        }

        resolve(data)
      } catch (error) {
        reject(new Error('解析备份文件失败'))
      }
    }

    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}