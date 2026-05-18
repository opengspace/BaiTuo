import { useState, useEffect } from 'react'
import { Modal, Switch } from '@/components/common'
import { DailyCheckConfig, DEFAULT_DAILY_CHECK_CONFIG, QUADRANT_LABELS } from '@/types'
import { getDailyCheckConfig, updateDailyCheckConfig } from '@/services/dailyCheck'
import { Settings, AlertTriangle } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [config, setConfig] = useState<DailyCheckConfig>(DEFAULT_DAILY_CHECK_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadConfig()
    }
  }, [open])

  const loadConfig = async () => {
    setLoading(true)
    const loadedConfig = await getDailyCheckConfig()
    setConfig(loadedConfig)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateDailyCheckConfig(config)
    setSaving(false)
    onClose()
  }

  const updateOverduePenalty = (key: keyof DailyCheckConfig['overduePenalty'], value: any) => {
    setConfig(prev => ({
      ...prev,
      overduePenalty: {
        ...prev.overduePenalty,
        [key]: value,
      },
    }))
  }

  const updateQuadrantMultiplier = (quadrant: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      overduePenalty: {
        ...prev.overduePenalty,
        quadrantMultiplier: {
          ...prev.overduePenalty.quadrantMultiplier,
          [quadrant]: value,
        },
      },
    }))
  }

  const updateCancelledPenalty = (key: keyof DailyCheckConfig['cancelledPenalty'], value: any) => {
    setConfig(prev => ({
      ...prev,
      cancelledPenalty: {
        ...prev.cancelledPenalty,
        [key]: value,
      },
    }))
  }

  if (loading) {
    return (
      <Modal open={open} onClose={onClose} title="设置">
        <div className="text-center py-8 text-gray-400">加载中...</div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="设置" size="lg">
      <div className="space-y-6">
        {/* 每日检查开关 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary-500" />
            <div>
              <p className="font-medium">每日检查</p>
              <p className="text-xs text-gray-500">每天自动检查逾期任务并扣分</p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        {/* 逾期扣分规则 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="font-medium">逾期扣分规则</p>
          </div>

          <div className="space-y-4">
            {/* 启用逾期扣分 */}
            <div className="flex items-center justify-between">
              <p className="text-sm">启用逾期扣分</p>
              <Switch
                checked={config.overduePenalty.enabled}
                onChange={(checked) => updateOverduePenalty('enabled', checked)}
              />
            </div>

            {config.overduePenalty.enabled && (
              <>
                {/* 每小时扣分 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">每小时扣分</p>
                    <span className="text-sm font-medium text-primary-500">
                      {config.overduePenalty.hourlyPenalty} 分
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.overduePenalty.hourlyPenalty}
                    onChange={(e) => updateOverduePenalty('hourlyPenalty', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                {/* 每日上限 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">每日扣分上限</p>
                    <span className="text-sm font-medium text-primary-500">
                      {config.overduePenalty.dailyMaxPenalty} 分
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={config.overduePenalty.dailyMaxPenalty}
                    onChange={(e) => updateOverduePenalty('dailyMaxPenalty', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                {/* 逾期天数阈值 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">逾期几天后开始扣分</p>
                    <span className="text-sm font-medium text-primary-500">
                      {config.overduePenalty.startAfterDays} 天
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    value={config.overduePenalty.startAfterDays}
                    onChange={(e) => updateOverduePenalty('startAfterDays', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                {/* 区分象限 */}
                <div className="flex items-center justify-between">
                  <p className="text-sm">不同象限不同扣分</p>
                  <Switch
                    checked={config.overduePenalty.differentiateByQuadrant}
                    onChange={(checked) => updateOverduePenalty('differentiateByQuadrant', checked)}
                  />
                </div>

                {/* 象限系数 */}
                {config.overduePenalty.differentiateByQuadrant && (
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    <p className="text-xs text-gray-500">象限扣分系数</p>
                    {Object.entries(config.overduePenalty.quadrantMultiplier).map(([quadrant, multiplier]) => (
                      <div key={quadrant} className="flex items-center justify-between">
                        <p className="text-sm">{QUADRANT_LABELS[quadrant as keyof typeof QUADRANT_LABELS]}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={multiplier}
                            onChange={(e) => updateQuadrantMultiplier(quadrant, parseFloat(e.target.value))}
                            className="w-16 text-sm text-center border border-gray-200 rounded px-2 py-1"
                          />
                          <span className="text-xs text-gray-400">x</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 取消任务惩罚 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="font-medium">取消任务惩罚</p>
          </div>

          <div className="space-y-4">
            {/* 启用取消惩罚 */}
            <div className="flex items-center justify-between">
              <p className="text-sm">启用取消任务扣分</p>
              <Switch
                checked={config.cancelledPenalty.enabled}
                onChange={(checked) => updateCancelledPenalty('enabled', checked)}
              />
            </div>

            {config.cancelledPenalty.enabled && (
              <>
                {/* 扣分比例 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">扣分比例（相对任务信誉值）</p>
                    <span className="text-sm font-medium text-primary-500">
                      {Math.round(config.cancelledPenalty.penaltyRate * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.cancelledPenalty.penaltyRate * 100}
                    onChange={(e) => updateCancelledPenalty('penaltyRate', parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                {/* 最大扣分 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">最大扣分上限</p>
                    <span className="text-sm font-medium text-primary-500">
                      {config.cancelledPenalty.maxPenalty} 分
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={config.cancelledPenalty.maxPenalty}
                    onChange={(e) => updateCancelledPenalty('maxPenalty', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </Modal>
  )
}