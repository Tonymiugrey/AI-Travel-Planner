import { useState, useEffect, useRef } from 'react'
import { Sheet, YStack, XStack, Input, TextArea, Button, Text, H4, Separator, Spinner, Select, Adapt, ScrollView } from 'tamagui'
import { TravelCardData } from '../data/travelData'
import { TRAVEL_CATEGORIES, TRAVEL_DAYS } from '../data/travelData'
import { X, Save, Clock, MapPin, Info, Bookmark, Trash2, AlertTriangle, ChevronDown, Check } from '@tamagui/lucide-icons' // Added AlertTriangle, ChevronDown, Check
import { TimePicker } from './TimePicker'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'

interface EditCardSheetProps {
  isOpen: boolean
  onClose: () => void
  card: TravelCardData | null
  mode?: 'edit' | 'create' | 'createPlanB'
  onSave?: (updated: TravelCardData, useSync?: boolean) => void
  onDelete?: (card: TravelCardData) => void; // Added onDelete prop
}

export const EditCardSheet: React.FC<EditCardSheetProps> = ({
  isOpen,
  onClose,
  card,
  mode = 'edit',
  onSave,
  onDelete,
}) => {
  const { updateCardWithSync } = useData()
  const { theme } = useTheme()
  const scrollViewRef = useRef<any>(null)
  
  // 使用默认值防止card为null时组件崩溃
  const safeCard = card || {
    id: '',
    title: '',
    day: 'Day 1',
    time: '',
    category: '',
    description: [],
    tips: [],
    highlights: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    amapUrl: '',
    transportation: ''
  } as TravelCardData

  const [form, setForm] = useState<TravelCardData>(safeCard)
  
  // 为编辑状态创建临时表单数据，将数组字段转换为字符串
  const [editForm, setEditForm] = useState<any>({})

  // 时间段拆分状态
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')

  // 错误状态管理
  const [error, setError] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // TimePicker状态
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false)
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false)

  // 同步状态管理
  const [needsSync, setNeedsSync] = useState(false)
  const [originalDay, setOriginalDay] = useState<string>('')
  const [originalStartTime, setOriginalStartTime] = useState<string>('')

  // 工具函数：从时间字符串中提取开始时间
  const extractStartTime = (timeStr: string): string => {
    if (!timeStr) return ''
    return timeStr.includes('-') ? timeStr.split('-')[0].trim() : timeStr.trim()
  }

  useEffect(() => {
    setForm(safeCard)
    // 将数组字段转换为字符串用于编辑
    setEditForm({
      ...safeCard,
      description: Array.isArray(safeCard.description) ? safeCard.description.join('\n') : '',
      tips: Array.isArray(safeCard.tips) ? safeCard.tips.join('\n') : ''
    })
    
    // 拆分时间段
    const timeRange = safeCard.time || ''
    if (timeRange.includes('-')) {
      const [start, end] = timeRange.split('-').map(t => t.trim())
      setStartTime(start || '')
      setEndTime(end || '')
    } else {
      setStartTime(timeRange)
      setEndTime('')
    }
    
    // 保存原始值用于同步检测
    setOriginalDay(safeCard.day || '')
    setOriginalStartTime(extractStartTime(safeCard.time || ''))
    
    // 重置错误状态
    setError('')
    setValidationErrors({})
    setIsLoading(false)
    setNeedsSync(false)
    
    // 重置 ScrollView 滚动位置到顶部
    if (scrollViewRef.current && isOpen) {
      // 使用 setTimeout 确保 ScrollView 已完全渲染
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: 0,
            animated: false
          })
        }
      }, 100)
    }
  }, [card, isOpen]) // 添加 isOpen 依赖，确保在打开时重置滚动位置

  // 检测是否需要同步相关卡片 - 只检查日期和开始时间变化
  useEffect(() => {
    if (!card) return
    
    // 检查是否为planB或有planB的planA
    const hasRelatedCard = card.isPlanB || (card && !card.isPlanB && card.id)
    
    if (hasRelatedCard) {
      const dayChanged = form.day !== originalDay
      const currentStartTime = extractStartTime(form.time)
      const startTimeChanged = currentStartTime !== originalStartTime
      
      if (dayChanged || startTimeChanged) {
        setNeedsSync(true)
      } else {
        setNeedsSync(false)
      }
    }
  }, [form.day, form.time, originalDay, originalStartTime, card])

  // 通用输入处理
  const handleChange = (key: keyof TravelCardData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setEditForm(prev => ({ ...prev, [key]: value }))
    // 清除相关字段的验证错误
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
    // 清除通用错误
    if (error) {
      setError('')
    }
  }

  // 处理文本输入（用于数组字段的编辑）
  const handleTextChange = (key: keyof TravelCardData, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value }))
    // 清除相关字段的验证错误
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
    // 清除通用错误
    if (error) {
      setError('')
    }
  }

  // 处理时间段变化
  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value)
    } else {
      setEndTime(value)
    }
    
    // 合并时间段并更新表单
    const newStartTime = type === 'start' ? value : startTime
    const newEndTime = type === 'end' ? value : endTime
    
    let combinedTime = ''
    if (newStartTime && newEndTime) {
      combinedTime = `${newStartTime}-${newEndTime}`
    } else if (newStartTime) {
      combinedTime = newStartTime
    } else if (newEndTime) {
      combinedTime = newEndTime
    }
    
    setForm(prev => ({ ...prev, time: combinedTime }))
    
    // 清除时间相关的验证错误
    if (validationErrors.time) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.time
        return newErrors
      })
    }
    // 清除通用错误
    if (error) {
      setError('')
    }
  }

  // 处理时间选择器的保存
  const handleTimeSave = (type: 'start' | 'end', value: string) => {
    handleTimeChange(type, value)
  }

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // 必填字段验证
    if (!form.title?.trim()) {
      errors.title = '标题不能为空'
    }
    
    if (!form.time?.trim()) {
      errors.time = '时间不能为空'
    }
    
    if (!form.category?.trim()) {
      errors.category = '分类不能为空'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 保存
  const handleSave = async () => {
    // 先验证表单
    if (!validateForm()) {
      setError('请填写所有必填字段')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 保存时将多行文本字段转换为数组
      const formToSave = { ...form }
      
      // 处理 description 字段 - 支持清空
      if (editForm.description !== undefined) {
        if (editForm.description.trim() === '') {
          formToSave.description = []
        } else {
          formToSave.description = editForm.description
            .split(/\n/)
            .map(s => s.trim())
            .filter(Boolean)
        }
      }
      
      // 处理 tips 字段 - 支持清空
      if (editForm.tips !== undefined) {
        if (editForm.tips.trim() === '') {
          formToSave.tips = []
        } else {
          formToSave.tips = editForm.tips
            .split(/\n/)
            .map(s => s.trim())
            .filter(Boolean)
        }
      }
      
      // 检查是否需要同步相关卡片
      if (needsSync && (card?.isPlanB || (card && !card.isPlanB))) {
        // 使用带同步的更新方法
        const result = await updateCardWithSync(formToSave, true)
        
        // 显示同步成功信息
        if (result.affectedCards.length > 1) {
          console.log(`已同步更新 ${result.affectedCards.length} 张相关卡片`)
        }
        
        // 通知外部使用了同步更新
        if (onSave) {
          await onSave(formToSave, true)
        }
      } else if (onSave) {
        // 使用传统的保存方法
        await onSave(formToSave, false)
      }
      
      // 保存成功后关闭Sheet
      onClose()
    } catch (error) {
      console.error('保存卡片失败:', error)
      setError(error instanceof Error ? error.message : '保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    // 直接调用onClose，让外部处理关闭
    onClose()
  }

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      snapPoints={[95]}
      disableDrag
    >
      <Sheet.Overlay         
        animation="lazy"
        backgroundColor="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}/>
      <Sheet.Frame 
        p="$4" 
        gap="$4" 
        bg="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between" pb="$0">
          <H4 color="$color12" flex={1}>
            {mode === 'edit' ? '编辑行程卡片' : 
             mode === 'create' ? '新建行程卡片' : 
             '新增方案B'}
          </H4>
          <XStack gap="$2">
            <Button 
              size="$3" 
              variant="outlined"
              icon={X}
              onPress={handleCancel}
            >
              取消
            </Button>
            <Button 
              size="$3" 
              theme="accent"
              icon={isLoading ? <Spinner size="small" color="$color1" /> : Save}
              onPress={handleSave}
              disabled={isLoading}
              fontWeight={600}
            >
              {isLoading ? (
                '保存中…'
              ) : (
                '保存'
              )}
            </Button>
          </XStack>
        </XStack>

        {/* 错误提示 */}
        {(error || Object.keys(validationErrors).length > 0) && (
          <YStack 
            p="$3" 
            bg="$red2" 
            borderRadius="$4" 
            borderColor="$red6" 
            borderWidth={1}
            gap="$2"
          >
            <XStack alignItems="center" gap="$2">
              <AlertTriangle size={16} color="$red10" />
              <Text fontSize="$3" color="$red11" fontWeight="600">
                保存失败
              </Text>
            </XStack>
            
            {error && (
              <Text fontSize="$3" color="$red10">
                {error}
              </Text>
            )}
            
            {Object.entries(validationErrors).map(([field, message]) => (
              <Text key={field} fontSize="$3" color="$red10">
                • {message}
              </Text>
            ))}
          </YStack>
        )}

        {/* 同步提示 */}
        {needsSync && (
          <YStack 
            p="$3" 
            bg="$accent2" 
            borderRadius="$4" 
            borderColor="$accent6" 
            borderWidth={1}
            gap="$2"
          >
            <XStack alignItems="center" gap="$2">
              <Info size={16} color="$accent10" />
              <Text fontSize="$3" color="$accent11" fontWeight="600">
                同步提示
              </Text>
            </XStack>
            
            <Text fontSize="$3" color="$accent10">
              {card?.isPlanB 
                ? '检测到日期或开始时间变更，将同时更新对应的方案A'
                : '检测到日期或开始时间变更，将同时更新对应的方案B'
              }
            </Text>
          </YStack>
        )}

        <ScrollView 
          ref={scrollViewRef}
          flex={1}
          mb='$6'
        >
          <YStack gap="$8" p="$2">
            {/* 基本信息 */}
            <YStack gap="$1">
                <XStack alignItems="center" gap="$2" mb="$2">
                    <Info size={16} color="$color11" />
                    <Text fontSize="$5" fontWeight="600" color="$color11">基本信息</Text>
                </XStack>
                
                <YStack gap="$2">
                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={600} fontSize="$3" color="$color10">标题 *</Text>
                        <Input 
                            value={form.title} 
                            onChangeText={v => handleChange('title', v)}
                            placeholder="输入行程标题"
                            borderColor={validationErrors.title ? '$red8' : '$borderColor'}
                            borderWidth={validationErrors.title ? 2 : 1}
                        />
                        {validationErrors.title && (
                            <Text fontSize="$2" color="$red10">
                            {validationErrors.title}
                            </Text>
                        )}
                    </YStack>

                    <XStack gap="$3">
                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={600} fontSize="$3" color="$color10">类别 *</Text>
                        <Select 
                          size="$4"
                          value={form.category} 
                          onValueChange={v => handleChange('category', v)}
                          disablePreventBodyScroll
                        >
                          <Select.Trigger 
                            borderColor={validationErrors.category ? '$red8' : '$borderColor'}
                            borderWidth={validationErrors.category ? 2 : 1}
                            iconAfter={ChevronDown}
                          >
                            <Select.Value fontWeight={400} placeholder="选择类别" />
                          </Select.Trigger>
                          
                          <Adapt when='maxMd' platform="touch">
                            <Select.Sheet 
                              modal 
                              dismissOnSnapToBottom
                              snapPointsMode='fit'
                            >
                            <Sheet.Overlay 
                                animation="lazy"
                                bg={'$shadow6'}
                                enterStyle={{ opacity: 0 }}
                                exitStyle={{ opacity: 0 }}
                            />
                              <Sheet.Frame>
                                <Sheet.ScrollView mt='$2' mb="$9">
                                  <Adapt.Contents />
                                </Sheet.ScrollView>
                              </Sheet.Frame>
                            </Select.Sheet>
                          </Adapt>

                          <Select.Content zIndex={200000}>
                            <Select.Viewport>
                              <Select.Group>
                                <Select.Label fontSize={'$5'} fontWeight={700}>选择类别</Select.Label>
                                {TRAVEL_CATEGORIES.map((category, i) => (
                                  <Select.Item 
                                    index={i} 
                                    key={category.value} 
                                    value={category.value}
                                  >
                                    <Select.ItemText fontWeight={400}>{category.label}</Select.ItemText>
                                    <Select.ItemIndicator marginLeft="auto">
                                      <Check size={16} />
                                    </Select.ItemIndicator>
                                  </Select.Item>
                                ))}
                              </Select.Group>
                            </Select.Viewport>
                          </Select.Content>
                        </Select>
                        {validationErrors.category && (
                          <Text fontSize="$2" color="$red10">
                            {validationErrors.category}
                          </Text>
                        )}
                    </YStack>
                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={600} fontSize="$3" color="$color10">日期 *</Text>
                        {mode === 'createPlanB' ? (
                          <>
                            <Input 
                              value={form.day}
                              editable={false}
                              opacity={0.5}
                              backgroundColor="$color3"
                              color="$color10"
                            />
                            <Text fontSize="$1" color="$color8">
                              继承Plan A的日期
                            </Text>
                          </>
                        ) : (
                          <Select 
                            size='$4'
                            value={form.day} 
                            onValueChange={v => handleChange('day', v)}
                            disablePreventBodyScroll
                          >
                            <Select.Trigger iconAfter={ChevronDown}>
                              <Select.Value fontWeight={400} placeholder="选择日期" />
                            </Select.Trigger>

                          <Adapt when='maxMd' platform="touch">
                            <Select.Sheet 
                              modal 
                              dismissOnSnapToBottom
                              snapPointsMode='fit'
                            >
                            <Sheet.Overlay 
                                animation="lazy"
                                bg={'$shadow6'}
                                enterStyle={{ opacity: 0 }}
                                exitStyle={{ opacity: 0 }}
                            />
                              <Sheet.Frame>
                                <Sheet.ScrollView mt='$2' mb="$9">
                                  <Adapt.Contents />
                                </Sheet.ScrollView>
                              </Sheet.Frame>
                            </Select.Sheet>
                          </Adapt>

                            <Select.Content zIndex={200000}>
                              <Select.Viewport>
                                <Select.Group>
                                  <Select.Label fontSize={'$5'} fontWeight={700}>选择日期</Select.Label>
                                  {TRAVEL_DAYS.map((day, i) => (
                                    <Select.Item 
                                      index={i} 
                                      key={day.value} 
                                      value={day.value}
                                    >
                                      <Select.ItemText fontWeight={400}>{day.label}</Select.ItemText>
                                      <Select.ItemIndicator marginLeft="auto">
                                        <Check size={16} />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  ))}
                                </Select.Group>
                              </Select.Viewport>
                            </Select.Content>
                          </Select>
                        )}
                    </YStack>
                    </XStack>

                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">交通方式</Text>
                        <Input 
                        value={form.transportation || ''} 
                        onChangeText={v => handleChange('transportation', v)}
                        placeholder="步行/地铁/出租车…"
                        />
                    </YStack>
                </YStack>
            </YStack>

            {/* 时间安排 */}
            <YStack gap="$1">
                <XStack alignItems="center" gap="$2" mb="$2">
                    <Clock size={16} color="$color11" />
                    <Text fontSize="$5" fontWeight="600" color="$color11">时间安排</Text>
                </XStack>
                
                <YStack gap="$2">
                    <YStack gap="$1">
                    <Text py='$3' fontWeight={600} fontSize="$3" color="$color10">时间段 *</Text>
                    <XStack gap="$3" alignItems="center">
                        <YStack gap="$1" flex={1}>
                            <Button
                                size="$4"
                                justifyContent="flex-start"
                                borderColor={validationErrors.time ? '$red8' : '$color5'}
                                borderWidth={validationErrors.time ? 2 : 1}
                                onPress={() => mode !== 'createPlanB' && setStartTimePickerOpen(true)}
                                color={startTime ? '$color12' : '$color10'}
                                opacity={mode === 'createPlanB' ? 0.5 : 1}
                                backgroundColor={mode === 'createPlanB' ? '$color3' : '$color2'}
                                disabled={mode === 'createPlanB'}
                                fontWeight={400}
                            >
                                {startTime || '行程开始时间'}
                            </Button>
                        </YStack>
                        <Text color="$color10">-</Text>
                        <YStack gap="$1" flex={1}>
                            <Button
                                size="$4"
                                justifyContent="flex-start"
                                borderColor={validationErrors.time ? '$red8' : '$color5'}
                                borderWidth={validationErrors.time ? 2 : 1}
                                onPress={() => setEndTimePickerOpen(true)}
                                bg={'$color2'}
                                color={endTime ? '$color12' : '$color10'}
                                fontWeight={400}
                            >
                                {endTime || '行程结束时间'}
                            </Button>
                        </YStack>
                    </XStack>
                    {validationErrors.time && (
                      <Text fontSize="$2" color="$red10">
                        {validationErrors.time}
                      </Text>
                    )}
                    </YStack>

                    <XStack gap="$3">
                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">计划出发</Text>
                        <Input 
                        value={form.departureTime || ''} 
                        onChangeText={v => handleChange('departureTime', v)}
                        placeholder="计划出发时间"
                        />
                    </YStack>
                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">计划到达</Text>
                        <Input 
                        value={form.arrivalTime || ''} 
                        onChangeText={v => handleChange('arrivalTime', v)}
                        placeholder="计划到达时间"
                        />
                    </YStack>
                    </XStack>

                    <YStack gap="$1" flex={1}>
                        <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">停留时长</Text>
                        <Input 
                        value={form.duration || ''} 
                        onChangeText={v => handleChange('duration', v)}
                        placeholder="在此地的停留时长"
                        />
                    </YStack>
                </YStack>
            </YStack>

            {/* 地点信息 */}
            <YStack gap="$1">
                <XStack alignItems="center" gap="$2" mb="$2">
                    <MapPin size={16} color="$color11" />
                    <Text fontSize="$5" fontWeight="600" color="$color11">地点信息</Text>
                </XStack>
                <YStack gap="$1">
                    <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">地图链接</Text>
                    <Input 
                    value={form.amapUrl || ''} 
                    onChangeText={v => handleChange('amapUrl', v)}
                    placeholder="请将地图链接粘贴至此"
                    />
                </YStack>
            </YStack>

            {/* 详细内容 */}
            <YStack gap="$1">
            <XStack alignItems="center" gap="$2" mb="$2">
                <Bookmark size={16} color="$color11" />
                <Text fontSize="$5" fontWeight="600" color="$color11">详细内容</Text>
            </XStack>
            
            <YStack gap="$2">
                <YStack gap="$1">
                <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">行程描述</Text>
                <TextArea
                    value={editForm.description || ''}
                    onChangeText={v => handleTextChange('description', v)}
                    placeholder="请输入行程描述内容（分行输入）"
minHeight={120}
    numberOfLines={6}
    multiline={true}
                />
                </YStack>

                <YStack gap="$1">
                <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">小贴士</Text>
                <TextArea
                    value={editForm.tips || ''}
                    onChangeText={v => handleTextChange('tips', v)}
                    placeholder="请输入小贴士内容（分行输入）"
minHeight={120}
    numberOfLines={6}
    multiline={true}
                />
                </YStack>

                <YStack gap="$1">
                <Text py='$3' fontWeight={500} fontSize="$3" color="$color10">详细信息</Text>
                <TextArea
                    value={form.highlights || ''}
                    onChangeText={v => handleChange('highlights', v)}
                    placeholder="请输入行程的具体信息（Markdown格式）"
minHeight={120}
    numberOfLines={6}
    multiline={true}
                />
                </YStack>
            </YStack>
            </YStack>

            {/* Delete Button Section */}
            {mode === 'edit' && onDelete && (
                <Button
                    icon={Trash2}
                    variant="filled"
                    theme='error'
                    {...(theme === 'light' && { 
                        backgroundColor: "$red10",
                        color: "rgb(255, 255, 255)",
                        pressStyle: {
                            backgroundColor: "$red11",
                            color: "rgb(255, 255, 255)"
                        },
                        hoverStyle: {
                            backgroundColor: "$red11",
                            color: "rgb(255, 255, 255)"
                        }
                     })}
                    onPress={() => onDelete(safeCard)}
                    size="$4"
                    fontWeight={600}
                >
                    删除此行程
                </Button>
            )}
          </YStack>
        </ScrollView>
      </Sheet.Frame>

      {/* TimePicker组件 */}
      <TimePicker
        isOpen={startTimePickerOpen}
        onClose={() => setStartTimePickerOpen(false)}
        value={startTime || '09:00'}
        onSave={(value) => handleTimeSave('start', value)}
        title="选择开始时间"
      />

      <TimePicker
        isOpen={endTimePickerOpen}
        onClose={() => setEndTimePickerOpen(false)}
        value={endTime || '12:00'}
        onSave={(value) => handleTimeSave('end', value)}
        title="选择结束时间"
      />
    </Sheet>
  )
}
