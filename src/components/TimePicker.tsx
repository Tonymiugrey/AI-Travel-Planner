import React, { useState, useRef, useEffect } from 'react'
import { Sheet, YStack, XStack, Button, Text, View } from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'
import { Check, X } from '@tamagui/lucide-icons'

interface TimePickerProps {
  isOpen: boolean
  onClose: () => void
  value: string // 格式: "09:00" 或 "14:30"
  onSave: (value: string) => void
  title: string
}

interface WheelItem {
  value: string
  display: string
}

const generateHours = (): WheelItem[] => {
  const hours: WheelItem[] = []
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0')
    hours.push({ value: hour, display: hour })
  }
  return hours
}

const generateMinutes = (): WheelItem[] => {
  const minutes: WheelItem[] = []
  for (let i = 0; i < 60; i++) {
    const minute = i.toString().padStart(2, '0')
    minutes.push({ value: minute, display: minute })
  }
  return minutes
}

const WheelPicker: React.FC<{
  items: WheelItem[]
  selectedValue: string
  onValueChange: (value: string) => void
  height: number
}> = ({ items, selectedValue, onValueChange, height }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startTranslateY, setStartTranslateY] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [lastMoveTime, setLastMoveTime] = useState(0)
  const [lastMoveY, setLastMoveY] = useState(0)
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false)
  const inertiaAnimationRef = useRef<number | null>(null)

  const itemHeight = height / 5 // 每个项目的高度
  const visibleItems = 5 // 可见项目数量
  const centerIndex = Math.floor(visibleItems / 2) // 中心索引

  // 检测是否为触摸设备
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // 清理动画
  useEffect(() => {
    return () => {
      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current)
      }
    }
  }, [])

  // 计算初始位置
  useEffect(() => {
    const selectedIndex = items.findIndex(item => item.value === selectedValue)
    if (selectedIndex !== -1) {
      const initialTranslateY = (centerIndex - selectedIndex) * itemHeight
      setTranslateY(initialTranslateY)
    }
  }, [selectedValue, items, itemHeight, centerIndex])

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return
    
    // 停止任何正在进行的惯性滚动
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current)
      inertiaAnimationRef.current = null
    }
    setIsInertiaScrolling(false)
    
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setStartTranslateY(translateY)
    
    // 重置速度计算相关变量
    setVelocity(0)
    setLastMoveTime(Date.now())
    setLastMoveY(e.touches[0].clientY)
  }

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return
    
    const currentTime = Date.now()
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY
    const newTranslateY = startTranslateY + deltaY
    
    // 计算速度 (像素/毫秒)
    if (lastMoveTime > 0) {
      const timeDelta = currentTime - lastMoveTime
      const yDelta = currentY - lastMoveY
      if (timeDelta > 0) {
        setVelocity(yDelta / timeDelta)
      }
    }
    
    setLastMoveTime(currentTime)
    setLastMoveY(currentY)
    setTranslateY(newTranslateY)
  }

  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    // 安全检查：确保 items 数组存在且不为空
    if (!items || items.length === 0) return
    
    // 检查是否需要惯性滚动
    const hasEnoughVelocity = Math.abs(velocity) > 0.5 // 最小速度阈值
    
    if (hasEnoughVelocity) {
      startInertiaScroll(velocity)
    } else {
      snapToNearestItem()
    }
  }
  
  // 惯性滚动函数
  const startInertiaScroll = (initialVelocity: number) => {
    setIsInertiaScrolling(true)
    
    let currentVelocity = initialVelocity * 0.6
    let currentTranslateY = translateY
    
    const friction = 0.85
    const minVelocity = 0.08
    
    const animate = () => {
      // 大幅减小移动距离
      currentTranslateY += currentVelocity * 16
      setTranslateY(currentTranslateY)
      
      // 应用摩擦力
      currentVelocity *= friction
      
      // 检查是否继续动画
      if (Math.abs(currentVelocity) > minVelocity) {
        inertiaAnimationRef.current = requestAnimationFrame(animate)
      } else {
        // 动画结束，使用专门的惯性吸附逻辑
        setIsInertiaScrolling(false)
        snapToNearestItemAfterInertia(currentTranslateY)
      }
    }
    
    // 取消之前的动画
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current)
    }
    
    animate()
  }
  
  // 普通吸附到最近项目的函数（用于非惯性滚动）
  const snapToNearestItem = () => {
    // 基于当前 translateY 计算最近的索引
    // 使用与初始化一致的坐标系统：translateY = (centerIndex - selectedIndex) * itemHeight
    const currentIndex = Math.round(centerIndex - translateY / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex))
    
    // 多重安全检查：确保索引有效且对应的项目存在且有 value 属性
    if (clampedIndex >= 0 && clampedIndex < items.length && 
        items[clampedIndex] && 
        typeof items[clampedIndex].value !== 'undefined') {
      const finalTranslateY = (centerIndex - clampedIndex) * itemHeight
      setTranslateY(finalTranslateY)
      onValueChange(items[clampedIndex].value)
    }
  }

  // 惯性滚动后的专门吸附逻辑
  const snapToNearestItemAfterInertia = (finalTranslateY?: number) => {
    // 使用传入的最终位置值或当前的 translateY state
    const currentTranslateY = finalTranslateY !== undefined ? finalTranslateY : translateY
    
    // 基于实际的最终位置计算最近的索引
    // 使用与初始化一致的坐标系统：translateY = (centerIndex - selectedIndex) * itemHeight
    // 因此：selectedIndex = centerIndex - translateY / itemHeight
    const currentIndex = Math.round(centerIndex - currentTranslateY / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex))
    
    // 多重安全检查：确保索引有效且对应的项目存在且有 value 属性
    if (clampedIndex >= 0 && clampedIndex < items.length && 
        items[clampedIndex] && 
        typeof items[clampedIndex].value !== 'undefined') {
      
      const targetTranslateY = (centerIndex - clampedIndex) * itemHeight
      
      // 使用平滑动画移动到目标位置
      const startTranslateY = currentTranslateY
      const distance = targetTranslateY - startTranslateY
      const duration = 250 // 250ms的吸附动画
      const startTime = Date.now()
      
      const animateSnap = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用easeOut动画曲线让停止更自然
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        const animatedTranslateY = startTranslateY + distance * easeProgress
        
        setTranslateY(animatedTranslateY)
        
        if (progress < 1) {
          requestAnimationFrame(animateSnap)
        } else {
          // 动画完成，更新选中值
          onValueChange(items[clampedIndex].value)
        }
      }
      
      animateSnap()
    }
  }

  // 处理滚轮事件
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    // 安全检查：确保 items 数组存在且不为空
    if (!items || items.length === 0) return
    
    const delta = e.deltaY > 0 ? 1 : -1
    const currentIndex = items.findIndex(item => item.value === selectedValue)
    
    // 如果当前值没找到，使用默认索引 0
    const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex
    const newIndex = Math.max(0, Math.min(items.length - 1, safeCurrentIndex + delta))
    
    // 多重安全检查：确保新索引有效且对应的项目存在且有 value 属性
    if (newIndex >= 0 && newIndex < items.length && 
        items[newIndex] && 
        typeof items[newIndex].value !== 'undefined') {
      const finalTranslateY = (centerIndex - newIndex) * itemHeight
      setTranslateY(finalTranslateY)
      onValueChange(items[newIndex].value)
    }
  }

  return (
    <View
      ref={containerRef}
      height={height}
      width={60}
      position="relative"
      overflow="hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ userSelect: 'none' }}
    >
      {/* 选中项覆盖层 */}
      <View
        position="absolute"
        top={itemHeight * centerIndex}
        height={itemHeight}
        width="100%"
        backgroundColor="$color5"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$color10"
        zIndex={1}
        opacity={0.4}
      />
      
      {/* 渐变遮罩 - 顶部 */}
      <View
        position="absolute"
        height={itemHeight * centerIndex}
        zIndex={2}
      />
      
      {/* 渐变遮罩 - 底部 */}
      <View
        position="absolute"
        height={itemHeight * centerIndex}
        width="100%"
        zIndex={2}
      />

      {/* 滚动内容 */}
      <View
        position="absolute"
        width="100%"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: (isDragging || isInertiaScrolling) ? 'none' : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {items.map((item, index) => {
          // 计算当前项目在视觉上的位置
          const itemY = index * itemHeight + translateY
          const centerY = centerIndex * itemHeight
          
          // 计算距离中心位置的距离（像素）
          const distanceFromCenter = Math.abs(itemY - centerY)
          
          // 基于距离计算相对位置（0 = 在中心，1+ = 远离中心）
          const relativeDistance = distanceFromCenter / itemHeight
          
          // 使用更平滑的插值函数
          const smoothDistance = Math.min(relativeDistance, 2) // 限制最大距离为2个单位
          
          // 计算透明度：使用平滑曲线，中心为1，远离中心逐渐减小
          const opacity = Math.max(0.3, Math.min(1, 1 - Math.pow(smoothDistance / 2, 0.8)))
          
          // 计算缩放：使用平滑的二次函数，让过渡更自然
          const scaleBase = Math.max(0, 1 - smoothDistance / 2)
          const scale = Math.max(0.75, Math.min(1, 0.75 + 0.25 * Math.pow(scaleBase, 0.6)))
          
          // 计算字体大小：使用平滑过渡，中心最大，远离中心逐渐减小
          const fontSizeBase = Math.max(0, 1 - smoothDistance / 2)
          const fontSize = Math.max(16, Math.min(24, 16 + 8 * Math.pow(fontSizeBase, 0.5)))
          
          // 计算字体粗细：基于距离的平滑过渡
          let fontWeight: string
          if (smoothDistance < 0.3) {
            fontWeight = '700'
          } else if (smoothDistance < 0.7) {
            fontWeight = '600'
          } else if (smoothDistance < 1.2) {
            fontWeight = '500'
          } else {
            fontWeight = '400'
          }
          
          // 计算颜色：使用平滑的颜色过渡
          let color: string
          if (smoothDistance < 0.3) {
            color = '$color12'
          } else if (smoothDistance < 0.7) {
            color = '$color11'
          } else if (smoothDistance < 1.2) {
            color = '$color10'
          } else {
            color = '$color8'
          }
          
          return (
            <View
              key={item.value}
              height={itemHeight}
              width="100%"
              justifyContent="center"
              alignItems="center"
              style={{
                opacity,
                transform: `scale(${scale})`,
                transition: (isDragging || isInertiaScrolling) ? 'transform 100ms ease-out, font-size 100ms ease-out' : 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              <Text
                fontSize={fontSize}
                fontWeight={fontWeight}
                color={color}
                style={{
                  transition: (isDragging || isInertiaScrolling) ? 'font-size 100ms ease-out, color 100ms ease-out' : 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                {item.display}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export const TimePicker: React.FC<TimePickerProps> = ({
  isOpen,
  onClose,
  value,
  onSave,
  title
}) => {
  const [selectedHour, setSelectedHour] = useState(value.split(':')[0] || '00')
  const [selectedMinute, setSelectedMinute] = useState(value.split(':')[1] || '00')

  const hours = generateHours()
  const minutes = generateMinutes()

  const handleSave = () => {
    const timeValue = `${selectedHour}:${selectedMinute}`
    onSave(timeValue)
    onClose()
  }

  const handleCancel = () => {
    // 重置为原始值
    setSelectedHour(value.split(':')[0] || '00')
    setSelectedMinute(value.split(':')[1] || '00')
    onClose()
  }

  // 当 value 改变时更新内部状态
  useEffect(() => {
    const [hour, minute] = value.split(':')
    if (hour && minute) {
      setSelectedHour(hour)
      setSelectedMinute(minute)
    }
  }, [value])

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
      disableDrag
      snapPointsMode='fit'
    >
      <Sheet.Handle 
        bg='$color4'
        mb='$3'
        borderRadius="$2"
      />
      <Sheet.Overlay
        animation="lazy"
        backgroundColor="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame 
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        {/* Header */}
        <YStack p="$4" gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Button
              size="$3"
              variant="outlined"
              icon={X}
              onPress={handleCancel}
            >
              取消
            </Button>
            
            <Text fontSize="$5" fontWeight="600" color="$color12">
              {title}
            </Text>
            
            <Button
              size="$3"
              theme="accent"
              icon={Check}
              onPress={handleSave}
              fontWeight={600}
            >
              确定
            </Button>
          </XStack>

          {/* 时间选择器 */}
          <XStack justifyContent="center" alignItems="center" gap="$4" py="$4">
            <WheelPicker
              items={hours}
              selectedValue={selectedHour}
              onValueChange={setSelectedHour}
              height={300}
            />
            
            <Text fontSize="$6" fontWeight="600" color="$color12">
              :
            </Text>
            
            <WheelPicker
              items={minutes}
              selectedValue={selectedMinute}
              onValueChange={setSelectedMinute}
              height={300}
            />
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}